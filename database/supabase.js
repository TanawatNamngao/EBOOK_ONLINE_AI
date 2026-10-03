// ====================================================================
// EBOOK_ONLINE: Supabase Cloud PostgreSQL Real-time Sync Engine
// ====================================================================

const { Pool } = require('pg');

const SUPABASE_DB_URL = process.env.DATABASE_URL || 
    'postgresql://postgres.skzpfkrwvsiqxamgfbey:cNex6904679437@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres';

const pool = new Pool({
    connectionString: SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 2000,
    connectionTimeoutMillis: 10000,
    allowExitOnIdle: true
});

// Test connection on load & auto-sync sequences (skip in CI to avoid slow network latency)
if (!process.env.CI) {
    pool.query(`
        SELECT setval(pg_get_serial_sequence('payments', 'payment_id'), COALESCE((SELECT MAX(payment_id) FROM payments), 0) + 1, false);
        SELECT setval(pg_get_serial_sequence('orders', 'order_id'), COALESCE((SELECT MAX(order_id) FROM orders), 0) + 1, false);
        SELECT setval(pg_get_serial_sequence('order_items', 'order_item_id'), COALESCE((SELECT MAX(order_item_id) FROM order_items), 0) + 1, false);
        SELECT setval(pg_get_serial_sequence('users', 'user_id'), COALESCE((SELECT MAX(user_id) FROM users), 0) + 1, false);
        SELECT setval(pg_get_serial_sequence('ebooks', 'ebook_id'), COALESCE((SELECT MAX(ebook_id) FROM ebooks), 0) + 1, false);
        SELECT setval(pg_get_serial_sequence('download_links', 'download_id'), COALESCE((SELECT MAX(download_id) FROM download_links), 0) + 1, false);
    `).then(() => console.log('☁️  Connected to Supabase PostgreSQL successfully! (Cloud Realtime Active & Sequences Aligned)'))
      .catch(err => {
          pool.query('SELECT NOW()')
              .then(() => console.log('☁️  Connected to Supabase PostgreSQL successfully! (Cloud Realtime Active)'))
              .catch(e => console.warn('⚠️  Supabase connection note:', e.message));
      });
}

// Helper: Sync new user to Supabase
async function syncUserToSupabase(user) {
    try {
        const query = `
            INSERT INTO users (user_id, role_id, username, email, password_hash, full_name, phone)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (user_id) DO UPDATE 
            SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, role_id = EXCLUDED.role_id;
        `;
        await pool.query(query, [
            user.user_id,
            user.role_id || 1,
            user.username,
            user.email,
            user.password_hash || user.password || '123456',
            user.full_name,
            user.phone || null
        ]);
        await pool.query('INSERT INTO carts (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING;', [user.user_id]);
        console.log(`☁️  Synced user "${user.username}" and their cart to Supabase Cloud!`);
    } catch (err) {
        console.error('⚠️  Failed to sync user to Supabase:', err.message);
    }
}

// Helper: Sync updated profile to Supabase
async function syncProfileToSupabase(userId, fullName, phone) {
    try {
        const query = `
            UPDATE users SET full_name = $1, phone = $2 WHERE user_id = $3;
        `;
        await pool.query(query, [fullName, phone || null, userId]);
        console.log(`☁️  Synced profile update (User ID: ${userId}) to Supabase!`);
    } catch (err) {
        console.error('⚠️  Failed to sync profile update to Supabase:', err.message);
    }
}

// Helper: Sync order to Supabase
async function syncOrderToSupabase(order, items = []) {
    try {
        const orderQuery = `
            INSERT INTO orders (order_id, order_number, user_id, total_amount, status)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (order_id) DO UPDATE 
            SET status = EXCLUDED.status, updated_at = CURRENT_TIMESTAMP;
        `;
        await pool.query(orderQuery, [
            order.order_id,
            order.order_number,
            order.user_id,
            order.total_amount,
            order.status || 'pending'
        ]);

        if (items && items.length > 0) {
            for (const item of items) {
                const itemQuery = `
                    INSERT INTO order_items (order_id, ebook_id, price_at_purchase)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (order_id, ebook_id) DO UPDATE 
                    SET price_at_purchase = EXCLUDED.price_at_purchase;
                `;
                await pool.query(itemQuery, [order.order_id, item.ebook_id, item.price]);
            }
        }
        console.log(`☁️  Synced order "${order.order_number}" to Supabase Cloud!`);
    } catch (err) {
        console.error('⚠️  Failed to sync order to Supabase:', err.message);
    }
}

// Helper: Sync payment to Supabase
async function syncPaymentToSupabase(payment) {
    try {
        const query = `
            INSERT INTO payments (order_id, payment_method, payment_status, slip_image_url, amount, note)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (order_id) DO UPDATE 
            SET payment_status = EXCLUDED.payment_status,
                slip_image_url = EXCLUDED.slip_image_url,
                verified_at = CASE WHEN EXCLUDED.payment_status = 'verified' THEN CURRENT_TIMESTAMP ELSE payments.verified_at END;
        `;
        await pool.query(query, [
            payment.order_id,
            payment.payment_method || 'promptpay_qr',
            payment.payment_status || 'submitted',
            payment.slip_image_url || null,
            payment.amount,
            payment.note || null
        ]);
        console.log(`☁️  Synced payment for Order #${payment.order_id} to Supabase!`);
    } catch (err) {
        console.error('⚠️  Failed to sync payment to Supabase:', err.message);
    }
}

// Helper: Sync order status update (e.g. admin approval)
async function syncOrderStatusToSupabase(orderId, status, sqliteDb = null) {
    try {
        await pool.query(`UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE order_id = $2;`, [status, orderId]);
        if (status === 'confirmed') {
            if (sqliteDb) {
                const pay = sqliteDb.prepare('SELECT * FROM payments WHERE order_id = ?').get(orderId);
                const ord = sqliteDb.prepare('SELECT * FROM orders WHERE order_id = ?').get(orderId);
                await pool.query(`
                    INSERT INTO payments (order_id, payment_method, payment_status, slip_image_url, amount, note, verified_at)
                    VALUES ($1, $2, 'verified', $3, $4, $5, CURRENT_TIMESTAMP)
                    ON CONFLICT (order_id) DO UPDATE 
                    SET payment_status = 'verified',
                        verified_at = CURRENT_TIMESTAMP,
                        amount = EXCLUDED.amount;
                `, [
                    orderId,
                    pay?.payment_method || 'promptpay_qr',
                    pay?.slip_image_url || null,
                    pay?.amount || ord?.total_amount || 0,
                    pay?.note || 'ยืนยันโดยผู้ดูแลระบบ'
                ]);
            } else {
                await pool.query(`UPDATE payments SET payment_status = 'verified', verified_at = CURRENT_TIMESTAMP WHERE order_id = $1;`, [orderId]);
            }

            // Sync download links from SQLite if available, or generate directly on Supabase
            if (sqliteDb) {
                const links = sqliteDb.prepare('SELECT * FROM download_links WHERE order_id = ?').all(orderId);
                for (const l of links) {
                    await pool.query(`
                        INSERT INTO download_links (order_id, ebook_id, user_id, token, download_url, expires_at, download_count, max_downloads)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                        ON CONFLICT (order_id, ebook_id) DO UPDATE SET token = EXCLUDED.token;
                    `, [l.order_id, l.ebook_id, l.user_id, l.token, l.download_url, l.expires_at, l.download_count, l.max_downloads]);
                }
            } else {
                const orderRes = await pool.query('SELECT user_id FROM orders WHERE order_id = $1;', [orderId]);
                const itemsRes = await pool.query('SELECT ebook_id FROM order_items WHERE order_id = $1;', [orderId]);
                if (orderRes.rows.length > 0 && itemsRes.rows.length > 0) {
                    const userId = orderRes.rows[0].user_id;
                    const crypto = require('crypto');
                    for (const item of itemsRes.rows) {
                        const token = 'tok_' + crypto.randomBytes(16).toString('hex');
                        const downloadUrl = `/api/download/${token}`;
                        const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
                        await pool.query(`
                            INSERT INTO download_links (order_id, ebook_id, user_id, token, download_url, expires_at, download_count, max_downloads)
                            VALUES ($1, $2, $3, $4, $5, $6, 0, 10)
                            ON CONFLICT (order_id, ebook_id) DO UPDATE SET token = EXCLUDED.token;
                        `, [orderId, item.ebook_id, userId, token, downloadUrl, expiresAt]);
                    }
                }
            }
        }
        console.log(`☁️  Synced order #${orderId} status "${status}" & download links to Supabase!`);
    } catch (err) {
        console.error('⚠️  Failed to sync status update to Supabase:', err.message);
    }
}

// Helper: Sync add item to cart in Supabase
async function syncCartItemToSupabase(userId, ebookId) {
    try {
        let cartRes = await pool.query('SELECT cart_id FROM carts WHERE user_id = $1', [userId]);
        let supaCartId = cartRes.rows[0]?.cart_id;
        if (!supaCartId) {
            const newCart = await pool.query('INSERT INTO carts (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING RETURNING cart_id', [userId]);
            supaCartId = newCart.rows[0]?.cart_id;
            if (!supaCartId) {
                const getAgain = await pool.query('SELECT cart_id FROM carts WHERE user_id = $1', [userId]);
                supaCartId = getAgain.rows[0]?.cart_id;
            }
        }
        if (supaCartId) {
            await pool.query(
                `INSERT INTO cart_items (cart_id, ebook_id, quantity) 
                 VALUES ($1, $2, 1) 
                 ON CONFLICT (cart_id, ebook_id) DO NOTHING`,
                [supaCartId, ebookId]
            );
            console.log(`☁️  Synced cart item (E-Book #${ebookId}) for User #${userId} to Supabase!`);
        }
    } catch (err) {
        console.warn('⚠️  Failed to sync cart item to Supabase:', err.message);
    }
}

// Helper: Sync remove item from cart in Supabase
async function removeCartItemFromSupabase(userId, ebookId) {
    try {
        const cartRes = await pool.query('SELECT cart_id FROM carts WHERE user_id = $1', [userId]);
        const supaCartId = cartRes.rows[0]?.cart_id;
        if (supaCartId) {
            await pool.query('DELETE FROM cart_items WHERE cart_id = $1 AND ebook_id = $2', [supaCartId, ebookId]);
            console.log(`☁️  Synced remove cart item (E-Book #${ebookId}) for User #${userId} from Supabase!`);
        }
    } catch (err) {
        console.warn('⚠️  Failed to sync remove cart item from Supabase:', err.message);
    }
}

// Helper: Sync clear cart in Supabase
async function clearCartInSupabase(userId) {
    try {
        const cartRes = await pool.query('SELECT cart_id FROM carts WHERE user_id = $1', [userId]);
        const supaCartId = cartRes.rows[0]?.cart_id;
        if (supaCartId) {
            await pool.query('DELETE FROM cart_items WHERE cart_id = $1', [supaCartId]);
            console.log(`☁️  Synced clear cart for User #${userId} from Supabase!`);
        }
    } catch (err) {
        console.warn('⚠️  Failed to clear cart in Supabase:', err.message);
    }
}

function toSqliteDate(val) {
    if (!val) return null;
    if (val instanceof Date) return val.toISOString().replace('T', ' ').substring(0, 19);
    return String(val);
}

// Startup Sync: Pull latest records from Supabase into SQLite
async function syncFromSupabaseToSQLite(sqliteDb) {
    try {
        console.log('🔄 Checking for new records from Supabase Cloud to SQLite...');
        sqliteDb.pragma('foreign_keys = OFF');
        // 0. Sync Categories
        const remoteCats = await pool.query('SELECT category_id, name, slug, description, is_active FROM categories ORDER BY category_id ASC');
        const insertCat = sqliteDb.prepare(`
            INSERT OR REPLACE INTO categories (category_id, name, slug, description, is_active)
            VALUES (?, ?, ?, ?, ?)
        `);
        for (const c of remoteCats.rows) {
            insertCat.run(c.category_id, c.name, c.slug, c.description, c.is_active !== undefined ? (c.is_active ? 1 : 0) : 1);
        }

        // 0.1 Sync Authors
        const remoteAuthors = await pool.query('SELECT author_id, name, bio, email FROM authors ORDER BY author_id ASC');
        const insertAuthor = sqliteDb.prepare(`
            INSERT OR REPLACE INTO authors (author_id, name, bio, email)
            VALUES (?, ?, ?, ?)
        `);
        for (const a of remoteAuthors.rows) {
            insertAuthor.run(a.author_id, a.name, a.bio, a.email);
        }

        // 0.2 Sync E-Books
        const remoteEbooks = await pool.query('SELECT ebook_id, category_id, author_id, title, isbn, description, price, cover_image, sample_file_url, full_file_url, is_published, created_at, updated_at FROM ebooks ORDER BY ebook_id ASC');
        const insertEbook = sqliteDb.prepare(`
            INSERT OR REPLACE INTO ebooks (ebook_id, category_id, author_id, title, isbn, description, price, cover_image, sample_file_url, full_file_url, is_published, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const b of remoteEbooks.rows) {
            insertEbook.run(b.ebook_id, b.category_id, b.author_id, b.title, b.isbn, b.description, b.price, b.cover_image, b.sample_file_url, b.full_file_url, b.is_published, toSqliteDate(b.created_at), toSqliteDate(b.updated_at));
        }

        // 1. Sync Users
        const remoteUsers = await pool.query('SELECT user_id, role_id, username, email, password_hash, full_name, phone, created_at FROM users ORDER BY user_id ASC');
        const insertUser = sqliteDb.prepare(`
            INSERT OR REPLACE INTO users (user_id, role_id, username, email, password_hash, full_name, phone, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const insertCart = sqliteDb.prepare(`INSERT OR IGNORE INTO carts (user_id) VALUES (?)`);

        for (const u of remoteUsers.rows) {
            insertUser.run(u.user_id, u.role_id, u.username, u.email, u.password_hash, u.full_name, u.phone, toSqliteDate(u.created_at));
            insertCart.run(u.user_id);
        }

        // 2. Sync Orders
        const remoteOrders = await pool.query('SELECT order_id, order_number, user_id, total_amount, status, created_at, updated_at FROM orders ORDER BY order_id ASC');
        const insertOrder = sqliteDb.prepare(`
            INSERT OR REPLACE INTO orders (order_id, order_number, user_id, total_amount, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        for (const o of remoteOrders.rows) {
            insertOrder.run(o.order_id, o.order_number, o.user_id, o.total_amount, o.status, toSqliteDate(o.created_at), toSqliteDate(o.updated_at));
        }

        // 3. Sync Order Items
        const remoteOrderItems = await pool.query('SELECT order_item_id, order_id, ebook_id, price_at_purchase FROM order_items ORDER BY order_item_id ASC');
        const insertOrderItem = sqliteDb.prepare(`
            INSERT OR REPLACE INTO order_items (order_item_id, order_id, ebook_id, price_at_purchase)
            VALUES (?, ?, ?, ?)
        `);
        for (const item of remoteOrderItems.rows) {
            insertOrderItem.run(item.order_item_id, item.order_id, item.ebook_id, item.price_at_purchase);
        }

        // 4. Sync Payments
        const remotePayments = await pool.query('SELECT payment_id, order_id, payment_method, payment_status, slip_image_url, amount, paid_at, verified_at, note FROM payments ORDER BY payment_id ASC');
        const insertPayment = sqliteDb.prepare(`
            INSERT OR REPLACE INTO payments (payment_id, order_id, payment_method, payment_status, slip_image_url, amount, paid_at, verified_at, note)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const p of remotePayments.rows) {
            insertPayment.run(p.payment_id, p.order_id, p.payment_method, p.payment_status, p.slip_image_url, p.amount, toSqliteDate(p.paid_at), toSqliteDate(p.verified_at), p.note);
        }

        // 5. Sync Download Links
        const remoteDownloadLinks = await pool.query('SELECT download_id, order_id, ebook_id, user_id, token, download_url, expires_at, download_count, max_downloads, created_at FROM download_links ORDER BY download_id ASC');
        const insertDownloadLink = sqliteDb.prepare(`
            INSERT OR REPLACE INTO download_links (download_id, order_id, ebook_id, user_id, token, download_url, expires_at, download_count, max_downloads, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const dl of remoteDownloadLinks.rows) {
            insertDownloadLink.run(dl.download_id, dl.order_id, dl.ebook_id, dl.user_id, dl.token, dl.download_url, toSqliteDate(dl.expires_at), dl.download_count, dl.max_downloads, toSqliteDate(dl.created_at));
        }

        sqliteDb.pragma('foreign_keys = ON');
        console.log(`✅ Cloud Sync Complete: SQLite now has ${remoteUsers.rows.length} users, ${remoteOrders.rows.length} orders, ${remoteOrderItems.rows.length} items, and ${remoteDownloadLinks.rows.length} download links from Supabase!`);
    } catch (err) {
        sqliteDb.pragma('foreign_keys = ON');
        console.warn('⚠️  Could not sync from Supabase on startup:', err.message);
    }
}

module.exports = {
    pool,
    syncUserToSupabase,
    syncProfileToSupabase,
    syncOrderToSupabase,
    syncPaymentToSupabase,
    syncOrderStatusToSupabase,
    syncCartItemToSupabase,
    removeCartItemFromSupabase,
    clearCartInSupabase,
    syncFromSupabaseToSQLite
};
