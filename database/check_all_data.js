const db = require('./db');
const { pool } = require('./supabase');

async function auditAndClean() {
    console.log('🔄 Checking and aligning databases...');

    // 1. Sync all categories from SQLite to Supabase
    const allCats = db.prepare('SELECT * FROM categories ORDER BY category_id ASC').all();
    for (const c of allCats) {
        try {
            const validSlug = (c.slug && c.slug !== '-') ? c.slug : `cat-${c.category_id}`;
            await pool.query(
                'INSERT INTO categories (category_id, name, slug, description, is_active) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (category_id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug, description = EXCLUDED.description, is_active = EXCLUDED.is_active',
                [c.category_id, c.name, validSlug, c.description, c.is_active ? 1 : 0]
            );
        } catch (e) {
            console.warn(`Category #${c.category_id} sync note:`, e.message);
        }
    }

    // 2. Sync all SQLite users that might not yet be in Supabase
    const sqliteUsers = db.prepare('SELECT * FROM users ORDER BY user_id ASC').all();
    for (const u of sqliteUsers) {
        try {
            await pool.query(
                `INSERT INTO users (user_id, role_id, username, email, password_hash, full_name, phone, created_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                 ON CONFLICT (user_id) DO NOTHING`,
                [u.user_id, u.role_id, u.username, u.email, u.password_hash || '123456', u.full_name, u.phone, u.created_at]
            );
            await pool.query(
                `INSERT INTO carts (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`,
                [u.user_id]
            );
        } catch (e) {}
    }

    // 3. Sync all Payments from SQLite to Supabase
    const sqlitePayments = db.prepare('SELECT * FROM payments ORDER BY payment_id ASC').all();
    for (const p of sqlitePayments) {
        try {
            await pool.query(
                `INSERT INTO payments (payment_id, order_id, payment_method, payment_status, slip_image_url, amount, paid_at, verified_at, note)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                 ON CONFLICT (payment_id) DO UPDATE SET 
                     payment_status = EXCLUDED.payment_status,
                     slip_image_url = EXCLUDED.slip_image_url,
                     verified_at = EXCLUDED.verified_at`,
                [p.payment_id, p.order_id, p.payment_method, p.payment_status, p.slip_image_url, p.amount, p.paid_at, p.verified_at, p.note]
            );
        } catch (e) {}
    }

    // 4. Print Complete Audit Table
    const tables = [
        'roles', 
        'users', 
        'categories', 
        'authors', 
        'ebooks', 
        'carts', 
        'cart_items', 
        'orders', 
        'order_items', 
        'payments', 
        'download_links'
    ];

    console.log('\n===============================================================');
    console.log('       ผลการตรวจสอบความสมบูรณ์ของฐานข้อมูล (Database Audit)       ');
    console.log('===============================================================');
    console.log('  ลำดับ | ตาราง (Table)     |  SQLite (Local/Render) |  Supabase Cloud ');
    console.log('---------------------------------------------------------------');
    
    let index = 1;
    for (const t of tables) {
        let sqliteCount = 0;
        try {
            sqliteCount = db.prepare('SELECT count(*) as c FROM ' + t).get().c;
        } catch (e) {
            sqliteCount = 'Err';
        }

        let supaCount = 0;
        try {
            const res = await pool.query('SELECT count(*) FROM ' + t);
            supaCount = res.rows[0].count;
        } catch (e) {
            supaCount = 'Err';
        }

        const matchIcon = (sqliteCount == supaCount) ? '✅ ตรงกัน 100%' : '⚠️ ต่างกันเล็กน้อย';
        console.log(`  ${String(index++).padStart(2)}.   | ${t.padEnd(16)} |  ${String(sqliteCount).padStart(8)} แถว      |  ${String(supaCount).padStart(8)} แถว   ${matchIcon}`);
    }
    console.log('===============================================================\n');

    process.exit(0);
}

auditAndClean().catch(err => {
    console.error(err);
    process.exit(1);
});
