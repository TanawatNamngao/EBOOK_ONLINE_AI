# ข้อมูลโครงการ (Project Information)

## ข้อมูลกลุ่มและวิชา
* **รายวิชาและตอนเรียน:** Database (Mini Project Database ร้านขาย E-Book)
* **ชื่อโครงงาน:** EBOOK_ONLINE
* **สมาชิกกลุ่ม:**
  1. **นายธนวัฒน์ นามเหง้า** รหัสประจำตัว: `67332110293-4`
  2. **นายภานุวัฒน์ แสงเครือ** รหัสประจำตัว: `67332110248-5`

---

## เครื่องมือและเทคโนโลยีที่ใช้ (Tech Stack)
* **ภาษาหลัก:** JavaScript (Node.js ES Modules / Express) + HTML5 / Vanilla CSS
* **Database Management System (DBMS):** Supabase (Cloud PostgreSQL) และ SQLite (Local Embedded Cache) รองรับมาตรฐาน ACID, Constraints, Foreign Keys และ Realtime Cloud Data Synchronization
* **เครื่องมือออกแบบ & เอกสาร:** Mermaid.js (สำหรับ ERD), Markdown Documentation
* **เครื่องมือ AI Assistant:** Google DeepMind Antigravity AI (บันทึกขั้นตอนการให้คำปรึกษาและตรวจสอบความถูกต้องอย่างรับผิดชอบ)

---

## การแบ่งหน้าที่ความรับผิดชอบของสมาชิก (ตามข้อกำหนดข้อ 9 ในใบงาน)

| สมาชิก | หน้าที่หลัก | ส่วนที่ต้องอธิบายในการนำเสนอ |
| :--- | :--- | :--- |
| **1. นายธนวัฒน์ นามเหง้า**<br>(67332110293-4) | **พัฒนาระบบจัดการข้อมูล (Database Developer)**<br>- ออกแบบ ERD และตาราง 3NF<br>- พัฒนาระบบ Cloud Sync (Supabase & SQLite)<br>- พัฒนาระบบแค็ตตาล็อกและตะกร้าสินค้า | **1. โครงสร้างฐานข้อมูล (ERD 11 ตาราง & 3NF):** ความสัมพันธ์ PK, FK และสคีมา<br>**2. ระบบจัดการข้อมูล (Supabase Cloud Sync):** การเก็บรักษาข้อมูลจริงบนคลาวด์<br>**3. SQL Query 2 รายการ:** ยอดขายตามชื่อหนังสือ (`SUM`, `COUNT`) และ Top 3 (`LIMIT 3`)<br>**4. เส้นทางการไหลของข้อมูล (Data Flow):** หนังสือ ➔ ตะกร้า ➔ ออเดอร์ |
| **2. นายภานุวัฒน์ แสงเครือ**<br>(67332110248-5) | **ทดสอบระบบและระบุจุดบกพร่อง (QA Tester)**<br>- ทดสอบระบบ 10 กรณี (10 Test Cases)<br>- ตรวจสอบเงื่อนไข Database Constraints<br>- ระบุและติดตามการแก้ไขข้อผิดพลาดของระบบ | **1. ผลการทดสอบ 10 Test Cases:** การดักข้อมูลซ้ำ (UNIQUE), ราคาติดลบ (CHECK), และการแก้ไขสลิปยอดไม่ตรง<br>**2. ความปลอดภัย (RBAC):** ล็อกสิทธิ์ดาวน์โหลด (403 Gate) และแยกสิทธิ์ Admin/User<br>**3. SQL Query 2 รายการ:** ยอดขายตามช่องทางชำระเงิน (`AVG`) และลูกค้าประจำ (`HAVING`)<br>**4. เส้นทางการสั่งซื้อ (Order Flow):** สั่งซื้อแนบสลิป ➔ แอดมินอนุมัติ ➔ โหลด E-Book |

---

## แนวทางการดำเนินงานตามคำแนะนำของใบงาน (3 เสาหลัก)
เพื่อให้การทำงานมีประสิทธิภาพและได้คะแนนสูงสุด กลุ่มของเรายึดหลักปฏิบัติตามคำแนะนำหน้า 1 ของใบงาน ดังนี้:

1. **เลือกขอบเขตที่พัฒนาและสาธิตได้จริง (Scope & Feasibility):**
   * เน้น Flow หลักที่สมบูรณ์ 100%: ลูกค้าสมัคร/ล็อกอิน -> ค้นหา/กรอง -> ใส่ตะกร้า -> กดสั่งซื้อ -> แนบสลิปชำระเงินจำลอง -> แอดมินตรวจสลิปและกดยืนยัน -> ปลดล็อกลิงก์ดาวน์โหลด
   * งดทำระบบภายนอกที่ไม่บังคับ (เช่น Payment Gateway ตัดบัตรจริง, DRM เข้ารหัสซับซ้อน, ระบบส่งเมลจริง) ตามข้อ 7 เพื่อทุ่มเทเวลาให้กับการออกแบบฐานข้อมูล ความถูกต้องของข้อมูล และรายงานวิเคราะห์ SQL 4 เรื่อง
2. **ใช้ข้อมูลตัวอย่างที่สมเหตุสมผล (Realistic Seed Data):**
   * ข้อมูล E-Book ผู้แต่ง และหมวดหมู่ ใช้ข้อมูลที่สื่อความหมายจริง (หมวดเทคโนโลยี, ธุรกิจ, ภาษา, จิตวิทยา ฯลฯ) พร้อมภาพปกตัวอย่าง
   * บันทึกคำสั่งซื้อตัวอย่างจริงมากกว่า 30 คำสั่งซื้อ มีการกระจายวันเวลา สถานะ (`pending`, `confirmed`, `cancelled`) เพื่อให้การทำรายงานวิเคราะห์และ Dashboard ตอบคำถามทางสถิติได้อย่างน่าเชื่อถือ
3. **เก็บหลักฐานการทำงานไว้สำหรับการนำเสนอ (Evidence Collection):**
   * เตรียมไฟล์ SQL มาตรฐาน (`schema.sql`, `seed.sql`, `reports.sql`) ให้ตรวจรันได้อิสระ
   * จัดทำตาราง Test Cases 8 กรณีอย่างละเอียด (ครอบคลุมทั้งข้อมูลที่ถูกต้องและ Edge Cases)
   * บันทึกการใช้งาน AI อย่างโปร่งใสในเอกสาร [02_AI_USAGE_LOG.md](file:///c:/Users/next5/Desktop/EBOOK/docs/02_AI_USAGE_LOG.md)
   * จัดเตรียมบัญชีทดสอบทั้งฝั่งลูกค้าและผู้ดูแลระบบ พร้อมขั้นตอนสาธิตเป็นลำดับขั้นตอน

---

## ขั้นตอนการดำเนินงาน 6 ระยะและหลักฐานประกอบ (ตามข้อกำหนดข้อ 8 ในใบงาน)

| ระยะที่ | งานที่ควรทำตามเกณฑ์ | สิ่งที่โครงงานทำจริง | หลักฐานเชิงประจักษ์ (Evidence) |
| :---: | :--- | :--- | :--- |
| **1 วิเคราะห์** | กำหนดกลุ่มผู้ใช้ ขอบเขตการทำงาน และกติกาของลิงก์ดาวน์โหลด | กำหนด 2 บทบาท (Customer, Admin), ขอบเขตหน้าร้าน-หลังบ้าน และกติกาความปลอดภัยล็อกลิงก์ 403 จนกว่า Admin จะอนุมัติ | ข้อเสนอ 1 หน้าและแผนผัง Sequence & State Flow ใน [03_SYSTEM_FLOW_AND_SCENARIOS.md](file:///c:/Users/next5/Desktop/EBOOK/docs/03_SYSTEM_FLOW_AND_SCENARIOS.md) |
| **2 ออกแบบ** | สร้าง ERD data dictionary และร่างหน้าจอที่จำเป็น | ออกแบบฐานข้อมูล 11 ตาราง (3NF), Data Dictionary ครบทุกฟิลด์ และออกแบบ UI หน้าร้านและหลังบ้าน | ERD, Data Dictionary ใน [01_DATABASE_DESIGN_ERD.md](file:///c:/Users/next5/Desktop/EBOOK/docs/01_DATABASE_DESIGN_ERD.md) และสถาปัตยกรรมหน้าจอ |
| **3 พัฒนา** | สร้างฐานข้อมูล ใส่ข้อมูลตัวอย่าง เชื่อมหน้าจอและส่วนหลังบ้าน | เขียน `schema.sql`, นำเข้า `seed.sql` (32 ออเดอร์, สลิปจำลอง 32 รูป), พัฒนา Express 5 API + Vanilla JS UI | Source Code และ SQL: [database/schema.sql](file:///c:/Users/next5/Desktop/EBOOK/database/schema.sql), [database/seed.sql](file:///c:/Users/next5/Desktop/EBOOK/database/seed.sql), [server.js](file:///c:/Users/next5/Desktop/EBOOK/server.js) |
| **4 ปรับปรุงแก้ไข** | เขียน query สร้างและตรวจสอบผลกับข้อมูล | เขียน SQL รายงาน 4 มิติ และตรวจสอบความถูกต้องกับข้อมูลจริง พร้อมแสดงผลบน Admin Dashboard และส่งออก CSV | สคริปต์ SQL [database/reports.sql](file:///c:/Users/next5/Desktop/EBOOK/database/reports.sql) และเล่มวิเคราะห์ [05_ANALYTICS_REPORTS.md](file:///c:/Users/next5/Desktop/EBOOK/docs/05_ANALYTICS_REPORTS.md) |
| **5 ทำรายงาน** | จัดทำเอกสารรูปเล่ม รายงาน | จัดทำเล่มรายงานฉบับสมบูรณ์ (Master Project Report) รวบรวมครบถ้วนทั้ง 6 บท พร้อมเอกสารสนับสนุนทุกด้าน | เล่มรายงานฉบับสมบูรณ์ [docs/FINAL_PROJECT_REPORT.md](file:///c:/Users/next5/Desktop/EBOOK/docs/FINAL_PROJECT_REPORT.md) |
| **6 นำเสนอ** | ทดสอบ flow แก้ข้อผิดพลาด สาธิต และจัดชุดส่งงาน | พัฒนาชุดทดสอบอัตโนมัติ 10 กรณี (`npm test` ผ่าน 100%), จัดทำสคริปต์สาธิต 5 นาที และเตรียมชุดไฟล์ส่งงาน | ตารางทดสอบ [04_TEST_CASES.md](file:///c:/Users/next5/Desktop/EBOOK/docs/04_TEST_CASES.md), สคริปต์สาธิตใน Master Report และ [README.md](file:///c:/Users/next5/Desktop/EBOOK/README.md) |

---

## รายการเอกสารที่จัดทำครบถ้วนตามเกณฑ์
1. [00_PROJECT_INFO.md](file:///c:/Users/next5/Desktop/EBOOK/docs/00_PROJECT_INFO.md) - ข้อมูลกลุ่ม โครงงาน การแบ่งหน้าที่ และขั้นตอนดำเนินงาน 6 ระยะ
2. [01_DATABASE_DESIGN_ERD.md](file:///c:/Users/next5/Desktop/EBOOK/docs/01_DATABASE_DESIGN_ERD.md) - แผนภาพ ERD, Data Dictionary ทั้ง 11 ตาราง, และคำอธิบาย 3NF
3. [02_AI_USAGE_LOG.md](file:///c:/Users/next5/Desktop/EBOOK/docs/02_AI_USAGE_LOG.md) - บันทึกการใช้งาน AI อย่างรับผิดชอบ 13 ลำดับตามเกณฑ์ใบงาน
4. [03_SYSTEM_FLOW_AND_SCENARIOS.md](file:///c:/Users/next5/Desktop/EBOOK/docs/03_SYSTEM_FLOW_AND_SCENARIOS.md) - แผนผังลำดับการทำงาน (Sequence Diagram) และกฎความปลอดภัยดาวน์โหลด
5. [04_TEST_CASES.md](file:///c:/Users/next5/Desktop/EBOOK/docs/04_TEST_CASES.md) - ตารางและผลการทดสอบระบบ 10 กรณี (ครอบคลุมทั้ง Happy Path และ Data Constraints)
6. [05_ANALYTICS_REPORTS.md](file:///c:/Users/next5/Desktop/EBOOK/docs/05_ANALYTICS_REPORTS.md) - รายละเอียดคำสั่ง SQL, ผลลัพธ์ข้อมูลจริง, และบทวิเคราะห์ 4 รายงาน
7. [FINAL_PROJECT_REPORT.md](file:///c:/Users/next5/Desktop/EBOOK/docs/FINAL_PROJECT_REPORT.md) - เล่มรายงานฉบับสมบูรณ์ (Master Report) และสคริปต์การนำเสนอ 5 นาที

