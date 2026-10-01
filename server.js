const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const crypto = require('crypto');
const db = require('./database/db');
const supabaseSync = require('./database/supabase');
const { createSlipFileForOrder, generateSlipSvg } = require('./utils/slipGenerator');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
// Static Files with custom headers for SVG/Slip images and cache management
app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.js') || filePath.endsWith('.html') || filePath.endsWith('.css')) {
            res.setHeader('Cache-Control', 'no-cache, must-revalidate');
        }
        if (filePath.includes('slips') || filePath.includes('covers')) {
            try {
                const fd = fs.openSync(filePath, 'r');
                const buf = Buffer.alloc(40);
                fs.readSync(fd, buf, 0, 40, 0);
                fs.closeSync(fd);
                const start = buf.toString('utf8');
                if (start.includes('<svg') || start.includes('<?xml')) {
                    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
                }
            } catch (err) {}
        }
    }
}));

// Explicit handler for /assets/slips to ensure 100% correct MIME type
app.get('/assets/slips/:file', (req, res, next) => {
    const filePath = path.join(__dirname, 'public', 'assets', 'slips', req.params.file);
    if (fs.existsSync(filePath)) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            if (content.includes('<svg') || content.includes('<?xml')) {
                res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
                return res.send(content);
            }
        } catch (e) {}
    }
    next();
});

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

// Configure Multer for E-Book cover image uploads
const coverStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dest = path.join(__dirname, 'public', 'assets', 'covers');
        fs.mkdirSync(dest, { recursive: true });
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname) || '.png';
        cb(null, `cover_${unique}${ext}`);
    }
});
const uploadCover = multer({ storage: coverStorage });

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
        
        // 1. ตรวจสอบข้อมูลบังคับ (Required Fields)
        if (!full_name || !full_name.trim()) {
            return res.status(400).json({ error: 'กรุณากรอกชื่อ-นามสกุล' });
        }
        if (!email || !email.trim()) {
            return res.status(400).json({ error: 'กรุณากรอกอีเมล' });
        }
        if (!password) {
            return res.status(400).json({ error: 'กรุณากรอกรหัสผ่าน' });
        }

        full_name = full_name.trim();
        email = email.trim().toLowerCase();
        phone = phone ? phone.trim() : null;

        // 2. มาตรฐานชื่อ-นามสกุล: ความยาว 3-100 ตัวอักษร และไม่มีอักขระพิเศษอันตราย
        if (full_name.length < 3 || full_name.length > 100) {
            return res.status(400).json({ error: 'ชื่อ-นามสกุล ต้องมีความยาวระหว่าง 3 ถึง 100 ตัวอักษร' });
        }
        const nameRegex = /^[a-zA-Zก-๙\s.'-]+$/;
        if (!nameRegex.test(full_name)) {
            return res.status(400).json({ error: 'ชื่อ-นามสกุล ต้องประกอบด้วยตัวอักษรภาษาไทยหรืออังกฤษเท่านั้น ห้ามมีสัญลักษณ์พิเศษหรือตัวเลข' });
        }

        // 3. มาตรฐานอีเมล: รูปแบบ RFC Email Validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email) || email.length > 120) {
            return res.status(400).json({ error: 'รูปแบบอีเมลไม่ถูกต้องตามมาตรฐานสากล (เช่น yourname@domain.com)' });
        }

        // 4. มาตรฐานเบอร์โทรศัพท์ (ถ้ามีการกรอก): 9-10 หลัก เริ่มต้นด้วย 0
        if (phone) {
            const cleanPhone = phone.replace(/[-\s]/g, '');
            const phoneRegex = /^0[0-9]{8,9}$/;
            if (!phoneRegex.test(cleanPhone)) {
                return res.status(400).json({ error: 'เบอร์โทรศัพท์ต้องขึ้นต้นด้วย 0 และเป็นตัวเลข 9-10 หลัก (เช่น 081-234-5678)' });
            }
        }

        // 5. มาตรฐานรหัสผ่าน: อย่างน้อย 6 ตัวอักษร และไม่เกิน 100 ตัวอักษร
        if (password.length < 6) {
            return res.status(400).json({ error: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษรขึ้นไป เพื่อความปลอดภัย' });
        }
        if (password.length > 100) {
            return res.status(400).json({ error: 'รหัสผ่านต้องมีความยาวไม่เกิน 100 ตัวอักษร' });
        }

        // 6. กำหนด Username อัตโนมัติถ้าไม่ได้ระบุ
        if (!username || !username.trim()) {
            const baseUser = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || 'user';
            let candidate = baseUser;
            let counter = 1;
            while (db.prepare('SELECT user_id FROM users WHERE username = ?').get(candidate)) {
                candidate = `${baseUser}${counter++}`;
            }
            username = candidate;
        } else {
            username = username.trim().toLowerCase();
            if (username.length < 3 || username.length > 50) {
                return res.status(400).json({ error: 'ชื่อผู้ใช้งาน (Username) ต้องมีความยาว 3-50 ตัวอักษร' });
            }
            if (!/^[a-zA-Z0-9_]+$/.test(username)) {
                return res.status(400).json({ error: 'ชื่อผู้ใช้งานต้องเป็นตัวอักษรภาษาอังกฤษ ตัวเลข หรือขีดล่าง (_) เท่านั้น' });
            }
        }

        // 7. ตรวจสอบข้อมูลซ้ำในฐานข้อมูล (UNIQUE Constraints)
        const existingEmail = db.prepare('SELECT user_id FROM users WHERE email = ?').get(email);
        if (existingEmail) {
            return res.status(400).json({ error: 'อีเมลนี้มีผู้ใช้งานในระบบแล้ว กรุณาใช้อีเมลอื่น หรือกดเข้าสู่ระบบ' });
        }

        const existingUser = db.prepare('SELECT user_id FROM users WHERE username = ?').get(username);
        if (existingUser) {
            return res.status(400).json({ error: 'ชื่อบัญชีนี้มีผู้ใช้งานแล้ว กรุณาระบุชื่อผู้ใช้งานอื่น' });
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

        // Realtime sync to Supabase Cloud
        try { supabaseSync.syncUserToSupabase({ ...newUser, password_hash: password }); } catch (e) {}

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

// Logout
app.post('/api/auth/logout', (req, res) => {
    res.json({ success: true, message: 'ออกจากระบบเรียบร้อยแล้ว' });
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

// Admin: Get all registered users with order stats
app.get('/api/admin/users', (req, res) => {
    try {
        const users = db.prepare(`
            SELECT u.user_id, u.role_id, r.role_name, u.username, u.email, u.full_name, u.phone, u.created_at,
                   COUNT(DISTINCT o.order_id) as total_orders,
                   COALESCE(SUM(CASE WHEN o.status = 'confirmed' THEN o.total_amount ELSE 0 END), 0) as total_spent
            FROM users u
            JOIN roles r ON u.role_id = r.role_id
            LEFT JOIN orders o ON u.user_id = o.user_id
            GROUP BY u.user_id
            ORDER BY u.user_id DESC
        `).all();
        res.json(users);
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

        // Realtime sync to Supabase Cloud
        try { supabaseSync.syncProfileToSupabase(user.user_id, full_name || user.full_name, phone || user.phone); } catch (e) {}

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

        // Check if user still has remaining download quota for this ebook in a confirmed order
        const activeQuota = db.prepare(`
            SELECT dl.download_id, dl.download_count, dl.max_downloads
            FROM download_links dl
            JOIN orders o ON dl.order_id = o.order_id
            WHERE o.user_id = ? AND dl.ebook_id = ? AND o.status = 'confirmed'
              AND dl.download_count < dl.max_downloads
        `).get(user.user_id, ebook_id);

        if (activeQuota) {
            return res.status(400).json({ 
                error: `ท่านยังมีสิทธิ์ดาวน์โหลด E-Book เล่มนี้คงเหลือ (${activeQuota.download_count}/${activeQuota.max_downloads} ครั้ง) ในประวัติคำสั่งซื้อ` 
            });
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

        // Realtime sync to Supabase Cloud
        try {
            supabaseSync.syncOrderToSupabase(
                { order_id: orderInfo.orderId, order_number: orderInfo.orderNumber, user_id: user.user_id, total_amount: orderInfo.totalAmount, status: 'pending' },
                cartItems
            );
        } catch (e) {}

        res.status(201).json({ message: 'สั่งซื้อสำเร็จ กรุณาแจ้งชำระเงิน', order: orderInfo });
    } catch (err) {
        console.error('Checkout error:', err);
        res.status(500).json({ error: 'ไม่สามารถสร้างคำสั่งซื้อได้: ' + err.message });
    }
});

// Dynamic Slip Preview API (for live preview in checkout modal)
app.get('/api/slips/preview', (req, res) => {
    try {
        const { amount, name, order_number, method } = req.query;
        const svg = generateSlipSvg({
            amount: parseFloat(amount) || 0,
            customerName: name || 'ลูกค้าผู้มีอุปการคุณ',
            orderNumber: order_number || 'PREVIEW',
            bankThemeKey: method === 'bank_transfer' ? 'KBANK' : 'PROMPTPAY'
        });
        res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.send(svg);
    } catch (err) {
        res.status(500).send('Error generating slip preview');
    }
});

// Dynamic Slip Serving / Fallback generator for orders WITH valid slips
app.get(['/api/orders/:id/slip', '/assets/slips/slip_order_:id.svg', '/assets/slips/slip_order_:id.png'], (req, res) => {
    try {
        const orderId = req.params.id;
        const slipsDir = path.join(__dirname, 'public', 'assets', 'slips');
        const svgFile = path.join(slipsDir, `slip_order_${orderId}.svg`);
        const pngFile = path.join(slipsDir, `slip_order_${orderId}.png`);

        // Check order and payment in DB first
        const order = db.prepare(`
            SELECT o.order_id, o.order_number, o.total_amount, o.status, o.created_at,
                   u.full_name, u.username,
                   p.payment_method, p.amount, p.paid_at, p.slip_image_url
            FROM orders o
            JOIN users u ON o.user_id = u.user_id
            LEFT JOIN payments p ON o.order_id = p.order_id
            WHERE o.order_id = ? OR o.order_number = ?
        `).get(orderId, orderId);

        if (!order) {
            return res.status(404).json({ error: 'ไม่พบคำสั่งซื้อ' });
        }

        // CRITICAL: If the order in DB has NO slip, NEVER fabricate a slip!
        if (!order.slip_image_url) {
            // Remove any stale cache file on disk if it existed
            try {
                if (fs.existsSync(svgFile)) fs.unlinkSync(svgFile);
                if (fs.existsSync(pngFile)) fs.unlinkSync(pngFile);
            } catch (e) {}

            return res.status(404).json({ 
                error: 'ไม่มีหลักฐานการชำระเงิน',
                has_slip: false,
                order_number: order.order_number,
                message: 'คำสั่งซื้อนี้ยังไม่มีการแนบสลิป (ค้างชำระ)'
            });
        }

        // If file exists on disk and order genuinely has a slip, send it
        if (fs.existsSync(svgFile)) {
            res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
            res.setHeader('Cache-Control', 'public, max-age=3600');
            return res.sendFile(svgFile);
        }

        // If slip_image_url is registered in DB but file was purged (e.g. fresh Render container), regenerate
        const theme = order.payment_method === 'bank_transfer' ? 'KBANK' : 'PROMPTPAY';
        const svg = generateSlipSvg({
            orderNumber: order.order_number,
            customerName: order.full_name || order.username || 'ลูกค้าผู้มีอุปการคุณ',
            amount: order.amount || order.total_amount,
            bankThemeKey: theme,
            dateStr: order.paid_at || order.created_at,
            note: `ชำระคำสั่งซื้อ #${order.order_number}`
        });

        // Write to cache disk
        try {
            if (!fs.existsSync(slipsDir)) fs.mkdirSync(slipsDir, { recursive: true });
            fs.writeFileSync(svgFile, svg, 'utf8');
            fs.writeFileSync(pngFile, svg, 'utf8');
        } catch (e) {}

        res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.send(svg);
    } catch (err) {
        console.error('Error serving slip:', err);
        res.status(500).send('Error serving slip');
    }
});

// Submit Mock Payment & Slip (Supports both attaching slip and ordering without slip)
app.post('/api/orders/:id/payment', uploadSlip.single('slip_image'), (req, res) => {
    try {
        const orderId = req.params.id;
        const { payment_method, note, skip_slip, no_slip, slip_mock_url } = req.body;
        let slipUrl = null;

        const order = db.prepare(`
            SELECT o.order_id, o.order_number, o.total_amount, o.status, u.full_name, u.username 
            FROM orders o 
            JOIN users u ON o.user_id = u.user_id 
            WHERE o.order_id = ?
        `).get(orderId);
        if (!order) return res.status(404).json({ error: 'ไม่พบคำสั่งซื้อ' });

        if (order.status === 'confirmed') {
            return res.status(400).json({ error: 'คำสั่งซื้อนี้ได้รับการยืนยันเรียบร้อยแล้ว' });
        }

        const isSkip = skip_slip === 'true' || skip_slip === true || no_slip === 'true' || no_slip === true;

        if (isSkip) {
            // Explicitly ordered without slip (for pending / demo cancel)
            slipUrl = null;
            db.prepare(`
                UPDATE payments 
                SET payment_method = ?,
                    payment_status = 'pending',
                    slip_image_url = NULL,
                    amount = ?,
                    note = ?
                WHERE order_id = ?
            `).run(payment_method || 'promptpay_qr', order.total_amount, note || 'สั่งซื้อโดยยังไม่ได้แนบสลิป (ค้างชำระ/ตัวอย่างยกเลิก)', orderId);

            db.prepare("UPDATE orders SET status = 'pending', updated_at = CURRENT_TIMESTAMP WHERE order_id = ?").run(orderId);

            try {
                supabaseSync.syncPaymentToSupabase({
                    order_id: orderId,
                    payment_method: payment_method || 'promptpay_qr',
                    payment_status: 'pending',
                    slip_image_url: null,
                    amount: order.total_amount,
                    note: note || 'สั่งซื้อโดยยังไม่ได้แนบสลิป (ค้างชำระ/ตัวอย่างยกเลิก)'
                });
            } catch (e) {}

            return res.json({ 
                message: 'บันทึกคำสั่งซื้อเรียบร้อย (ยังไม่ได้แนบสลิป/ค้างชำระ)', 
                slip_image_url: null,
                has_slip: false 
            });
        }

        // If file or slip_mock_url provided:
        if (req.file) {
            slipUrl = `/assets/slips/${req.file.filename}`;
        } else if (slip_mock_url) {
            // Generate customized dynamic SVG slip matching the EXACT order total amount & customer name!
            slipUrl = createSlipFileForOrder({
                orderId: order.order_id,
                orderNumber: order.order_number,
                customerName: order.full_name || order.username || 'ลูกค้า EBOOK_ONLINE',
                totalAmount: order.total_amount,
                paymentMethod: payment_method || 'promptpay_qr'
            });
        } else {
            // No file and no slip_mock_url -> do not generate slip
            slipUrl = null;
        }

        const newPaymentStatus = slipUrl ? 'submitted' : 'pending';
        const finalNote = note || (slipUrl ? 'แจ้งชำระเงินจำลองแล้ว' : 'รอการแจ้งชำระเงินและแนบสลิป');

        if (slipUrl) {
            db.prepare(`
                UPDATE payments 
                SET payment_method = ?,
                    payment_status = ?,
                    slip_image_url = ?,
                    amount = ?,
                    paid_at = CURRENT_TIMESTAMP,
                    note = ?
                WHERE order_id = ?
            `).run(payment_method || 'promptpay_qr', newPaymentStatus, slipUrl, order.total_amount, finalNote, orderId);
        } else {
            db.prepare(`
                UPDATE payments 
                SET payment_method = ?,
                    payment_status = ?,
                    slip_image_url = NULL,
                    amount = ?,
                    note = ?
                WHERE order_id = ?
            `).run(payment_method || 'promptpay_qr', newPaymentStatus, order.total_amount, finalNote, orderId);
        }

        db.prepare("UPDATE orders SET status = 'pending', updated_at = CURRENT_TIMESTAMP WHERE order_id = ?").run(orderId);

        // Realtime sync to Supabase Cloud
        try {
            supabaseSync.syncPaymentToSupabase({
                order_id: orderId,
                payment_method: payment_method || 'promptpay_qr',
                payment_status: newPaymentStatus,
                slip_image_url: slipUrl,
                amount: order.total_amount,
                note: finalNote
            });
            supabaseSync.syncOrderStatusToSupabase(orderId, 'pending');
        } catch (e) {}

        res.json({ 
            message: slipUrl ? 'แจ้งชำระเงินสำเร็จ กรุณารอผู้ดูแลระบบตรวจสอบหลักฐาน' : 'บันทึกคำสั่งซื้อ (ยังไม่แนบสลิป) เรียบร้อย', 
            slip_image_url: slipUrl,
            has_slip: !!slipUrl 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Customer/User cancels pending order
app.put('/api/orders/:id/cancel', (req, res) => {
    try {
        const orderId = req.params.id;
        const user = getCurrentUser(req);
        
        const order = db.prepare('SELECT * FROM orders WHERE order_id = ?').get(orderId);
        if (!order) return res.status(404).json({ error: 'ไม่พบคำสั่งซื้อ' });

        // Check ownership (if not admin)
        if (user && user.role_id !== 2 && order.user_id !== user.user_id) {
            return res.status(403).json({ error: 'ไม่มีสิทธิ์ยกเลิกคำสั่งซื้อนี้' });
        }

        if (order.status === 'confirmed') {
            return res.status(400).json({ error: 'คำสั่งซื้อที่อนุมัติแล้วไม่สามารถยกเลิกได้' });
        }

        if (order.status === 'cancelled') {
            return res.status(400).json({ error: 'คำสั่งซื้อนี้ถูกยกเลิกไปแล้ว' });
        }

        db.transaction(() => {
            db.prepare("UPDATE orders SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE order_id = ?").run(orderId);
            db.prepare("UPDATE payments SET payment_status = 'rejected', note = 'ลูกค้ายกเลิกคำสั่งซื้อ', verified_at = CURRENT_TIMESTAMP WHERE order_id = ?").run(orderId);
        })();

        // Sync to Supabase
        try {
            supabaseSync.syncOrderStatusToSupabase(orderId, 'cancelled');
        } catch (e) {}

        res.json({ message: 'ยกเลิกคำสั่งซื้อเรียบร้อยแล้ว' });
    } catch (err) {
        console.error('Cancel order error:', err);
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
                <div style="font-family: sans-serif; text-align: center; padding: 50px; line-height: 1.6;">
                    <h1 style="color: #ea580c; font-size: 24px;">🔒 สิทธิ์ดาวน์โหลดครบตามโควตาแล้ว (${downloadRecord.max_downloads}/${downloadRecord.max_downloads} ครั้ง)</h1>
                    <p style="font-size: 16px; color: #475569; margin: 12px 0;">
                        คุณได้ดาวน์โหลดไฟล์ E-Book <strong>"${downloadRecord.title}"</strong> ครบตามโควตาความปลอดภัย (${downloadRecord.max_downloads} ครั้ง) แล้ว
                    </p>
                    <p style="color: #64748b; font-size: 14px;">
                        หากต้องการดาวน์โหลดเพิ่มเติม ท่านสามารถสั่งซื้อเล่มนี้ใหม่ผ่านหน้าร้านเพื่อรับโควตาดาวน์โหลดเพิ่มอีก 10 ครั้งได้ทันที
                    </p>
                    <div style="margin-top: 24px; display: flex; gap: 12px; justify-content: center;">
                        <a href="/#catalog" style="display:inline-block; padding:10px 20px; background:#0284c7; color:#fff; text-decoration:none; border-radius:6px; font-weight:600;">🛒 ไปสั่งซื้อที่หน้าร้าน</a>
                        <a href="/#orders" style="display:inline-block; padding:10px 20px; background:#64748b; color:#fff; text-decoration:none; border-radius:6px;">📋 ดูประวัติคำสั่งซื้อ</a>
                    </div>
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

        // Realtime sync to Supabase Cloud (including identical download links from SQLite)
        try { supabaseSync.syncOrderStatusToSupabase(orderId, status, db); } catch (e) {}

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
app.post('/api/admin/ebooks', uploadCover.single('cover_file'), async (req, res) => {
    try {
        const { category_id, author_id, title, isbn, description, price, cover_image, sample_file_url, full_file_url, is_published } = req.body;
        if (!category_id || !author_id || !title || price === undefined) {
            return res.status(400).json({ error: 'กรุณาระบุข้อมูลจำเป็น (ชื่อเรื่อง, หมวดหมู่, ผู้แต่ง, ราคา)' });
        }

        let finalCover = '/assets/covers/default.svg';
        if (req.file) {
            finalCover = `/assets/covers/${req.file.filename}`;
        } else if (cover_image && cover_image.trim()) {
            finalCover = cover_image.trim();
        }

        const insert = db.prepare(`
            INSERT INTO ebooks (category_id, author_id, title, isbn, description, price, cover_image, sample_file_url, full_file_url, is_published)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const result = insert.run(
            parseInt(category_id),
            parseInt(author_id),
            title.trim(),
            isbn ? isbn.trim() : null,
            description ? description.trim() : '',
            parseFloat(price),
            finalCover,
            sample_file_url || null,
            full_file_url || '/downloads/full_db_guide.pdf',
            is_published !== undefined ? parseInt(is_published) : 1
        );

        // Sync to Supabase Cloud
        try {
            await supabaseSync.pool.query(`
                INSERT INTO ebooks (ebook_id, category_id, author_id, title, isbn, description, price, cover_image, sample_file_url, full_file_url, is_published)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                ON CONFLICT (ebook_id) DO UPDATE SET 
                    title = EXCLUDED.title, price = EXCLUDED.price, cover_image = EXCLUDED.cover_image, description = EXCLUDED.description, is_published = EXCLUDED.is_published;
            `, [result.lastInsertRowid, parseInt(category_id), parseInt(author_id), title.trim(), isbn ? isbn.trim() : null, description ? description.trim() : '', parseFloat(price), finalCover, sample_file_url || null, full_file_url || '/downloads/full_db_guide.pdf', is_published !== undefined ? parseInt(is_published) : 1]);
        } catch (syncErr) {
            console.warn('⚠️ Supabase ebook sync note:', syncErr.message);
        }

        res.status(201).json({ message: 'เพิ่มหนังสือเรียบร้อย', ebook_id: result.lastInsertRowid, cover_image: finalCover });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update E-Book
app.put('/api/admin/ebooks/:id', uploadCover.single('cover_file'), async (req, res) => {
    try {
        const { category_id, author_id, title, isbn, description, price, cover_image, is_published, full_file_url } = req.body;
        
        let finalCover = cover_image || null;
        if (req.file) {
            finalCover = `/assets/covers/${req.file.filename}`;
        }

        db.prepare(`
            UPDATE ebooks 
            SET category_id = COALESCE(?, category_id),
                author_id = COALESCE(?, author_id),
                title = COALESCE(?, title),
                isbn = COALESCE(?, isbn),
                description = COALESCE(?, description),
                price = COALESCE(?, price),
                cover_image = COALESCE(?, cover_image),
                full_file_url = COALESCE(?, full_file_url),
                is_published = COALESCE(?, is_published),
                updated_at = CURRENT_TIMESTAMP
            WHERE ebook_id = ?
        `).run(
            category_id ? parseInt(category_id) : null,
            author_id ? parseInt(author_id) : null,
            title ? title.trim() : null,
            isbn ? isbn.trim() : null,
            description !== undefined ? description.trim() : null,
            price ? parseFloat(price) : null,
            finalCover,
            full_file_url ? full_file_url.trim() : null,
            is_published !== undefined && is_published !== null ? parseInt(is_published) : null,
            req.params.id
        );

        // Sync update to Supabase
        try {
            await supabaseSync.pool.query(`
                UPDATE ebooks 
                SET title = COALESCE($1, title),
                    price = COALESCE($2, price),
                    cover_image = COALESCE($3, cover_image),
                    description = COALESCE($4, description),
                    is_published = COALESCE($5, is_published),
                    updated_at = CURRENT_TIMESTAMP
                WHERE ebook_id = $6
            `, [title ? title.trim() : null, price ? parseFloat(price) : null, finalCover, description !== undefined ? description.trim() : null, is_published !== undefined && is_published !== null ? parseInt(is_published) : null, req.params.id]);
        } catch (syncErr) {
            console.warn('⚠️ Supabase ebook update note:', syncErr.message);
        }

        res.json({ message: 'ปรับปรุงข้อมูลหนังสือสำเร็จ', cover_image: finalCover });
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

// Delete E-Book (จัดการลบหนังสือ ป้องกัน Foreign Key Constraint ด้วยการตรวจสอบประวัติคำสั่งซื้อ)
app.delete('/api/admin/ebooks/:id', async (req, res) => {
    try {
        const ebookId = parseInt(req.params.id);
        const book = db.prepare('SELECT * FROM ebooks WHERE ebook_id = ?').get(ebookId);
        if (!book) {
            return res.status(404).json({ error: 'ไม่พบหนังสือที่ต้องการลบในระบบ' });
        }

        // 1. ตรวจสอบว่ามีประวัติการสั่งซื้อหนังสือเล่มนี้หรือไม่
        const orderCountRow = db.prepare('SELECT COUNT(*) as count FROM order_items WHERE ebook_id = ?').get(ebookId);
        const orderCount = orderCountRow ? orderCountRow.count : 0;
        const force = req.query.force === 'true';

        // หากมีประวัติการซื้อ และไม่ได้ระบุ force=true ให้แจ้งเตือนความปลอดภัยของข้อมูล
        if (orderCount > 0 && !force) {
            return res.status(400).json({
                has_orders: true,
                order_count: orderCount,
                error: `หนังสือ "${book.title}" มีประวัติการสั่งซื้อแล้ว ${orderCount} รายการ เพื่อรักษาประวัติการสั่งซื้อและสิทธิ์ดาวน์โหลดของลูกค้า แนะนำให้ใช้ปุ่ม "ปิดการขาย" แทน หรือกดยืนยันหากต้องการลบประวัติที่เกี่ยวข้องทั้งหมด (Force Delete)`
            });
        }

        // 2. ดำเนินการลบข้อมูล (ใช้ Transaction ป้องกันข้อมูลสูญหายกึ่งกลาง)
        const deleteTransaction = db.transaction(() => {
            if (force && orderCount > 0) {
                db.prepare('DELETE FROM download_links WHERE ebook_id = ?').run(ebookId);
                db.prepare('DELETE FROM order_items WHERE ebook_id = ?').run(ebookId);
            }
            db.prepare('DELETE FROM cart_items WHERE ebook_id = ?').run(ebookId);
            db.prepare('DELETE FROM ebooks WHERE ebook_id = ?').run(ebookId);
        });
        deleteTransaction();

        // 3. ซิงค์การลบข้อมูลไปยัง Supabase PostgreSQL (ถ้าเชื่อมต่ออยู่)
        try {
            if (force && orderCount > 0) {
                await supabaseSync.pool.query('DELETE FROM download_links WHERE ebook_id = $1', [ebookId]);
                await supabaseSync.pool.query('DELETE FROM order_items WHERE ebook_id = $1', [ebookId]);
            }
            await supabaseSync.pool.query('DELETE FROM cart_items WHERE ebook_id = $1', [ebookId]);
            await supabaseSync.pool.query('DELETE FROM ebooks WHERE ebook_id = $1', [ebookId]);
            console.log(`☁️ Synced deletion of E-Book ID #${ebookId} to Supabase`);
        } catch (syncErr) {
            console.warn('⚠️ Supabase sync delete notice:', syncErr.message);
        }

        res.json({ message: `ลบหนังสือ "${book.title}" เรียบร้อยแล้ว` });
    } catch (err) {
        console.error('Delete ebook error:', err);
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

// Admin Authors Management
app.get('/api/admin/authors', (req, res) => {
    try {
        const authors = db.prepare(`
            SELECT a.*, COUNT(b.ebook_id) AS book_count
            FROM authors a
            LEFT JOIN ebooks b ON a.author_id = b.author_id
            GROUP BY a.author_id
            ORDER BY a.name ASC
        `).all();
        res.json(authors);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add new Author
app.post('/api/admin/authors', async (req, res) => {
    try {
        const { name, bio, email } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'กรุณาระบุชื่อผู้แต่ง / นักเขียน' });
        }

        const insert = db.prepare(`
            INSERT INTO authors (name, bio, email)
            VALUES (?, ?, ?)
        `);
        const result = insert.run(name.trim(), bio ? bio.trim() : null, email ? email.trim() : null);
        const newAuthorId = result.lastInsertRowid;

        // Sync to Supabase
        try {
            await supabaseSync.pool.query(`
                INSERT INTO authors (author_id, name, bio, email)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (author_id) DO UPDATE SET 
                    name = EXCLUDED.name, bio = EXCLUDED.bio, email = EXCLUDED.email;
            `, [newAuthorId, name.trim(), bio ? bio.trim() : null, email ? email.trim() : null]);
        } catch (syncErr) {
            console.warn('⚠️ Supabase author sync note:', syncErr.message);
        }

        res.status(201).json({ 
            message: `เพิ่มผู้แต่ง "${name.trim()}" เรียบร้อยแล้ว`,
            author_id: newAuthorId,
            author: { author_id: newAuthorId, name: name.trim(), bio: bio ? bio.trim() : '', email: email ? email.trim() : '' }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Author (ตรวจสอบไม่ให้ลบผู้แต่งที่มีหนังสืออยู่ในระบบ)
app.delete('/api/admin/authors/:id', async (req, res) => {
    try {
        const authorId = req.params.id;
        const author = db.prepare('SELECT name FROM authors WHERE author_id = ?').get(authorId);
        if (!author) return res.status(404).json({ error: 'ไม่พบผู้แต่งที่ต้องการลบ' });

        const bookCountRow = db.prepare('SELECT COUNT(*) as count FROM ebooks WHERE author_id = ?').get(authorId);
        if (bookCountRow && bookCountRow.count > 0) {
            return res.status(400).json({ 
                error: `ไม่สามารถลบผู้แต่ง "${author.name}" ได้ เนื่องจากมีหนังสือในระบบผูกอยู่ ${bookCountRow.count} เล่ม` 
            });
        }

        db.prepare('DELETE FROM authors WHERE author_id = ?').run(authorId);

        try {
            await supabaseSync.pool.query('DELETE FROM authors WHERE author_id = $1', [authorId]);
        } catch (e) {}

        res.json({ message: `ลบผู้แต่ง "${author.name}" เรียบร้อยแล้ว` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Note: /api/admin/users is defined above with order & spent statistics


// Update User Role
app.put('/api/admin/users/:id/role', (req, res) => {
    const { role_id } = req.body;
    if (!role_id) return res.status(400).json({ error: 'ไม่ระบุ role_id' });
    db.prepare('UPDATE users SET role_id = ? WHERE user_id = ?').run(role_id, req.params.id);
    res.json({ message: 'เปลี่ยนบทบาทผู้ใช้สำเร็จ' });
});

// ====================================================================
// 7. ANALYTICS & REPORTS APIs (4 รายงานวิเคราะห์ตามข้อ 5 ของใบงาน & PDF เล่มรายงาน)
// ====================================================================

// รายงานที่ 1: สรุปยอดขายและจำนวนเล่มที่ขายได้ของหนังสือแต่ละเล่ม (JOIN, GROUP BY, COUNT, SUM, ORDER BY)
app.get(['/api/admin/reports/sales-by-book', '/api/admin/reports/sales-over-time'], (req, res) => {
    try {
        const data = db.prepare(`
            SELECT 
                ebooks.title,
                COUNT(order_items.order_item_id) AS total_sold,
                SUM(order_items.price_at_purchase) AS total_sales
            FROM order_items
            JOIN ebooks ON order_items.ebook_id = ebooks.ebook_id
            GROUP BY ebooks.title
            ORDER BY total_sales DESC
        `).all();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// รายงานที่ 2: จัดอันดับ E-Book ขายดีที่สุด 3 อันดับแรก (Top 3 Bestsellers) (JOIN, GROUP BY, COUNT, ORDER BY, LIMIT)
app.get(['/api/admin/reports/best-sellers-top3', '/api/admin/reports/best-sellers'], (req, res) => {
    try {
        const data = db.prepare(`
            SELECT 
                ebooks.title,
                COUNT(order_items.order_item_id) AS total_sold
            FROM order_items
            JOIN ebooks ON order_items.ebook_id = ebooks.ebook_id
            GROUP BY ebooks.title
            ORDER BY total_sold DESC
            LIMIT 3
        `).all();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// รายงานที่ 3: สรุปประสิทธิภาพช่องทางชำระเงินและยอดเฉลี่ยต่อบิล (JOIN, GROUP BY, COUNT, SUM, AVG, ROUND, ORDER BY)
app.get(['/api/admin/reports/payment-methods', '/api/admin/reports/sales-by-category'], (req, res) => {
    try {
        const data = db.prepare(`
            SELECT 
                payments.payment_method,
                COUNT(orders.order_id) AS total_orders,
                SUM(orders.total_amount) AS total_sales,
                ROUND(AVG(orders.total_amount), 2) AS avg_sales
            FROM orders
            JOIN payments ON orders.order_id = payments.order_id
            WHERE orders.status = 'confirmed'
            GROUP BY payments.payment_method
            ORDER BY total_sales DESC
        `).all();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// รายงานที่ 4: ค้นหาลูกค้าประจำที่ซื้อตั้งแต่ 2 ครั้งขึ้นไป (JOIN, GROUP BY, HAVING, COUNT, SUM, ORDER BY)
app.get(['/api/admin/reports/repeat-customers', '/api/admin/reports/customer-insights'], (req, res) => {
    try {
        const data = db.prepare(`
            SELECT 
                users.full_name,
                COUNT(orders.order_id) AS total_orders,
                SUM(orders.total_amount) AS total_spent
            FROM users
            JOIN orders ON users.user_id = orders.user_id
            WHERE orders.status = 'confirmed'
            GROUP BY users.full_name
            HAVING COUNT(orders.order_id) >= 2
            ORDER BY total_spent DESC
        `).all();
        res.json(data);
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

// Export current SQLite Database file for grading / verification
app.get('/api/admin/export-db', (req, res) => {
    try {
        const dbPath = path.join(__dirname, 'database', 'ebookstore.db');
        if (fs.existsSync(dbPath)) {
            res.download(dbPath, 'ebookstore.db');
        } else {
            res.status(404).json({ error: 'ไม่พบไฟล์ฐานข้อมูล' });
        }
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
