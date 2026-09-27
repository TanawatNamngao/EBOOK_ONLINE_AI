# รายงานวิเคราะห์ข้อมูลจากระบบจริง 4 หัวข้อ (Analytics Reports)
## โครงงาน: EBOOK_ONLINE (Mini Project Database ร้านขาย E-Book)

เอกสารนี้จัดทำขึ้นตาม **ข้อ 5. รายงานวิเคราะห์จากข้อมูลจริง** ของใบงาน Mini Project Database ร้านขาย E-Book ประจำปี 2026 โดยทุกรายงานอ้างอิงคำสั่ง SQL ที่เขียนขึ้นจริง และรันจากฐานข้อมูล `ebookstore.db` เดียวกับระบบ

---

## สรุปการแบ่งหน้าที่นำเสนอรายงานของสมาชิกกลุ่ม (ตามข้อกำหนดข้อ 9)

| รายงานที่ | หัวข้อรายงาน | ผู้รับผิดชอบอธิบาย | คำสั่ง SQL ที่ใช้ |
| :---: | :--- | :--- | :--- |
| **1** | ยอดขายตามช่วงเวลา (วัน/เดือน) | **นายภานุวัฒน์ แสงเครือ** (67332110248-5) | `JOIN`, `GROUP BY`, `SUM`, `COUNT`, `AVG`, Date filter |
| **2** | E-Book ขายดีที่สุด | **นายธนวัฒน์ นามเหง้า** (67332110293-4) | `JOIN`, `GROUP BY`, `SUM`, `COUNT`, `LIMIT` |
| **3** | ยอดขายตามหมวดหมู่สินค้า | **นายธนวัฒน์ นามเหง้า** (67332110293-4) | `JOIN หลายตาราง`, `GROUP BY`, `SUM` |
| **4** | พฤติกรรมลูกค้าและสถานะคำสั่งซื้อ | **นายภานุวัฒน์ แสงเครือ** (67332110248-5) | `JOIN`, `GROUP BY`, `HAVING`, `COUNT`, `SUM`, Status filter |

---

## รายงานที่ 1: ยอดขายตามช่วงเวลา (Sales Over Time by Month)

### 1.1 คำถามทางธุรกิจที่ต้องตอบ
* ยอดขาย จำนวนคำสั่งซื้อ และค่าเฉลี่ยต่อคำสั่งซื้อ (Average Order Value: AOV) เปลี่ยนแปลงไปอย่างไรตามแต่ละเดือน?
* มีแนวโน้มการเติบโตของรายได้เป็นอย่างไร?

### 1.2 คำสั่ง SQL ที่ใช้
```sql
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
```

### 1.3 ผลลัพธ์จากการรันจริงในระบบ
| ช่วงเวลา (sale_period) | จำนวนออเดอร์ (total_orders) | ยอดขายรวม (gross_sales) | ค่าเฉลี่ยต่อออเดอร์ (AOV) | ยอดต่ำสุด (min) | ยอดสูงสุด (max) |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **2026-06** | 6 | ฿2,410.00 | ฿401.67 | ฿250.00 | ฿540.00 |
| **2026-07** | 8 | ฿3,295.00 | ฿411.88 | ฿195.00 | ฿730.00 |
| **2026-08** | 8 | ฿3,200.00 | ฿400.00 | ฿260.00 | ฿540.00 |
| **2026-09** | 6 | ฿2,300.00 | ฿383.33 | ฿280.00 | ฿500.00 |
| **รวมทั้งหมด** | **28** | **฿11,205.00** | **฿400.18** | **฿195.00** | **฿730.00** |

### 1.4 ข้อสรุปและการนำไปใช้ (Insight)
* ยอดขายสูงสุดเกิดขึ้นในเดือน **กรกฎาคม 2026** (8 ออเดอร์, ยอด ฿3,295.00) โดยมีค่าเฉลี่ยต่อคำสั่งซื้อสูงสุดที่ ฿411.88
* ค่าเฉลี่ยการซื้อต่อครั้งของลูกค้าอยู่ที่ประมาณ **400 บาท** ซึ่งเทียบเท่ากับการซื้อหนังสือเฉลี่ย 1.3 เล่มต่อคำสั่งซื้อ

---

## รายงานที่ 2: E-Book ขายดีที่สุด (Best-Selling E-Books)

### 2.1 คำถามทางธุรกิจที่ต้องตอบ
* E-Book เล่มใดทำยอดขายได้มากที่สุดทั้งในแง่จำนวนเล่มที่ขายได้ และรายได้รวมที่สร้างให้แก่ร้านค้า?

### 2.2 คำสั่ง SQL ที่ใช้
```sql
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
```

### 2.3 ผลลัพธ์จากการรันจริงในระบบ
| อันดับ | ชื่อเรื่อง E-Book | ผู้แต่ง | หมวดหมู่ | ราคาขาย | จำนวนเล่มที่ขาย | รายได้รวม (total_revenue) |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: |
| 🥇 **1** | **คู่มือออกแบบและจัดการฐานข้อมูลขั้นสูง** | ดร. สมเกียรติ์ ปัญญาดิลก | เทคโนโลยี | ฿350.00 | **5 เล่ม** | **฿1,750.00** |
| 🥈 **2** | **Full-Stack JavaScript กับ Node.js & SQLite** | กิตติศักดิ์ พัฒนาซอฟต์ | เทคโนโลยี | ฿290.00 | **5 เล่ม** | **฿1,450.00** |
| 🥉 **3** | **ปัญญาประดิษฐ์และ Machine Learning ฉบับใช้งานจริง** | ดร. สมเกียรติ์ ปัญญาดิลก | เทคโนโลยี | ฿420.00 | **4 เล่ม** | **฿1,680.00** |
| **4** | สตาร์ทอัพติดสปีด: กลยุทธ์เติบโตแบบก้าวกระโดด | ณัฐวุฒิ นวการค้า | ธุรกิจ | ฿250.00 | **3 เล่ม** | **฿750.00** |
| **5** | Cloud Security & DevOps Fundamentals | กิตติศักดิ์ พัฒนาซอฟต์ | เทคโนโลยี | ฿380.00 | **3 เล่ม** | **฿1,140.00** |

### 2.4 ข้อสรุปและการนำไปใช้ (Insight)
* หนังสือด้าน **เทคโนโลยีและการพัฒนาซอฟต์แวร์** ครองตำแหน่ง Top 3 ทั้งจำนวนเล่มและยอดเงิน
* เล่มที่ขายดีที่สุดอันดับ 1 คือ *"คู่มือออกแบบและจัดการฐานข้อมูลขั้นสูง"* ทำยอดขายได้ 5 เล่ม สร้างรายได้ 1,750 บาท ร้านค้าควรจัดเซ็ตคู่กับหนังสือ Full-Stack JavaScript เพื่อเพิ่มยอดขายแบบ Bundle

---

## รายงานที่ 3: ยอดขายตามหมวดหมู่สินค้า (Sales by Category)

### 3.1 คำถามทางธุรกิจที่ต้องตอบ
* หมวดหมู่ใดทำยอดขายและจำนวนเล่มสูงสุด และแต่ละหมวดมีสัดส่วนรายได้คิดเป็นกี่เปอร์เซ็นต์ของร้าน?

### 3.2 คำสั่ง SQL ที่ใช้
```sql
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
```

### 3.3 ผลลัพธ์จากการรันจริงในระบบ
| หมวดหมู่ (category_name) | จำนวนเล่มในระบบ | จำนวนเล่มที่ขายได้ | รายได้รวม (total_revenue) | สัดส่วนยอดขาย (%) |
| :--- | :---: | :---: | :---: | :---: |
| **เทคโนโลยีและการเขียนโปรแกรม** | 4 เล่ม | 17 เล่ม | **฿6,020.00** | **53.73%** |
| **นิยายและวรรณกรรมสร้างสรรค์** | 2 เล่ม | 7 เล่ม | **฿1,880.00** | **16.78%** |
| **ธุรกิจและการลงทุน** | 2 เล่ม | 6 เล่ม | **฿1,410.00** | **12.58%** |
| **ภาษาและการสื่อสารสากล** | 2 เล่ม | 4 เล่ม | **฿1,080.00** | **9.64%** |
| **การพัฒนาตนเองและจิตวิทยา** | 2 เล่ม | 4 เล่ม | **฿815.00** | **7.27%** |
| **รวมทั้งสิ้น** | **12 เล่ม** | **38 เล่ม** | **฿11,205.00** | **100.00%** |

### 3.4 ข้อสรุปและการนำไปใช้ (Insight)
* หมวดหมู่ **เทคโนโลยีและการเขียนโปรแกรม** เป็นหัวใจหลักของร้าน คิดเป็นสัดส่วนมากกว่า **53.73%** ของยอดขายรวมทั้งร้าน
* ร้านค้าควรเพิ่มจำนวนหนังสือในหมวดนี้ และพิจารณาจัดโปรโมชันกระตุ้นหมวดพัฒนาตนเองและภาษาเพิ่มเติม

---

## รายงานที่ 4: พฤติกรรมลูกค้าและสถานะคำสั่งซื้อ (Customer Orders & Status Breakdown)

### 4.1 คำถามทางธุรกิจที่ต้องตอบ
* ลูกค้ารายใดซื้อบ่อยหรือมียอดซื้อสะสมสูงที่สุด (Top Spenders)?
* ลูกค้าแต่ละคนมีคำสั่งซื้อที่ยืนยันแล้ว, รอตรวจสอบ, หรือยกเลิกจำนวนเท่าใด?

### 4.2 คำสั่ง SQL ที่ใช้
```sql
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
HAVING total_orders >= 2
ORDER BY total_spent DESC, total_orders DESC;
```

### 4.3 ผลลัพธ์จากการรันจริงในระบบ
| ลูกค้า (full_name) | Username | คำสั่งซื้อทั้งหมด | ยืนยันแล้ว | รอตรวจ | ยกเลิก | ยอดซื้อสะสมสุทธิ (total_spent) |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **นายธนวัฒน์ นามเหง้า** | `thanawat` | 5 | 4 | 1 | 0 | **฿1,750.00** |
| **นายภานุวัฒน์ แสงเครือ** | `panuwat` | 4 | 3 | 1 | 0 | **฿1,240.00** |
| **ชวลิต ธนกิจ** | `chavalit` | 2 | 2 | 0 | 0 | **฿1,180.00** |
| **ธีรภัทร พงษ์ศิริ** | `teerapat` | 2 | 2 | 0 | 0 | **฿1,230.00** |
| **สุดา เกียรติสกุล** | `suda` | 3 | 3 | 0 | 0 | **฿1,220.00** |
| **สมชาย ดำรงไทย** | `somchai` | 3 | 3 | 0 | 0 | **฿1,240.00** |
| **กัญญา วารินทร์** | `kanya` | 3 | 3 | 0 | 0 | **฿1,080.00** |
| **วิชัย บุญมา** | `wichai` | 3 | 2 | 1 | 0 | **฿740.00** |
| **อานนท์ มั่นคง** | `anon` | 2 | 2 | 0 | 0 | **฿760.00** |
| **พิมพา ชูใจ** | `pimpa` | 2 | 2 | 0 | 0 | **฿570.00** |

### 4.4 ข้อสรุปและการนำไปใช้ (Insight)
* ลูกค้าชั้นดีที่มียอดซื้อสะสมสูงสุดคือ `thanawat` (4 คำสั่งซื้อสำเร็จ ยอด 1,750 บาท) และ `panuwat` (3 คำสั่งซื้อสำเร็จ ยอด 1,240 บาท)
* ระบบสามารถนำข้อมูลในรายงานนี้ไปพัฒนาระบบ Loyalty Program หรือแจกคูปองส่วนลดสำหรับลูกค้ากลุ่ม Top Spenders ที่มียอดซื้อเกิน 1,000 บาทได้
