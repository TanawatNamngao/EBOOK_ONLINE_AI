-- ====================================================================
-- EBOOK_ONLINE: 4 รายงานวิเคราะห์จากข้อมูลจริง (Analytics Reports)
-- ตามข้อกำหนดใบงานวิชา Database 2026
-- (เวอร์ชันสั้น กระชับ จำง่าย เขียนสดสอบได้ทันที ครบเกณฑ์ 100%)
-- ====================================================================

-- --------------------------------------------------------------------
-- รายงานที่ 1: ยอดขายตามช่วงเวลา
-- คำถามที่ต้องตอบ: ยอดขาย จำนวนคำสั่งซื้อ และค่าเฉลี่ยต่อคำสั่งซื้อ เปลี่ยนไปอย่างไรตามวันที่หรือเดือน
-- สิ่งที่ควรใช้ใน SQL: JOIN GROUP BY SUM COUNT AVG และตัวกรองวัน
-- ผู้รับผิดชอบอธิบาย: นายธนวัฒน์ นามเหง้า (67332110293-4)
-- --------------------------------------------------------------------
SELECT 
    DATE(orders.created_at) AS sales_date,
    COUNT(orders.order_id) AS total_orders,
    SUM(orders.total_amount) AS total_sales,
    ROUND(AVG(orders.total_amount), 2) AS avg_order_value
FROM orders
JOIN payments ON orders.order_id = payments.order_id
WHERE orders.status = 'confirmed' 
  AND orders.created_at >= '2026-01-01'
GROUP BY DATE(orders.created_at)
ORDER BY sales_date DESC;


-- --------------------------------------------------------------------
-- รายงานที่ 2: E Book ขายดี
-- คำถามที่ต้องตอบ: E Book ใดขายได้มากที่สุดตามจำนวนเล่มหรือยอดขาย
-- สิ่งที่ควรใช้ใน SQL: JOIN GROUP BY SUM หรือ COUNT และ LIMIT
-- ผู้รับผิดชอบอธิบาย: นายธนวัฒน์ นามเหง้า (67332110293-4)
-- --------------------------------------------------------------------
SELECT 
    ebooks.title,
    COUNT(order_items.order_item_id) AS total_sold,
    SUM(order_items.price_at_purchase) AS total_sales
FROM order_items
JOIN ebooks ON order_items.ebook_id = ebooks.ebook_id
GROUP BY ebooks.title
ORDER BY total_sold DESC
LIMIT 5;


-- --------------------------------------------------------------------
-- รายงานที่ 3: ยอดขายตามหมวดหมู่
-- คำถามที่ต้องตอบ: หมวดหมู่ใดสร้างยอดขายและจำนวนรายการสูงสุด
-- สิ่งที่ควรใช้ใน SQL: JOIN หลายตาราง GROUP BY และ SUM
-- ผู้รับผิดชอบอธิบาย: นายภานุวัฒน์ แสงเครือ (67332110248-5)
-- --------------------------------------------------------------------
SELECT 
    categories.name AS category_name,
    COUNT(order_items.order_item_id) AS total_items_sold,
    SUM(order_items.price_at_purchase) AS total_sales
FROM order_items
JOIN ebooks ON order_items.ebook_id = ebooks.ebook_id
JOIN categories ON ebooks.category_id = categories.category_id
GROUP BY categories.name
ORDER BY total_sales DESC;


-- --------------------------------------------------------------------
-- รายงานที่ 4: ลูกค้าและคำสั่งซื้อ
-- คำถามที่ต้องตอบ: ลูกค้ารายใดซื้อบ่อยหรือมียอดซื้อสะสมสูง และแต่ละสถานะมีจำนวนเท่าใด
-- สิ่งที่ควรใช้ใน SQL: JOIN GROUP BY HAVING COUNT SUM และเงื่อนไขสถานะ
-- ผู้รับผิดชอบอธิบาย: นายภานุวัฒน์ แสงเครือ (67332110248-5)
-- --------------------------------------------------------------------
SELECT 
    users.full_name,
    orders.status,
    COUNT(orders.order_id) AS total_orders,
    SUM(orders.total_amount) AS total_spent
FROM users
JOIN orders ON users.user_id = orders.user_id
WHERE orders.status = 'confirmed'
GROUP BY users.full_name, orders.status
HAVING COUNT(orders.order_id) >= 2
ORDER BY total_spent DESC;
