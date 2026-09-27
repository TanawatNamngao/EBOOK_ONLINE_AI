const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const crypto = require('crypto');
const db = require('./database/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configure Multer for mock slip uploads
const slipStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dest = path.join(__dirname, 'public', 'assets', 'slips');
        fs.mkdirSync(dest, { recursive: true });
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname) || '.png';
        cb(null, `slip_upload_${unique}${ext}`);
    }
});
const uploadSlip = multer({ storage: slipStorage });

// Route for Auth Page
app.get(['/auth', '/login', '/register'], (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'auth.html'));
});

// Helper: Simple session simulation via Header (or fallback to user_id query/body)
function getCurrentUser(req) {
    const userIdHeader = req.headers['x-user-id'] || req.query.current_user_id;
    if (userIdHeader) {
        return db.prepare('SELECT user_id, role_id, username, email, full_name, phone FROM users WHERE user_id = ?').get(userIdHeader);
    }
    // Default to test customer if not provided
    return db.prepare('SELECT user_id, role_id, username, email, full_name, phone FROM users WHERE user_id = 2').get();
}

// ====================================================================
// 1. AUTHENTICATION & USER PROFILE APIs
// ====================================================================

// Register
app.post('/api/auth/register', (req, res) => {
    try {
        let { username, email, password, full_name, phone } = req.body;
        if (!email || !password || !full_name) {
            return res.status(400).json({ error: 'กรุณากรอกชื่อ-นามสกุล, อีเมล และรหัสผ่านให้ครบถ้วน' });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' });
        }

        // Auto-generate username from email prefix if omitted
        if (!username || !username.trim()) {
            const baseUser = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || 'user';
            let candidate = baseUser;
            let counter = 1;
            while (db.prepare('SELECT user_id FROM users WHERE username = ?').get(candidate)) {
                candidate = `${baseUser}${counter++}`;
            }
            username = candidate;
        }

        // Check duplicate email
        const existingEmail = db.prepare('SELECT user_id FROM users WHERE email = ?').get(email.trim());
        if (existingEmail) {
            return res.status(400).json({ error: 'อีเมลนี้ถูกใช้งานในระบบแล้ว กรุณาเข้าสู่ระบบ' });
        }

        // Check duplicate username
        const existingUser = db.prepare('SELECT user_id FROM users WHERE username = ?').get(username.trim());
        if (existingUser) {
            return res.status(400).json({ error: 'ชื่อบัญชีนี้มีผู้ใช้งานแล้ว' });
        }

        const insertUser = db.prepare(`
            INSERT INTO users (role_id, username, email, password_hash, full_name, phone)
            VALUES (1, ?, ?, ?, ?, ?)
        `);
        const result = insertUser.run(username.trim(), email.trim(), password, full_name.trim(), phone ? phone.trim() : null);
        const newUser = db.prepare(`
            SELECT u.user_id, u.role_id, r.role_name, u.username, u.email, u.full_name, u.phone 
            FROM users u
            JOIN roles r ON u.role_id = r.role_id
            WHERE u.user_id = ?
        `).get(result.lastInsertRowid);

        // Auto create cart for new user
        db.prepare('INSERT OR IGNORE INTO carts (user_id) VALUES (?)').run(newUser.user_id);

        res.status(201).json({ message: 'สร้างบัญชีสำเร็จ ยินดีต้อนรับสู่ระบบ!', user: newUser });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Login
app.post('/api/auth/login', (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'กรุณากรอกอีเมล/ชื่อผู้ใช้ และรหัสผ่าน' });
        }

        const user = db.prepare(`
            SELECT u.user_id, u.role_id, r.role_name, u.username, u.email, u.full_name, u.phone, u.password_hash 
            FROM users u
            JOIN roles r ON u.role_id = r.role_id
            WHERE (u.username = ? OR u.email = ?)
        `).get(username.trim(), username.trim());

        if (!user || user.password_hash !== password) {
            return res.status(401).json({ error: 'อีเมล/ชื่อผู้ใช้งาน หรือรหัสผ่านไม่ถูกต้อง' });
        }

        // Auto ensure cart exists
        db.prepare('INSERT OR IGNORE INTO carts (user_id) VALUES (?)').run(user.user_id);

        const { password_hash, ...safeUser } = user;
        res.json({ message: 'เข้าสู่ระบบสำเร็จ', user: safeUser });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Test accounts for demonstration
app.get('/api/auth/test-accounts', (req, res) => {
    try {
        const accounts = db.prepare(`
            SELECT u.user_id, u.role_id, r.role_name, u.username, u.email, u.full_name, u.phone,
                   CASE WHEN u.role_id = 2 THEN 'admin123' ELSE '123456' END as test_password
            FROM users u
            JOIN roles r ON u.role_id = r.role_id
            ORDER BY u.role_id DESC, u.user_id ASC
            LIMIT 6
        `).all();
        res.json(accounts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Current User info
app.get('/api/auth/me', (req, res) => {
    const user = getCurrentUser(req);
    if (!user) return res.status(404).json({ error: 'ไม่พบผู้ใช้' });
    const role = db.prepare('SELECT role_name FROM roles WHERE role_id = ?').get(user.role_id);
    res.json({ user: { ...user, role_name: role ? role.role_name : 'customer' } });
});

// Update Profile
app.put('/api/auth/profile', (req, res) => {
    try {
        const user = getCurrentUser(req);
        if (!user) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });
        const { full_name, phone } = req.body;

        db.prepare('UPDATE users SET full_name = ?, phone = ? WHERE user_id = ?')
            .run(full_name || user.full_name, phone || user.phone, user.user_id);

        const updated = db.prepare('SELECT user_id, role_id, username, email, full_name, phone FROM users WHERE user_id = ?').get(user.user_id);
        res.json({ message: 'แก้ไขข้อมูลสำเร็จ', user: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ====================================================================
// 2. CATEGORIES & E-BOOKS APIs (หน้าร้าน & ค้นหา & คัดกรอง)
// ====================================================================

// Get all categories with count of published books
app.get('/api/categories', (req, res) => {
    try {
        const categories = db.prepare(`
            SELECT c.category_id, c.name, c.slug, c.description, c.is_active,
                   COUNT(b.ebook_id) AS book_count
            FROM categories c
            LEFT JOIN ebooks b ON c.category_id = b.category_id AND b.is_published = 1
            WHERE c.is_active = 1
            GROUP BY c.category_id
            ORDER BY c.category_id ASC
        `).all();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get E-Books with search, category filtering, and sorting
app.get('/api/ebooks', (req, res) => {
    try {
        const { search, category_id, sort, min_price, max_price } = req.query;

        let query = `
            SELECT b.ebook_id, b.title, b.isbn, b.description, b.price, 
                   b.cover_image, b.sample_file_url, b.is_published, b.created_at,
                   c.category_id, c.name AS category_name, c.slug AS category_slug,
                   a.author_id, a.name AS author_name
            FROM ebooks b
            JOIN categories c ON b.category_id = c.category_id
            JOIN authors a ON b.author_id = a.author_id
            WHERE b.is_published = 1 AND c.is_active = 1
        `;
        const params = [];

        if (search) {
            query += ` AND (b.title LIKE ? OR a.name LIKE ? OR b.description LIKE ?)`;
            const term = `%${search}%`;
            params.push(term, term, term);
        }

        if (category_id && category_id !== 'all') {
            query += ` AND b.category_id = ?`;
            params.push(category_id);
        }

        if (min_price) {
            query += ` AND b.price >= ?`;
            params.push(parseFloat(min_price));
        }

        if (max_price) {
            query += ` AND b.price <= ?`;
            params.push(parseFloat(max_price));
        }

        if (sort === 'price_asc') {
            query += ` ORDER BY b.price ASC`;
        } else if (sort === 'price_desc') {
            query += ` ORDER BY b.price DESC`;
        } else if (sort === 'title') {
            query += ` ORDER BY b.title ASC`;
        } else {
            query += ` ORDER BY b.ebook_id DESC`;
        }

        const ebooks = db.prepare(query).all(...params);
        res.json(ebooks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get single E-Book detail
app.get('/api/ebooks/:id', (req, res) => {
    try {
        const ebook = db.prepare(`
            SELECT b.*, c.name AS category_name, a.name AS author_name, a.bio AS author_bio
            FROM ebooks b
            JOIN categories c ON b.category_id = c.category_id
            JOIN authors a ON b.author_id = a.author_id
            WHERE b.ebook_id = ?
        `).get(req.params.id);

        if (!ebook) return res.status(404).json({ error: 'ไม่พบหนังสือเล่มนี้' });
        res.json(ebook);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ====================================================================
// 3. CART MANAGEMENT APIs (ตะกร้าสินค้า)
// ====================================================================

function getOrCreateUserCart(userId) {
    let cart = db.prepare('SELECT cart_id FROM carts WHERE user_id = ?').get(userId);
    if (!cart) {
        const res = db.prepare('INSERT INTO carts (user_id) VALUES (?)').run(userId);
        return res.lastInsertRowid;
    }
    return cart.cart_id;
}

// Get Cart & Items
app.get('/api/cart', (req, res) => {
    try {
        const user = getCurrentUser(req);
        if (!user) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });

        const cartId = getOrCreateUserCart(user.user_id);
        const items = db.prepare(`
            SELECT ci.cart_item_id, ci.cart_id, ci.ebook_id, ci.quantity, ci.added_at,
                   b.title, b.price, b.cover_image, a.name AS author_name, c.name AS category_name
            FROM cart_items ci
            JOIN ebooks b ON ci.ebook_id = b.ebook_id
            JOIN authors a ON b.author_id = a.author_id
            JOIN categories c ON b.category_id = c.category_id
            WHERE ci.cart_id = ?
            ORDER BY ci.cart_item_id DESC
        `).all(cartId);

        const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        res.json({ cart_id: cartId, items, total_amount: totalAmount, item_count: items.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add Item to Cart
app.post('/api/cart/items', (req, res) => {
    try {
        const user = getCurrentUser(req);
        if (!user) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });
        const { ebook_id } = req.body;

        if (!ebook_id) return res.status(400).json({ error: 'ไม่ระบุรหัสหนังสือ' });

        // Check if book exists and is published
        const book = db.prepare('SELECT ebook_id, title, price, is_published FROM ebooks WHERE ebook_id = ?').get(ebook_id);
        if (!book || !book.is_published) {
            return res.status(400).json({ error: 'หนังสือเล่มนี้ไม่พร้อมจำหน่าย' });
        }

        // Check if user already owns this ebook in a confirmed order
        const alreadyBought = db.prepare(`
            SELECT oi.order_item_id 
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.order_id
            WHERE o.user_id = ? AND oi.ebook_id = ? AND o.status = 'confirmed'
        `).get(user.user_id, ebook_id);

        if (alreadyBought) {
            return res.status(400).json({ error: 'ท่านได้สั่งซื้อและมีสิทธิ์ใน E-Book เล่มนี้แล้ว' });
        }

        const cartId = getOrCreateUserCart(user.user_id);

        // E-books have UNIQUE(cart_id, ebook_id) and quantity = 1
        const existingItem = db.prepare('SELECT cart_item_id FROM cart_items WHERE cart_id = ? AND ebook_id = ?').get(cartId, ebook_id);
        if (existingItem) {
            return res.status(400).json({ error: 'หนังสือเล่มนี้อยู่ในตะกร้าแล้ว' });
        }

        db.prepare('INSERT INTO cart_items (cart_id, ebook_id, quantity) VALUES (?, ?, 1)').run(cartId, ebook_id);
        db.prepare('UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE cart_id = ?').run(cartId);

        res.status(201).json({ message: 'เพิ่มลงในตะกร้าเรียบร้อย' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Remove Item from Cart
app.delete('/api/cart/items/:id', (req, res) => {
    try {
        const user = getCurrentUser(req);
        if (!user) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });
        const cartId = getOrCreateUserCart(user.user_id);

        db.prepare('DELETE FROM cart_items WHERE cart_item_id = ? AND cart_id = ?').run(req.params.id, cartId);
        res.json({ message: 'ลบรายการออกจากตะกร้าแล้ว' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Clear Entire Cart
app.delete('/api/cart', (req, res) => {
    try {
        const user = getCurrentUser(req);
        if (!user) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });
        const cartId = getOrCreateUserCart(user.user_id);

        db.prepare('DELETE FROM cart_items WHERE cart_id = ?').run(cartId);
        res.json({ message: 'ล้างตะกร้าสินค้าเรียบร้อย' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ====================================================================
// 4. ORDERS & CHECKOUT & MOCK PAYMENT APIs
// ====================================================================

// Checkout from Cart
app.post('/api/orders/checkout', (req, res) => {
    const user = getCurrentUser(req);
    if (!user) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });

    const cartId = getOrCreateUserCart(user.user_id);
    const cartItems = db.prepare(`
        SELECT ci.ebook_id, b.price, b.title
        FROM cart_items ci
        JOIN ebooks b ON ci.ebook_id = b.ebook_id
        WHERE ci.cart_id = ?
    `).all(cartId);

    if (cartItems.length === 0) {
        return res.status(400).json({ error: 'ตะกร้าสินค้าว่างเปล่า ไม่สามารถสั่งซื้อได้' });
    }

    const totalAmount = cartItems.reduce((sum, item) => sum + item.price, 0);
    const orderNumber = `ORD-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 900 + 100)}`;

    const createOrderTransaction = db.transaction(() => {
        // 1. Insert order
        const orderResult = db.prepare(`
            INSERT INTO orders (order_number, user_id, total_amount, status)
            VALUES (?, ?, ?, 'pending')
        `).run(orderNumber, user.user_id, totalAmount);
        const orderId = orderResult.lastInsertRowid;

        // 2. Insert order items
        const insertOrderItem = db.prepare(`
            INSERT INTO order_items (order_id, ebook_id, price_at_purchase)
            VALUES (?, ?, ?)
        `);
        for (const item of cartItems) {
            insertOrderItem.run(orderId, item.ebook_id, item.price);
        }

        // 3. Insert mock payment record
        db.prepare(`
            INSERT INTO payments (order_id, payment_method, payment_status, amount, note)
            VALUES (?, 'promptpay_qr', 'pending', ?, 'รอการแจ้งชำระเงินและแนบสลิป')
        `).run(orderId, totalAmount);

        // 4. Clear cart
        db.prepare('DELETE FROM cart_items WHERE cart_id = ?').run(cartId);

        return { orderId, orderNumber, totalAmount };
    });

    try {
        const orderInfo = createOrderTransaction();
        res.status(201).json({ message: 'สั่งซื้อสำเร็จ กรุณาแจ้งชำระเงิน', order: orderInfo });
    } catch (err) {
        console.error('Checkout error:', err);
        res.status(500).json({ error: 'ไม่สามารถสร้างคำสั่งซื้อได้: ' + err.message });
    }
});

// Submit Mock Payment & Slip
app.post('/api/orders/:id/payment', uploadSlip.single('slip_image'), (req, res) => {
    try {
        const orderId = req.params.id;
        const { payment_method, note } = req.body;
        let slipUrl = null;

        if (req.file) {
            slipUrl = `/assets/slips/${req.file.filename}`;
        } else if (req.body.slip_mock_url) {
            slipUrl = req.body.slip_mock_url;
        } else {
            slipUrl = '/assets/slips/slip_mock_01.png'; // default mock slip
        }

        const order = db.prepare('SELECT order_id, total_amount, status FROM orders WHERE order_id = ?').get(orderId);
        if (!order) return res.status(404).json({ error: 'ไม่พบคำสั่งซื้อ' });

        if (order.status === 'confirmed') {
            return res.status(400).json({ error: 'คำสั่งซื้อนี้ได้รับการยืนยันเรียบร้อยแล้ว' });
        }

        db.prepare(`
            UPDATE payments 
            SET payment_method = ?,
                payment_status = 'submitted',
                slip_image_url = ?,
                amount = ?,
                paid_at = CURRENT_TIMESTAMP,
                note = ?
            WHERE order_id = ?
        `).run(payment_method || 'promptpay_qr', slipUrl, order.total_amount, note || 'แจ้งชำระเงินจำลองแล้ว', orderId);

        db.prepare('UPDATE orders SET updated_at = CURRENT_TIMESTAMP WHERE order_id = ?').run(orderId);

        res.json({ message: 'แจ้งชำระเงินสำเร็จ กรุณารอผู้ดูแลระบบตรวจสอบหลักฐาน', slip_image_url: slipUrl });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get User's Order History with Download Links (Only if Confirmed!)
app.get('/api/orders/my', (req, res) => {
    try {
        const user = getCurrentUser(req);
        if (!user) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });

        const orders = db.prepare(`
            SELECT o.order_id, o.order_number, o.total_amount, o.status, o.created_at,
                   p.payment_method, p.payment_status, p.slip_image_url, p.paid_at
            FROM orders o
            LEFT JOIN payments p ON o.order_id = p.order_id
            WHERE o.user_id = ?
            ORDER BY o.order_id DESC
        `).all(user.user_id);

        for (const order of orders) {
            // Get order items
            order.items = db.prepare(`
                SELECT oi.order_item_id, oi.ebook_id, oi.price_at_purchase,
                       b.title, b.cover_image, a.name AS author_name,
                       dl.token, dl.download_url, dl.download_count, dl.max_downloads, dl.expires_at
                FROM order_items oi
                JOIN ebooks b ON oi.ebook_id = b.ebook_id
                JOIN authors a ON b.author_id = a.author_id
                LEFT JOIN download_links dl ON dl.order_id = oi.order_id AND dl.ebook_id = oi.ebook_id
                WHERE oi.order_id = ?
            `).all(order.order_id);

            // GATING LOGIC: If order is NOT confirmed, strip/lock download tokens!
            if (order.status !== 'confirmed') {
                order.items.forEach(item => {
                    item.token = null;
                    item.download_url = null;
                    item.download_locked = true;
                    item.lock_reason = order.status === 'pending' ? 'รอผู้ดูแลยืนยันการชำระเงิน' : 'คำสั่งซื้อถูกยกเลิก';
                });
            } else {
                order.items.forEach(item => {
                    item.download_locked = false;
                });
            }
        }

        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ====================================================================
// 5. SECURE DOWNLOAD GATEWAY (ตามเงื่อนไขข้อ 2.2 ในใบงาน)
// ====================================================================
// "ระบบต้องไม่เปิดลิงก์ของหนังสือที่ลูกค้ายังไม่ได้ซื้อหรือคำสั่งซื้อยังไม่ยืนยัน"
app.get('/api/download/:token', (req, res) => {
    try {
        const { token } = req.params;
        if (!token) return res.status(400).send('<h1>400 Bad Request</h1><p>ไม่พบ Token ดาวน์โหลด</p>');

        // Lookup token join orders and payments
        const downloadRecord = db.prepare(`
            SELECT dl.*, o.status AS order_status, p.payment_status, b.title, b.full_file_url
            FROM download_links dl
            JOIN orders o ON dl.order_id = o.order_id
            JOIN payments p ON o.order_id = p.order_id
            JOIN ebooks b ON dl.ebook_id = b.ebook_id
            WHERE dl.token = ?
        `).get(token);

        if (!downloadRecord) {
            return res.status(404).send(`
                <div style="font-family: sans-serif; text-align: center; padding: 50px;">
                    <h1 style="color: #ef4444;">404 ไม่พบสิทธิ์ดาวน์โหลด</h1>
                    <p>ลิงก์ดาวน์โหลดไม่ถูกต้อง หรืออาจหมดอายุไปแล้ว</p>
                    <a href="/" style="display:inline-block; padding:10px 20px; background:#0284c7; color:#fff; text-decoration:none; border-radius:6px;">กลับหน้าร้าน</a>
                </div>
            `);
        }

        // STRICT ACCESS GATE CHECK
        if (downloadRecord.order_status !== 'confirmed' || downloadRecord.payment_status !== 'verified') {
            return res.status(403).send(`
                <div style="font-family: sans-serif; text-align: center; padding: 50px;">
                    <h1 style="color: #dc2626;">403 การเข้าถึงถูกปฏิเสธ (Forbidden)</h1>
                    <p style="font-size: 16px; color: #475569;">
                        ระบบไม่สามารถเปิดให้ดาวน์โหลดหนังสือ <strong>"${downloadRecord.title}"</strong> ได้<br>
                        เนื่องจากคำสั่งซื้อนี้ยังไม่ได้รับการยืนยันการชำระเงินจากผู้ดูแลระบบ
                    </p>
                    <p style="color: #64748b; font-size: 14px;">(เงื่อนไขความปลอดภัย: คำสั่งซื้อต้องมีสถานะเป็น Confirmed เท่านั้น)</p>
                    <a href="/#orders" style="display:inline-block; margin-top:20px; padding:10px 20px; background:#0284c7; color:#fff; text-decoration:none; border-radius:6px;">ดูประวัติคำสั่งซื้อ</a>
                </div>
            `);
        }

        // Check download limits
        if (downloadRecord.download_count >= downloadRecord.max_downloads) {
            return res.status(403).send(`
                <div style="font-family: sans-serif; text-align: center; padding: 50px;">
                    <h1 style="color: #ea580c;">สิทธิ์ดาวน์โหลดครบจำนวนที่กำหนดแล้ว</h1>
                    <p>คุณดาวน์โหลดหนังสือเล่มนี้ครบตามโควตา (${downloadRecord.max_downloads} ครั้ง) แล้ว</p>
                </div>
            `);
        }

        // Increment count
        db.prepare('UPDATE download_links SET download_count = download_count + 1 WHERE download_id = ?').run(downloadRecord.download_id);

        // Send file
        const filePath = path.join(__dirname, 'public', downloadRecord.full_file_url);
        if (fs.existsSync(filePath)) {
            res.download(filePath, `${downloadRecord.title}.pdf`);
        } else {
            // Send synthetic fallback
            res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(downloadRecord.title)}.pdf"`);
            res.setHeader('Content-Type', 'application/pdf');
            res.send(`%PDF-1.4\n1 0 obj\n<< /Title (${downloadRecord.title}) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF`);
        }
    } catch (err) {
        res.status(500).send('Server Error: ' + err.message);
    }
});

// ====================================================================
// 6. ADMIN MANAGEMENT APIs (ระบบบริหารจัดการร้าน)
// ====================================================================

// Get all orders for Admin
app.get('/api/admin/orders', (req, res) => {
    try {
        const { status, search } = req.query;
        let query = `
            SELECT o.order_id, o.order_number, o.total_amount, o.status, o.created_at, o.updated_at,
                   u.username, u.full_name, u.email, u.phone,
                   p.payment_id, p.payment_method, p.payment_status, p.slip_image_url, p.paid_at, p.verified_at, p.note
            FROM orders o
            JOIN users u ON o.user_id = u.user_id
            LEFT JOIN payments p ON o.order_id = p.order_id
            WHERE 1=1
        `;
        const params = [];

        if (status && status !== 'all') {
            query += ' AND o.status = ?';
            params.push(status);
        }

        if (search) {
            query += ' AND (o.order_number LIKE ? OR u.full_name LIKE ? OR u.email LIKE ?)';
            const term = `%${search}%`;
            params.push(term, term, term);
        }

        query += ' ORDER BY o.order_id DESC';
        const orders = db.prepare(query).all(...params);

        // Attach items to each order
        for (const order of orders) {
            order.items = db.prepare(`
                SELECT oi.order_item_id, oi.price_at_purchase, b.ebook_id, b.title, b.cover_image, a.name as author_name
                FROM order_items oi
                JOIN ebooks b ON oi.ebook_id = b.ebook_id
                JOIN authors a ON b.author_id = a.author_id
                WHERE oi.order_id = ?
            `).all(order.order_id);
        }

        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin updates order status (Confirm / Cancel)
app.put('/api/admin/orders/:id/status', (req, res) => {
    const { status, note } = req.body;
    const orderId = req.params.id;

    if (!['confirmed', 'cancelled', 'pending'].includes(status)) {
        return res.status(400).json({ error: 'สถานะไม่ถูกต้อง' });
    }

    const updateStatusTransaction = db.transaction(() => {
        const order = db.prepare('SELECT * FROM orders WHERE order_id = ?').get(orderId);
        if (!order) throw new Error('ไม่พบคำสั่งซื้อ');

        // Update Order
        db.prepare('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE order_id = ?').run(status, orderId);

        if (status === 'confirmed') {
            // Update Payment to verified
            db.prepare(`
                UPDATE payments 
                SET payment_status = 'verified', verified_at = CURRENT_TIMESTAMP, note = ?
                WHERE order_id = ?
            `).run(note || 'ผู้ดูแลอนุมัติคำสั่งซื้อเรียบร้อย', orderId);

            // Automatically grant download links for each book in the order!
            const items = db.prepare('SELECT ebook_id FROM order_items WHERE order_id = ?').all(orderId);
            const insertDownloadLink = db.prepare(`
                INSERT INTO download_links (order_id, ebook_id, user_id, token, download_url, expires_at, download_count, max_downloads)
                VALUES (?, ?, ?, ?, ?, datetime('now', '+90 days'), 0, 10)
                ON CONFLICT(order_id, ebook_id) DO UPDATE SET token = excluded.token
            `);

            for (const item of items) {
                const token = 'tok_' + crypto.randomBytes(16).toString('hex');
                const downloadUrl = `/api/download/${token}`;
                insertDownloadLink.run(orderId, item.ebook_id, order.user_id, token, downloadUrl);
            }
        } else if (status === 'cancelled') {
            db.prepare(`
                UPDATE payments 
                SET payment_status = 'rejected', verified_at = CURRENT_TIMESTAMP, note = ?
                WHERE order_id = ?
            `).run(note || 'ยกเลิกคำสั่งซื้อ', orderId);
        }
    });

    try {
        updateStatusTransaction();
        res.json({ message: `ปรับสถานะคำสั่งซื้อเป็น "${status}" เรียบร้อยแล้ว` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin E-Books Management
app.get('/api/admin/ebooks', (req, res) => {
    try {
        const books = db.prepare(`
            SELECT b.*, c.name AS category_name, a.name AS author_name
            FROM ebooks b
            JOIN categories c ON b.category_id = c.category_id
            JOIN authors a ON b.author_id = a.author_id
            ORDER BY b.ebook_id DESC
        `).all();
        res.json(books);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add new E-Book
app.post('/api/admin/ebooks', (req, res) => {
    try {
        const { category_id, author_id, title, isbn, description, price, cover_image, sample_file_url, full_file_url, is_published } = req.body;
        if (!category_id || !author_id || !title || price === undefined) {
            return res.status(400).json({ error: 'กรุณาระบุข้อมูลจำเป็น (ชื่อเรื่อง, หมวดหมู่, ผู้แต่ง, ราคา)' });
        }

        const insert = db.prepare(`
            INSERT INTO ebooks (category_id, author_id, title, isbn, description, price, cover_image, sample_file_url, full_file_url, is_published)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const result = insert.run(
            category_id,
            author_id,
            title,
            isbn || null,
            description || '',
            parseFloat(price),
            cover_image || '/assets/covers/default.svg',
            sample_file_url || null,
            full_file_url || '/downloads/full_db_guide.pdf',
            is_published !== undefined ? parseInt(is_published) : 1
        );

        res.status(201).json({ message: 'เพิ่มหนังสือเรียบร้อย', ebook_id: result.lastInsertRowid });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update E-Book
app.put('/api/admin/ebooks/:id', (req, res) => {
    try {
        const { category_id, author_id, title, isbn, description, price, cover_image, is_published } = req.body;
        db.prepare(`
            UPDATE ebooks 
            SET category_id = COALESCE(?, category_id),
                author_id = COALESCE(?, author_id),
                title = COALESCE(?, title),
                isbn = COALESCE(?, isbn),
                description = COALESCE(?, description),
                price = COALESCE(?, price),
                cover_image = COALESCE(?, cover_image),
                is_published = COALESCE(?, is_published),
                updated_at = CURRENT_TIMESTAMP
            WHERE ebook_id = ?
        `).run(category_id, author_id, title, isbn, description, price ? parseFloat(price) : null, cover_image, is_published, req.params.id);

        res.json({ message: 'ปรับปรุงข้อมูลหนังสือสำเร็จ' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Toggle E-Book Publish Status
app.put('/api/admin/ebooks/:id/toggle', (req, res) => {
    try {
        const book = db.prepare('SELECT is_published FROM ebooks WHERE ebook_id = ?').get(req.params.id);
        if (!book) return res.status(404).json({ error: 'ไม่พบหนังสือ' });

        const newStatus = book.is_published === 1 ? 0 : 1;
        db.prepare('UPDATE ebooks SET is_published = ?, updated_at = CURRENT_TIMESTAMP WHERE ebook_id = ?').run(newStatus, req.params.id);
        res.json({ message: `เปลี่ยนสถานะเป็น ${newStatus === 1 ? 'พร้อมขาย' : 'ปิดการขาย'} เรียบร้อย`, is_published: newStatus });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Categories Management
app.post('/api/admin/categories', (req, res) => {
    try {
        const { name, slug, description } = req.body;
        if (!name) return res.status(400).json({ error: 'กรุณาระบุชื่อหมวดหมู่' });
        const autoSlug = slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
        
        const result = db.prepare(`
            INSERT INTO categories (name, slug, description, is_active)
            VALUES (?, ?, ?, 1)
        `).run(name, autoSlug, description || null);

        res.status(201).json({ message: 'เพิ่มหมวดหมู่สำเร็จ', category_id: result.lastInsertRowid });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/admin/categories/:id', (req, res) => {
    try {
        const { name, description, is_active } = req.body;
        db.prepare(`
            UPDATE categories 
            SET name = COALESCE(?, name),
                description = COALESCE(?, description),
                is_active = COALESCE(?, is_active)
            WHERE category_id = ?
        `).run(name, description, is_active, req.params.id);

        res.json({ message: 'แก้ไขหมวดหมู่สำเร็จ' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Authors and Users
app.get('/api/admin/authors', (req, res) => {
    const authors = db.prepare('SELECT * FROM authors ORDER BY name ASC').all();
    res.json(authors);
});

app.get('/api/admin/users', (req, res) => {
    const users = db.prepare(`
        SELECT u.user_id, u.username, u.email, u.full_name, u.phone, u.role_id, r.role_name, u.created_at,
               COUNT(o.order_id) AS total_orders
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        LEFT JOIN orders o ON u.user_id = o.user_id
        GROUP BY u.user_id
        ORDER BY u.user_id ASC
    `).all();
    res.json(users);
});

// Update User Role
app.put('/api/admin/users/:id/role', (req, res) => {
    const { role_id } = req.body;
    if (!role_id) return res.status(400).json({ error: 'ไม่ระบุ role_id' });
    db.prepare('UPDATE users SET role_id = ? WHERE user_id = ?').run(role_id, req.params.id);
    res.json({ message: 'เปลี่ยนบทบาทผู้ใช้สำเร็จ' });
});

// ====================================================================
// 7. ANALYTICS & REPORTS APIs (4 รายงานวิเคราะห์ตามข้อ 5 ของใบงาน)
// ====================================================================

// รายงานที่ 1: ยอดขายตามช่วงเวลา (JOIN, GROUP BY, SUM, COUNT, AVG, date filter)
app.get('/api/admin/reports/sales-over-time', (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        let query = `
            SELECT 
                strftime('%Y-%m', o.created_at) AS sale_period,
                COUNT(o.order_id) AS total_orders,
                SUM(o.total_amount) AS gross_sales,
                ROUND(AVG(o.total_amount), 2) AS average_order_value,
                MIN(o.total_amount) AS min_order_amount,
                MAX(o.total_amount) AS max_order_amount
            FROM orders o
            JOIN payments p ON o.order_id = p.order_id
            WHERE o.status = 'confirmed' 
              AND p.payment_status = 'verified'
        `;
        const params = [];

        if (start_date) {
            query += ` AND o.created_at >= ?`;
            params.push(start_date);
        }
        if (end_date) {
            query += ` AND o.created_at <= ?`;
            params.push(end_date + ' 23:59:59');
        }

        query += ` GROUP BY strftime('%Y-%m', o.created_at) ORDER BY sale_period ASC`;
        const data = db.prepare(query).all(...params);

        // Daily breakdown for rich charting
        const dailyData = db.prepare(`
            SELECT 
                strftime('%Y-%m-%d', o.created_at) AS sale_date,
                COUNT(o.order_id) AS orders_count,
                SUM(o.total_amount) AS daily_sales
            FROM orders o
            WHERE o.status = 'confirmed'
            GROUP BY strftime('%Y-%m-%d', o.created_at)
            ORDER BY sale_date DESC
            LIMIT 15
        `).all();

        res.json({ monthly: data, daily: dailyData });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// รายงานที่ 2: E-Book ขายดี (JOIN, GROUP BY, SUM, COUNT, LIMIT)
app.get('/api/admin/reports/best-sellers', (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const data = db.prepare(`
            SELECT 
                b.ebook_id,
                b.title AS ebook_title,
                a.name AS author_name,
                c.name AS category_name,
                b.price AS current_price,
                b.cover_image,
                COUNT(oi.order_item_id) AS total_copies_sold,
                SUM(oi.price_at_purchase) AS total_revenue
            FROM ebooks b
            JOIN authors a ON b.author_id = a.author_id
            JOIN categories c ON b.category_id = c.category_id
            JOIN order_items oi ON b.ebook_id = oi.ebook_id
            JOIN orders o ON oi.order_id = o.order_id
            WHERE o.status = 'confirmed'
            GROUP BY b.ebook_id, b.title, a.name, c.name, b.price, b.cover_image
            ORDER BY total_copies_sold DESC, total_revenue DESC
            LIMIT ?
        `).all(limit);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// รายงานที่ 3: ยอดขายตามหมวดหมู่ (JOIN หลายตาราง, GROUP BY, SUM)
app.get('/api/admin/reports/sales-by-category', (req, res) => {
    try {
        const data = db.prepare(`
            SELECT 
                c.category_id,
                c.name AS category_name,
                COUNT(DISTINCT b.ebook_id) AS total_active_titles,
                COUNT(oi.order_item_id) AS total_items_sold,
                SUM(oi.price_at_purchase) AS total_category_revenue,
                ROUND(SUM(oi.price_at_purchase) * 100.0 / (
                    SELECT SUM(oi2.price_at_purchase) 
                    FROM order_items oi2 
                    JOIN orders o2 ON oi2.order_id = o2.order_id 
                    WHERE o2.status = 'confirmed'
                ), 2) AS revenue_percentage
            FROM categories c
            JOIN ebooks b ON c.category_id = b.category_id
            JOIN order_items oi ON b.ebook_id = oi.ebook_id
            JOIN orders o ON oi.order_id = o.order_id
            WHERE o.status = 'confirmed'
            GROUP BY c.category_id, c.name
            ORDER BY total_category_revenue DESC
        `).all();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// รายงานที่ 4: ลูกค้าและคำสั่งซื้อ (JOIN, GROUP BY, HAVING, COUNT, SUM, เงื่อนไขสถานะ)
app.get('/api/admin/reports/customer-insights', (req, res) => {
    try {
        const minOrders = parseInt(req.query.min_orders) || 1;
        const data = db.prepare(`
            SELECT 
                u.user_id,
                u.username,
                u.full_name,
                u.email,
                COUNT(o.order_id) AS total_orders,
                SUM(CASE WHEN o.status = 'confirmed' THEN 1 ELSE 0 END) AS confirmed_orders,
                SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) AS pending_orders,
                SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_orders,
                COALESCE(SUM(CASE WHEN o.status = 'confirmed' THEN o.total_amount ELSE 0 END), 0) AS total_spent
            FROM users u
            JOIN orders o ON u.user_id = o.user_id
            WHERE u.role_id = 1
            GROUP BY u.user_id, u.username, u.full_name, u.email
            HAVING total_orders >= ?
            ORDER BY total_spent DESC, total_orders DESC
        `).all(minOrders);

        // Status overview
        const statusOverview = db.prepare(`
            SELECT status, COUNT(*) AS count, SUM(total_amount) as total_amount
            FROM orders
            GROUP BY status
        `).all();

        res.json({ customers: data, status_overview: statusOverview });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Dashboard summary stats
app.get('/api/admin/dashboard-stats', (req, res) => {
    try {
        const totalSales = db.prepare(`SELECT COALESCE(SUM(total_amount), 0) AS total FROM orders WHERE status = 'confirmed'`).get();
        const totalOrders = db.prepare(`SELECT COUNT(*) AS total FROM orders`).get();
        const pendingOrders = db.prepare(`SELECT COUNT(*) AS total FROM orders WHERE status = 'pending'`).get();
        const totalUsers = db.prepare(`SELECT COUNT(*) AS total FROM users WHERE role_id = 1`).get();
        const totalEbooks = db.prepare(`SELECT COUNT(*) AS total FROM ebooks WHERE is_published = 1`).get();

        res.json({
            total_sales: totalSales.total,
            total_orders: totalOrders.total,
            pending_orders: pendingOrders.total,
            total_users: totalUsers.total,
            total_ebooks: totalEbooks.total
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Fallback to index.html
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`🚀 EBOOK_ONLINE Server running at http://0.0.0.0:${PORT}`);
    console.log(`📚 Storefront:  http://localhost:${PORT}`);
    console.log(`🛠️ Admin Panel: http://localhost:${PORT}/admin.html`);
    console.log(`=======================================================`);
});
