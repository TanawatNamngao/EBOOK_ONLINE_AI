const Database = require('better-sqlite3');
const path = require('path');
const { pool } = require('../database/supabase');

const sqliteDb = new Database(path.join(__dirname, '../database/ebookstore.db'));

async function fixOrder37() {
    console.log('--- 1. Fixing SQLite order_items for order 37 ---');
    const existing = sqliteDb.prepare("SELECT * FROM order_items WHERE order_id = 37").all();
    if (existing.length === 0) {
        sqliteDb.prepare(`
            INSERT INTO order_items (order_id, ebook_id, price_at_purchase)
            VALUES (37, 1, 360.00)
        `).run();
        console.log('✅ Inserted order_items for order_id: 37 (ebook_id: 1, price: 360.00) in SQLite');
    } else {
        console.log('ℹ️ order_items already exists in SQLite:', existing);
    }

    console.log('\n--- 2. Syncing Order 37 & 39 to Supabase Cloud ---');
    try {
        // Check order 37 in Supabase
        const check37 = await pool.query("SELECT * FROM orders WHERE order_id = 37");
        if (check37.rows.length === 0) {
            const ord37 = sqliteDb.prepare("SELECT * FROM orders WHERE order_id = 37").get();
            await pool.query(`
                INSERT INTO orders (order_id, order_number, user_id, total_amount, status, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (order_id) DO NOTHING
            `, [ord37.order_id, ord37.order_number, ord37.user_id, ord37.total_amount, ord37.status, ord37.created_at, ord37.updated_at]);
            console.log('✅ Inserted order 37 into Supabase');
        }

        // Insert order_item 37 in Supabase
        await pool.query(`
            INSERT INTO order_items (order_id, ebook_id, price_at_purchase)
            SELECT 37, 1, 360.00
            WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 37 AND ebook_id = 1)
        `);
        console.log('✅ Ensured order_items for order 37 in Supabase');

        // Check order 39 in Supabase
        const check39 = await pool.query("SELECT * FROM orders WHERE order_id = 39");
        if (check39.rows.length === 0) {
            const ord39 = sqliteDb.prepare("SELECT * FROM orders WHERE order_id = 39").get();
            if (ord39) {
                // Ensure user 31 exists in Supabase
                const user31 = sqliteDb.prepare("SELECT * FROM users WHERE user_id = ?").get(ord39.user_id);
                if (user31) {
                    await pool.query(`
                        INSERT INTO users (user_id, role_id, username, email, password_hash, full_name, phone)
                        VALUES ($1, $2, $3, $4, $5, $6, $7)
                        ON CONFLICT (user_id) DO NOTHING
                    `, [user31.user_id, user31.role_id, user31.username, user31.email, user31.password_hash, user31.full_name, user31.phone]);
                }
                await pool.query(`
                    INSERT INTO orders (order_id, order_number, user_id, total_amount, status, created_at, updated_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    ON CONFLICT (order_id) DO NOTHING
                `, [ord39.order_id, ord39.order_number, ord39.user_id, ord39.total_amount, ord39.status, ord39.created_at, ord39.updated_at]);
                console.log('✅ Inserted order 39 into Supabase');

                await pool.query(`
                    INSERT INTO order_items (order_id, ebook_id, price_at_purchase)
                    SELECT 39, 1, 360.00
                    WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 39 AND ebook_id = 1)
                `);
                console.log('✅ Ensured order_items for order 39 in Supabase');
            }
        }

        // Sync payment 36 for order 37 if not in Supabase
        const checkPayment = await pool.query("SELECT * FROM payments WHERE order_id = 37");
        if (checkPayment.rows.length === 0) {
            const p37 = sqliteDb.prepare("SELECT * FROM payments WHERE order_id = 37").get();
            if (p37) {
                await pool.query(`
                    INSERT INTO payments (order_id, payment_method, payment_status, slip_image_url, amount, paid_at, note)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                `, [p37.order_id, p37.payment_method, p37.payment_status, p37.slip_image_url, p37.amount, p37.paid_at, p37.note]);
                console.log('✅ Inserted payment for order 37 into Supabase');
            }
        }
    } catch (err) {
        console.error('⚠️ Supabase error:', err.message);
    } finally {
        await pool.end();
    }

    console.log('\n--- 3. Verifying SQLite Order 37 with Items ---');
    const verify = sqliteDb.prepare(`
        SELECT o.order_id, o.order_number, o.total_amount, oi.ebook_id, b.title, oi.price_at_purchase
        FROM orders o
        JOIN order_items oi ON o.order_id = oi.order_id
        JOIN ebooks b ON oi.ebook_id = b.ebook_id
        WHERE o.order_id = 37
    `).all();
    console.table(verify);
}

fixOrder37();
