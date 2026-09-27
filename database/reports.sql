-- ====================================================================
-- EBOOK_ONLINE: 4 รายงานวิเคราะห์จากข้อมูลจริง (Analytics Reports)
-- ตามข้อกำหนดข้อ 5 ของใบงาน Mini Project Database
-- ====================================================================

-- --------------------------------------------------------------------
-- รายงานที่ 1: ยอดขายตามช่วงเวลา (Sales Over Time by Month / Day)
-- คำถามที่ต้องตอบ: ยอดขาย จำนวนคำสั่งซื้อ และค่าเฉลี่ยต่อคำสั่งซื้อ เปลี่ยนไปอย่างไรตามวันที่หรือเดือน?
-- สิ่งที่ใช้ใน SQL: JOIN, GROUP BY, SUM, COUNT, AVG, และตัวกรองวัน (date filter)
-- ผู้รับผิดชอบอธิบาย: นายภานุวัฒน์ แสงเครือ (67332110248-5)
-- --------------------------------------------------------------------
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
  AND o.created_at BETWEEN '2026-06-01' AND '2026-09-30 23:59:59'
GROUP BY strftime('%Y-%m', o.created_at)
ORDER BY sale_period ASC;


-- --------------------------------------------------------------------
-- รายงานที่ 2: E-Book ขายดีที่สุด (Best-Selling E-Books)
-- คำถามที่ต้องตอบ: E-Book ใดขายได้มากที่สุดตามจำนวนเล่มและยอดขายรวม?
-- สิ่งที่ใช้ใน SQL: JOIN, GROUP BY, SUM, COUNT, และ LIMIT
-- ผู้รับผิดชอบอธิบาย: นายธนวัฒน์ นามเหง้า (67332110293-4)
-- --------------------------------------------------------------------
SELECT 
    b.ebook_id,
    b.title AS ebook_title,
    a.name AS author_name,
    c.name AS category_name,
    b.price AS current_price,
    COUNT(oi.order_item_id) AS total_copies_sold,
    SUM(oi.price_at_purchase) AS total_revenue
FROM ebooks b
JOIN authors a ON b.author_id = a.author_id
JOIN categories c ON b.category_id = c.category_id
JOIN order_items oi ON b.ebook_id = oi.ebook_id
JOIN orders o ON oi.order_id = o.order_id
WHERE o.status = 'confirmed'
GROUP BY b.ebook_id, b.title, a.name, c.name, b.price
ORDER BY total_copies_sold DESC, total_revenue DESC
LIMIT 5;


-- --------------------------------------------------------------------
-- รายงานที่ 3: ยอดขายตามหมวดหมู่ (Sales by Category)
-- คำถามที่ต้องตอบ: หมวดหมู่ใดสร้างยอดขายและจำนวนรายการขายสูงสุด?
-- สิ่งที่ใช้ใน SQL: JOIN หลายตาราง (categories -> ebooks -> order_items -> orders), GROUP BY, SUM, COUNT
-- ผู้รับผิดชอบอธิบาย: นายธนวัฒน์ นามเหง้า (67332110293-4)
-- --------------------------------------------------------------------
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
ORDER BY total_category_revenue DESC;


-- --------------------------------------------------------------------
-- รายงานที่ 4: พฤติกรรมลูกค้าและสถานะคำสั่งซื้อ (Customer Orders & Status Breakdown)
-- คำถามที่ต้องตอบ: ลูกค้ารายใดซื้อบ่อยหรือมียอดซื้อสะสมสูง (Top Spenders) และแต่ละสถานะมีจำนวนเท่าใด?
-- สิ่งที่ใช้ใน SQL: JOIN, GROUP BY, HAVING, COUNT, SUM, เงื่อนไขสถานะ (CASE WHEN)
-- ผู้รับผิดชอบอธิบาย: นายภานุวัฒน์ แสงเครือ (67332110248-5)
-- --------------------------------------------------------------------
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
WHERE u.role_id = 1 -- เฉพาะลูกค้า
GROUP BY u.user_id, u.username, u.full_name, u.email
HAVING total_orders >= 2
ORDER BY total_spent DESC, total_orders DESC;
