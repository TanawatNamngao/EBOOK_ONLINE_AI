# EBOOK_ONLINE - Mini Project Database ร้านขาย E-Book 2026

## 📚 ข้อมูลกลุ่มและวิชา
* **รายวิชา:** Database (Mini Project Database ร้านขาย E-Book)
* **ชื่อโครงงาน:** `EBOOK_ONLINE`
* **สมาชิกกลุ่ม:**
  1. **นายธนวัฒน์ นามเหง้า** (รหัส `67332110293-4`)
  2. **นายภานุวัฒน์ แสงเครือ** (รหัส `67332110248-5`)

---

## 🚀 วิธีการเปิดใช้งานระบบ (Quick Start)

ระบบถูกออกแบบให้เป็น **Zero-Configuration** รันได้ทันทีโดยไม่ต้องติดตั้ง Database Server ภายนอก

1. **ติดตั้ง Dependencies:**
   ```bash
   npm install
   ```

2. **เปิดเซิร์ฟเวอร์:**
   ```bash
   npm start
   # หรือ npm run dev
   ```

3. **เข้าใช้งานผ่านเว็บเบราว์เซอร์:**
   * 🛍️ **ส่วนหน้าร้าน (Storefront):** [http://localhost:3000](http://localhost:3000)
   * 🛠️ **ส่วนจัดการหลังบ้าน & 4 รายงาน (Admin Portal):** [http://localhost:3000/admin.html](http://localhost:3000/admin.html)

---

## 🔑 บัญชีทดสอบสำหรับผู้สอนและกรรมการ (Test Accounts)

| ประเภทผู้ใช้ | ชื่อบัญชี (Username) | รหัสผ่าน (Password) | บทบาท / สิทธิ์ |
| :--- | :---: | :---: | :--- |
| **ผู้ดูแลระบบ (Admin)** | `admin` | `admin123` | จัดการหนังสือ ตรวจสลิป อนุมัติออเดอร์ ดู 4 รายงาน |
| **ลูกค้า 1 (Customer)** | `thanawat` | `123456` | นายธนวัฒน์ นามเหง้า (มีออเดอร์ในประวัติ) |
| **ลูกค้า 2 (Customer)** | `panuwat` | `123456` | นายภานุวัฒน์ แสงเครือ (มีออเดอร์ในประวัติ) |
| **ลูกค้า 3 (Customer)** | `somchai` | `123456` | นายสมชาย ดำรงไทย |

> 💡 *หมายเหตุ:* ที่มุมขวาบนของหน้าเว็บ มีปุ่ม **"สลับบัญชีเพื่อทดสอบระบบ"** ให้คลิกเลือกสลับลูกค้าเพื่อสาธิตระบบได้ทันทีโดยไม่ต้องล็อกเอาต์-ล็อกอินใหม่

---

## 📁 สิ่งที่ต้องส่งครบถ้วน (Submission Checklist - ตามข้อ 10)

| รายการ | รายละเอียดที่ต้องมีตามเกณฑ์ | สิ่งที่จัดเตรียมในโปรเจกต์ | ตรวจแล้ว |
| :--- | :--- | :--- | :---: |
| **ระบบหรือ prototype** | URL หรือวิธีเปิดระบบ พร้อมบัญชีทดสอบสำหรับผู้สอน | • หน้าร้าน: [http://localhost:3000](http://localhost:3000)<br>• หลังบ้าน: [http://localhost:3000/admin.html](http://localhost:3000/admin.html)<br>• บัญชี Admin: `admin` / `admin123` \| ลูกค้า: `thanawat`, `panuwat`, `somchai` / `123456` | ☑ ผ่าน |
| **ฐานข้อมูลและ SQL** | ไฟล์สร้างตาราง constraints seed data และ query รายงาน | • DDL: [`database/schema.sql`](file:///c:/Users/next5/Desktop/EBOOK/database/schema.sql) (11 ตาราง 3NF)<br>• Seed Data: [`database/seed.sql`](file:///c:/Users/next5/Desktop/EBOOK/database/seed.sql) (32 ออเดอร์)<br>• Query รายงาน: [`database/reports.sql`](file:///c:/Users/next5/Desktop/EBOOK/database/reports.sql) | ☑ ผ่าน |
| **เอกสารออกแบบ** | ERD data dictionary คำอธิบายการปรับแบบข้อมูล และขอบเขตระบบ | • ERD & Data Dictionary & 3NF: [`docs/01_DATABASE_DESIGN_ERD.md`](file:///c:/Users/next5/Desktop/EBOOK/docs/01_DATABASE_DESIGN_ERD.md)<br>• Flow & Scenarios: [`docs/03_SYSTEM_FLOW_AND_SCENARIOS.md`](file:///c:/Users/next5/Desktop/EBOOK/docs/03_SYSTEM_FLOW_AND_SCENARIOS.md) | ☑ ผ่าน |
| **รายงานวิเคราะห์** | อย่างน้อย 4 รายงาน พร้อม SQL และคำอธิบายสรุปผล | • รายงานยอดขายตามเวลา, E-Book ขายดี, ยอดตามหมวดหมู่, พฤติกรรมลูกค้า: [`docs/05_ANALYTICS_REPORTS.md`](file:///c:/Users/next5/Desktop/EBOOK/docs/05_ANALYTICS_REPORTS.md)<br>• หน้าจอ Interactive พร้อมปุ่ม Export CSV ในระบบ | ☑ ผ่าน |
| **ผลทดสอบ** | ตารางทดสอบอย่างน้อย 8 กรณี และผลการแก้ไข | • ตารางทดสอบ 10 กรณี (เกินเกณฑ์ 8 ข้อ) ผ่าน 100%: [`docs/04_TEST_CASES.md`](file:///c:/Users/next5/Desktop/EBOOK/docs/04_TEST_CASES.md)<br>• สคริปต์อัตโนมัติ: `npm test` (`tests/run_tests.js`) | ☑ ผ่าน |
| **เอกสารการใช้ AI** | เครื่องมือ prompt สำคัญ ผลที่นำมาใช้ และการตรวจทานของสมาชิก | • บันทึกการใช้งาน Google DeepMind Antigravity AI 13 ขั้นตอนอย่างโปร่งใสตามข้อ 12: [`docs/02_AI_USAGE_LOG.md`](file:///c:/Users/next5/Desktop/EBOOK/docs/02_AI_USAGE_LOG.md) | ☑ ผ่าน |

---

## 📄 เอกสารเล่มรายงานฉบับสมบูรณ์
* เล่มรายงานโครงงานฉบับสมบูรณ์: [`docs/FINAL_PROJECT_REPORT.md`](file:///c:/Users/next5/Desktop/EBOOK/docs/FINAL_PROJECT_REPORT.md)
* ข้อมูลกลุ่มและขั้นตอนดำเนินงาน 6 ระยะ: [`docs/00_PROJECT_INFO.md`](file:///c:/Users/next5/Desktop/EBOOK/docs/00_PROJECT_INFO.md)

