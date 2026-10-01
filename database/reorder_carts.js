const db = require('./db');
const { pool } = require('./supabase');

async function fixCarts() {
    // Sort SQLite carts cleanly by user_id ASC (user 1, 2, 3... 34)
    const sqliteCarts = db.prepare('SELECT cart_id, user_id, created_at, updated_at FROM carts ORDER BY user_id ASC').all();
    console.log(`Found ${sqliteCarts.length} carts in SQLite to re-order and sync to Supabase...`);

    // Clean Supabase carts and cart_items
    await pool.query('DELETE FROM cart_items;');
    await pool.query('DELETE FROM carts;');

    // Insert clean rows ordered by user_id
    for (const c of sqliteCarts) {
        // Ensure timestamp is properly formatted with +07:00 (Asia/Bangkok)
        let createdAt = c.created_at;
        if (!createdAt) {
            createdAt = '2026-09-20 10:00:00+07';
        } else if (!createdAt.includes('+')) {
            createdAt = `${createdAt}+07`;
        }

        let updatedAt = c.updated_at;
        if (!updatedAt) {
            updatedAt = createdAt;
        } else if (!updatedAt.includes('+')) {
            updatedAt = `${updatedAt}+07`;
        }

        await pool.query(
            'INSERT INTO carts (cart_id, user_id, created_at, updated_at) VALUES ($1, $2, $3, $4)',
            [c.cart_id, c.user_id, createdAt, updatedAt]
        );
    }

    // Re-insert cart item
    await pool.query('INSERT INTO cart_items (cart_item_id, cart_id, ebook_id, quantity) VALUES (2, 2, 7, 1) ON CONFLICT DO NOTHING;');

    // Reset auto-increment sequence
    await pool.query("SELECT setval(pg_get_serial_sequence('carts', 'cart_id'), (SELECT max(cart_id) FROM carts));");
    await pool.query("SELECT setval(pg_get_serial_sequence('cart_items', 'cart_item_id'), (SELECT COALESCE(max(cart_item_id), 1) FROM cart_items));");

    const supaCarts = await pool.query('SELECT cart_id, user_id, created_at FROM carts ORDER BY user_id ASC');
    console.log(`✅ Supabase now has ${supaCarts.rows.length} carts, ordered cleanly 1 to 34!`);
    console.log('Sample rows:', supaCarts.rows.slice(0, 5));

    process.exit(0);
}

fixCarts().catch(err => {
    console.error('Error fixing carts:', err);
    process.exit(1);
});
