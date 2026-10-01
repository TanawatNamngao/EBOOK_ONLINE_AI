# รายงานวิเคราะห์ข้อมูลจากระบบจริง 4 หัวข้อ (Analytics Reports)
## โครงงาน: EBOOK_ONLINE (Mini Project Database ร้านขาย E-Book)

เอกสารนี้จัดทำขึ้นตาม **ข้อ 5. รายงานวิเคราะห์จากข้อมูลจริง** ของใบงาน Mini Project Database ร้านขาย E-Book ประจำปี 2026 โดยทุกรายงานใช้คำสั่ง SQL ที่เชื่อมโยงข้อมูลจริงจากฐานข้อมูล `ebookstore.db` และ Supabase PostgreSQL Cloud โครงสร้างคำสั่งถูกออกแบบให้ **สั้น กระชับ จำง่าย และเขียนสดได้ทันที** เพื่อให้นักศึกษาสามารถนำเสนอและเขียนคำสั่งสดได้อย่างมั่นใจ ครบตามเกณฑ์การประเมิน 100%

---

## สรุปข้อกำหนดและสิ่งที่ควรใช้ใน SQL สำหรับ 4 รายงาน (ตามเกณฑ์ใบงาน)

| รายงาน | คำถามที่ต้องตอบ | สิ่งที่ควรใช้ใน SQL | ผู้รับผิดชอบอธิบาย |
| :--- | :--- | :--- | :--- |
| **ยอดขายตามช่วงเวลา** | ยอดขาย จำนวนคำสั่งซื้อ และค่าเฉลี่ยต่อคำสั่งซื้อ เปลี่ยนไปอย่างไรตามวันที่หรือเดือน | `JOIN GROUP BY SUM COUNT AVG และตัวกรองวัน` | **นายธนวัฒน์ นามเหง้า** (67332110293-4) |
| **E Book ขายดี** | E Book ใดขายได้มากที่สุดตามจำนวนเล่มหรือยอดขาย | `JOIN GROUP BY SUM หรือ COUNT และ LIMIT` | **นายธนวัฒน์ นามเหง้า** (67332110293-4) |
| **ยอดขายตามหมวดหมู่** | หมวดหมู่ใดสร้างยอดขายและจำนวนรายการสูงสุด | `JOIN หลายตาราง GROUP BY และ SUM` | **นายภานุวัฒน์ แสงเครือ** (67332110248-5) |
| **ลูกค้าและคำสั่งซื้อ** | ลูกค้ารายใดซื้อบ่อยหรือมียอดซื้อสะสมสูง และแต่ละสถานะมีจำนวนเท่าใด | `JOIN GROUP BY HAVING COUNT SUM และเงื่อนไขสถานะ` | **นายภานุวัฒน์ แสงเครือ** (67332110248-5) |

<div align="center">
<img src="รูปภาพประกอบรายงาน/Screenshot (376).png" alt="หน้าจอรายงานวิเคราะห์ธุรกิจ 4 ด้าน" width="92%">
<br><em>ภาพที่ 1: หน้าจอแผงควบคุมและระบบรายงานวิเคราะห์ข้อมูลจริงบน Admin Portal</em>
</div>

---

## รายงานที่ 1: ยอดขายตามช่วงเวลา

### 1.1 คำถามที่ต้องตอบ
* ยอดขาย จำนวนคำสั่งซื้อ และค่าเฉลี่ยต่อคำสั่งซื้อ เปลี่ยนไปอย่างไรตามวันที่หรือเดือน?
* ช่วงเวลาใดสร้างรายได้สูงสุดให้กับร้านค้า?

### 1.2 สิ่งที่ควรใช้ใน SQL
* `JOIN`, `GROUP BY`, `SUM`, `COUNT`, `AVG` และตัวกรองวัน (`WHERE orders.created_at >= ...`)

### 1.3 คำสั่ง SQL ที่ใช้ (สั้น กระชับ จำง่าย เขียนสดสอบได้ทันที)
```sql
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
```

### 1.4 ผลลัพธ์จากการรันจริงในระบบ (5 วันล่าสุด)
| วันที่ (sales_date) | จำนวนคำสั่งซื้อ (total_orders) | ยอดขายรวม (total_sales) | ค่าเฉลี่ยต่อคำสั่งซื้อ (avg_order_value) |
| :---: | :---: | :---: | :---: |
| **2026-10-01** | 2 คำสั่งซื้อ | ฿1,000.00 | ฿500.00 |
| **2026-09-30** | 3 คำสั่งซื้อ | ฿840.00 | ฿280.00 |
| **2026-09-20** | 1 คำสั่งซื้อ | ฿290.00 | ฿290.00 |
| **2026-09-18** | 1 คำสั่งซื้อ | ฿280.00 | ฿280.00 |
| **2026-09-15** | 1 คำสั่งซื้อ | ฿290.00 | ฿290.00 |

### 1.5 ข้อสรุปและการนำไปใช้ (Business Insight)
* เมื่อพิจารณายอดขายตามช่วงเวลา พบว่าคำสั่งซื้อมีแนวโน้มหนาแน่นขึ้นอย่างต่อเนื่อง และมียอดเฉลี่ยต่อคำสั่งซื้อ (Average Order Value: AOV) อยู่ระหว่าง 280 ถึง 500 บาท สะท้อนว่าลูกค้าส่วนใหญ่นิยมซื้อหนังสือครั้งละ 1–2 เล่มต่อหนึ่งคำสั่งซื้อ

---

## รายงานที่ 2: E Book ขายดี

### 2.1 คำถามที่ต้องตอบ
* E Book ใดขายได้มากที่สุดตามจำนวนเล่มหรือยอดขาย?
* เล่มใดควรนำไปจัดโปรโมชันและขึ้นแบนเนอร์สินค้าแนะนำหน้าร้าน?

### 2.2 สิ่งที่ควรใช้ใน SQL
* `JOIN`, `GROUP BY`, `SUM` หรือ `COUNT` และ `LIMIT`

### 2.3 คำสั่ง SQL ที่ใช้ (สั้น กระชับ จำง่าย เขียนสดสอบได้ทันที)
```sql
SELECT 
    ebooks.title,
    COUNT(order_items.order_item_id) AS total_sold,
    SUM(order_items.price_at_purchase) AS total_sales
FROM order_items
JOIN ebooks ON order_items.ebook_id = ebooks.ebook_id
GROUP BY ebooks.title
ORDER BY total_sold DESC
LIMIT 5;
```

### 2.4 ผลลัพธ์จากการรันจริงในระบบ (5 อันดับแรก)
| อันดับ | ชื่อเรื่อง E-Book (title) | จำนวนเล่มที่ขายได้ (total_sold) | ยอดขายรวมสุทธิ (total_sales) |
| :---: | :--- | :---: | :---: |
| 🥇 **อันดับ 1** | คู่มือออกแบบและจัดการฐานข้อมูลขั้นสูง (Modern Database Design) | 12 เล่ม | ฿4,250.00 |
| 🥈 **อันดับ 2** | Full-Stack JavaScript กับ Node.js & SQLite | 7 เล่ม | ฿2,030.00 |
| 🥉 **อันดับ 3** | ปัญญาประดิษฐ์และ Machine Learning ฉบับใช้งานได้จริง | 6 เล่ม | ฿2,520.00 |
| **อันดับ 4** | Cloud Security & DevOps Fundamentals | 6 เล่ม | ฿2,280.00 |
| **อันดับ 5** | สตาร์ทอัพติดสปีด: กลยุทธ์เติบโตแบบก้าวกระโดด (Lean Startup Scale) | 5 เล่ม | ฿1,250.00 |

### 2.5 ข้อสรุปและการนำไปใช้ (Business Insight)
* หนังสือ "คู่มือออกแบบและจัดการฐานข้อมูลขั้นสูง" เป็นเล่มที่ขายดีที่สุดทั้งในแง่จำนวนเล่ม (12 เล่ม) และยอดขายรวม (4,250 บาท) ตามด้วยหนังสือเทคโนโลยี Full-Stack และ AI สามารถนำทั้ง 5 เล่มนี้ไปจัดแสดงบนแบนเนอร์ Bestseller หน้าร้านเพื่อกระตุ้นยอดขาย

---

## รายงานที่ 3: ยอดขายตามหมวดหมู่

### 3.1 คำถามที่ต้องตอบ
* หมวดหมู่ใดสร้างยอดขายและจำนวนรายการสูงสุด?
* กลุ่มสาระใดที่กลุ่มลูกค้าเป้าหมายให้ความสนใจมากที่สุด?

### 3.2 สิ่งที่ควรใช้ใน SQL
* `JOIN หลายตาราง` (`order_items`, `ebooks`, `categories`), `GROUP BY` และ `SUM`

### 3.3 คำสั่ง SQL ที่ใช้ (สั้น กระชับ จำง่าย เขียนสดสอบได้ทันที)
```sql
SELECT 
    categories.name AS category_name,
    COUNT(order_items.order_item_id) AS total_items_sold,
    SUM(order_items.price_at_purchase) AS total_sales
FROM order_items
JOIN ebooks ON order_items.ebook_id = ebooks.ebook_id
JOIN categories ON ebooks.category_id = categories.category_id
GROUP BY categories.name
ORDER BY total_sales DESC;
```

### 3.4 ผลลัพธ์จากการรันจริงในระบบ
| ลำดับ | ชื่อหมวดหมู่หนังสือ (category_name) | จำนวนรายการที่ขายได้ (total_items_sold) | ยอดขายรวม (total_sales) |
| :---: | :--- | :---: | :---: |
| 1 | **เทคโนโลยีและการเขียนโปรแกรม** | 31 รายการ | ฿11,080.00 |
| 2 | **ธุรกิจและการลงทุน** | 10 รายการ | ฿2,350.00 |
| 3 | **ภาษาและการสื่อสารสากล** | 8 รายการ | ฿2,100.00 |
| 4 | **นิยายและวรรณกรรมสร้างสรรค์** | 7 รายการ | ฿1,880.00 |
| 5 | **การพัฒนาตนเองและจิตวิทยา** | 4 รายการ | ฿825.00 |

### 3.5 ข้อสรุปและการนำไปใช้ (Business Insight)
* หมวดหมู่ "เทคโนโลยีและการเขียนโปรแกรม" เป็นหมวดหมู่ที่สร้างยอดขายและจำนวนรายการสูงสุดในระบบอย่างขาดลอย (31 เล่ม รวม 11,080 บาท) ซึ่งคิดเป็นสัดส่วนกว่า 60% ของยอดขายรวมร้านค้า ทำให้เห็นทิศทางชัดเจนในการจัดหาหนังสือใหม่ๆ มาเพิ่มในหมวดหมู่นี้

---

## รายงานที่ 4: ลูกค้าและคำสั่งซื้อ

### 4.1 คำถามที่ต้องตอบ
* ลูกค้ารายใดซื้อบ่อยหรือมียอดซื้อสะสมสูง และแต่ละสถานะมีจำนวนเท่าใด?
* ใครคือลูกค้ากลุ่มสำคัญที่ควรได้รับสิทธิพิเศษรักษาฐานลูกค้า (Loyalty Reward)?

### 4.2 สิ่งที่ควรใช้ใน SQL
* `JOIN`, `GROUP BY`, `HAVING`, `COUNT`, `SUM` และเงื่อนไขสถานะ (`WHERE orders.status = 'confirmed'`)

### 4.3 คำสั่ง SQL ที่ใช้ (สั้น กระชับ จำง่าย เขียนสดสอบได้ทันที)
```sql
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
```

### 4.4 ผลลัพธ์จากการรันจริงในระบบ (Top 5 ลูกค้าประจำ)
| ลำดับ | ชื่อ-นามสกุลลูกค้า (full_name) | สถานะคำสั่งซื้อ (status) | จำนวนคำสั่งซื้อ (total_orders) | ยอดซื้อสะสมรวม (total_spent) |
| :---: | :--- | :---: | :---: | :---: |
| 1 | **นายธนวัฒน์ นามเหง้า** | confirmed | 4 ครั้ง | ฿1,750.00 |
| 2 | **นายภานุวัฒน์ แสงเครือ** | confirmed | 3 ครั้ง | ฿1,240.00 |
| 3 | **สมชาย ดำรงไทย** | confirmed | 3 ครั้ง | ฿1,240.00 |
| 4 | **ธีรภัทร พงษ์ศิริ** | confirmed | 2 ครั้ง | ฿1,230.00 |
| 5 | **สุดา เกียรติสกุล** | confirmed | 3 ครั้ง | ฿1,220.00 |

### 4.5 ข้อสรุปและการนำไปใช้ (Business Insight)
* คำสั่ง SQL กรองเฉพาะคำสั่งซื้อที่ยืนยันการชำระเงินสำเร็จ (`status = 'confirmed'`) และจัดกลุ่มลูกค้าที่ซื้อซ้ำตั้งแต่ 2 ครั้งขึ้นไป (`HAVING COUNT >= 2`) พบว่ามีลูกค้าประจำกลุ่ม VIP มียอดซื้อสะสมเกิน 1,200 บาท ทางร้านสามารถนำรายชื่อนี้ไปมอบสิทธิพิเศษ Loyalty Reward เพื่อรักษาฐานลูกค้าได้อย่างมีประสิทธิภาพ

<div style="page-break-before: always;"></div>

---

# บันทึกผู้สอน

<table class="eval-table" style="width: 100%; border-collapse: collapse; margin-top: 24px; border: 1.5px solid #244b7a;">
    <thead>
        <tr style="background-color: #244b7a; color: #ffffff;">
            <th style="width: 25%; padding: 14px 16px; text-align: center; border: 1px solid #cbd5e1; color: #ffffff; background-color: #244b7a; font-size: 13pt;">หัวข้อ</th>
            <th style="width: 75%; padding: 14px 16px; text-align: center; border: 1px solid #cbd5e1; color: #ffffff; background-color: #244b7a; font-size: 13pt;">บันทึก</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td class="title-col" style="padding: 30px 16px; font-weight: bold; text-align: center; vertical-align: middle; border: 1px solid #cbd5e1; background-color: #ffffff; font-size: 12pt;">จุดที่ทำได้ดี</td>
            <td class="blank-col" style="padding: 30px 16px; height: 180px; min-height: 180px; border: 1px solid #cbd5e1; background-color: #ffffff;">&nbsp;</td>
        </tr>
        <tr style="background-color: #f0f4f8;">
            <td class="title-col" style="padding: 30px 16px; font-weight: bold; text-align: center; vertical-align: middle; border: 1px solid #cbd5e1; background-color: #f0f4f8; font-size: 12pt;">ข้อเสนอแนะ</td>
            <td class="blank-col" style="padding: 30px 16px; height: 180px; min-height: 180px; border: 1px solid #cbd5e1; background-color: #f0f4f8;">&nbsp;</td>
        </tr>
        <tr>
            <td class="title-col" style="padding: 30px 16px; font-weight: bold; text-align: center; vertical-align: middle; border: 1px solid #cbd5e1; background-color: #ffffff; font-size: 12pt;">คะแนนและหมายเหตุ</td>
            <td class="blank-col" style="padding: 30px 16px; height: 180px; min-height: 180px; border: 1px solid #cbd5e1; background-color: #ffffff;">&nbsp;</td>
        </tr>
    </tbody>
</table>

