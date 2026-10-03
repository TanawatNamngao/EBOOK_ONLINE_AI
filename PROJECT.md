# EBOOK_ONLINE: ระบบร้านขายหนังสือและอีบุ๊กออนไลน์
## ดัชนีตรวจส่งโครงงานรายวิชาระบบฐานข้อมูล (Project Submission Index)
### รายวิชา [31-407-102-301] ระบบฐานข้อมูล ภาคการศึกษา 2569
**สาขาวิชาวิศวกรรมคอมพิวเตอร์ คณะวิศวกรรมศาสตร์ มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน วิทยาเขตขอนแก่น**

---

## 👥 ข้อมูลผู้จัดทำโครงงาน (Team Members)
1. **นายธนวัฒน์ นามเหง้า** (รหัสนักศึกษา `67332110293-4`) — Database Developer & Full-Stack Architect
2. **นายภานุวัฒน์ แสงเครือ** (รหัสนักศึกษา `67332110248-5`) — QA Tester & Data Security Specialist

---

## 🌐 ลิงก์สำคัญของโครงงาน (Quick Links)
* **GitHub Repository (Public):** [https://github.com/TanawatNamngao/EBOOK_ONLINE_AI](https://github.com/TanawatNamngao/EBOOK_ONLINE_AI)
* **ลิงก์ตรงไปยังไฟล์นี้ (PROJECT.md):** [https://github.com/TanawatNamngao/EBOOK_ONLINE_AI/blob/main/PROJECT.md](https://github.com/TanawatNamngao/EBOOK_ONLINE_AI/blob/main/PROJECT.md)
* **Live Cloud Application (ทดลองใช้งานจริง):** [https://ebook-online-ai-1.onrender.com](https://ebook-online-ai-1.onrender.com)
* **หน้าผลการรัน CI (GitHub Actions):** [https://github.com/TanawatNamngao/EBOOK_ONLINE_AI/actions](https://github.com/TanawatNamngao/EBOOK_ONLINE_AI/actions)

---

## 📌 5 รายการหลักสำหรับการตรวจโครงงานของผู้สอน (5 Core Evaluation Links)

ผู้สอนสามารถคลิกลิงก์เพื่อเปิดดูรายละเอียดแต่ละหัวข้อได้ทันที:

| ลำดับ | หัวข้อที่ตรวจตามเกณฑ์ | ลิงก์เปิดไฟล์เอกสารใน Repository | ลิงก์ตรงบน GitHub (Direct URL) | สรุปสาระสำคัญ |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **spec ของระบบ** | [📄 docs/06_SYSTEM_SPECIFICATION.md](docs/06_SYSTEM_SPECIFICATION.md) | [คลิกเปิด GitHub](https://github.com/TanawatNamngao/EBOOK_ONLINE_AI/blob/main/docs/06_SYSTEM_SPECIFICATION.md) | ขอบเขตระบบ, 2 บทบาท (Customer, Admin), ข้อกำหนดเชิงฟังก์ชัน 10 ข้อ (FR-01 ถึง FR-10), NFR, สถาปัตยกรรมระบบ Dual-DB (SQLite + Supabase PostgreSQL) และรายการ RESTful API Endpoints |
| **2** | **class diagram หรือ sequence diagram** | [📊 docs/DIAGRAMS_CLASS_AND_SEQUENCE.md](docs/DIAGRAMS_CLASS_AND_SEQUENCE.md)<br>(และ [docs/03_SYSTEM_FLOW_AND_SCENARIOS.md](docs/03_SYSTEM_FLOW_AND_SCENARIOS.md)) | [คลิกเปิด GitHub](https://github.com/TanawatNamngao/EBOOK_ONLINE_AI/blob/main/docs/DIAGRAMS_CLASS_AND_SEQUENCE.md) | **Class Diagram (Mermaid):** แสดง 11 คลาส/เอนทิตี Attributes, Methods, และความสัมพันธ์ครบถ้วน<br>**Sequence Diagrams:** 4 แผนภาพลำดับการทำงาน (สั่งซื้อ-แนบสลิป, แอดมินตรวจอนุมัติ, Security Download Gate 403/200, Cloud Sync) |
| **3** | **งานฝั่งผู้ใช้ คือ persona, wireframe และผลตรวจ accessibility** | [🎨 docs/USER_EXPERIENCE_UX_ACCESSIBILITY.md](docs/USER_EXPERIENCE_UX_ACCESSIBILITY.md) | [คลิกเปิด GitHub](https://github.com/TanawatNamngao/EBOOK_ONLINE_AI/blob/main/docs/USER_EXPERIENCE_UX_ACCESSIBILITY.md) | **Persona:** 2 กลุ่มเป้าหมาย (น้องฟ้า - ลูกค้า/นักศึกษา และ คุณเก่ง - ผู้จัดการร้าน/แอดมิน)<br>**Wireframe:** โครงสร้างและผังหน้าจอหน้าร้าน ตะกร้า ชำระเงิน ตรวจสลิป และแดชบอร์ด<br>**Accessibility Audit:** ผลตรวจมาตรฐาน WCAG 2.1 AA คะแนน **98/100** จาก Lighthouse และ axe-core |
| **4** | **test อัตโนมัติ และหน้าผลการรัน CI** | [🧪 docs/04_TEST_CASES.md](docs/04_TEST_CASES.md)<br>(โค้ดทดสอบ: [tests/run_tests.js](tests/run_tests.js)) | [คลิกเปิด GitHub](https://github.com/TanawatNamngao/EBOOK_ONLINE_AI/blob/main/docs/04_TEST_CASES.md)<br>[คลิกดูผลรัน CI บน Actions](https://github.com/TanawatNamngao/EBOOK_ONLINE_AI/actions) | **Automated Tests:** ชุดรันการทดสอบอัตโนมัติ 10 กรณี (`npm test` ผ่าน 10/10 PASS) ดักจับ Schema Constraints, UNIQUE, CHECK, ป้องกันราคาติดลบ, สกัดกั้นแอบดาวน์โหลดก่อนอนุมัติ<br>**CI Pipeline:** ติดตั้ง GitHub Actions Workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) รันเทสอัตโนมัติทุก push |
| **5** | **บันทึกการใช้ AI** | [🤖 docs/02_AI_USAGE_LOG.md](docs/02_AI_USAGE_LOG.md) | [คลิกเปิด GitHub](https://github.com/TanawatNamngao/EBOOK_ONLINE_AI/blob/main/docs/02_AI_USAGE_LOG.md) | บันทึกการใช้งาน AI อย่างรับผิดชอบ 13 ลำดับงานตามเกณฑ์ใบงาน แสดง Prompt สำคัญ, สิ่งที่นำมาประยุกต์ใช้, วิธีการตรวจสอบความถูกต้องโดยสมาชิกกลุ่ม และข้อเสนอของ AI ที่สมาชิกตัดสินใจปฏิเสธ |

---

## 📚 เอกสารสนับสนุนโครงงานฉบับสมบูรณ์ (Complete Project Deliverables)

นอกจาก 5 หัวข้อหลักข้างต้น กลุ่มได้จัดเตรียมเอกสารรายงานฉบับสมบูรณ์และสคริปต์ SQL ให้ผู้สอนตรวจรันได้อย่างอิสระ:

1. **เล่มรายงานฉบับสมบูรณ์ (Master Report 6 บท):** [`docs/FINAL_PROJECT_REPORT.md`](docs/FINAL_PROJECT_REPORT.md)
2. **การออกแบบฐานข้อมูล ผัง ERD 11 ตาราง และ Data Dictionary (3NF):** [`docs/01_DATABASE_DESIGN_ERD.md`](docs/01_DATABASE_DESIGN_ERD.md)
3. **รายงานวิเคราะห์ข้อมูลเชิงลึก 4 ด้านด้วย SQL ขั้นสูง (Business Analytics):** [`docs/05_ANALYTICS_REPORTS.md`](docs/05_ANALYTICS_REPORTS.md)
4. **แผนภาพเส้นทางการสั่งซื้อและดาวน์โหลด (Flow & Scenarios):** [`docs/03_SYSTEM_FLOW_AND_SCENARIOS.md`](docs/03_SYSTEM_FLOW_AND_SCENARIOS.md)
5. **ข้อมูลโครงงานและการแบ่งหน้าที่รับผิดชอบ:** [`docs/00_PROJECT_INFO.md`](docs/00_PROJECT_INFO.md)
6. **สไลด์นำเสนอโครงงาน (HTML Presentation Slides):** [`docs/PRESENTATION_SLIDES.html`](docs/PRESENTATION_SLIDES.html)

---

## 💻 ซอร์สโค้ดและไฟล์สคริปต์ SQL (Source Code & Database Assets)

* **SQL DDL Schema (11 ตาราง + Constraints):** [`database/schema.sql`](database/schema.sql)
* **SQL Seed Data (30+ คำสั่งซื้อ, สลิปจำลอง 30+ รายการ):** [`database/seed.sql`](database/seed.sql)
* **SQL 4 มิติ รายงานวิเคราะห์เชิงลึก:** [`database/reports.sql`](database/reports.sql)
* **REST API Backend & Security Gateway:** [`server.js`](server.js)
* **Supabase Cloud Sync Engine:** [`database/supabase.js`](database/supabase.js)
* **Frontend Web Application (Storefront):** [`public/index.html`](public/index.html)
* **Admin Backoffice Portal:** [`public/admin.html`](public/admin.html)

---

## 🚀 วิธีการติดตั้งและทดสอบระบบบนเครื่อง Local (Quick Start)

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. รันชุดทดสอบอัตโนมัติ (10 Test Cases)
```bash
npm test
```

### 3. เริ่มต้นเซิร์ฟเวอร์
```bash
npm start
```
* เปิดหน้าร้านสำหรับลูกค้า: [http://localhost:3000](http://localhost:3000)
* เปิดระบบหลังบ้านสำหรับผู้ดูแล: [http://localhost:3000/admin.html](http://localhost:3000/admin.html)

---

## ✅ แบบฟอร์มตรวจสอบความพร้อมก่อนส่งงาน (Self-Verification Checklist)
* [x] **ข้อ 1. spec ของระบบ:** เปิดไฟล์ `docs/06_SYSTEM_SPECIFICATION.md` ได้สมบูรณ์
* [x] **ข้อ 2. class diagram หรือ sequence diagram:** เปิดไฟล์ `docs/DIAGRAMS_CLASS_AND_SEQUENCE.md` ได้สมบูรณ์
* [x] **ข้อ 3. งานฝั่งผู้ใช้ (persona, wireframe, accessibility):** เปิดไฟล์ `docs/USER_EXPERIENCE_UX_ACCESSIBILITY.md` ได้สมบูรณ์
* [x] **ข้อ 4. test อัตโนมัติ และหน้าผลการรัน CI:** รัน `npm test` ผ่านครบ 10/10 PASS และเปิดดูหน้า GitHub Actions ได้
* [x] **ข้อ 5. บันทึกการใช้ AI:** เปิดไฟล์ `docs/02_AI_USAGE_LOG.md` ได้สมบูรณ์
