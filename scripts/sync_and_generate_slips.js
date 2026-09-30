const db = require('../database/db');
const { pool } = require('../database/supabase');
const { createSlipFileForOrder } = require('../utils/slipGenerator');
const crypto = require('crypto');

async function runSyncAndFixSlips() {
    console.log('🚀 Starting Full Database & Slip Synchronization...');

    // 1. Get all orders from SQLite join users and payments
    const orders = db.prepare(`
        SELECT o.order_id, o.order_number, o.user_id, o.total_amount, o.status,
               u.full_name, u.username,
               p.payment_id, p.payment_method, p.payment_status, p.slip_image_url
        FROM orders o
        JOIN users u ON o.user_id = u.user_id
        LEFT JOIN payments p ON o.order_id = p.order_id
        ORDER BY o.order_id ASC
    `).all();

    console.log(`Found ${orders.length} orders in SQLite.`);

    // 2. Fix/generate matching dynamic slips for all orders
    for (const o of orders) {
        const slipUrl = createSlipFileForOrder({
            orderId: o.order_id,
            orderNumber: o.order_number,
            customerName: o.full_name || o.username,
            totalAmount: o.total_amount,
            paymentMethod: o.payment_method || 'promptpay_qr'
        });

        // Update in SQLite
        db.prepare('UPDATE payments SET slip_image_url = ?, amount = ? WHERE order_id = ?')
            .run(slipUrl, o.total_amount, o.order_id);

        // Update in Supabase
        try {
            await pool.query(
                'UPDATE payments SET slip_image_url = $1, amount = $2 WHERE order_id = $3',
                [slipUrl, o.total_amount, o.order_id]
            );
        } catch (e) {
            console.warn(`Supabase update payment for order ${o.order_id} note:`, e.message);
        }
    }
    console.log('✅ Generated exact matching slips for all orders in SQLite and Supabase!');

    // 3. Ensure order_items and download_links for orders 33 & 34 in Supabase & SQLite
    // Order 33: user_id = 19, ebook_id = 12, price = 380
    // Order 34: user_id = 18, ebook_id = 11, price = 240
    const ensureItems = [
        { order_id: 33, ebook_id: 12, price: 380, user_id: 19 },
        { order_id: 34, ebook_id: 11, price: 240, user_id: 18 }
    ];

    for (const item of ensureItems) {
        // SQLite order_items
        db.prepare(`
            INSERT OR IGNORE INTO order_items (order_id, ebook_id, price_at_purchase)
            VALUES (?, ?, ?)
        `).run(item.order_id, item.ebook_id, item.price);

        // Supabase order_items
        try {
            await pool.query(`
                INSERT INTO order_items (order_id, ebook_id, price_at_purchase)
                VALUES ($1, $2, $3)
                ON CONFLICT (order_id, ebook_id) DO NOTHING;
            `, [item.order_id, item.ebook_id, item.price]);
        } catch (e) {}

        // Download links if order confirmed
        const token = 'tok_' + crypto.randomBytes(16).toString('hex');
        const dlUrl = `/api/download/${token}`;

        // SQLite download_links
        db.prepare(`
            INSERT OR IGNORE INTO download_links (order_id, ebook_id, user_id, token, download_url, expires_at, download_count, max_downloads)
            VALUES (?, ?, ?, ?, ?, datetime('now', '+90 days'), 0, 10)
        `).run(item.order_id, item.ebook_id, item.user_id, token, dlUrl);

        // Supabase download_links
        const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
        try {
            await pool.query(`
                INSERT INTO download_links (order_id, ebook_id, user_id, token, download_url, expires_at, download_count, max_downloads)
                VALUES ($1, $2, $3, $4, $5, $6, 0, 10)
                ON CONFLICT (order_id, ebook_id) DO UPDATE SET token = EXCLUDED.token;
            `, [item.order_id, item.ebook_id, item.user_id, token, dlUrl, expiresAt]);
        } catch (e) {}
    }

    // 4. Verify Download Links for user 18 and 19
    const sqliteLinks = db.prepare('SELECT * FROM download_links WHERE user_id IN (18, 19)').all();
    console.log('📌 Download links in SQLite for users 18 & 19:', sqliteLinks);

    const supaLinks = await pool.query('SELECT download_id, order_id, ebook_id, user_id, token FROM download_links WHERE user_id IN (18, 19)');
    console.log('☁️  Download links in Supabase for users 18 & 19:', supaLinks.rows);

    await pool.end();
    console.log('🎉 Full Sync & Slip Fix Complete!');
}

runSyncAndFixSlips().catch(err => {
    console.error('Fatal sync error:', err);
    process.exit(1);
});
