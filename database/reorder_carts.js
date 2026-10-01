const db = require('./db');
const { pool } = require('./supabase');

async function perfectAlign() {
    console.log('🔄 Re-aligning carts in SQLite and Supabase...');
    
    // Fetch users ordered 1 to 34
    const users = db.prepare('SELECT user_id, created_at FROM users ORDER BY user_id ASC').all();
    console.log(`Found ${users.length} users.`);

    // 1. Reset and cleanly rebuild carts in SQLite
    db.pragma('foreign_keys = OFF');
    db.prepare('DELETE FROM carts').run();
    const insertSqlite = db.prepare('INSERT INTO carts (cart_id, user_id, created_at, updated_at) VALUES (?, ?, ?, ?)');
    for (const u of users) {
        insertSqlite.run(u.user_id, u.user_id, u.created_at, u.created_at);
    }
    // Update cart_items in SQLite to point to cart_id = 2 for user 2
    db.prepare('DELETE FROM cart_items').run();
    db.prepare('INSERT INTO cart_items (cart_item_id, cart_id, ebook_id, quantity) VALUES (1, 2, 7, 1)').run();
    db.pragma('foreign_keys = ON');
    console.log('✅ SQLite carts cleanly rebuilt (cart_id 1..34 matches user_id 1..34)');

    // 2. Reset and cleanly rebuild carts in Supabase
    await pool.query('DELETE FROM cart_items;');
    await pool.query('DELETE FROM carts;');

    for (const u of users) {
        // Pass timestamp string directly so it displays cleanly
        await pool.query(
            'INSERT INTO carts (cart_id, user_id, created_at, updated_at) VALUES ($1, $2, $3, $4)',
            [u.user_id, u.user_id, u.created_at, u.created_at]
        );
    }

    // Reinsert cart_item (cart_id: 2, ebook_id: 7)
    await pool.query('INSERT INTO cart_items (cart_item_id, cart_id, ebook_id, quantity) VALUES (1, 2, 7, 1) ON CONFLICT DO NOTHING;');

    // Reset auto-increment sequences
    await pool.query("SELECT setval(pg_get_serial_sequence('carts', 'cart_id'), (SELECT max(cart_id) FROM carts));");
    await pool.query("SELECT setval(pg_get_serial_sequence('cart_items', 'cart_item_id'), (SELECT max(cart_item_id) FROM cart_items));");

    const sample = await pool.query('SELECT cart_id, user_id, created_at FROM carts ORDER BY cart_id ASC LIMIT 10');
    console.log('Supabase First 10 carts:');
    console.table(sample.rows);

    const last = await pool.query('SELECT cart_id, user_id, created_at FROM carts ORDER BY cart_id DESC LIMIT 5');
    console.log('Supabase Last 5 carts:');
    console.table(last.rows);

    console.log('🎉 Both databases now have 100% clean, sorted, matching 1..34 carts!');
    process.exit(0);
}

perfectAlign().catch(err => {
    console.error('Error during alignment:', err);
    process.exit(1);
});
