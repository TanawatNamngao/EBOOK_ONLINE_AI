# แผนภาพเส้นทางการทำงานและสถานการณ์โจทย์ (System Flow & Scenarios)
## โครงงาน: EBOOK_ONLINE (Mini Project Database ร้านขาย E-Book)

เอกสารนี้วิเคราะห์และแปลงโจทย์จาก **ข้อ 1. สถานการณ์โจทย์** ของใบงาน ให้เป็นกระบวนการทำงานจริงของระบบ (Business Logic & System Flow)

---

## 1. การวิเคราะห์ตัวละครและบทบาท (Actors & Roles)

ตามสถานการณ์โจทย์ มี 2 ตัวละครหลักที่มีปฏิสัมพันธ์กับฐานข้อมูล:

```
[ ลูกค้า (Customer) ]                                  [ ผู้ดูแลร้าน (Admin) ]
       │                                                         │
       ├─ สมัครสมาชิก / ล็อกอิน                                   ├─ ล็อกอินระบบหลังบ้าน
       ├─ ค้นหา / คัดกรอง E-Book                                 ├─ จัดการหนังสือ / หมวดหมู่
       ├─ เลือกใส่ตะกร้า / ปรับจำนวน                             ├─ ตรวจสอบหลักฐานการชำระเงินจำลอง
       ├─ สั่งซื้อ (Checkout)                                    ├─ ยืนยันคำสั่งซื้อ (อนุมัติ / ปฏิเสธ)
       ├─ แนบสลิปชำระเงินจำลอง                                    └─ ดู Dashboard วิเคราะห์ยอดขายและแนวโน้ม
       └─ รับลิงก์ดาวน์โหลด (เฉพาะเล่มที่ยืนยันแล้ว)
```

---

## 2. แผนภาพเส้นทางการสั่งซื้อจนถึงดาวน์โหลด (Customer to Admin Flow)

```mermaid
sequenceDiagram
    autonumber
    actor Customer as ลูกค้า (Customer)
    participant Web as หน้าร้าน (Frontend)
    participant Server as เซิร์ฟเวอร์ (API Backend)
    participant DB as ฐานข้อมูล (SQLite DB)
    actor Admin as ผู้ดูแลร้าน (Admin)

    %% 1. เลือกสินค้าและสั่งซื้อ
    Customer->>Web: เลือก E-Book ใส่ตะกร้า
    Web->>Server: POST /api/cart/items (ebook_id)
    Server->>DB: INSERT INTO cart_items
    Customer->>Web: กดยืนยันการสั่งซื้อ (Checkout)
    Web->>Server: POST /api/orders (สร้างคำสั่งซื้อ)
    Server->>DB: INSERT INTO orders (status = 'pending')
    Server->>DB: INSERT INTO order_items (คัดลอกจาก cart)
    Server->>DB: DELETE FROM cart_items (ล้างตะกร้า)

    %% 2. ชำระเงินจำลอง
    Customer->>Web: อัปโหลดสลิปจำลองและแจ้งชำระเงิน
    Web->>Server: POST /api/orders/:id/payment (หลักฐานจำลอง)
    Server->>DB: INSERT INTO payments (status = 'submitted')
    Server-->>Customer: แสดงสถานะ "รอผู้ดูแลตรวจสอบ"

    %% 3. สิทธิ์การดาวน์โหลดช่วงรอตรวจ
    Note over Customer,DB: ในช่วงสถานะ pending ลิงก์ดาวน์โหลดจะยังไม่ถูกสร้าง/ถูกล็อก (ความปลอดภัย)

    %% 4. ผู้ดูแลตรวจสอบและอนุมัติ
    Admin->>Server: GET /api/admin/orders?status=pending
    Server->>DB: SELECT * FROM orders JOIN payments
    Server-->>Admin: แสดงรายการสั่งซื้อพร้อมภาพสลิปจำลอง
    Admin->>Server: PUT /api/admin/orders/:id/confirm (ยืนยันคำสั่งซื้อ)
    Server->>DB: UPDATE orders SET status = 'confirmed'
    Server->>DB: UPDATE payments SET payment_status = 'verified'
    Server->>DB: INSERT INTO download_links (สร้างโทเคนและสิทธิ์ดาวน์โหลด)

    %% 5. ลูกค้าเข้าดาวน์โหลด
    Customer->>Web: เปิดดูประวัติคำสั่งซื้อ
    Web->>Server: GET /api/my-orders
    Server->>DB: SELECT * FROM orders WHERE status = 'confirmed'
    Server-->>Web: ส่งรายการพร้อมปุ่มลิงก์ดาวน์โหลด
    Customer->>Web: คลิกปุ่มดาวน์โหลด E-Book
    Web->>Server: GET /api/download/:token
    Server->>DB: ตรวจสอบ token, สถานะ order = 'confirmed', และเพิ่ม download_count
    Server-->>Customer: ส่งไฟล์หนังสือ E-Book ฉบับเต็ม
```

---

## 3. วงจรสถานะคำสั่งซื้อและเงื่อนไขความปลอดภัย (Order Lifecycle & Access Gate)

สถานะของคำสั่งซื้อในตาราง `orders` และ `payments` จะเป็นตัวควบคุมสิทธิ์การเข้าถึงข้อมูลตามเงื่อนไขโจทย์:

```mermaid
stateDiagram-v2
    [*] --> Pending : ลูกค้ากดสั่งซื้อและแนบสลิปจำลอง (status = 'pending')
    
    state Pending {
        [*] --> WaitingVerification : payments.status = 'submitted'
        WaitingVerification --> LockDownload : ปิดกั้นการดาวน์โหลด (HTTP 403)
    }

    Pending --> Confirmed : แอดมินตรวจสอบสลิปแล้วถูกต้อง (status = 'confirmed')
    Pending --> Cancelled : แอดมินปฏิเสธ หรือลูกค้ายกเลิก (status = 'cancelled')

    state Confirmed {
        [*] --> GenerateToken : สร้าง download_links (token ปลอดภัย)
        GenerateToken --> AllowDownload : อนุญาตให้ลูกค้าดาวน์โหลดไฟล์ E-Book ได้
    }

    state Cancelled {
        [*] --> VoidOrder : ยกเลิกรายการและคืนสิทธิ์
    }

    Confirmed --> [*]
    Cancelled --> [*]
```

### กฎข้อห้ามเด็ดขาด (Security Rule)
> **ระบบต้องไม่เปิดเผย Direct URL ของไฟล์ E-Book** และ **ต้องไม่เปิดลิงก์ของหนังสือที่ลูกค้ายังไม่ได้ซื้อ หรือคำสั่งซื้อยังไม่ยืนยัน** โดยทุกครั้งที่เรียกโหลดไฟล์ ต้องผ่านตัวกรอง:
> `WHERE orders.status = 'confirmed' AND payments.payment_status = 'verified'`

---

## 4. ระบบวิเคราะห์แนวโน้มสำหรับผู้ดูแลร้าน (Admin Analytics & Insights)
ตามโจทย์ *"ผู้ดูแลต้องติดตามการขายและวิเคราะห์แนวโน้มจากข้อมูลในฐานข้อมูลได้"* ระบบจัดเตรียมหน้า Dashboard เชื่อมโยงกับ 4 คำถามทางธุรกิจ:

1. **แนวโน้มรายได้และจำนวนออเดอร์:** กราฟยอดขายเปรียบเทียบตามวันและเดือน ดูอัตราการเติบโต
2. **สินค้าขายดีติดอันดับ:** Top 5 หรือ Top 10 เล่มที่ทำยอดขายสูงสุด เพื่อใช้วางแผนโปรโมชัน
3. **หมวดหมู่ทำเงินสูงสุด:** สัดส่วนยอดขายแบ่งตามหมวดหมู่ (กราฟวงกลม/แท่ง)
4. **พฤติกรรมลูกค้า:** ลูกค้าที่มียอดซื้อสะสมสูงสุด (Top Spenders) และสัดส่วนสถานะออเดอร์ (สำเร็จ vs รอตรวจ vs ยกเลิก)

<div align="center">
<img src="รูปภาพประกอบรายงาน/Screenshot (373).png" alt="หน้าร้านแคตตาล็อก" width="92%">
<br><em>ภาพประกอบที่ 1: หน้าต่างแคตตาล็อกหนังสือและการค้นหา E-Book หน้าร้าน (Storefront Catalog)</em>
</div>

<div align="center">
<img src="รูปภาพประกอบรายงาน/Screenshot (374).png" alt="ตะกร้าสินค้า" width="92%">
<br><em>ภาพประกอบที่ 2: หน้าต่างตะกร้าสินค้าและการคำนวณราคาสุทธิแบบ Real-Time (Shopping Cart Drawer)</em>
</div>

<div align="center">
<img src="รูปภาพประกอบรายงาน/Screenshot (375).png" alt="ประวัติคำสั่งซื้อและการดาวน์โหลด" width="92%">
<br><em>ภาพประกอบที่ 3: หน้าต่างประวัติคำสั่งซื้อ การควบคุมสิทธิ์ และปุ่มดาวน์โหลด E-Book ปลอดภัย</em>
</div>

<div align="center">
<img src="รูปภาพประกอบรายงาน/Screenshot (376).png" alt="Admin Dashboard" width="92%">
<br><em>ภาพประกอบที่ 4: แผงควบคุมหลักผู้ดูแลระบบ (Admin Dashboard) และสรุปยอดขายสดจากฐานข้อมูล</em>
</div>
