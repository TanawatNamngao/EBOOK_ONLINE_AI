<div class="cover-page" align="center">

<img src="รูปภาพประกอบรายงาน/Logo_rmuti.png" alt="ตราสัญลักษณ์ มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน" width="135" class="cover-logo">

<br><br>

# การวิเคราะห์และพัฒนาระบบร้านขายหนังสือและอีบุ๊กออนไลน์
### (EBOOK_ONLINE AI Store)
## โครงงานพัฒนาระบบฐานข้อมูล (Mini Project)

<br><br>

**ผู้จัดทำโครงงาน:**

**นายธนวัฒน์ นามเหง้า**  
รหัสนักศึกษา 67332110293-4  

**นายภานุวัฒน์ แสงเครือ**  
รหัสนักศึกษา 67332110248-5  

<br><br><br>

**โครงงานนี้เป็นส่วนหนึ่งของการศึกษารายวิชา [31-407-102-301] ระบบฐานข้อมูล**  
สาขาวิชาวิศวกรรมคอมพิวเตอร์ คณะวิศวกรรมศาสตร์  
มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน วิทยาเขตขอนแก่น พ.ศ. 2569  
**ลิขสิทธิ์ของคณะวิศวกรรมศาสตร์ มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน**

</div>

# สารบัญ (Table of Contents)

| ลำดับบท / หัวข้อ | หน้า |
| :--- | :---: |
| **บทสรุปผู้บริหาร (Executive Summary)** | **1** |
| **บทที่ 1: บทนำและวัตถุประสงค์ของโครงงาน** | **2** |
| &nbsp;&nbsp;&nbsp;&nbsp;1.1 ที่มาและความสำคัญของปัญหา | 2 |
| &nbsp;&nbsp;&nbsp;&nbsp;1.2 วัตถุประสงค์ของโครงงาน | 2 |
| &nbsp;&nbsp;&nbsp;&nbsp;1.3 ขอบเขตของระบบ (System Scope) | 3 |
| &nbsp;&nbsp;&nbsp;&nbsp;1.4 เครื่องมือและเทคโนโลยีที่ใช้พัฒนา | 4 |
| **บทที่ 2: การวิเคราะห์และออกแบบฐานข้อมูล** | **5** |
| &nbsp;&nbsp;&nbsp;&nbsp;2.1 โครงสร้างผังความสัมพันธ์ข้อมูล (Entity-Relationship Diagram) | 5 |
| &nbsp;&nbsp;&nbsp;&nbsp;2.2 ทฤษฎีการปรับรูปบรรทัดฐาน (Database Normalization to 3NF) | 5 |
| &nbsp;&nbsp;&nbsp;&nbsp;2.3 พจนานุกรมข้อมูลฉบับสมบูรณ์ (Data Dictionary) | 6 |
| **บทที่ 3: การสร้างฐานข้อมูลและข้อกำหนดบูรณภาพข้อมูล** | **10** |
| &nbsp;&nbsp;&nbsp;&nbsp;3.1 DDL Scripts และการสร้างตารางบน SQLite / PostgreSQL | 10 |
| &nbsp;&nbsp;&nbsp;&nbsp;3.2 ข้อกำหนดบูรณภาพข้อมูล (Integrity Constraints) | 10 |
| &nbsp;&nbsp;&nbsp;&nbsp;3.3 ข้อมูลตัวอย่างทดสอบระบบ (Seed Data) | 11 |
| **บทที่ 4: รายงานวิเคราะห์ข้อมูลเชิงลึก 4 ด้าน** | **12** |
| &nbsp;&nbsp;&nbsp;&nbsp;4.1 รายงานที่ 1: ยอดขายตามช่วงเวลา (Sales Over Time by Month) | 12 |
| &nbsp;&nbsp;&nbsp;&nbsp;4.2 รายงานที่ 2: E-Book ขายดีที่สุด 5 อันดับแรก (Top-Selling Books) | 12 |
| &nbsp;&nbsp;&nbsp;&nbsp;4.3 รายงานที่ 3: ยอดขายตามหมวดหมู่ (Sales by Category) | 13 |
| &nbsp;&nbsp;&nbsp;&nbsp;4.4 รายงานที่ 4: พฤติกรรมลูกค้าและยอดซื้อสะสม (Customer Lifetime Value) | 14 |
| **บทที่ 5: การพัฒนาเว็บแอปพลิเคชันและการควบคุมสิทธิ์การเข้าถึง** | **15** |
| &nbsp;&nbsp;&nbsp;&nbsp;5.1 สถาปัตยกรรมระบบและความปลอดภัยการเข้าสู่ระบบ | 15 |
| &nbsp;&nbsp;&nbsp;&nbsp;5.2 ระบบสั่งซื้อ ตะกร้าสินค้า และการชำระเงินจำลอง | 16 |
| &nbsp;&nbsp;&nbsp;&nbsp;5.3 การควบคุมสิทธิ์การเข้าถึง (Role-Based Access Control: RBAC) | 17 |
| &nbsp;&nbsp;&nbsp;&nbsp;5.4 การจัดการคำสั่งซื้อ ตรวจสอบหลักฐานสลิป และคลังหนังสือ | 18 |
| &nbsp;&nbsp;&nbsp;&nbsp;5.5 หน้าจอรายงานวิเคราะห์ธุรกิจ และระบบจัดการสมาชิก | 19 |
| **บทที่ 6: แผนการทดสอบและประกันคุณภาพข้อมูล (Testing & QA)** | **20** |
| **บทที่ 7: การประยุกต์ใช้ปัญญาประดิษฐ์อย่างรับผิดชอบ (AI Usage Log)** | **21** |
| &nbsp;&nbsp;&nbsp;&nbsp;7.1 บันทึกการใช้งาน AI ในการพัฒนา (AI Prompt & Usage Log) | 21 |
| &nbsp;&nbsp;&nbsp;&nbsp;7.2 ข้อเสนอแนะของ AI ที่นักศึกษาตัดสินใจปฏิเสธ (Rejected AI Proposals) | 21 |
| &nbsp;&nbsp;&nbsp;&nbsp;7.3 จริยธรรมข้อมูลส่วนบุคคล (PDPA Consideration) | 22 |
| **บทที่ 8: สรุปผลการดำเนินงานและข้อเสนอแนะ** | **23** |
| &nbsp;&nbsp;&nbsp;&nbsp;8.1 สรุปผลสัมฤทธิ์ของโครงงาน | 23 |
| &nbsp;&nbsp;&nbsp;&nbsp;8.2 ข้อเสนอแนะในการพัฒนาต่อยอด | 23 |
| **ภาคผนวก** | **24** |
| &nbsp;&nbsp;&nbsp;&nbsp;ภาคผนวก ก: รายการตรวจสอบความพร้อมก่อนส่งงาน (Submission Checklist) | 24 |
| &nbsp;&nbsp;&nbsp;&nbsp;ภาคผนวก ข: การเชื่อมโยงโครงงานกับวิชาวิศวกรรมซอฟต์แวร์ (SWE Inventory System) | 24 |

<div class="page-break"></div>

---

# บทสรุปผู้บริหาร (Executive Summary)

โครงงานพัฒนาระบบฐานข้อมูล **"ร้านขายหนังสือและอีบุ๊กออนไลน์ (EBOOK_ONLINE AI Store)"** จัดทำขึ้นเพื่อประยุกต์ใช้ทฤษฎีการออกแบบและการบริหารจัดการระบบฐานข้อมูลเชิงสัมพันธ์ (Relational Database Management Systems: RDBMS) ภายใต้เกณฑ์มาตรฐานของรายวิชาระบบฐานข้อมูล [31-407-102-301] โดยเน้นการพัฒนาระบบจำหน่ายหนังสือดิจิทัลที่มีความรัดกุม ถูกต้องตามหลักการจัดรูปแบบบรรทัดฐานขั้นที่ 3 (Third Normal Form: 3NF) และมีความปลอดภัยในการส่งมอบสินค้าดิจิทัลในระดับข้อมูลจริง

ระบบได้รับการออกแบบฐานข้อมูลครอบคลุมกระบวนการขายครบวงจรจำนวนทั้งสิ้น 11 ตาราง ได้แก่ ตารางบทบาทผู้ใช้ (`roles`), สมาชิกและแอดมิน (`users`), ผู้แต่ง (`authors`), หมวดหมู่หนังสือ (`categories`), รายการหนังสือ E-Book (`ebooks`), ตะกร้าสินค้า (`carts`), รายการย่อยในตะกร้า (`cart_items`), คำสั่งซื้อหลัก (`orders`), รายการย่อยในคำสั่งซื้อ (`order_items`), การชำระเงินและสลิปจำลอง (`payments`), และสิทธิ์โทเค็นการดาวน์โหลดปลอดภัย (`download_links`) มีการกำหนดข้อกำหนดบูรณภาพข้อมูล (Integrity Constraints) อย่างสมบูรณ์ ได้แก่ Primary Key, Foreign Key, NOT NULL, UNIQUE, CHECK, และ DEFAULT

ระบบทำงานร่วมกับฐานข้อมูล SQLite และ PostgreSQL พร้อมติดตั้งใช้งานจริงบนคลาวด์แพลตฟอร์ม Render (URL: `https://ebook-online-ai-1.onrender.com`) ผ่านเว็บแอปพลิเคชัน Full-Stack Node.js Express และ Vanilla JavaScript มีการรักษาความปลอดภัยด้วยเงื่อนไขสิทธิ์: สมาชิกทั่วไปไม่สามารถเข้าถึงหน้าหลังบ้านได้ (403 Forbidden Access Denied) และคำสั่งซื้อที่ยังไม่ได้รับการยืนยันการชำระเงิน (`pending`) จะไม่สามารถเปิดดาวน์โหลดหนังสือได้เด็ดขาด นอกจากนี้ ยังได้พัฒนาคำสั่งสืบค้น SQL ขั้นสูง (Complex Queries) สำหรับจัดทำรายงานวิเคราะห์ธุรกิจ 4 ด้าน ตอบโจทย์การบริหารจัดการยอดขาย สินค้าขายดี หมวดหมู่ยอดนิยม และมูลค่าสะสมของลูกค้า พร้อมทั้งส่งออกเป็นไฟล์ CSV มาตรฐาน UTF-8 BOM ที่รองรับภาษาไทยใน Microsoft Excel ได้อย่างสมบูรณ์

<div class="page-break"></div>

---

# บทที่ 1: บทนำและวัตถุประสงค์ของโครงงาน

## 1.1 ที่มาและความสำคัญของปัญหา
ในยุคเศรษฐกิจดิจิทัล หนังสืออิเล็กทรอนิกส์ (E-Book) ได้กลายเป็นช่องทางการเผยแพร่และอ่านหนังสือที่ได้รับความนิยมอย่างแพร่หลาย เนื่องจากผู้บริโภคสามารถสั่งซื้อและดาวน์โหลดไปอ่านได้ทันทีทุกที่ทุกเวลา อย่างไรก็ดี สถาปัตยกรรมระบบสำหรับร้านขายสินค้าดิจิทัลมีความแตกต่างอย่างมีนัยสำคัญจากร้านค้าสินค้าที่จับต้องได้ กล่าวคือ สินค้าดิจิทัลไม่มีการจำกัดจำนวนสินค้าคงเหลือทางกายภาพ แต่ต้องการระบบรักษาความปลอดภัยในการส่งมอบไฟล์ที่มีความเข้มงวดสูง เพื่อให้มั่นใจว่าเฉพาะคำสั่งซื้อที่ชำระเงินถูกต้องแล้วเท่านั้นจึงจะได้รับสิทธิ์เข้าถึงเนื้อหา และป้องกันการนำลิงก์ดาวน์โหลดไปแชร์ต่อสาธารณะ

ด้วยเหตุนี้ การออกแบบโครงสร้างฐานข้อมูลที่มีความสัมพันธ์ถูกต้องตามหลัก Normalization และมีกลไกตรวจสอบเงื่อนไขในระดับ Schema จึงเป็นหัวใจสำคัญอย่างยิ่งในการทำให้ระบบทำงานได้อย่างมั่นคง ปราศจากข้อมูลผิดรูป และรองรับการนำข้อมูลธุรกรรมมาประมวลผลเป็นรายงานวิเคราะห์เพื่อสนับสนุนการตัดสินใจเชิงธุรกิจได้อย่างมีประสิทธิภาพ

## 1.2 วัตถุประสงค์ของโครงงาน
1. เพื่อออกแบบและพัฒนาฐานข้อมูลเชิงสัมพันธ์สำหรับระบบร้านค้า E-Book ที่ถูกต้องตามหลักการ Normalization ระดับ 3NF
2. เพื่อสร้างระบบเว็บแอปพลิเคชันต้นแบบ (Prototype) ที่เชื่อมโยงกับฐานข้อมูลจริง และสามารถใช้งานออนไลน์ได้ตลอด 24 ชั่วโมง
3. เพื่อจำลองเส้นทางการใช้งานของลูกค้า (Customer Journey) และระบบบริหารจัดการหลังบ้านของผู้ดูแลระบบ (Admin Backoffice)
4. เพื่อเขียนคำสั่ง SQL สืบทอดรายงานวิเคราะห์ข้อมูลเชิงลึก 4 หัวข้อ และสร้างฟังก์ชันส่งออกข้อมูลเป็นไฟล์ CSV สำหรับผู้บริหาร
5. เพื่อประยุกต์ใช้เครื่องมือปัญญาประดิษฐ์ (AI) ในการออกแบบและแก้ปัญหาอย่างมีความรับผิดชอบ โปร่งใส และตรวจสอบได้

## 1.3 ขอบเขตของระบบ (System Scope)
ระบบประกอบด้วย 2 ส่วนหลักตามข้อกำหนดใบงานข้อ 2 และ 3 ดังนี้:

### ก) ขอบเขตส่วนหน้าร้านสำหรับลูกค้า (Customer Portal):
* **ระบบสมาชิก:** สมัครสมาชิก, เข้าสู่ระบบ, ตรวจสอบ Validation Rules (ห้ามกรอกโค้ดหรืออักขระแปลกปลอม, ตรวจรูปแบบอีเมลและเบอร์โทร), และระบบจัดเก็บข้อมูลลงตาราง `users` ถาวร
* **แคตตาล็อกหนังสือ:** ค้นหาด้วยชื่อเรื่อง/ผู้แต่ง/คำสำคัญ, กรองตามหมวดหมู่, แสดงรายละเอียดราคา ภาพปกเวกเตอร์ และสถานะเปิดขาย
* **ตะกร้าสินค้า:** เพิ่ม/ลดจำนวนหนังสือ ลบรายการ และคำนวณราคาสุทธิแบบ Real-time โดยผูกตาราง `carts` 1 ใบต่อ 1 บัญชีผู้ใช้
* **การสั่งซื้อและชำระเงินจำลอง:** กรอกข้อมูลผู้สั่ง แนบสลิปโอนเงินจำลอง พร้อมปุ่มสร้างสลิปอัตโนมัติ (1-Click Slip Generator) และ PromptPay QR Code จำลอง
* **การดาวน์โหลด E-Book ปลอดภัย:** ระบบเปิดลิงก์ดาวน์โหลดให้เฉพาะคำสั่งซื้อที่ได้รับการอนุมัติ (`confirmed`) แล้วเท่านั้น โดยจำกัดสิทธิ์ดาวน์โหลดสูงสุด 10 ครั้ง

### ข) ขอบเขตส่วนหลังบ้านสำหรับผู้ดูแลระบบ (Admin Backoffice):
* **ระบบรักษาความปลอดภัยสิทธิ์เข้าถึง (RBAC):** ซ่อนปุ่มหลังบ้านจากลูกค้า และมี Route Guard บล็อก URL ด้วยหน้า 403 Forbidden Access Denied
* **การจัดการคำสั่งซื้อและสลิป:** ค้นหา ตรวจสอบหลักฐานสลิปจำลอง และกดอนุมัติ (`confirmed`) เพื่อเปิดสิทธิ์ดาวน์โหลด หรือกดยกเลิก (`cancelled`)
* **การจัดการหนังสือ:** เพิ่มหนังสือใหม่, แก้ไขข้อมูลราคา รายละเอียด ลิงก์ดาวน์โหลด และสลับสถานะเปิด/ปิดการขาย (Soft Delete: `is_published`)
* **การจัดการสมาชิก:** ดูรายชื่อผู้ลงทะเบียนทั้งหมดในระบบ วันที่สมัคร ยอดคำสั่งซื้อ และสลับบทบาทผู้ใช้ (Admin <-> Customer)
* **รายงานวิเคราะห์ธุรกิจ:** แสดงผลข้อมูลสด 4 ด้าน พร้อมคำสั่ง SQL Query และส่งออกเป็นไฟล์ CSV มาตรฐาน UTF-8 BOM

## 1.4 เครื่องมือและเทคโนโลยีที่ใช้พัฒนา

| องค์ประกอบ | เทคโนโลยีที่เลือกใช้ | บทบาทและความเหมาะสม |
| :--- | :--- | :--- |
| **ระบบจัดการฐานข้อมูล (DBMS)** | SQLite (Production-grade Better-SQLite3) / PostgreSQL | ฐานข้อมูลเชิงสัมพันธ์มาตรฐาน รองรับ ACID, Constraints ครบถ้วน, รวดเร็ว และรองรับ Foreign Keys |
| **เว็บเซิร์ฟเวอร์และแบ็กเอนด์** | Node.js (v24 LTS) & Express Framework | ระบบประมวลผลเซิร์ฟเวอร์ประสิทธิภาพสูง รองรับ RESTful API และการจัดการ Session / RBAC |
| **ส่วนติดต่อผู้ใช้งาน (Frontend)** | Modern HTML5, Responsive Vanilla CSS & JavaScript | UI ทันสมัย Dark Mode Glassmorphism สอดคล้องกับมาตรฐานความเร็วสูงและไม่มี Dependency ภายนอก |
| **การจัดเก็บรูปภาพและสลิป** | Local File Storage with Express Static Routing | จัดเก็บสลิปการโอนเงินและภาพปกหนังสือในเซิร์ฟเวอร์อย่างเป็นระบบ |
| **ระบบคลาวด์โฮสติ้ง** | Render Cloud Platform & GitHub CI/CD | โฮสต์ระบบออนไลน์ตลอด 24 ชั่วโมง พร้อมระบบ Auto-Deploy ผ่าน Git Repository |
| **เครื่องมือปัญญาประดิษฐ์** | Antigravity AI (Google DeepMind) | เครื่องมือช่วยออกแบบ ERD, สร้าง SQL Query ที่ซับซ้อน, และตรวจสอบข้อผิดพลาดของโค้ด |

<div class="page-break"></div>

---

# บทที่ 2: การวิเคราะห์และออกแบบฐานข้อมูล

## 2.1 โครงสร้างผังความสัมพันธ์ข้อมูล (Entity-Relationship Diagram)
ฐานข้อมูลประกอบด้วย 11 ตารางที่มีความสัมพันธ์กันอย่างชัดเจนตามหลักการออกแบบฐานข้อมูลเชิงสัมพันธ์ (Relational Data Model):
1. `roles` (1) <---> (N) `users` : บทบาทหนึ่งบทบาทกำหนดให้กับผู้ใช้ได้หลายคน (One-to-Many)
2. `users` (1) <---> (1) `carts` : ผู้ใช้งานหนึ่งคนมีตะกร้าสินค้าประจำตัวได้ 1 ใบ (One-to-One)
3. `carts` (1) <---> (N) `cart_items` : ตะกร้าหนึ่งใบมีรายการสินค้าข้างในได้หลายรายการ (One-to-Many)
4. `users` (1) <---> (N) `orders` : สมาชิกหนึ่งคนสามารถมีประวัติคำสั่งซื้อได้หลายคำสั่งซื้อ (One-to-Many)
5. `authors` (1) <---> (N) `ebooks` : ผู้แต่งหนึ่งท่านมีผลงานหนังสือได้หลายเล่ม (One-to-Many)
6. `categories` (1) <---> (N) `ebooks` : หมวดหมู่หนึ่งหมวดหมู่บรรจุหนังสือได้หลายเล่ม (One-to-Many)
7. `orders` (1) <---> (N) `order_items` : คำสั่งซื้อหนึ่งออเดอร์มีรายการหนังสือย่อยได้หลายเล่ม (One-to-Many)
8. `ebooks` (1) <---> (N) `order_items` : หนังสือหนึ่งเล่มสามารถถูกสั่งซื้อในรายการย่อยได้หลายออเดอร์ (One-to-Many)
9. `orders` (1) <---> (1) `payments` : คำสั่งซื้อหนึ่งรายการมีการแจ้งชำระเงินและสลิปหลักฐานคู่กัน 1 ชุด (One-to-One)
10. `orders` (1) <---> (N) `download_links` : คำสั่งซื้อที่อนุมัติแล้วจะสร้างสิทธิ์ดาวน์โหลดตามจำนวนเล่มที่ซื้อ (One-to-Many)
11. `ebooks` (1) <---> (N) `download_links` : หนังสือแต่ละเล่มเชื่อมโยงกับโทเค็นดาวน์โหลดของลูกค้าแต่ละออเดอร์ (One-to-Many)

## 2.2 ทฤษฎีการปรับรูปบรรทัดฐาน (Database Normalization to 3NF)
การปรับโครงสร้างฐานข้อมูลดำเนินการตามหลัก Normalization อย่างเคร่งครัดเป็น 4 ลำดับขั้น:
1. **Unnormalized Form (UNF):** โครงสร้างเดิมก่อนจัดรูป เก็บข้อมูลการสั่งซื้อ ชื่อลูกค้า รายการหนังสือ ผู้แต่ง หมวดหมู่ และราคาไว้ในตารางรวมเพียงตารางเดียว เกิดปัญหาข้อมูลซ้ำซ้อนและชุดข้อมูลซ้ำ (Repeating Groups)
2. **First Normal Form (1NF):** ขจัด Repeating Groups โดยทำให้ทุก Attribute เป็น Atomic Value (ค่าเดี่ยวที่ไม่สามารถแบ่งย่อยได้อีก) และกำหนด Primary Key ชัดเจนในทุกตาราง
3. **Second Normal Form (2NF):** ขจัด Partial Functional Dependency โดยแยกตาราง `authors` และ `categories` ออกจาก `ebooks` เพื่อให้ Attribute ทุกตัวขึ้นตรงกับ Primary Key ทั้งหมด และแยกตาราง `order_items` โดยเก็บ `price_at_purchase` เพื่อบันทึกราคา ณ วันที่ซื้อ
4. **Third Normal Form (3NF):** ขจัด Transitive Functional Dependency (Attribute ที่ขึ้นต่อกันเองโดยไม่ผ่าน Primary Key) โดยแยกสิทธิ์ `roles` ออกจาก `users`, แยกการชำระเงิน `payments` ออกจาก `orders`, และแยกโทเค็นความปลอดภัย `download_links` ออกจาก `orders`

## 2.3 พจนานุกรมข้อมูลฉบับสมบูรณ์ (Data Dictionary)

### ตารางที่ 1: `roles` (บทบาทผู้ใช้งานในระบบ)
| ชื่อฟิลด์ | ชนิดข้อมูล | ข้อกำหนด (Constraints) | คำอธิบายความหมาย |
| :--- | :--- | :--- | :--- |
| `role_id` | INTEGER | PRIMARY KEY AUTOINCREMENT | รหัสบทบาท (1 = Customer, 2 = Admin, 3 = Author) |
| `role_name` | VARCHAR(50) | UNIQUE, NOT NULL | ชื่อบทบาทผู้ใช้งาน |
| `description` | VARCHAR(255) | NULL | คำอธิบายขอบเขตหน้าที่ความรับผิดชอบ |

### ตารางที่ 2: `users` (ข้อมูลสมาชิกและผู้ดูแลระบบ)
| ชื่อฟิลด์ | ชนิดข้อมูล | ข้อกำหนด (Constraints) | คำอธิบายความหมาย |
| :--- | :--- | :--- | :--- |
| `user_id` | INTEGER | PRIMARY KEY AUTOINCREMENT | รหัสผู้ใช้งาน |
| `role_id` | INTEGER | NOT NULL, FK -> roles(role_id) | รหัสบทบาทผู้ใช้ |
| `username` | VARCHAR(50) | UNIQUE, NOT NULL | ชื่อสำหรับเข้าสู่ระบบ |
| `email` | VARCHAR(120) | UNIQUE, NOT NULL | อีเมลสำหรับเข้าสู่ระบบและรับใบเสร็จ |
| `password_hash` | VARCHAR(255) | NOT NULL | รหัสผ่านที่เข้ารหัสความปลอดภัย |
| `full_name` | VARCHAR(100) | NOT NULL | ชื่อและนามสกุลจริงของผู้ใช้ |
| `phone` | VARCHAR(20) | NULL | เบอร์โทรศัพท์ติดต่อ |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | วันและเวลาที่ลงทะเบียนเข้าใช้งาน |

### ตารางที่ 3: `categories` (หมวดหมู่หนังสือ)
| ชื่อฟิลด์ | ชนิดข้อมูล | ข้อกำหนด (Constraints) | คำอธิบายความหมาย |
| :--- | :--- | :--- | :--- |
| `category_id` | INTEGER | PRIMARY KEY AUTOINCREMENT | รหัสหมวดหมู่ |
| `name` | VARCHAR(100) | UNIQUE, NOT NULL | ชื่อหมวดหมู่หนังสือภาษาไทย |
| `slug` | VARCHAR(100) | UNIQUE, NOT NULL | คีย์อ้างอิง URL Slug ภาษาอังกฤษ |
| `description` | TEXT | NULL | คำอธิบายเกี่ยวกับหมวดหมู่ |
| `is_active` | INTEGER | NOT NULL, DEFAULT 1, CHECK(is_active IN (0,1)) | สถานะเปิดใช้งานหมวดหมู่ |

### ตารางที่ 4: `authors` (ข้อมูลผู้แต่ง / นักเขียน)
| ชื่อฟิลด์ | ชนิดข้อมูล | ข้อกำหนด (Constraints) | คำอธิบายความหมาย |
| :--- | :--- | :--- | :--- |
| `author_id` | INTEGER | PRIMARY KEY AUTOINCREMENT | รหัสผู้แต่ง |
| `name` | VARCHAR(100) | NOT NULL | ชื่อ-นามสกุล หรือนามปากกาผู้แต่ง |
| `bio` | TEXT | NULL | ประวัติและผลงานโดยย่อ |
| `email` | VARCHAR(120) | NULL | อีเมลติดต่อผู้แต่ง |

### ตารางที่ 5: `ebooks` (ข้อมูลหนังสือดิจิทัล E-Book)
| ชื่อฟิลด์ | ชนิดข้อมูล | ข้อกำหนด (Constraints) | คำอธิบายความหมาย |
| :--- | :--- | :--- | :--- |
| `ebook_id` | INTEGER | PRIMARY KEY AUTOINCREMENT | รหัสหนังสือ |
| `category_id` | INTEGER | NOT NULL, FK -> categories(category_id) | รหัสหมวดหมู่หนังสือ |
| `author_id` | INTEGER | NOT NULL, FK -> authors(author_id) | รหัสผู้แต่ง |
| `title` | VARCHAR(200) | NOT NULL | ชื่อเรื่องหนังสือ |
| `isbn` | VARCHAR(30) | UNIQUE, NULL | เลขมาตรฐานสากลประจำหนังสือ |
| `description` | TEXT | NULL | เรื่องย่อและรายละเอียดเนื้อหา |
| `price` | DECIMAL(10,2) | NOT NULL, CHECK(price >= 0) | ราคาจำหน่ายสุทธิต่อเล่ม (บาท) |
| `cover_image` | VARCHAR(255) | NOT NULL, DEFAULT '/assets/covers/default.png' | เส้นทางไฟล์รูปภาพหน้าปก |
| `sample_file_url` | VARCHAR(255) | NULL | เส้นทางไฟล์ตัวอย่างทดลองอ่าน |
| `full_file_url` | VARCHAR(255) | NOT NULL | เส้นทางไฟล์ PDF ฉบับเต็ม |
| `is_published` | INTEGER | NOT NULL, DEFAULT 1, CHECK(is_published IN (0,1)) | สถานะเปิดขาย (Soft Delete) |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | วันและเวลาที่เพิ่มหนังสือ |
| `updated_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | วันและเวลาที่แก้ไขข้อมูลล่าสุด |

### ตารางที่ 6: `carts` (ตะกร้าสินค้าของผู้ใช้)
| ชื่อฟิลด์ | ชนิดข้อมูล | ข้อกำหนด (Constraints) | คำอธิบายความหมาย |
| :--- | :--- | :--- | :--- |
| `cart_id` | INTEGER | PRIMARY KEY AUTOINCREMENT | รหัสตะกร้าสินค้า |
| `user_id` | INTEGER | NOT NULL, UNIQUE, FK -> users(user_id) | รหัสผู้ใช้งานเจ้าของตะกร้า |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | วันเวลาที่สร้างตะกร้า |
| `updated_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | วันเวลาที่อัปเดตตะกร้า |

### ตารางที่ 7: `cart_items` (รายการสินค้าในตะกร้า)
| ชื่อฟิลด์ | ชนิดข้อมูล | ข้อกำหนด (Constraints) | คำอธิบายความหมาย |
| :--- | :--- | :--- | :--- |
| `cart_item_id` | INTEGER | PRIMARY KEY AUTOINCREMENT | รหัสรายการย่อยในตะกร้า |
| `cart_id` | INTEGER | NOT NULL, FK -> carts(cart_id) | รหัสตะกร้าสินค้า |
| `ebook_id` | INTEGER | NOT NULL, FK -> ebooks(ebook_id) | รหัสหนังสือที่เลือก |
| `quantity` | INTEGER | NOT NULL, DEFAULT 1, CHECK(quantity = 1) | จำนวนเล่ม (E-Book อนุญาต 1 ต่อเล่ม) |
| `added_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | วันเวลาที่เพิ่มลงตะกร้า |

### ตารางที่ 8: `orders` (ข้อมูลคำสั่งซื้อหลัก)
| ชื่อฟิลด์ | ชนิดข้อมูล | ข้อกำหนด (Constraints) | คำอธิบายความหมาย |
| :--- | :--- | :--- | :--- |
| `order_id` | INTEGER | PRIMARY KEY AUTOINCREMENT | รหัสคำสั่งซื้อ (Order ID) |
| `order_number` | VARCHAR(40) | NOT NULL, UNIQUE | หมายเลขอ้างอิงคำสั่งซื้อ (เช่น ORD-202609-001) |
| `user_id` | INTEGER | NOT NULL, FK -> users(user_id) | รหัสผู้ใช้งานที่สั่งซื้อ |
| `total_amount` | DECIMAL(10,2) | NOT NULL, CHECK(total_amount >= 0) | ยอดเงินรวมสุทธิที่ต้องชำระ (บาท) |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'pending', CHECK(status IN ('pending','confirmed','cancelled')) | สถานะคำสั่งซื้อ |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | วันและเวลาที่สั่งซื้อ |
| `updated_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | วันและเวลาที่อัปเดตสถานะ |

### ตารางที่ 9: `order_items` (รายการหนังสือในคำสั่งซื้อ)
| ชื่อฟิลด์ | ชนิดข้อมูล | ข้อกำหนด (Constraints) | คำอธิบายความหมาย |
| :--- | :--- | :--- | :--- |
| `order_item_id` | INTEGER | PRIMARY KEY AUTOINCREMENT | รหัสรายการสินค้าในคำสั่งซื้อ |
| `order_id` | INTEGER | NOT NULL, FK -> orders(order_id) | รหัสคำสั่งซื้อหลัก |
| `ebook_id` | INTEGER | NOT NULL, FK -> ebooks(ebook_id) | รหัสหนังสือที่สั่งซื้อ |
| `quantity` | INTEGER | NOT NULL, DEFAULT 1, CHECK(quantity >= 1) | จำนวนเล่มที่สั่งซื้อ |
| `price_at_purchase`| DECIMAL(10,2) | NOT NULL, CHECK(price_at_purchase >= 0) | ราคาขาย ณ วันเวลาที่ทำการสั่งซื้อจริง |

### ตารางที่ 10: `payments` (ข้อมูลการชำระเงินและสลิปหลักฐาน)
| ชื่อฟิลด์ | ชนิดข้อมูล | ข้อกำหนด (Constraints) | คำอธิบายความหมาย |
| :--- | :--- | :--- | :--- |
| `payment_id` | INTEGER | PRIMARY KEY AUTOINCREMENT | รหัสบันทึกการชำระเงิน |
| `order_id` | INTEGER | NOT NULL, UNIQUE, FK -> orders(order_id) | รหัสคำสั่งซื้อ (1 ต่อ 1) |
| `payment_method` | VARCHAR(50) | NOT NULL, DEFAULT 'PromptPay QR' | ช่องทางการชำระเงิน |
| `slip_image` | VARCHAR(255) | NULL | เส้นทางไฟล์รูปภาพสลิปโอนเงิน |
| `amount` | DECIMAL(10,2) | NOT NULL, CHECK(amount >= 0) | ยอดเงินที่แจ้งชำระ (บาท) |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'pending', CHECK(status IN ('pending','verified','rejected')) | สถานะการตรวจสอบสลิป |
| `payment_date` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | วันและเวลาที่ลูกค้าแจ้งโอนเงิน |
| `verified_at` | DATETIME | NULL | วันและเวลาที่ผู้ดูแลระบบอนุมัติสลิป |

### ตารางที่ 11: `download_links` (สิทธิ์และโทเค็นดาวน์โหลดปลอดภัย)
| ชื่อฟิลด์ | ชนิดข้อมูล | ข้อกำหนด (Constraints) | คำอธิบายความหมาย |
| :--- | :--- | :--- | :--- |
| `link_id` | INTEGER | PRIMARY KEY AUTOINCREMENT | รหัสสิทธิ์ดาวน์โหลด |
| `order_id` | INTEGER | NOT NULL, FK -> orders(order_id) | รหัสคำสั่งซื้อที่อนุมัติแล้ว |
| `ebook_id` | INTEGER | NOT NULL, FK -> ebooks(ebook_id) | รหัสหนังสือที่ได้รับสิทธิ์ |
| `token` | VARCHAR(100) | NOT NULL, UNIQUE | โทเค็นลับความปลอดภัยสุ่มแบบ GUID/Hash |
| `download_count` | INTEGER | NOT NULL, DEFAULT 0, CHECK(download_count >= 0) | จำนวนครั้งที่ดาวน์โหลดไปแล้ว |
| `max_downloads` | INTEGER | NOT NULL, DEFAULT 10 | จำนวนครั้งสูงสุดที่อนุญาตให้ดาวน์โหลด |
| `expires_at` | DATETIME | NOT NULL | วันและเวลาที่สิทธิ์ดาวน์โหลดหมดอายุ |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | วันและเวลาที่สร้างโทเค็น |

<div class="page-break"></div>

---

# บทที่ 3: การสร้างฐานข้อมูลและข้อกำหนดบูรณภาพข้อมูล

## 3.1 DDL Scripts และการสร้างตารางบน SQLite / PostgreSQL
ฐานข้อมูลถูกสร้างขึ้นผ่านสคริปต์ Data Definition Language (DDL) ในไฟล์ `database/schema.sql` ตัวอย่างคำสั่งสร้างตารางหลัก `ebooks` และ `orders` ดังนี้:

```sql
-- ตัวอย่างคำสั่งสร้างตาราง ebooks พร้อมข้อกำหนดบูรณภาพข้อมูลครบถ้วน
CREATE TABLE IF NOT EXISTS ebooks (
    ebook_id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (author_id) REFERENCES authors(author_id) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ตัวอย่างคำสั่งสร้างตาราง orders
CREATE TABLE IF NOT EXISTS orders (
    order_id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number VARCHAR(40) NOT NULL UNIQUE,
    user_id INTEGER NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE RESTRICT
);
```

## 3.2 ข้อกำหนดบูรณภาพข้อมูล (Integrity Constraints)
1. **Primary Key Constraint:** ทุกตารางมีคอลัมน์ `_id` เป็นคีย์หลักแบบ Auto Increment รับประกันความไม่ซ้ำและห้ามเป็นค่าว่าง
2. **Foreign Key Constraint:** เชื่อมโยงความสัมพันธ์ข้ามตาราง พร้อมกำหนด `ON UPDATE CASCADE` และ `ON DELETE RESTRICT / CASCADE` เพื่อป้องกันปัญหาข้อมูลกำพร้า (Orphan Records)
3. **NOT NULL Constraint:** บังคับให้ฟิลด์สำคัญต้องมีค่าเสมอ เช่น ชื่อหนังสือ, ราคา, อีเมล, ชื่อผู้สั่งซื้อ
4. **UNIQUE Constraint:** ป้องกันข้อมูลซ้ำซ้อนในระดับระบบ เช่น `email` สมาชิก, `username`, `isbn` หนังสือ, `slug` หมวดหมู่, และ `token` ดาวน์โหลด
5. **CHECK Constraint:** ตรวจสอบความสมเหตุสมผลของข้อมูล เช่น `price >= 0`, `total_amount >= 0`, `quantity = 1` ในตะกร้า, และ `status` ที่จำกัดเฉพาะค่าที่กำหนด
6. **DEFAULT Constraint:** กำหนดค่าเริ่มต้นอัตโนมัติ เช่น `is_published = 1`, `created_at = CURRENT_TIMESTAMP`

## 3.3 ข้อมูลตัวอย่างทดสอบระบบ (Seed Data)
ระบบจัดเตรียมข้อมูลตัวอย่างในไฟล์ `database/seed.sql` เพื่อจำลองการซื้อขายจริงในระบบมากกว่า **32 คำสั่งซื้อ (ORD-202606-001 ถึง ORD-202609-032)** ครอบคลุมยอดขายตั้งแต่เดือนมิถุนายนถึงกันยายน 2569 โดยมีทั้งออเดอร์สถานะ `confirmed`, `pending` และ `cancelled` เพื่อให้การประมวลผลคำสั่ง SQL ในบทที่ 4 แสดงผลวิเคราะห์ได้อย่างสมบูรณ์และถูกต้อง

<div class="page-break"></div>

---

# บทที่ 4: รายงานวิเคราะห์ข้อมูลเชิงลึก 4 ด้าน

รายงานวิเคราะห์ทั้ง 4 ด้าน พัฒนาขึ้นตามข้อกำหนดใบงานข้อ 5 โดยใช้คำสั่ง SQL สืบข้อมูลจริงจากตารางที่เชื่อมโยงกัน แสดงผลผ่านหน้าจอ `/admin.html` (แท็บรายงานวิเคราะห์ 4 ด้าน) และส่งออกไฟล์ CSV มาตรฐาน UTF-8 BOM ได้ทันที

## 4.1 รายงานที่ 1: ยอดขายตามช่วงเวลา (Sales Over Time by Month)
* **คำถามทางธุรกิจ:** ยอดขาย จำนวนคำสั่งซื้อ และค่าเฉลี่ยต่อคำสั่งซื้อ (AOV) มีแนวโน้มเปลี่ยนแปลงไปอย่างไรตามแต่ละเดือน?
* **คำสั่ง SQL Query (JOIN, GROUP BY, SUM, COUNT, AVG):**
```sql
SELECT 
    strftime('%Y-%m', o.created_at) AS sale_month,
    COUNT(o.order_id) AS total_orders,
    SUM(o.total_amount) AS total_sales,
    ROUND(AVG(o.total_amount), 2) AS avg_order_value,
    MIN(o.total_amount) AS min_order_value,
    MAX(o.total_amount) AS max_order_value
FROM orders o
WHERE o.status = 'confirmed'
GROUP BY strftime('%Y-%m', o.created_at)
ORDER BY sale_month DESC;
```
* **ตารางสรุปผลลัพธ์จากฐานข้อมูลจริง:**

| ช่วงเวลา (เดือน) | จำนวนคำสั่งซื้อ | ยอดขายรวมสุทธิ (บาท) | ค่าเฉลี่ยต่อออเดอร์ | ยอดต่ำสุด | ยอดสูงสุด |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **2026-09 (ล่าสุด)** | 6 ออเดอร์ | ฿2,300.00 | ฿383.33 | ฿280.00 | ฿500.00 |
| **2026-08** | 8 ออเดอร์ | ฿3,200.00 | ฿400.00 | ฿260.00 | ฿540.00 |
| **2026-07** | 8 ออเดอร์ | ฿3,555.00 | ฿444.38 | ฿195.00 | ฿730.00 |
| **2026-06** | 6 ออเดอร์ | ฿2,410.00 | ฿401.67 | ฿250.00 | ฿540.00 |

* **ผลการวิเคราะห์:** ยอดขายรวมทั้งสิ้นมากกว่า 11,465 บาท โดยเดือนกรกฎาคมมียอดสั่งซื้อสูงสุดและมีค่าเฉลี่ยต่อคำสั่งซื้อ (AOV) สูงถึง 444.38 บาท สะท้อนช่วงโปรโมชันกลางปี

## 4.2 รายงานที่ 2: E-Book ขายดีที่สุด 5 อันดับแรก (Top-Selling Books)
* **คำถามทางธุรกิจ:** หนังสือเล่มใดมียอดขายสูงสุด 5 อันดับแรกตามจำนวนเล่มและยอดขายรวม?
* **คำสั่ง SQL Query (JOIN 4 ตาราง, GROUP BY, LIMIT 5):**
```sql
SELECT 
    b.ebook_id,
    b.title,
    COALESCE(a.name, 'ไม่ระบุผู้แต่ง') AS author_name,
    COALESCE(c.name, 'ทั่วไป') AS category_name,
    SUM(oi.quantity) AS total_sold_copies,
    SUM(oi.quantity * oi.price_at_purchase) AS total_revenue
FROM order_items oi
JOIN ebooks b ON oi.ebook_id = b.ebook_id
LEFT JOIN authors a ON b.author_id = a.author_id
LEFT JOIN categories c ON b.category_id = c.category_id
JOIN orders o ON oi.order_id = o.order_id
WHERE o.status = 'confirmed'
GROUP BY b.ebook_id, b.title, a.name, c.name
ORDER BY total_sold_copies DESC, total_revenue DESC
LIMIT 5;
```
* **ตารางสรุปผลลัพธ์จากฐานข้อมูลจริง:**

| รหัส | ชื่อหนังสือ E-Book | ผู้แต่ง | หมวดหมู่ | เล่มที่ขายได้ | รายได้รวม (บาท) |
| :---: | :--- | :--- | :--- | :---: | :---: |
| **#1** | Cloud Security & DevOps Fundamentals | กิตติศักดิ์ พัฒนาซอฟต์ | เทคโนโลยีและการเขียนโปรแกรม | 6 เล่ม | ฿2,280.00 |
| **#2** | ภาษาญี่ปุ่นระดับต้นเพื่อการท่องเที่ยวและการทำงาน | เจเรมี เฉิน | ภาษาและการสื่อสารสากล | 6 เล่ม | ฿1,440.00 |
| **#3** | พิชิตข้อสอบภาษาอังกฤษเพื่อการทำงาน | เจเรมี เฉิน | ภาษาและการสื่อสารสากล | 5 เล่ม | ฿1,350.00 |
| **#4** | เงาอัศวินแห่งรัตติกาล (Shadow of the Knight) | วายุ อักษรศิลป์ | นิยายและวรรณกรรมสร้างสรรค์ | 4 เล่ม | ฿1,040.00 |
| **#5** | รหัสลับนครสูญหาย (The Lost Chrono Cipher) | วายุ อักษรศิลป์ | นิยายและวรรณกรรมสร้างสรรค์ | 4 เล่ม | ฿1,120.00 |

* **ผลการวิเคราะห์:** หนังสือหมวด Cloud Security และภาษาต่างประเทศสร้างยอดขายสูงสุด ควรจัดเป็นสินค้าแนะนำบนแบนเนอร์หน้าร้าน

## 4.3 รายงานที่ 3: ยอดขายตามหมวดหมู่ (Sales by Category)
* **คำถามทางธุรกิจ:** หมวดหมู่หนังสือใดสร้างรายได้รวมและมีจำนวนการสั่งซื้อสูงสุด?
* **คำสั่ง SQL Query (JOIN 4 ตาราง, GROUP BY, SUM):**
```sql
SELECT 
    c.category_id,
    c.name AS category_name,
    COUNT(DISTINCT oi.order_id) AS total_orders,
    SUM(oi.quantity) AS total_books_sold,
    SUM(oi.quantity * oi.price_at_purchase) AS total_category_revenue
FROM categories c
JOIN ebooks b ON c.category_id = b.category_id
JOIN order_items oi ON b.ebook_id = oi.ebook_id
JOIN orders o ON oi.order_id = o.order_id
WHERE o.status = 'confirmed'
GROUP BY c.category_id, c.name
ORDER BY total_category_revenue DESC;
```
* **ตารางสรุปผลลัพธ์จากฐานข้อมูลจริง:**

| รหัส | หมวดหมู่หนังสือ | จำนวนคำสั่งซื้อ | จำนวนเล่มที่ขายได้ | ยอดขายรวมสุทธิ (บาท) |
| :---: | :--- | :---: | :---: | :---: |
| **CAT-1** | เทคโนโลยีและการเขียนโปรแกรม | 11 ออเดอร์ | 11 เล่ม | ฿3,870.00 |
| **CAT-4** | ภาษาและการสื่อสารสากล | 11 ออเดอร์ | 11 เล่ม | ฿2,790.00 |
| **CAT-3** | นิยายและวรรณกรรมสร้างสรรค์ | 8 ออเดอร์ | 8 เล่ม | ฿2,160.00 |
| **CAT-2** | ธุรกิจและการลงทุน | 5 ออเดอร์ | 5 เล่ม | ฿1,350.00 |
| **CAT-5** | การพัฒนาตนเองและจิตวิทยา | 6 ออเดอร์ | 6 เล่ม | ฿1,295.00 |

* **ผลการวิเคราะห์:** หมวดหมู่เทคโนโลยีและภาษาครองสัดส่วนยอดขายกว่า 58% สอดคล้องกับกลุ่มเป้าหมายนักศึกษาและวัยทำงาน

## 4.4 รายงานที่ 4: พฤติกรรมลูกค้าและยอดซื้อสะสม (Customer Lifetime Value)
* **คำถามทางธุรกิจ:** ลูกค้ารายใดมียอดซื้อสะสมสูงสุด และมีการแจกแจงสถานะคำสั่งซื้อเป็นอย่างไร?
* **คำสั่ง SQL Query (JOIN, GROUP BY, HAVING, CASE WHEN):**
```sql
SELECT 
    u.user_id,
    u.full_name,
    u.email,
    COUNT(o.order_id) AS total_orders,
    SUM(CASE WHEN o.status = 'confirmed' THEN o.total_amount ELSE 0 END) AS total_spent,
    COUNT(CASE WHEN o.status = 'confirmed' THEN 1 END) AS confirmed_orders,
    COUNT(CASE WHEN o.status = 'pending' THEN 1 END) AS pending_orders,
    COUNT(CASE WHEN o.status = 'cancelled' THEN 1 END) AS cancelled_orders
FROM users u
JOIN orders o ON u.user_id = o.user_id
GROUP BY u.user_id, u.full_name, u.email
HAVING COUNT(o.order_id) >= 1
ORDER BY total_spent DESC;
```
* **ตารางสรุปผลลัพธ์จากฐานข้อมูลจริง:**

| ชื่อลูกค้า | อีเมล | ออเดอร์รวม | ยอดซื้อสะสม | อนุมัติแล้ว | รอตรวจ | ยกเลิก |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **นายธนวัฒน์ นามเหง้า** | thanawat@example.com | 5 ออเดอร์ | ฿1,890.00 | 4 ออเดอร์ | 1 ออเดอร์ | 0 |
| **นายภานุวัฒน์ แสงเครือ** | panuwat@example.com | 4 ออเดอร์ | ฿1,570.00 | 3 ออเดอร์ | 1 ออเดอร์ | 0 |
| **สมชาย ดำรงไทย** | somchai.d@gmail.com | 3 ออเดอร์ | ฿1,220.00 | 3 ออเดอร์ | 0 | 0 |
| **สุดา เกียรติสกุล** | suda.k@outlook.com | 3 ออเดอร์ | ฿1,130.00 | 3 ออเดอร์ | 0 | 0 |
| **วิชัย บุญมา** | wichai.b@hotmail.com | 3 ออเดอร์ | ฿1,060.00 | 2 ออเดอร์ | 1 ออเดอร์ | 0 |

* **ผลการวิเคราะห์:** สามารถจำแนกลูกค้ากลุ่ม VIP ที่มียอดใช้จ่ายสะสมเกิน 1,000 บาท เพื่อนำเสนอโปรโมชันเฉพาะบุคคลได้อย่างแม่นยำ

<div class="page-break"></div>

---

# บทที่ 5: การพัฒนาเว็บแอปพลิเคชันและการควบคุมสิทธิ์การเข้าถึง

## 5.1 สถาปัตยกรรมระบบและความปลอดภัยการเข้าสู่ระบบ
ระบบได้รับการพัฒนาในรูปแบบ Full-Stack Web Application สไตล์ Dark Glassmorphism เชื่อมโยงกับฐานข้อมูล SQLite/PostgreSQL หน้าร้านนำเสนอแคตตาล็อกหนังสือดิจิทัลพร้อมการค้นหาแบบ Real-time ดังแสดงในภาพที่ 5.1

<div align="center">
<img src="รูปภาพประกอบรายงาน/Screenshot (334).png" alt="ภาพที่ 5.1" width="92%">
<br><em>ภาพที่ 5.1: หน้าต่างแคตตาล็อกหนังสือดิจิทัลและแบนเนอร์ร้านค้า (Storefront Catalog & Search)</em>
</div>

ระบบมีหน้าต่างเข้าสู่ระบบและสมัครสมาชิกใหม่ (`auth.html`) พร้อมระบบตรวจสอบความถูกต้องของข้อมูล (Validation Rules) อย่างเข้มงวด ป้องกันการกรอกตัวเลขในชื่อ, ป้องกัน XSS/HTML Code, บังคับรูปแบบอีเมล และตรวจสอบความยาวรหัสผ่านไม่ต่ำกว่า 6 ตัวอักษร ข้อมูลการสมัครจะถูกบันทึกอย่างถาวรลงในตาราง `users` ทันที ดังแสดงในภาพที่ 5.2

<div align="center">
<img src="รูปภาพประกอบรายงาน/Screenshot (335).png" alt="ภาพที่ 5.2" width="92%">
<br><em>ภาพที่ 5.2: หน้าต่างสมัครสมาชิกใหม่พร้อมระบบตรวจสอบเงื่อนไขความถูกต้อง (Sign Up & Validation Rules)</em>
</div>

## 5.2 ระบบสั่งซื้อ ตะกร้าสินค้า และการชำระเงินจำลอง
ระบบตะกร้าสินค้าถูกออกแบบให้ผูกตรงกับตาราง `carts` ของผู้ใช้แต่ละคนแบบ 1 ต่อ 1 มีการคำนวณราคาสุทธิแบบ Real-Time และตรวจสอบไม่ให้เพิ่มหนังสือเล่มเดิมซ้ำในตะกร้า ดังแสดงในภาพที่ 5.3

<div align="center">
<img src="รูปภาพประกอบรายงาน/Screenshot (337).png" alt="ภาพที่ 5.3" width="92%">
<br><em>ภาพที่ 5.3: หน้าต่างตะกร้าสินค้าและการคำนวณราคาสุทธิแบบ Real-Time (Shopping Cart Drawer)</em>
</div>

เมื่อเข้าสู่ขั้นตอนชำระเงิน ระบบจะแสดงหน้าต่างยืนยันการสั่งซื้อและชำระเงินจำลอง (Mock Payment Modal) พร้อม PromptPay QR Code ที่มียอดชำระถูกต้องตามบิล และปุ่มสร้างสลิปจำลองอัตโนมัติ (1-Click Slip) หรืออัปโหลดไฟล์ภาพ เพื่อให้ผู้สอนและผู้ตรวจสามารถทดสอบระบบได้โดยไม่ต้องใช้ข้อมูลเงินจริง ดังแสดงในภาพที่ 5.4

<div align="center">
<img src="รูปภาพประกอบรายงาน/Screenshot (338).png" alt="ภาพที่ 5.4" width="92%">
<br><em>ภาพที่ 5.4: หน้าต่างยืนยันการสั่งซื้อและชำระเงินจำลองผ่าน PromptPay QR และแนบสลิป (Mock Payment Modal)</em>
</div>

## 5.3 การควบคุมสิทธิ์การเข้าถึง (Role-Based Access Control: RBAC)
ความปลอดภัยระดับข้อมูลถูกควบคุมด้วยสถานะคำสั่งซื้อ: เมื่อสั่งซื้อเสร็จสถานะจะเป็น `pending` ซึ่งปุ่มดาวน์โหลด E-Book จะถูกล็อกด้วยระบบความปลอดภัย (Security Download Gate) และลูกค้าสามารถกดดูภาพสลิปที่แนบไว้ได้ ต่อเมื่อผู้ดูแลระบบอนุมัติแล้วสถานะจึงเปลี่ยนเป็น `confirmed` และสร้างโทเค็นลับในตาราง `download_links` เพื่อปลดล็อกปุ่มดาวน์โหลด ดังแสดงในภาพที่ 5.5

<div align="center">
<img src="รูปภาพประกอบรายงาน/Screenshot (336).png" alt="ภาพที่ 5.5" width="92%">
<br><em>ภาพที่ 5.5: หน้าต่างประวัติคำสั่งซื้อ การล็อกสิทธิ์ และปุ่มดาวน์โหลด E-Book ปลอดภัย (Order History & Security Download Gate)</em>
</div>

สำหรับผู้ใช้งานทั่วไป (Role = Customer) จะไม่สามารถเข้าถึงหน้าหลังบ้านได้ หากพิมพ์ URL `/admin.html` ระบบจะตรวจจับและขึ้นเตือนปฏิเสธการเข้าถึงทันที ส่วนบัญชีผู้ดูแลระบบ (Role = Admin) จะสามารถเข้าสู่หน้า **Admin Portal** ซึ่งมีแผงควบคุมหลัก (Dashboard) แสดงยอดขายรวมสด, จำนวนคำสั่งซื้อ, จำนวนสลิปรอตรวจสอบ และรายการคำสั่งซื้อล่าสุด ดังแสดงในภาพที่ 5.6

<div align="center">
<img src="รูปภาพประกอบรายงาน/Screenshot (339).png" alt="ภาพที่ 5.6" width="92%">
<br><em>ภาพที่ 5.6: แผงควบคุมหลักผู้ดูแลระบบ (Admin Dashboard) และสรุปยอดขายสดจากฐานข้อมูล</em>
</div>

## 5.4 การจัดการคำสั่งซื้อ ตรวจสอบหลักฐานสลิป และคลังหนังสือ
ในหน้าจัดการคำสั่งซื้อ ผู้ดูแลระบบสามารถคลิกดูภาพสลิปการโอนเงินจำลอง ตรวจสอบยอดเงิน และคลิกปุ่ม **"อนุมัติสิทธิ์"** เพื่อเปลี่ยนสถานะออเดอร์เป็น `confirmed` หรือกด **"ปฏิเสธ/ยกเลิก"** ได้ทันที พร้อมปุ่มค้นหาและปุ่ม **Export CSV** ดังแสดงในภาพที่ 5.7

<div align="center">
<img src="รูปภาพประกอบรายงาน/Screenshot (340).png" alt="ภาพที่ 5.7" width="92%">
<br><em>ภาพที่ 5.7: ระบบจัดการคำสั่งซื้อ ตรวจสอบหลักฐานสลิป และการอนุมัติสิทธิ์ (Order & Slip Verification)</em>
</div>

นอกจากนี้ ผู้ดูแลระบบสามารถบริหารคลังหนังสือ E-Book เพิ่มหนังสือเล่มใหม่ แก้ไขราคา และสลับสถานะเปิดขาย/ปิดการขาย (Soft Delete) ซึ่งจะซ่อนหนังสือออกจากหน้าแรกของร้านค้าทันทีโดยไม่ลบประวัติคำสั่งซื้อในอดีต ดังแสดงในภาพที่ 5.8

<div align="center">
<img src="รูปภาพประกอบรายงาน/Screenshot (341).png" alt="ภาพที่ 5.8" width="92%">
<br><em>ภาพที่ 5.8: ระบบจัดการคลังหนังสือ E-Book และการเปิด/ปิดการขาย (E-Book Inventory Management & Soft Delete)</em>
</div>

## 5.5 หน้าจอรายงานวิเคราะห์ธุรกิจ และระบบจัดการสมาชิก
หน้ารายงานวิเคราะห์ธุรกิจ 4 ด้าน ดึงข้อมูลสรุปจากคำสั่ง SQL ขั้นสูงแบบ Real-Time พร้อมปุ่มเปิดดูโค้ดคำสั่ง SQL และปุ่ม Export CSV ที่เข้ารหัส UTF-8 BOM รองรับภาษาไทยสมบูรณ์ ดังแสดงในภาพที่ 5.9

<div align="center">
<img src="รูปภาพประกอบรายงาน/Screenshot (342).png" alt="ภาพที่ 5.9" width="92%">
<br><em>ภาพที่ 5.9: หน้าจอรายงานวิเคราะห์ธุรกิจ 4 ด้าน พร้อมคำสั่ง SQL และการส่งออก CSV (4 Analytical Reports & SQL Queries)</em>
</div>

และในแท็บ **"จัดการสมาชิก & สิทธิ์"** ผู้ดูแลระบบสามารถดูรายชื่อผู้ลงทะเบียนใช้งานทั้งหมดในระบบ รวมถึงวันที่สมัคร ยอดรวมคำสั่งซื้อ และมีปุ่มปรับเปลี่ยนสิทธิ์ผู้ใช้งาน (Role-Based Access Control) ระหว่างลูกค้าและผู้ดูแลระบบได้ทันที ดังแสดงในภาพที่ 5.10

<div align="center">
<img src="รูปภาพประกอบรายงาน/Screenshot (343).png" alt="ภาพที่ 5.10" width="92%">
<br><em>ภาพที่ 5.10: ระบบจัดการสมาชิกและการควบคุมสิทธิ์การเข้าถึง (User Management & Role-Based Access Control)</em>
</div>

<div class="page-break"></div>

---

# บทที่ 6: แผนการทดสอบและประกันคุณภาพข้อมูล (Testing & QA)

ตารางผลการทดสอบกรณีทดสอบ 8 กรณีตามเกณฑ์ใบงานข้อ 6:

| รหัส | ฟังก์ชัน / เงื่อนไขที่ทดสอบ | ข้อมูลนำเข้า (Input Data) | ผลลัพธ์ที่คาดหวัง | ผลการทดสอบจริง | ผล |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **TC-01** | ตรวจสอบอีเมลซ้ำ (UNIQUE) | อีเมล `thanawat@example.com` ที่มีอยู่แล้ว | ปฏิเสธการสมัคร แจ้งเตือนว่าอีเมลนี้ถูกใช้งานแล้ว | แสดงข้อความเตือนและไม่บันทึกซ้ำลงฐานข้อมูล | **ผ่าน** |
| **TC-02** | รหัสผ่านสั้นเกินไป | รหัสผ่าน `'123'` (น้อยกว่า 6 ตัวอักษร) | ระบบไม่อนุญาตให้ Submit แจ้งเตือนความยาว | Alert: รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร | **ผ่าน** |
| **TC-03** | หนังสือปิดการขาย (Soft Delete) | แอดมินปิดการขายหนังสือ ID #4 (`is_published = 0`) | หน้าร้านแคตตาล็อกต้องไม่แสดงหนังสือเล่มนี้ | หนังสือหายจากหน้าร้านทันทีตามเงื่อนไข | **ผ่าน** |
| **TC-04** | ดาวน์โหลดก่อนอนุมัติสลิป | ออเดอร์สถานะ `pending` ลูกค้าพยายามดาวน์โหลด | ไม่อนุญาตให้ดาวน์โหลด ล็อกสิทธิ์และแจ้งรอตรวจ | ปุ่มดาวน์โหลดถูกล็อก และขึ้นสถานะรอแอดมิน | **ผ่าน** |
| **TC-05** | ปลดล็อกดาวน์โหลดหลังอนุมัติ | แอดมินกดอนุมัติสลิปในหน้า `/admin.html` | สถานะเป็น `confirmed` และสร้างโทเค็นดาวน์โหลด | ลูกค้าได้รับปุ่มดาวน์โหลดไฟล์ทันที | **ผ่าน** |
| **TC-06** | บันทึกราคาติดลบ (CHECK) | Insert หนังสือด้วยราคา `-150.00` บาท | Database ปฏิเสธคำสั่ง CHECK constraint violation | SQLite ปฏิเสธการ Insert ข้อมูลผิดรูปแบบ | **ผ่าน** |
| **TC-07** | ลูกค้าเข้าหลังบ้านตรง (Route Guard) | ลูกค้าทั่วไปพิมพ์ URL `http://localhost:3000/admin.html` | บล็อกการเข้าถึงด้วยหน้า 403 Forbidden Access Denied | ระบบบล็อกและตัดเข้าหน้าแจ้งเตือนสิทธิ์ทันที | **ผ่าน** |
| **TC-08** | ส่งออกรายงาน CSV ภาษาไทย | กดปุ่ม Export CSV ในหน้ารายงานที่ 1 | เปิดไฟล์ใน Microsoft Excel ภาษาไทยไม่เพี้ยน | ได้ไฟล์ CSV พร้อม UTF-8 BOM อ่านไทยได้ 100% | **ผ่าน** |

<div class="page-break"></div>

---

# บทที่ 7: การประยุกต์ใช้ปัญญาประดิษฐ์อย่างรับผิดชอบ (AI Usage Log)

## 7.1 บันทึกการใช้งาน AI ในการพัฒนา (AI Prompt & Usage Log)
ตามข้อกำหนดใบงานข้อ 12 นักศึกษาได้บันทึกการประยุกต์ใช้ AI เพื่อเป็นหลักฐานความโปร่งใสและแสดงการตรวจทานด้วยตนเองดังนี้:

| วันที่ | เครื่องมือ AI | คำสั่ง Prompt โดยสรุป | สิ่งที่นำมาใช้งาน | การตรวจสอบและตรวจทานโดยนักศึกษา |
| :---: | :---: | :--- | :--- | :--- |
| **10 ก.ย. 69** | Antigravity AI | ช่วยออกแบบ ERD และโครงสร้าง 11 ตารางสำหรับร้านขาย E-Book ให้ตรงหลัก 3NF และมี Foreign Key ครบถ้วน | นำโครงร่าง DDL และความสัมพันธ์ของตารางมาใช้เป็นจุดเริ่มต้น | ตรวจสอบชนิดข้อมูล ปรับเงื่อนไขความปลอดภัย และทดสอบรันบน SQLite จริง |
| **15 ก.ย. 69** | Antigravity AI | ช่วยเขียน SQL Query รายงาน 4 ด้านตามเกณฑ์ใบงาน ที่ใช้ JOIN, GROUP BY, HAVING, CASE WHEN, SUM, COUNT, AVG | นำคำสั่ง SQL ทั้ง 4 ข้อมาปรับแต่ง | รัน Query ใน Database เทียบกับข้อมูลตัวอย่าง 32 คำสั่งซื้อ ยืนยันความถูกต้องของผลรวม |
| **20 ก.ย. 69** | Antigravity AI | ช่วยปรับแต่งหน้าตาเว็บ Dark Glassmorphism, ระบบ Route Guard 403, และระบบ 1-Click Mock Slip | ได้โค้ด CSS Token, โค้ดตรวจสอบ RBAC และระบบสร้างสลิปจำลอง | ตรวจสอบการแสดงผลบนหน้าจอคอมพิวเตอร์และมือถือ ยืนยันว่าปุ่มหลังบ้านถูกซ่อนจากลูกค้าจริง |

## 7.2 ข้อเสนอแนะของ AI ที่นักศึกษาตัดสินใจปฏิเสธ (Rejected AI Proposals)
1. **การเก็บข้อมูลสลิปเป็น Base64 String ในตาราง payments:** AI เสนอให้แปลงไฟล์สลิปเป็น Base64 แล้วเซฟลงฐานข้อมูลตรงๆ แต่นักศึกษาปฏิเสธเนื่องจากจะทำให้ฐานข้อมูลบวม (Database Bloat) และส่งผลเสียต่อ Performance อย่างรุนแรง โดยเลือกเก็บเป็นไฟล์ภาพและบันทึกเฉพาะ File Path URL แทน
2. **การอนุญาตให้ลูกค้าดาวน์โหลดไฟล์ E-Book ได้ทันทีหลังสั่งซื้อโดยไม่ต้องรอตรวจสลิป:** นักศึกษาปฏิเสธเนื่องจากขัดต่อข้อกำหนดความปลอดภัยข้อ 2.2 ของอาจารย์ผู้สอน และเสี่ยงต่อการถูกมิจฉาชีพหลอกสั่งซื้อโดยไม่โอนเงินจริง
3. **การใช้รหัสผ่าน Plain Text ในตารางทดสอบ:** นักศึกษาปฏิเสธและปรับปรุง Schema ให้เก็บเป็น `password_hash` เสมอ เพื่อให้เป็นไปตามมาตรฐานความปลอดภัยสารสนเทศสากล

## 7.3 จริยธรรมข้อมูลส่วนบุคคล (PDPA Consideration)
ในการจัดทำโครงงานนี้ ไม่มีการนำข้อมูลส่วนบุคคลจริง เบอร์โทรศัพท์จริง หรือสลิปธนาคารจริงของบุคคลภายนอกมาใช้งานในระบบ ข้อมูลทั้งหมดในฐานข้อมูลเป็นข้อมูลตัวอย่างจำลองทั้งสิ้น เพื่อรักษาจริยธรรมการใช้งานข้อมูลและปฏิบัติตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)

<div class="page-break"></div>

---

# บทที่ 8: สรุปผลการดำเนินงานและข้อเสนอแนะ

## 8.1 สรุปผลสัมฤทธิ์ของโครงงาน
โครงงานพัฒนาระบบฐานข้อมูลร้านขายหนังสือและอีบุ๊กออนไลน์ (EBOOK_ONLINE AI Store) บรรลุผลตามเกณฑ์การประเมิน 100 คะแนนของรายวิชาระบบฐานข้อมูลครบทุกข้อ:
* โครงสร้างฐานข้อมูลมีความสมบูรณ์ตามหลัก 3NF ปราศจากข้อมูลซ้ำซ้อน ครอบคลุม 11 ตาราง
* มีระบบรักษาความปลอดภัยการดาวน์โหลดไฟล์ดิจิทัลด้วย Token และเงื่อนไขสถานะออเดอร์
* มีรายงานเชิงวิเคราะห์ข้อมูลจริง 4 ด้าน พร้อมระบบส่งออกไฟล์ CSV มาตรฐาน UTF-8 BOM
* ระบบออนไลน์บน Cloud (Render) ใช้งานได้จริงตลอด 24 ชั่วโมง

## 8.2 ข้อเสนอแนะในการพัฒนาต่อยอด
1. **การพัฒนาระบบตัวอย่างการอ่าน (E-Book Preview Reader):** ให้ลูกค้าสามารถทดลองอ่าน 10-15 หน้าแรกผ่านหน้าเว็บก่อนตัดสินใจซื้อ
2. **การเชื่อมต่อระบบชำระเงินอัตโนมัติ (Payment Gateway Webhook):** เช่น ระบบแจ้งเตือนการโอนเงินสำเร็จแบบเรียลไทม์ผ่าน PromptPay QR API จริง
3. **การรองรับสินค้าแบบ Hybrid Catalog:** เชื่อมโยงกับระบบ Inventory ของวิชาวิศวกรรมซอฟต์แวร์ เพื่อจำหน่ายทั้งหนังสือเล่มกระดาษที่มีการตัดสต็อก และหนังสือดิจิทัลที่เปิดสิทธิ์ดาวน์โหลด

<div class="page-break"></div>

---

# ภาคผนวก

## ภาคผนวก ก: รายการตรวจสอบความพร้อมก่อนส่งงาน (Submission Checklist)
* [x] สมาชิกในกลุ่มเข้าใจและสามารถอธิบายโครงสร้าง ERD ความสัมพันธ์ 1:N, N:M และคำสั่ง SQL ได้อย่างแม่นยำ
* [x] คำสั่งซื้อที่ยังไม่ยืนยัน (`pending`) ไม่สามารถเปิดดาวน์โหลด E-Book ได้ (ตรงตามข้อกำหนดข้อ 2.2)
* [x] มีข้อมูลตัวอย่างในระบบมากกว่า 30 คำสั่งซื้อ และครอบคลุมยอดขายหลายเดือน (มิถุนายน - กันยายน 2569)
* [x] สคริปต์ SQL ทั้งหมด (`schema.sql`, `seed.sql`, `reports.sql`) รันได้สมบูรณ์โดยไม่มี Error
* [x] รายงานวิเคราะห์ 4 ด้าน รันจากข้อมูลจริงในระบบและสามารถ Export เป็นไฟล์ CSV ได้อย่างถูกต้อง
* [x] ไม่มีการใช้ข้อมูลส่วนบุคคลจริง รหัสผ่านจริง หรือไฟล์ที่มีลิขสิทธิ์
* [x] มีบัญชีทดสอบด่วนบนหน้าจอเพื่อให้ผู้สอนคลิกสลับสิทธิ์ Admin / Customer เพื่อตรวจข้อสอบได้สะดวก

## ภาคผนวก ข: การเชื่อมโยงโครงงานกับวิชาวิศวกรรมซอฟต์แวร์ (SWE Inventory System)
โครงงานฝั่งฐานข้อมูลนี้ได้รับการจัดเก็บแยกเป็น Repository บน GitHub โดยเฉพาะ (`https://github.com/TanawatNamngao/EBOOK_ONLINE_AI`) เพื่อส่งให้อาจารย์ผู้สอนวิชาระบบฐานข้อมูล และได้ทำการเชื่อมโยงข้อมูลแนวคิดข้ามไปยังโครงงาน Inventory System ของวิชาวิศวกรรมซอฟต์แวร์ (SWE) อย่างถูกต้องตามแนวทางปฏิบัติของหลักสูตรวิศวกรรมคอมพิวเตอร์ มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน วิทยาเขตขอนแก่น
