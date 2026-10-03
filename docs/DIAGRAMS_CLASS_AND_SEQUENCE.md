# แผนภาพคลาสและลำดับการทำงาน (Class & Sequence Diagrams)
## โครงงาน: EBOOK_ONLINE (ร้านขายหนังสือและอีบุ๊กออนไลน์)
### รายวิชาระบบฐานข้อมูล [31-407-102-301] ประจำปีการศึกษา 2569

---

## 1. ผังคลาสของระบบ (System Class Diagram)

แผนภาพคลาสแสดงความสัมพันธ์ระหว่างโมเดลและเอนทิตีข้อมูลทั้ง 11 คลาสในระบบ ตามโครงสร้างมาตรฐานการออกแบบเชิงวัตถุและระบบฐานข้อมูลเชิงสัมพันธ์:

```mermaid
classDiagram
    direction TB

    class Role {
        +int role_id
        +string role_name
        +string description
        +getUsers()
    }

    class User {
        +int user_id
        +int role_id
        +string username
        +string email
        +string password_hash
        +string full_name
        +string phone
        +datetime created_at
        +register()
        +login()
        +getCart()
        +getOrders()
    }

    class Category {
        +int category_id
        +string name
        +string description
        +getEbooks()
    }

    class Author {
        +int author_id
        +string name
        +string bio
        +getEbooks()
    }

    class EBook {
        +int ebook_id
        +int category_id
        +int author_id
        +string title
        +decimal price
        +string description
        +string cover_image_url
        +string sample_file_url
        +string full_file_url
        +boolean is_published
        +datetime created_at
        +publish()
        +unpublish()
        +updatePrice(decimal new_price)
    }

    class Cart {
        +int cart_id
        +int user_id
        +datetime created_at
        +datetime updated_at
        +addItem(int ebook_id)
        +removeItem(int cart_item_id)
        +calculateTotal()
        +clear()
    }

    class CartItem {
        +int cart_item_id
        +int cart_id
        +int ebook_id
        +datetime added_at
    }

    class Order {
        +int order_id
        +int user_id
        +string order_number
        +decimal total_amount
        +string status
        +datetime created_at
        +datetime updated_at
        +checkout()
        +confirm()
        +cancel()
        +generateDownloadLinks()
    }

    class OrderItem {
        +int order_item_id
        +int order_id
        +int ebook_id
        +decimal price_at_purchase
    }

    class Payment {
        +int payment_id
        +int order_id
        +string payment_method
        +decimal amount
        +string slip_image_url
        +string status
        +datetime payment_date
        +verifySlip()
        +approve()
        +reject()
    }

    class DownloadLink {
        +int download_id
        +int order_id
        +int ebook_id
        +string token
        +datetime expires_at
        +int max_downloads
        +int download_count
        +boolean is_active
        +validateToken()
        +incrementDownload()
        +revoke()
    }

    Role "1" -- "0..*" User : defines role of
    User "1" -- "1" Cart : owns
    User "1" -- "0..*" Order : places
    Category "1" -- "0..*" EBook : categorizes
    Author "1" -- "0..*" EBook : writes
    Cart "1" -- "0..*" CartItem : contains
    EBook "1" -- "0..*" CartItem : referenced in
    Order "1" -- "1..*" OrderItem : consists of
    EBook "1" -- "0..*" OrderItem : bought in
    Order "1" -- "0..1" Payment : paid by
    Order "1" -- "0..*" DownloadLink : issues
    EBook "1" -- "0..*" DownloadLink : targets
```

---

## 2. แผนภาพลำดับการทำงาน (Sequence Diagrams)

### 2.1 แผนภาพลำดับ: การสั่งซื้อสินค้าและแนบสลิปชำระเงินจำลอง (Order & Payment Submission Flow)

```mermaid
sequenceDiagram
    autonumber
    actor Customer as 👤 ลูกค้า (Customer)
    participant UI as 💻 เว็บหน้าร้าน (Storefront UI)
    participant Server as ⚙️ ระบบหลังบ้าน (Node.js API)
    participant DB as 🗄️ ฐานข้อมูล (SQLite / Supabase)

    Customer->>UI: กดเลือกหนังสือเข้าตะกร้า (Add to Cart)
    UI->>Server: POST /api/cart/items (ebook_id)
    Server->>DB: INSERT INTO cart_items (cart_id, ebook_id)
    Server-->>UI: 200 OK (เพิ่มสำเร็จ)

    Customer->>UI: กดชำระเงินสั่งซื้อ (Checkout)
    UI->>Server: POST /api/orders/checkout
    Server->>DB: INSERT INTO orders (user_id, status='pending')
    Server->>DB: INSERT INTO order_items (คัดลอกจาก cart)
    Server->>DB: DELETE FROM cart_items WHERE cart_id = ?
    Server-->>UI: 201 Created (สร้างออเดอร์สถานะ pending สำเร็จ)

    Customer->>UI: อัปโหลดสลิปจำลองและกดยืนยันชำระเงิน
    UI->>Server: POST /api/orders/:id/payment (slip_file, amount)
    Server->>DB: INSERT INTO payments (status='submitted')
    Server-->>UI: 200 OK (บันทึกหลักฐานเรียบร้อย รอแอดมินตรวจสอบ)
```

---

### 2.2 แผนภาพลำดับ: การตรวจสอบสลิปและอนุมัติออเดอร์โดยผู้ดูแลระบบ (Admin Verification Flow)

```mermaid
sequenceDiagram
    autonumber
    actor Admin as 🛡️ ผู้ดูแลระบบ (Store Admin)
    participant AdminUI as 🖥️ ระบบแอดมิน (Admin Portal)
    participant Server as ⚙️ ระบบหลังบ้าน (Node.js API)
    participant DB as 🗄️ ฐานข้อมูล (SQLite / Supabase)

    Admin->>AdminUI: เปิดหน้าตรวจสอบออเดอร์ (Orders Tab)
    AdminUI->>Server: GET /api/admin/orders?status=pending
    Server->>DB: SELECT * FROM orders JOIN payments WHERE status = 'pending'
    Server-->>AdminUI: ส่งรายการคำสั่งซื้อพร้อมรูปภาพสลิป
    
    Admin->>AdminUI: ตรวจดูยอดเงินและหลักฐานสลิปแบบ Side-by-side
    Admin->>AdminUI: กดปุ่ม "อนุมัติคำสั่งซื้อ (Confirm)"
    AdminUI->>Server: PUT /api/admin/orders/:id/confirm
    
    Server->>DB: UPDATE orders SET status = 'confirmed' WHERE order_id = ?
    Server->>DB: UPDATE payments SET status = 'approved' WHERE order_id = ?
    Server->>DB: INSERT INTO download_links (order_id, ebook_id, token, max_downloads=5)
    Server-->>AdminUI: 200 OK (อนุมัติสำเร็จ และเปิดสิทธิ์ดาวน์โหลดแล้ว)
```

---

### 2.3 แผนภาพลำดับ: กลไกสกัดกั้นความปลอดภัยในการดาวน์โหลด (Security Download Gate: 403 vs 200)

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 ผู้ใช้ / ผู้บุกรุก (Client)
    participant Gateway as 🚪 Secure Download Gateway
    participant DB as 🗄️ ฐานข้อมูล (SQLite DB)
    participant Storage as 📁 ที่เก็บไฟล์ (Storage)

    alt คำสั่งซื้อยังไม่อนุมัติ (Pending / Cancelled)
        User->>Gateway: GET /api/download/:token
        Gateway->>DB: SELECT status, download_count, max_downloads FROM download_links JOIN orders
        DB-->>Gateway: status = 'pending'
        Gateway-->>User: ⛔ 403 Forbidden (ปฏิเสธการดาวน์โหลดจนกว่าจะได้รับอนุมัติ)
    else คำสั่งซื้ออนุมัติแล้ว และจำนวนครั้งดาวน์โหลดไม่เกินกำหนด
        User->>Gateway: GET /api/download/:token
        Gateway->>DB: SELECT status, download_count, max_downloads FROM download_links JOIN orders
        DB-->>Gateway: status = 'confirmed' และ download_count < 5
        Gateway->>DB: UPDATE download_links SET download_count = download_count + 1
        Gateway->>Storage: ดึงไฟล์ตัวเต็ม (E-Book File)
        Storage-->>Gateway: สตรีมข้อมูลไฟล์ (Binary PDF Stream)
        Gateway-->>User: 🟢 200 OK พร้อมไฟล์ E-Book ดาวน์โหลดเข้าเครื่อง
    end
```

---

### 2.4 แผนภาพลำดับ: การเชื่อมโยงและซิงค์ข้อมูลบนคลาวด์ (Cloud Real-time Synchronization Flow)

```mermaid
sequenceDiagram
    autonumber
    participant App as 🖥️ เว็บแอปพลิเคชัน (EBOOK_ONLINE)
    participant SQLite as 🗄️ Local DB (SQLite)
    participant SyncEngine as 🔄 Background Sync Engine
    participant Supabase as ☁️ Cloud DB (Supabase PostgreSQL)

    App->>SQLite: ทำธุรกรรมใหม่ (User / Order / Payment)
    SQLite-->>App: บันทึกข้อมูลแบบ Realtime (Sub-millisecond)
    App->>SyncEngine: แจ้งเตือนเหตุการณ์ข้อมูลเปลี่ยนแปลง (Trigger Sync)
    SyncEngine->>Supabase: UPSERT ข้อมูลเข้าสู่ตารางคลาวด์ผ่าน Connection Pool
    Supabase-->>SyncEngine: ยืนยันการบันทึกสำเร็จ (200 OK)
    SyncEngine-->>App: สถานะคลาวด์สอดคล้องกัน (Synced)
```
