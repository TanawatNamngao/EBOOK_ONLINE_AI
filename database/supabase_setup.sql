-- ====================================================================
-- EBOOK_ONLINE: Supabase PostgreSQL Schema & Seed Migration Script
-- รันไฟล์นี้ใน Supabase Studio > SQL Editor เพื่อสร้างตารางและใส่ข้อมูลเริ่มต้น
-- ====================================================================

-- 0. ล้างตารางเดิม (ถ้ามี)
DROP TABLE IF EXISTS download_links CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS ebooks CASCADE;
DROP TABLE IF EXISTS authors CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- 1. ตารางบทบาทผู้ใช้งาน (Roles)
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
);

-- 2. ตารางผู้ใช้งาน (Users)
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    role_id INTEGER NOT NULL DEFAULT 1,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- 3. ตารางหมวดหมู่หนังสือ (Categories)
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1))
);

-- 4. ตารางนักเขียน/ผู้แต่ง (Authors)
CREATE TABLE authors (
    author_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    bio TEXT,
    email VARCHAR(120)
);

-- 5. ตารางหนังสืออิเล็กทรอนิกส์ (E-Books)
CREATE TABLE ebooks (
    ebook_id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL,
    author_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    isbn VARCHAR(30) UNIQUE,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    cover_image VARCHAR(255) NOT NULL DEFAULT '/assets/covers/default.png',
    sample_file_url VARCHAR(255),
    full_file_url VARCHAR(255) NOT NULL,
    is_published INTEGER NOT NULL DEFAULT 1 CHECK (is_published IN (0, 1)),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (author_id) REFERENCES authors(author_id) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- 6. ตารางตะกร้าสินค้า (Carts - 1 ผู้ใช้ ต่อ 1 ตะกร้า)
CREATE TABLE carts (
    cart_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 7. ตารางรายการในตะกร้า (Cart Items)
CREATE TABLE cart_items (
    cart_item_id SERIAL PRIMARY KEY,
    cart_id INTEGER NOT NULL,
    ebook_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity = 1),
    added_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES carts(cart_id) ON DELETE CASCADE,
    FOREIGN KEY (ebook_id) REFERENCES ebooks(ebook_id) ON DELETE CASCADE,
    UNIQUE(cart_id, ebook_id)
);

-- 8. ตารางคำสั่งซื้อ (Orders)
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    order_number VARCHAR(40) NOT NULL UNIQUE,
    user_id INTEGER NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- 9. ตารางรายการสินค้าในคำสั่งซื้อ (Order Items)
CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    ebook_id INTEGER NOT NULL,
    price_at_purchase DECIMAL(10, 2) NOT NULL CHECK (price_at_purchase >= 0),
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (ebook_id) REFERENCES ebooks(ebook_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    UNIQUE(order_id, ebook_id)
);

-- 10. ตารางการชำระเงินจำลอง (Payments)
CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL UNIQUE,
    payment_method VARCHAR(30) NOT NULL CHECK (payment_method IN ('promptpay_qr', 'bank_transfer', 'mock_gateway')),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'submitted' CHECK (payment_status IN ('pending', 'submitted', 'verified', 'rejected')),
    slip_image_url VARCHAR(255),
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    paid_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMPTZ,
    note VARCHAR(255),
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

-- 11. ตารางสิทธิ์และลิงก์ดาวน์โหลดที่ปลอดภัย (Download Links)
CREATE TABLE download_links (
    download_id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    ebook_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    token VARCHAR(64) NOT NULL UNIQUE,
    download_url VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    download_count INTEGER NOT NULL DEFAULT 0 CHECK (download_count >= 0),
    max_downloads INTEGER NOT NULL DEFAULT 10 CHECK (max_downloads >= 1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (ebook_id) REFERENCES ebooks(ebook_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE(order_id, ebook_id)
);

-- ดัชนีเพิ่มประสิทธิภาพการสืบค้น (Indexes)
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_ebooks_category ON ebooks(category_id);
CREATE INDEX idx_ebooks_author ON ebooks(author_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_order_items_ebook ON order_items(ebook_id);
CREATE INDEX idx_payments_status ON payments(payment_status);
CREATE INDEX idx_downloads_token ON download_links(token);
CREATE INDEX idx_downloads_user ON download_links(user_id);

-- ปิด Row Level Security (RLS) เพื่อให้ระบบ Backend เชื่อมต่อจัดการข้อมูลได้ทันที
ALTER TABLE roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE authors DISABLE ROW LEVEL SECURITY;
ALTER TABLE ebooks DISABLE ROW LEVEL SECURITY;
ALTER TABLE carts DISABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE download_links DISABLE ROW LEVEL SECURITY;

-- ====================================================================
-- SEED DATA
-- ====================================================================

-- 1. ข้อมูลบทบาท (Roles)
INSERT INTO roles (role_id, role_name, description) VALUES
(1, 'customer', 'ลูกค้าทั่วไป สามารถค้นหา สั่งซื้อ และดาวน์โหลด E-Book'),
(2, 'admin', 'ผู้ดูแลระบบ มีสิทธิ์จัดการหนังสือ หมวดหมู่ อนุมัติคำสั่งซื้อ และดูรายงาน');

-- 2. ข้อมูลผู้ใช้งาน (Users)
INSERT INTO users (user_id, role_id, username, email, password_hash, full_name, phone, created_at) VALUES
(1, 2, 'admin', 'admin@ebookstore.local', 'admin123', 'ผู้ดูแลระบบสูงสุด (System Admin)', '081-999-8888', '2026-06-01 08:00:00+07'),
(2, 1, 'thanawat', 'thanawat@example.com', '123456', 'นายธนวัฒน์ นามเหง้า', '089-111-2222', '2026-06-05 09:30:00+07'),
(3, 1, 'panuwat', 'panuwat@example.com', '123456', 'นายภานุวัฒน์ แสงเครือ', '089-333-4444', '2026-06-08 10:15:00+07'),
(4, 1, 'somchai', 'somchai.d@gmail.com', '123456', 'สมชาย ดำรงไทย', '082-456-7890', '2026-06-12 11:20:00+07'),
(5, 1, 'suda', 'suda.k@outlook.com', '123456', 'สุดา เกียรติสกุล', '083-987-6543', '2026-06-15 14:00:00+07'),
(6, 1, 'wichai', 'wichai.b@hotmail.com', '123456', 'วิชัย บุญมา', '084-555-1234', '2026-06-20 16:45:00+07'),
(7, 1, 'kanya', 'kanya.w@gmail.com', '123456', 'กัญญา วารินทร์', '085-333-9876', '2026-07-01 10:00:00+07'),
(8, 1, 'anon', 'anon.m@yahoo.com', '123456', 'อานนท์ มั่นคง', '086-777-8899', '2026-07-10 13:10:00+07'),
(9, 1, 'pimpa', 'pimpa.c@gmail.com', '123456', 'พิมพา ชูใจ', '087-123-9900', '2026-07-15 15:30:00+07'),
(10, 1, 'chavalit', 'chavalit.t@gmail.com', '123456', 'ชวลิต ธนกิจ', '088-444-2211', '2026-08-01 09:00:00+07'),
(11, 1, 'nattaporn', 'nattaporn.s@gmail.com', '123456', 'ณัฐพร สุขเกษม', '089-666-3322', '2026-08-10 11:40:00+07'),
(12, 1, 'teerapat', 'teerapat.p@gmail.com', '123456', 'ธีรภัทร พงษ์ศิริ', '081-222-3344', '2026-08-20 17:00:00+07');

-- 3. ข้อมูลหมวดหมู่ (Categories)
INSERT INTO categories (category_id, name, slug, description, is_active) VALUES
(1, 'เทคโนโลยีและการเขียนโปรแกรม', 'tech', 'หนังสือเรียนรู้ Coding, ฐานข้อมูล, AI และระบบคลาวด์', 1),
(2, 'ธุรกิจและการลงทุน', 'business', 'กลยุทธ์การตลาด การบริหารการเงิน และโมเดลธุรกิจสตาร์ทอัพ', 1),
(3, 'การพัฒนาตนเองและจิตวิทยา', 'self-dev', 'เพิ่มประสิทธิภาพการทำงาน จิตวิทยาการสื่อสาร และการจัดการอารมณ์', 1),
(4, 'นิยายและวรรณกรรมสร้างสรรค์', 'fiction', 'นิยายสืบสวน ไซไฟแฟนตาซี และวรรณกรรมแปลชั้นนำ', 1),
(5, 'ภาษาและการสื่อสารสากล', 'language', 'คู่มือพัฒนาทักษะภาษาอังกฤษ จีน และเทคนิคการสอบวัดระดับ', 1);

-- 4. ข้อมูลนักเขียน (Authors)
INSERT INTO authors (author_id, name, bio, email) VALUES
(1, 'ดร. สมเกียรติ์ ปัญญาดิลก', 'ผู้เชี่ยวชาญด้านวิทยาการข้อมูลและสถาปัตยกรรมระบบฐานข้อมูลขนาดใหญ่', 'somkiat.p@ai-data.org'),
(2, 'ณัฐวุฒิ นวการค้า', 'ที่ปรึกษาธุรกิจสตาร์ทอัพและวิทยากรด้านกลยุทธ์ดิจิทัลเทรนด์ใหม่', 'nattawut@startup-pro.biz'),
(3, 'พญ. ชิดชนก สุขสราญ', 'แพทย์ผู้เชี่ยวชาญด้านสุขภาพจิตและนักเขียนด้านจิตวิทยาประยุกต์เพื่อชีวิตที่สมดุล', 'chidchanok@mindfuldoc.th'),
(4, 'วายุ อักษรศิลป์', 'นักเขียนนวนิยายแนววิทยาศาสตร์แฟนตาซีและสืบสวนสอบสวน เจ้าของผลงานติดอันดับเบสต์เซลเลอร์', 'wayu@novelist-club.com'),
(5, 'เจเรมี เฉิน (Jeremy Chen)', 'อาจารย์ภาษาศาสตร์ประยุกต์และผู้เชี่ยวชาญการสอนภาษาเพื่อการสื่อสารธุรกิจระดับนานาชาติ', 'jchen@global-lang.edu'),
(6, 'กิตติศักดิ์ พัฒนาซอฟต์', 'Full-stack Architect และที่ปรึกษาด้านความปลอดภัยบนคลาวด์และ Web API', 'kittisak@devcraft.io');

-- 5. ข้อมูลหนังสือ E-Books (12 รายการ)
INSERT INTO ebooks (ebook_id, category_id, author_id, title, isbn, description, price, cover_image, sample_file_url, full_file_url, is_published, created_at) VALUES
(1, 1, 1, 'คู่มือออกแบบและจัดการฐานข้อมูลขั้นสูง (Modern Database Design)', '978-616-01-0001-1', 'เจาะลึกการออกแบบ ERD, Normalization 3NF, BCNF, การปรับแต่ง Index และคำสั่ง SQL ประสิทธิภาพสูงสำหรับการทำงานระดับมืออาชีพ', 350.00, '/assets/covers/book1.svg', '/samples/sample_db.pdf', '/downloads/full_db_guide.pdf', 1, '2026-06-01 10:00:00+07'),
(2, 1, 6, 'Full-Stack JavaScript กับ Node.js & SQLite', '978-616-01-0002-8', 'สร้างเว็บแอปพลิเคชันอย่างเป็นระบบตั้งแต่พื้นฐาน REST API, จัดการฐานข้อมูล SQLite จนถึงการควบคุมสิทธิ์ความปลอดภัย', 290.00, '/assets/covers/book2.svg', '/samples/sample_js.pdf', '/downloads/full_js_stack.pdf', 1, '2026-06-02 11:00:00+07'),
(3, 1, 1, 'ปัญญาประดิษฐ์และ Machine Learning ฉบับใช้งานได้จริง', '978-616-01-0003-5', 'เรียนรู้หลักการ AI สมัยใหม่ การสร้างโมเดล Machine Learning และการประยุกต์ใช้งานวิเคราะห์ข้อมูลเชิงลึกในองค์กร', 420.00, '/assets/covers/book3.svg', '/samples/sample_ai.pdf', '/downloads/full_ai_practical.pdf', 1, '2026-06-03 14:00:00+07'),
(4, 2, 2, 'สตาร์ทอัพติดสปีด: กลยุทธ์เติบโตแบบก้าวกระโดด (Lean Startup Scale)', '978-616-02-0004-2', 'เคล็ดลับสร้างธุรกิจให้อยู่รอดและเติบโตในยุคดิจิทัล การวิเคราะห์โมเดลธุรกิจ การหา Product-Market Fit และระดมทุน', 250.00, '/assets/covers/book4.svg', '/samples/sample_startup.pdf', '/downloads/full_startup_scale.pdf', 1, '2026-06-04 09:30:00+07'),
(5, 2, 2, 'การเงินและการลงทุนฉบับเข้าใจง่ายสำหรับคนทำงาน', '978-616-02-0005-9', 'คู่มือวางแผนทางการเงิน การจัดพอร์ตโฟลิโอหุ้น กองทุนรวม อสังหาริมทรัพย์ และการบริหารกระแสเงินสดส่วนบุคคล', 220.00, '/assets/covers/book5.svg', '/samples/sample_finance.pdf', '/downloads/full_personal_finance.pdf', 1, '2026-06-05 13:15:00+07'),
(6, 3, 3, 'จัดระเบียบความคิด พิชิตความกังวล (Mindset for Success)', '978-616-03-0006-6', 'เทคนิคทางจิตวิทยาเพื่อการปรับปรุงกรอบความคิด ขจัดความเครียด เพิ่มสมาธิและประสิทธิภาพในการเรียนและการทำงานประจำวัน', 195.00, '/assets/covers/book6.svg', '/samples/sample_mindset.pdf', '/downloads/full_mindset_success.pdf', 1, '2026-06-06 15:45:00+07'),
(7, 3, 3, 'ศิลปะการสื่อสารและโน้มน้าวใจในที่ทำงาน', '978-616-03-0007-3', 'พัฒนาทักษะการฟัง การเจรจาต่อรอง และการนำเสนองานเพื่อสร้างความสัมพันธ์ที่ดีและบรรลุเป้าหมายในอาชีพการงาน', 210.00, '/assets/covers/book7.svg', '/samples/sample_comm.pdf', '/downloads/full_effective_comm.pdf', 1, '2026-06-07 10:20:00+07'),
(8, 4, 4, 'รหัสลับนครสูญหาย (The Lost Chrono Cipher)', '978-616-04-0008-0', 'นิยายไซไฟสืบสวนระทึกขวัญ การไขปริศนาโบราณคดีไซเบอร์และการผจญภัยข้ามมิติเวลาที่หยุดไม่อยู่', 280.00, '/assets/covers/book8.svg', '/samples/sample_chrono.pdf', '/downloads/full_lost_chrono.pdf', 1, '2026-06-08 16:30:00+07'),
(9, 4, 4, 'เงาอัศวินแห่งรัตติกาล (Shadow of the Knight)', '978-616-04-0009-7', 'มหากาพย์วรรณกรรมแฟนตาซี การต่อสู้เพื่อความยุติธรรม เวทมนตร์ และมิตรภาพที่ต้องแลกมาด้วยความเสียสละ', 260.00, '/assets/covers/book9.svg', '/samples/sample_shadow.pdf', '/downloads/full_shadow_knight.pdf', 1, '2026-06-09 11:10:00+07'),
(10, 5, 5, 'พิชิตข้อสอบภาษาอังกฤษเพื่อการทำงาน (Business English Mastery)', '978-616-05-0010-3', 'คำศัพท์ สำนวน การเขียนอีเมลธุรกิจ การประชุม และเทคนิคการทำข้อสอบ TOEIC ให้ได้คะแนน 850+', 270.00, '/assets/covers/book10.svg', '/samples/sample_eng.pdf', '/downloads/full_business_eng.pdf', 1, '2026-06-10 14:00:00+07'),
(11, 5, 5, 'ภาษาญี่ปุ่นระดับต้นเพื่อการท่องเที่ยวและการทำงาน', '978-616-05-0011-0', 'ไวยากรณ์และบทสนทนาภาษาญี่ปุ่นที่จำเป็นในชีวิตประจำวัน พร้อมแบบฝึกหัดเตรียมสอบ JLPT N5-N4', 240.00, '/assets/covers/book11.svg', '/samples/sample_jp.pdf', '/downloads/full_basic_japanese.pdf', 1, '2026-06-11 09:00:00+07'),
(12, 1, 6, 'Cloud Security & DevOps Fundamentals', '978-616-01-0012-7', 'แนวทางปฏิบัติในการดูแลความปลอดภัยของระบบคลาวด์ คอนเทนเนอร์ Docker, Kubernetes และ CI/CD Pipeline', 380.00, '/assets/covers/book12.svg', '/samples/sample_devops.pdf', '/downloads/full_cloud_devops.pdf', 1, '2026-06-12 17:00:00+07');

-- 6. ตะกร้าสินค้าเริ่มต้น (Carts)
INSERT INTO carts (cart_id, user_id, created_at, updated_at) VALUES
(1, 2, '2026-09-20 10:00:00+07', '2026-09-20 10:00:00+07'),
(2, 3, '2026-09-21 11:30:00+07', '2026-09-21 11:30:00+07'),
(3, 4, '2026-09-22 14:00:00+07', '2026-09-22 14:00:00+07');

-- 7. สินค้าในตะกร้าเริ่มต้น (Cart Items)
INSERT INTO cart_items (cart_item_id, cart_id, ebook_id, quantity, added_at) VALUES
(1, 1, 3, 1, '2026-09-25 15:30:00+07'),
(2, 2, 7, 1, '2026-09-26 09:45:00+07');

-- 8. ข้อมูลคำสั่งซื้อตัวอย่าง 32 คำสั่งซื้อ (Orders)
INSERT INTO orders (order_id, order_number, user_id, total_amount, status, created_at, updated_at) VALUES
(1,  'ORD-20260610-001', 2,  350.00, 'confirmed', '2026-06-10 10:30:00+07', '2026-06-10 11:00:00+07'),
(2,  'ORD-20260612-002', 4,  540.00, 'confirmed', '2026-06-12 14:15:00+07', '2026-06-12 14:45:00+07'),
(3,  'ORD-20260615-003', 5,  420.00, 'confirmed', '2026-06-15 16:20:00+07', '2026-06-15 17:00:00+07'),
(4,  'ORD-20260618-004', 3,  250.00, 'confirmed', '2026-06-18 09:45:00+07', '2026-06-18 10:15:00+07'),
(5,  'ORD-20260622-005', 6,  470.00, 'confirmed', '2026-06-22 11:30:00+07', '2026-06-22 12:00:00+07'),
(6,  'ORD-20260628-006', 7,  380.00, 'confirmed', '2026-06-28 13:10:00+07', '2026-06-28 13:50:00+07'),
(7,  'ORD-20260702-007', 8,  290.00, 'confirmed', '2026-07-02 10:20:00+07', '2026-07-02 10:45:00+07'),
(8,  'ORD-20260705-008', 2,  560.00, 'confirmed', '2026-07-05 15:00:00+07', '2026-07-05 15:30:00+07'),
(9,  'ORD-20260708-009', 9,  220.00, 'confirmed', '2026-07-08 17:15:00+07', '2026-07-08 17:40:00+07'),
(10, 'ORD-20260712-010', 10, 640.00, 'confirmed', '2026-07-12 11:00:00+07', '2026-07-12 11:30:00+07'),
(11, 'ORD-20260716-011', 11, 195.00, 'confirmed', '2026-07-16 12:45:00+07', '2026-07-16 13:15:00+07'),
(12, 'ORD-20260720-012', 3,  640.00, 'confirmed', '2026-07-20 14:30:00+07', '2026-07-20 15:00:00+07'),
(13, 'ORD-20260725-013', 4,  280.00, 'confirmed', '2026-07-25 09:15:00+07', '2026-07-25 09:50:00+07'),
(14, 'ORD-20260729-014', 12, 730.00, 'confirmed', '2026-07-29 16:40:00+07', '2026-07-29 17:10:00+07'),
(15, 'ORD-20260803-015', 5,  510.00, 'confirmed', '2026-08-03 10:10:00+07', '2026-08-03 10:40:00+07'),
(16, 'ORD-20260806-016', 7,  420.00, 'confirmed', '2026-08-06 13:25:00+07', '2026-08-06 14:00:00+07'),
(17, 'ORD-20260810-017', 2,  380.00, 'confirmed', '2026-08-10 15:50:00+07', '2026-08-10 16:20:00+07'),
(18, 'ORD-20260813-018', 6,  270.00, 'confirmed', '2026-08-13 09:30:00+07', '2026-08-13 10:00:00+07'),
(19, 'ORD-20260817-019', 8,  470.00, 'confirmed', '2026-08-17 11:20:00+07', '2026-08-17 11:55:00+07'),
(20, 'ORD-20260821-020', 9,  350.00, 'confirmed', '2026-08-21 14:00:00+07', '2026-08-21 14:35:00+07'),
(21, 'ORD-20260825-021', 10, 540.00, 'confirmed', '2026-08-25 16:30:00+07', '2026-08-25 17:05:00+07'),
(22, 'ORD-20260828-022', 11, 260.00, 'confirmed', '2026-08-28 10:00:00+07', '2026-08-28 10:30:00+07'),
(23, 'ORD-20260902-023', 3,  350.00, 'confirmed', '2026-09-02 11:45:00+07', '2026-09-02 12:15:00+07'),
(24, 'ORD-20260905-024', 4,  420.00, 'confirmed', '2026-09-05 14:20:00+07', '2026-09-05 14:50:00+07'),
(25, 'ORD-20260908-025', 12, 500.00, 'confirmed', '2026-09-08 16:10:00+07', '2026-09-08 16:40:00+07'),
(26, 'ORD-20260912-026', 2,  460.00, 'confirmed', '2026-09-12 09:30:00+07', '2026-09-12 10:00:00+07'),
(27, 'ORD-20260915-027', 5,  290.00, 'confirmed', '2026-09-15 13:40:00+07', '2026-09-15 14:10:00+07'),
(28, 'ORD-20260918-028', 7,  280.00, 'confirmed', '2026-09-18 15:15:00+07', '2026-09-18 15:45:00+07'),
(29, 'ORD-20260924-029', 2,  350.00, 'pending',   '2026-09-24 10:00:00+07', '2026-09-24 10:05:00+07'),
(30, 'ORD-20260925-030', 3,  510.00, 'pending',   '2026-09-25 14:20:00+07', '2026-09-25 14:25:00+07'),
(31, 'ORD-20260926-031', 6,  420.00, 'pending',   '2026-09-26 11:30:00+07', '2026-09-26 11:35:00+07'),
(32, 'ORD-20260920-032', 8,  290.00, 'cancelled', '2026-09-20 09:10:00+07', '2026-09-20 10:30:00+07');

-- 9. รายการสินค้าในคำสั่งซื้อ (Order Items)
INSERT INTO order_items (order_item_id, order_id, ebook_id, price_at_purchase) VALUES
(1,  1,  1,  350.00),
(2,  2,  2,  290.00), (3,  2, 4, 250.00),
(4,  3,  3,  420.00),
(5,  4,  4,  250.00),
(6,  5,  5,  220.00), (7,  5, 4, 250.00),
(8,  6,  12, 380.00),
(9,  7,  2,  290.00),
(10, 8,  8,  280.00), (11, 8, 9, 260.00),
(12, 9,  5,  220.00),
(13, 10, 1,  350.00), (14, 10, 2, 290.00),
(15, 11, 6,  195.00),
(16, 12, 3,  420.00), (17, 12, 5, 220.00),
(18, 13, 8,  280.00),
(19, 14, 1,  350.00), (20, 14, 12, 380.00),
(21, 15, 7,  210.00), (22, 15, 10, 300.00),
(24, 16, 3,  420.00),
(25, 17, 12, 380.00),
(26, 18, 10, 270.00),
(27, 19, 7,  210.00), (28, 19, 9, 260.00),
(29, 20, 1,  350.00),
(30, 21, 2,  290.00), (31, 21, 4, 250.00),
(32, 22, 9,  260.00),
(33, 23, 1,  350.00),
(34, 24, 3,  420.00),
(35, 25, 11, 240.00), (36, 25, 9, 260.00),
(37, 26, 5,  220.00), (38, 26, 11, 240.00),
(39, 27, 2,  290.00),
(40, 28, 8,  280.00),
(41, 29, 1,  350.00),
(42, 30, 7,  210.00), (43, 30, 10, 300.00),
(45, 31, 3,  420.00),
(46, 32, 2,  290.00);

-- 10. ข้อมูลการชำระเงินจำลอง (Payments)
INSERT INTO payments (payment_id, order_id, payment_method, payment_status, slip_image_url, amount, paid_at, verified_at, note) VALUES
(1,  1,  'promptpay_qr',  'verified',  '/assets/slips/slip_mock_01.png', 350.00, '2026-06-10 10:35:00+07', '2026-06-10 11:00:00+07', 'ตรวจสอบสลิป QR ถูกต้อง'),
(2,  2,  'bank_transfer', 'verified',  '/assets/slips/slip_mock_02.png', 540.00, '2026-06-12 14:20:00+07', '2026-06-12 14:45:00+07', 'โอนตรงยอดตรง'),
(3,  3,  'promptpay_qr',  'verified',  '/assets/slips/slip_mock_03.png', 420.00, '2026-06-15 16:30:00+07', '2026-06-15 17:00:00+07', 'อนุมัติเรียบร้อย'),
(4,  4,  'mock_gateway',  'verified',  '/assets/slips/slip_mock_04.png', 250.00, '2026-06-18 10:00:00+07', '2026-06-18 10:15:00+07', 'เกตเวย์จำลองผ่าน'),
(5,  5,  'promptpay_qr',  'verified',  '/assets/slips/slip_mock_05.png', 470.00, '2026-06-22 11:40:00+07', '2026-06-22 12:00:00+07', 'ตรวจสอบแล้ว'),
(6,  6,  'bank_transfer', 'verified',  '/assets/slips/slip_mock_06.png', 380.00, '2026-06-28 13:20:00+07', '2026-06-28 13:50:00+07', 'ตรวจสอบแล้ว'),
(7,  7,  'promptpay_qr',  'verified',  '/assets/slips/slip_mock_07.png', 290.00, '2026-07-02 10:30:00+07', '2026-07-02 10:45:00+07', 'ยอดตรงเวลาตรง'),
(8,  8,  'bank_transfer', 'verified',  '/assets/slips/slip_mock_08.png', 560.00, '2026-07-05 15:10:00+07', '2026-07-05 15:30:00+07', 'อนุมัติแล้ว'),
(9,  9,  'promptpay_qr',  'verified',  '/assets/slips/slip_mock_09.png', 220.00, '2026-07-08 17:25:00+07', '2026-07-08 17:40:00+07', 'ยอดเงินถูกต้อง'),
(10, 10, 'promptpay_qr',  'verified',  '/assets/slips/slip_mock_10.png', 640.00, '2026-07-12 11:15:00+07', '2026-07-12 11:30:00+07', 'อนุมัติยอด 2 เล่ม'),
(11, 11, 'mock_gateway',  'verified',  '/assets/slips/slip_mock_11.png', 195.00, '2026-07-16 13:00:00+07', '2026-07-16 13:15:00+07', 'ชำระสำเร็จ'),
(12, 12, 'bank_transfer', 'verified',  '/assets/slips/slip_mock_12.png', 640.00, '2026-07-20 14:40:00+07', '2026-07-20 15:00:00+07', 'ตรวจสอบแล้ว'),
(13, 13, 'promptpay_qr',  'verified',  '/assets/slips/slip_mock_13.png', 280.00, '2026-07-25 09:30:00+07', '2026-07-25 09:50:00+07', 'ยอดถูกต้อง'),
(14, 14, 'bank_transfer', 'verified',  '/assets/slips/slip_mock_14.png', 730.00, '2026-07-29 16:50:00+07', '2026-07-29 17:10:00+07', 'ยอดถูกต้อง 2 เล่ม'),
(15, 15, 'promptpay_qr',  'verified',  '/assets/slips/slip_mock_15.png', 510.00, '2026-08-03 10:20:00+07', '2026-08-03 10:40:00+07', 'อนุมัติเรียบร้อย'),
(16, 16, 'promptpay_qr',  'verified',  '/assets/slips/slip_mock_16.png', 420.00, '2026-08-06 13:40:00+07', '2026-08-06 14:00:00+07', 'ตรวจสอบผ่าน'),
(17, 17, 'mock_gateway',  'verified',  '/assets/slips/slip_mock_17.png', 380.00, '2026-08-10 16:05:00+07', '2026-08-10 16:20:00+07', 'สำเร็จ'),
(18, 18, 'bank_transfer', 'verified',  '/assets/slips/slip_mock_18.png', 270.00, '2026-08-13 09:40:00+07', '2026-08-13 10:00:00+07', 'ยอดตรง'),
(19, 19, 'promptpay_qr',  'verified',  '/assets/slips/slip_mock_19.png', 470.00, '2026-08-17 11:35:00+07', '2026-08-17 11:55:00+07', 'ตรวจสอบแล้ว'),
(20, 20, 'promptpay_qr',  'verified',  '/assets/slips/slip_mock_20.png', 350.00, '2026-08-21 14:15:00+07', '2026-08-21 14:35:00+07', 'อนุมัติแล้ว'),
(21, 21, 'bank_transfer', 'verified',  '/assets/slips/slip_mock_21.png', 540.00, '2026-08-25 16:45:00+07', '2026-08-25 17:05:00+07', 'ยอดตรง'),
(22, 22, 'promptpay_qr',  'verified',  '/assets/slips/slip_mock_22.png', 260.00, '2026-08-28 10:15:00+07', '2026-08-28 10:30:00+07', 'ตรวจสอบแล้ว'),
(23, 23, 'promptpay_qr',  'verified',  '/assets/slips/slip_mock_23.png', 350.00, '2026-09-02 12:00:00+07', '2026-09-02 12:15:00+07', 'อนุมัติแล้ว'),
(24, 24, 'bank_transfer', 'verified',  '/assets/slips/slip_mock_24.png', 420.00, '2026-09-05 14:35:00+07', '2026-09-05 14:50:00+07', 'อนุมัติแล้ว'),
(25, 25, 'promptpay_qr',  'verified',  '/assets/slips/slip_mock_25.png', 500.00, '2026-09-08 16:25:00+07', '2026-09-08 16:40:00+07', 'ตรวจสอบแล้ว'),
(26, 26, 'mock_gateway',  'verified',  '/assets/slips/slip_mock_26.png', 460.00, '2026-09-12 09:45:00+07', '2026-09-12 10:00:00+07', 'ชำระสำเร็จ'),
(27, 27, 'promptpay_qr',  'verified',  '/assets/slips/slip_mock_27.png', 290.00, '2026-09-15 13:55:00+07', '2026-09-15 14:10:00+07', 'อนุมัติแล้ว'),
(28, 28, 'promptpay_qr',  'verified',  '/assets/slips/slip_mock_28.png', 280.00, '2026-09-18 15:30:00+07', '2026-09-18 15:45:00+07', 'อนุมัติแล้ว'),
(29, 29, 'promptpay_qr',  'submitted', '/assets/slips/slip_mock_29.png', 350.00, '2026-09-24 10:05:00+07', NULL, 'รอยืนยันสลิป'),
(30, 30, 'bank_transfer', 'submitted', '/assets/slips/slip_mock_30.png', 510.00, '2026-09-25 14:25:00+07', NULL, 'รอยืนยันสลิป'),
(31, 31, 'promptpay_qr',  'submitted', '/assets/slips/slip_mock_31.png', 420.00, '2026-09-26 11:35:00+07', NULL, 'รอยืนยันสลิป'),
(32, 32, 'promptpay_qr',  'rejected',  '/assets/slips/slip_mock_32.png', 290.00, '2026-09-20 09:15:00+07', '2026-09-20 10:30:00+07', 'สลิปไม่ตรงกับยอดเงิน');

-- 11. สิทธิ์และลิงก์ดาวน์โหลดที่ปลอดภัย (Download Links)
INSERT INTO download_links (download_id, order_id, ebook_id, user_id, token, download_url, expires_at, download_count, max_downloads, created_at) VALUES
(1,  1,  1,  2,  'tok_sec_01a1b2c3d4e5f601', '/api/download/tok_sec_01a1b2c3d4e5f601', '2026-12-31 23:59:59+07', 2, 10, '2026-06-10 11:00:00+07'),
(2,  2,  2,  4,  'tok_sec_02a1b2c3d4e5f602', '/api/download/tok_sec_02a1b2c3d4e5f602', '2026-12-31 23:59:59+07', 1, 10, '2026-06-12 14:45:00+07'),
(3,  2,  4,  4,  'tok_sec_02a1b2c3d4e5f603', '/api/download/tok_sec_02a1b2c3d4e5f603', '2026-12-31 23:59:59+07', 0, 10, '2026-06-12 14:45:00+07'),
(4,  3,  3,  5,  'tok_sec_03a1b2c3d4e5f604', '/api/download/tok_sec_03a1b2c3d4e5f604', '2026-12-31 23:59:59+07', 3, 10, '2026-06-15 17:00:00+07'),
(5,  4,  4,  3,  'tok_sec_04a1b2c3d4e5f605', '/api/download/tok_sec_04a1b2c3d4e5f605', '2026-12-31 23:59:59+07', 1, 10, '2026-06-18 10:15:00+07'),
(6,  5,  5,  6,  'tok_sec_05a1b2c3d4e5f606', '/api/download/tok_sec_05a1b2c3d4e5f606', '2026-12-31 23:59:59+07', 1, 10, '2026-06-22 12:00:00+07'),
(7,  5,  4,  6,  'tok_sec_05a1b2c3d4e5f607', '/api/download/tok_sec_05a1b2c3d4e5f607', '2026-12-31 23:59:59+07', 0, 10, '2026-06-22 12:00:00+07'),
(8,  6,  12, 7,  'tok_sec_06a1b2c3d4e5f608', '/api/download/tok_sec_06a1b2c3d4e5f608', '2026-12-31 23:59:59+07', 2, 10, '2026-06-28 13:50:00+07'),
(9,  7,  2,  8,  'tok_sec_07a1b2c3d4e5f609', '/api/download/tok_sec_07a1b2c3d4e5f609', '2026-12-31 23:59:59+07', 1, 10, '2026-07-02 10:45:00+07'),
(10, 8,  8,  2,  'tok_sec_08a1b2c3d4e5f610', '/api/download/tok_sec_08a1b2c3d4e5f610', '2026-12-31 23:59:59+07', 1, 10, '2026-07-05 15:30:00+07'),
(11, 8,  9,  2,  'tok_sec_08a1b2c3d4e5f611', '/api/download/tok_sec_08a1b2c3d4e5f611', '2026-12-31 23:59:59+07', 0, 10, '2026-07-05 15:30:00+07'),
(12, 9,  5,  9,  'tok_sec_09a1b2c3d4e5f612', '/api/download/tok_sec_09a1b2c3d4e5f612', '2026-12-31 23:59:59+07', 1, 10, '2026-07-08 17:40:00+07'),
(13, 10, 1,  10, 'tok_sec_10a1b2c3d4e5f613', '/api/download/tok_sec_10a1b2c3d4e5f613', '2026-12-31 23:59:59+07', 4, 10, '2026-07-12 11:30:00+07'),
(14, 10, 2,  10, 'tok_sec_10a1b2c3d4e5f614', '/api/download/tok_sec_10a1b2c3d4e5f614', '2026-12-31 23:59:59+07', 1, 10, '2026-07-12 11:30:00+07'),
(15, 11, 6,  11, 'tok_sec_11a1b2c3d4e5f615', '/api/download/tok_sec_11a1b2c3d4e5f615', '2026-12-31 23:59:59+07', 1, 10, '2026-07-16 13:15:00+07'),
(16, 12, 3,  3,  'tok_sec_12a1b2c3d4e5f616', '/api/download/tok_sec_12a1b2c3d4e5f616', '2026-12-31 23:59:59+07', 2, 10, '2026-07-20 15:00:00+07'),
(17, 12, 5,  3,  'tok_sec_12a1b2c3d4e5f617', '/api/download/tok_sec_12a1b2c3d4e5f617', '2026-12-31 23:59:59+07', 1, 10, '2026-07-20 15:00:00+07'),
(18, 13, 8,  4,  'tok_sec_13a1b2c3d4e5f618', '/api/download/tok_sec_13a1b2c3d4e5f618', '2026-12-31 23:59:59+07', 1, 10, '2026-07-25 09:50:00+07'),
(19, 14, 1,  12, 'tok_sec_14a1b2c3d4e5f619', '/api/download/tok_sec_14a1b2c3d4e5f619', '2026-12-31 23:59:59+07', 2, 10, '2026-07-29 17:10:00+07'),
(20, 14, 12, 12, 'tok_sec_14a1b2c3d4e5f620', '/api/download/tok_sec_14a1b2c3d4e5f620', '2026-12-31 23:59:59+07', 1, 10, '2026-07-29 17:10:00+07'),
(21, 15, 7,  5,  'tok_sec_15a1b2c3d4e5f621', '/api/download/tok_sec_15a1b2c3d4e5f621', '2026-12-31 23:59:59+07', 0, 10, '2026-08-03 10:40:00+07'),
(22, 15, 10, 5,  'tok_sec_15a1b2c3d4e5f622', '/api/download/tok_sec_15a1b2c3d4e5f622', '2026-12-31 23:59:59+07', 1, 10, '2026-08-03 10:40:00+07'),
(23, 16, 3,  7,  'tok_sec_16a1b2c3d4e5f623', '/api/download/tok_sec_16a1b2c3d4e5f623', '2026-12-31 23:59:59+07', 2, 10, '2026-08-06 14:00:00+07'),
(24, 17, 12, 2,  'tok_sec_17a1b2c3d4e5f624', '/api/download/tok_sec_17a1b2c3d4e5f624', '2026-12-31 23:59:59+07', 1, 10, '2026-08-10 16:20:00+07'),
(25, 18, 10, 6,  'tok_sec_18a1b2c3d4e5f625', '/api/download/tok_sec_18a1b2c3d4e5f625', '2026-12-31 23:59:59+07', 1, 10, '2026-08-13 10:00:00+07'),
(26, 19, 7,  8,  'tok_sec_19a1b2c3d4e5f626', '/api/download/tok_sec_19a1b2c3d4e5f626', '2026-12-31 23:59:59+07', 0, 10, '2026-08-17 11:55:00+07'),
(27, 19, 9,  8,  'tok_sec_19a1b2c3d4e5f627', '/api/download/tok_sec_19a1b2c3d4e5f627', '2026-12-31 23:59:59+07', 1, 10, '2026-08-17 11:55:00+07'),
(28, 20, 1,  9,  'tok_sec_20a1b2c3d4e5f628', '/api/download/tok_sec_20a1b2c3d4e5f628', '2026-12-31 23:59:59+07', 2, 10, '2026-08-21 14:35:00+07'),
(29, 21, 2,  10, 'tok_sec_21a1b2c3d4e5f629', '/api/download/tok_sec_21a1b2c3d4e5f629', '2026-12-31 23:59:59+07', 1, 10, '2026-08-25 17:05:00+07'),
(30, 21, 4,  10, 'tok_sec_21a1b2c3d4e5f630', '/api/download/tok_sec_21a1b2c3d4e5f630', '2026-12-31 23:59:59+07', 0, 10, '2026-08-25 17:05:00+07'),
(31, 22, 9,  11, 'tok_sec_22a1b2c3d4e5f631', '/api/download/tok_sec_22a1b2c3d4e5f631', '2026-12-31 23:59:59+07', 1, 10, '2026-08-28 10:30:00+07'),
(32, 23, 1,  3,  'tok_sec_23a1b2c3d4e5f632', '/api/download/tok_sec_23a1b2c3d4e5f632', '2026-12-31 23:59:59+07', 3, 10, '2026-09-02 12:15:00+07'),
(33, 24, 3,  4,  'tok_sec_24a1b2c3d4e5f633', '/api/download/tok_sec_24a1b2c3d4e5f633', '2026-12-31 23:59:59+07', 1, 10, '2026-09-05 14:50:00+07'),
(34, 25, 11, 12, 'tok_sec_25a1b2c3d4e5f634', '/api/download/tok_sec_25a1b2c3d4e5f634', '2026-12-31 23:59:59+07', 1, 10, '2026-09-08 16:40:00+07'),
(35, 25, 9,  12, 'tok_sec_25a1b2c3d4e5f635', '/api/download/tok_sec_25a1b2c3d4e5f635', '2026-12-31 23:59:59+07', 0, 10, '2026-09-08 16:40:00+07'),
(36, 26, 5,  2,  'tok_sec_26a1b2c3d4e5f636', '/api/download/tok_sec_26a1b2c3d4e5f636', '2026-12-31 23:59:59+07', 2, 10, '2026-09-12 10:00:00+07'),
(37, 26, 11, 2,  'tok_sec_26a1b2c3d4e5f637', '/api/download/tok_sec_26a1b2c3d4e5f637', '2026-12-31 23:59:59+07', 1, 10, '2026-09-12 10:00:00+07'),
(38, 27, 2,  5,  'tok_sec_27a1b2c3d4e5f638', '/api/download/tok_sec_27a1b2c3d4e5f638', '2026-12-31 23:59:59+07', 1, 10, '2026-09-15 14:10:00+07'),
(39, 28, 8,  7,  'tok_sec_28a1b2c3d4e5f639', '/api/download/tok_sec_28a1b2c3d4e5f639', '2026-12-31 23:59:59+07', 1, 10, '2026-09-18 15:45:00+07');

-- ซิงค์ Sequence ID ให้ตรงกับข้อมูลที่เพิ่ง INSERT เข้าไป (เพื่อให้ auto increment นับต่อได้ถูกต้อง)
SELECT setval(pg_get_serial_sequence('roles', 'role_id'), COALESCE(max(role_id), 1)) FROM roles;
SELECT setval(pg_get_serial_sequence('users', 'user_id'), COALESCE(max(user_id), 1)) FROM users;
SELECT setval(pg_get_serial_sequence('categories', 'category_id'), COALESCE(max(category_id), 1)) FROM categories;
SELECT setval(pg_get_serial_sequence('authors', 'author_id'), COALESCE(max(author_id), 1)) FROM authors;
SELECT setval(pg_get_serial_sequence('ebooks', 'ebook_id'), COALESCE(max(ebook_id), 1)) FROM ebooks;
SELECT setval(pg_get_serial_sequence('carts', 'cart_id'), COALESCE(max(cart_id), 1)) FROM carts;
SELECT setval(pg_get_serial_sequence('cart_items', 'cart_item_id'), COALESCE(max(cart_item_id), 1)) FROM cart_items;
SELECT setval(pg_get_serial_sequence('orders', 'order_id'), COALESCE(max(order_id), 1)) FROM orders;
SELECT setval(pg_get_serial_sequence('order_items', 'order_item_id'), COALESCE(max(order_item_id), 1)) FROM order_items;
SELECT setval(pg_get_serial_sequence('payments', 'payment_id'), COALESCE(max(payment_id), 1)) FROM payments;
SELECT setval(pg_get_serial_sequence('download_links', 'download_id'), COALESCE(max(download_id), 1)) FROM download_links;
