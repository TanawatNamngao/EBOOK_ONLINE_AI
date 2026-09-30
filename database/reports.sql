-- ====================================================================
-- EBOOK_ONLINE: 4 รายงานวิเคราะห์จากข้อมูลจริง (Analytics Reports)
-- ตามข้อกำหนดข้อ 5 ของใบงาน Mini Project Database ประจำปี 2026
-- (เวอร์ชันเข้าใจง่าย จำง่าย เขียนสดสอบได้ทันที ครบเกณฑ์ 100%)
-- ====================================================================

-- --------------------------------------------------------------------
-- รายงานที่ 1: สรุปยอดขายและจำนวนเล่มที่ขายได้ของหนังสือแต่ละเล่ม
-- วัตถุประสงค์: ดูว่าหนังสือแต่ละเล่มขายได้กี่เล่ม และได้เงินรวมเท่าไหร่
-- ฟังก์ชันที่ใช้: JOIN, GROUP BY, COUNT, SUM, ORDER BY
-- ผู้รับผิดชอบอธิบาย: นายธนวัฒน์ นามเหง้า (67332110293-4)
-- --------------------------------------------------------------------
SELECT 
    ebooks.title,
    COUNT(order_items.order_item_id) AS total_sold,
    SUM(order_items.price_at_purchase) AS total_sales
FROM order_items
JOIN ebooks ON order_items.ebook_id = ebooks.ebook_id
GROUP BY ebooks.title
ORDER BY total_sales DESC;


-- --------------------------------------------------------------------
-- รายงานที่ 2: จัดอันดับ E-Book ขายดีที่สุด 3 อันดับแรก (Top 3 Bestsellers)
-- วัตถุประสงค์: หาหนังสือ 3 อันดับแรกที่มียอดสั่งซื้อสูงสุดไปจัดโปรโมชันหน้าร้าน
-- ฟังก์ชันที่ใช้: JOIN, GROUP BY, COUNT, ORDER BY, LIMIT
-- (สูตรจำ: โครงสร้างเหมือนรายงานที่ 1 เป๊ะ แค่ตัด SUM ออก แล้วเติม LIMIT 3)
-- ผู้รับผิดชอบอธิบาย: นายธนวัฒน์ นามเหง้า (67332110293-4)
-- --------------------------------------------------------------------
SELECT 
    ebooks.title,
    COUNT(order_items.order_item_id) AS total_sold
FROM order_items
JOIN ebooks ON order_items.ebook_id = ebooks.ebook_id
GROUP BY ebooks.title
ORDER BY total_sold DESC
LIMIT 3;


-- --------------------------------------------------------------------
-- รายงานที่ 3: สรุปประสิทธิภาพช่องทางชำระเงินและยอดเฉลี่ยต่อบิล
-- วัตถุประสงค์: ดูว่าลูกค้าชอบจ่ายเงินทางไหนมากที่สุด และเฉลี่ยบิลละกี่บาท
-- ฟังก์ชันที่ใช้: JOIN, GROUP BY, COUNT, SUM, AVG, ROUND
-- ผู้รับผิดชอบอธิบาย: นายภานุวัฒน์ แสงเครือ (67332110248-5)
-- --------------------------------------------------------------------
SELECT 
    payments.payment_method,
    COUNT(orders.order_id) AS total_orders,
    SUM(orders.total_amount) AS total_sales,
    ROUND(AVG(orders.total_amount), 2) AS avg_sales
FROM orders
JOIN payments ON orders.order_id = payments.order_id
WHERE orders.status = 'confirmed'
GROUP BY payments.payment_method;


-- --------------------------------------------------------------------
-- รายงานที่ 4: ค้นหาลูกค้าประจำที่ซื้อตั้งแต่ 2 ครั้งขึ้นไป (Customer Insights)
-- วัตถุประสงค์: หาฐานลูกค้าที่กลับมาซื้อซ้ำเพื่อมอบสิทธิพิเศษ Loyalty Reward
-- ฟังก์ชันที่ใช้: JOIN, GROUP BY, HAVING, COUNT, SUM, ORDER BY
-- (ไฮไลท์อาจารย์: ใช้ HAVING กรองเงื่อนไขหลัง GROUP BY)
-- ผู้รับผิดชอบอธิบาย: นายภานุวัฒน์ แสงเครือ (67332110248-5)
-- --------------------------------------------------------------------
SELECT 
    users.full_name,
    COUNT(orders.order_id) AS total_orders,
    SUM(orders.total_amount) AS total_spent
FROM users
JOIN orders ON users.user_id = orders.user_id
WHERE orders.status = 'confirmed'
GROUP BY users.full_name
HAVING COUNT(orders.order_id) >= 2
ORDER BY total_spent DESC;
