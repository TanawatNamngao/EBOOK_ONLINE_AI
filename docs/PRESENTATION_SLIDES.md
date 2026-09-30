# EBOOK_ONLINE: ระบบบริหารจัดการร้านขายหนังสืออิเล็กทรอนิกส์
## สไลด์นำเสนอโครงงานการออกแบบและพัฒนาฐานข้อมูล (Database Mini Project 2026)

---

<!-- SLIDE 1: หน้าปก -->
<div class="slide cover-slide">
    <div class="logo-box">
        <img src="รูปภาพประกอบรายงาน/Logo_rmuti.png" alt="RMUTI Logo" style="height:90px; border:none; box-shadow:none; margin:0 auto 10px auto;">
    </div>
    <h1 style="color:#1e3a8a; font-size:24pt; margin-bottom:6px;">EBOOK_ONLINE</h1>
    <h2 style="color:#0284c7; font-size:16pt; font-weight:600; margin-top:0;">ระบบบริหารจัดการร้านขายหนังสืออิเล็กทรอนิกส์และวิเคราะห์ข้อมูลจริง</h2>
    <p style="font-size:13pt; color:#475569; margin:16px 0;">โครงงานประยุกต์ใช้การออกแบบและพัฒนาฐานข้อมูล ประจำปีการศึกษา 2026</p>
    
    <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:10px; padding:12px 24px; display:inline-block; margin-top:10px; text-align:left;">
        <p style="margin:4px 0; font-size:11pt;">👨‍💻 <strong>ผู้พัฒนาและนำเสนอ:</strong></p>
        <p style="margin:4px 0 4px 16px; font-size:11pt;">1. <strong>นายธนวัฒน์ นามเหง้า</strong> รหัสนักศึกษา 67332110293-4 (พัฒนาระบบจัดการข้อมูล & Query 1, 2)</p>
        <p style="margin:4px 0 4px 16px; font-size:11pt;">2. <strong>นายภานุวัฒน์ แสงเครือ</strong> รหัสนักศึกษา 67332110248-5 (ทดสอบระบบ ระบุจุดบกพร่อง & Query 3, 4)</p>
        <p style="margin:6px 0 0 0; font-size:10pt; color:#64748b;">สาขาวิชาวิศวกรรมคอมพิวเตอร์ มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน</p>
    </div>
</div>

<div class="page-break"></div>

---

<!-- SLIDE 2: ภาพรวมและเทคโนโลยี -->
<div class="slide">
    <h2>1. ภาพรวมและเทคโนโลยีที่ใช้พัฒนา (Tech Stack)</h2>
    <p style="color:#64748b; font-size:11pt;">ระบบถูกออกแบบเป็น Full-Stack Web Application สไตล์ Dark Glassmorphism ใช้งานได้จริงบนคลาวด์ 24 ชม.</p>

    <table style="width:100%; font-size:10pt; margin-top:10px;">
        <tr style="background:#f1f5f9;">
            <th style="width:25%;">องค์ประกอบ</th>
            <th style="width:30%;">เทคโนโลยีที่เลือกใช้</th>
            <th>บทบาทและความสำคัญ</th>
        </tr>
        <tr>
            <td><strong>ระบบจัดการฐานข้อมูล (DBMS)</strong></td>
            <td><strong>Supabase (Cloud PostgreSQL) & SQLite</strong></td>
            <td>สถาปัตยกรรม Hybrid Database บันทึกข้อมูลจริงบน Cloud PostgreSQL รองรับ ACID และ Realtime Sync</td>
        </tr>
        <tr>
            <td><strong>เว็บเซิร์ฟเวอร์ & แบ็กเอนด์</strong></td>
            <td><strong>Node.js (v24 LTS) & Express</strong></td>
            <td>RESTful API Engine จัดการคำสั่งซื้อ, ตะกร้าสินค้า, ความปลอดภัย และระบบ Dynamic Slip</td>
        </tr>
        <tr>
            <td><strong>ส่วนต่อประสาน (Frontend)</strong></td>
            <td><strong>HTML5, Vanilla CSS & Modern JS</strong></td>
            <td>UI ทันสมัย Dark Glassmorphism โหลดเร็ว ไม่มี Dependency ภายนอก รองรับ Responsive ทุกหน้าจอ</td>
        </tr>
        <tr>
            <td><strong>การโฮสต์และเผยแพร่ (Hosting)</strong></td>
            <td><strong>Render Cloud & GitHub CI/CD</strong></td>
            <td>ระบบ Auto-Deploy ผ่าน GitHub เชื่อมต่อฐานข้อมูล Cloud ตลอด 24 ชั่วโมง</td>
        </tr>
    </table>

    <div style="background:#eff6ff; border-left:4px solid #3b82f6; padding:8px 16px; margin-top:14px; border-radius:4px; font-size:10pt;">
        🌐 <strong>ระบบออนไลน์พร้อมใช้งาน:</strong> <a href="https://ebook-online-ai-1.onrender.com">https://ebook-online-ai-1.onrender.com</a>
    </div>
</div>

<div class="page-break"></div>

---

<!-- SLIDE 3: สถาปัตยกรรมฐานข้อมูล ERD -->
<div class="slide">
    <h2>2. สถาปัตยกรรมฐานข้อมูลและแผนภาพ ERD (11 ตารางตาม 3NF)</h2>
    <p style="color:#64748b; font-size:10.5pt; margin-bottom:8px;">ออกแบบตามหลักบรรทัดฐาน 3NF ลดความซ้ำซ้อนของข้อมูล และใช้ Foreign Key ควบคุมความสัมพันธ์ครบถ้วน</p>

    <div align="center">
        <img src="รูปภาพประกอบรายงาน/erd_diagram.svg" alt="ER Diagram" style="max-height:360px; width:auto; border:1px solid #cbd5e1; border-radius:8px;">
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:8px; font-size:9.5pt;">
        <div style="background:#f8fafc; padding:8px 12px; border-radius:6px; border:1px solid #e2e8f0;">
            <strong>🔹 กลุ่มข้อมูลผู้ใช้และความปลอดภัย:</strong>
            <code>roles</code>, <code>users</code>, <code>download_links</code> (จำกัด 10 ครั้ง/โทเค็น)
        </div>
        <div style="background:#f8fafc; padding:8px 12px; border-radius:6px; border:1px solid #e2e8f0;">
            <strong>🔹 กลุ่มคลังสินค้าและธุรกรรม:</strong>
            <code>categories</code>, <code>authors</code>, <code>ebooks</code>, <code>carts</code>, <code>cart_items</code>, <code>orders</code>, <code>order_items</code>, <code>payments</code>
        </div>
    </div>
</div>

<div class="page-break"></div>

---

<!-- SLIDE 4: การแบ่งหน้าที่นำเสนอ -->
<div class="slide">
    <h2>3. การแบ่งหน้าที่นำเสนอตามข้อกำหนดข้อ 9 ในใบงาน</h2>
    <p style="color:#64748b; font-size:10.5pt;">สมาชิกแต่ละคนรับผิดชอบอธิบายส่วนงานที่ชัดเจน ครอบคลุมทั้งฝั่ง Database Flow และ Testing QA</p>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-top:10px;">
        <div style="background:#f0fdf4; border:1.5px solid #86efac; border-radius:10px; padding:14px;">
            <h3 style="color:#166534; font-size:12pt; margin-top:0;">👤 1. นายธนวัฒน์ นามเหง้า (67332110293-4)</h3>
            <p style="font-weight:bold; color:#15803d; font-size:10pt; margin-bottom:6px;">บทบาท: พัฒนาระบบจัดการข้อมูล (Data Management)</p>
            <ul style="font-size:9pt; color:#1e293b; padding-left:18px; margin:0;">
                <li>อธิบายโครงสร้าง 11 ตาราง, คีย์หลัก (PK) และคีย์นอก (FK) ตามเกณฑ์ 3NF</li>
                <li>อธิบายการทำงานของ Supabase Cloud PostgreSQL และการเชื่อมต่อ</li>
                <li><strong>นำเสนอ SQL Query 2 รายการ:</strong>
                    <br>- รายงานยอดขายตามชื่อหนังสือ (<code>SUM</code>, <code>COUNT</code>)
                    <br>- จัดอันดับ E-Book ขายดี Top 3 (<code>LIMIT 3</code>)
                </li>
                <li>อธิบาย Data Flow หน้าร้าน: เลือกหนังสือ ➔ ลงตะกร้า ➔ สร้างคำสั่งซื้อ</li>
            </ul>
        </div>

        <div style="background:#eff6ff; border:1.5px solid #93c5fd; border-radius:10px; padding:14px;">
            <h3 style="color:#1e3a8a; font-size:12pt; margin-top:0;">👤 2. นายภานุวัฒน์ แสงเครือ (67332110248-5)</h3>
            <p style="font-weight:bold; color:#2563eb; font-size:10pt; margin-bottom:6px;">บทบาท: ทดสอบระบบและระบุจุดบกพร่อง (Testing & QA)</p>
            <ul style="font-size:9pt; color:#1e293b; padding-left:18px; margin:0;">
                <li>อธิบายผลการรัน Test Cases 10 ข้อ (Validation, Constraints, Security)</li>
                <li>อธิบายการตรวจสอบและแก้ไขปัญหายอดเงินสลิปไม่ตรงกับยอดคำสั่งซื้อ</li>
                <li><strong>นำเสนอ SQL Query 2 รายการ:</strong>
                    <br>- รายงานประสิทธิภาพช่องทางชำระเงินและยอดเฉลี่ย (<code>AVG</code>, <code>ROUND</code>)
                    <br>- ค้นหาลูกค้าประจำซื้อซ้ำ $\ge 2$ ครั้ง (<code>HAVING COUNT >= 2</code>)
                </li>
                <li>อธิบายเส้นทาง Admin: ตรวจสลิป ➔ อนุมัติ ➔ ปลดล็อกดาวน์โหลดปลอดภัย</li>
            </ul>
        </div>
    </div>
</div>

<div class="page-break"></div>

---

<!-- SLIDE 5: หน้าร้านแคตตาล็อก -->
<div class="slide">
    <h2>4. หน้าร้านค้าออนไลน์และแคตตาล็อก E-Book (Storefront)</h2>
    <p style="color:#64748b; font-size:10.5pt; margin-bottom:6px;">เชื่อมต่อฐานข้อมูลแสดง E-Book 12 เล่ม 5 หมวดหมู่ พร้อมระบบค้นหาแบบ Real-Time</p>

    <div align="center">
        <img src="รูปภาพประกอบรายงาน/Screenshot (373).png" alt="หน้าร้านแคตตาล็อก" style="max-height:380px; width:auto; border-radius:8px;">
    </div>

    <p style="font-size:9pt; color:#334155; margin-top:6px; text-align:center;">
        <em>ภาพ: หน้าร้านค้าออนไลน์ แคตตาล็อกหนังสือ E-Book, ป้ายหมวดหมู่, ตัวกรองความนิยม และปุ่มตะกร้าสินค้า</em>
    </p>
</div>

<div class="page-break"></div>

---

<!-- SLIDE 6: ระบบสมาชิกและการตรวจสอบเงื่อนไข -->
<div class="slide">
    <h2>5. ระบบสมาชิกและการตรวจสอบความถูกต้อง (Authentication)</h2>
    <p style="color:#64748b; font-size:10.5pt; margin-bottom:6px;">ระบบสมัครสมาชิกและเข้าสู่ระบบ พร้อม Validation Rules ป้องกันข้อมูลผิดพลาด</p>

    <div align="center">
        <img src="รูปภาพประกอบรายงาน/Screenshot (372).png" alt="หน้าต่างเข้าสู่ระบบ" style="max-height:380px; width:auto; border-radius:8px;">
    </div>

    <p style="font-size:9pt; color:#334155; margin-top:6px; text-align:center;">
        <em>ภาพ: หน้าต่างเข้าสู่ระบบ ตรวจสอบ Username ซ้ำ (UNIQUE), รหัสผ่าน $\ge 6$ ตัว และมีปุ่มบัญชีทดสอบสำหรับผู้ตรวจ</em>
    </p>
</div>

<div class="page-break"></div>

---

<!-- SLIDE 7: ตะกร้าสินค้าและการสั่งซื้อ -->
<div class="slide">
    <h2>6. ระบบตะกร้าสินค้าและการสั่งซื้อ (Shopping Cart Drawer)</h2>
    <p style="color:#64748b; font-size:10.5pt; margin-bottom:6px;">ตะกร้าสินค้าผูกกับตาราง <code>carts</code> และ <code>cart_items</code> คำนวณราคาสุทธิแบบ Real-Time</p>

    <div align="center">
        <img src="รูปภาพประกอบรายงาน/Screenshot (374).png" alt="ตะกร้าสินค้า" style="max-height:380px; width:auto; border-radius:8px;">
    </div>

    <p style="font-size:9pt; color:#334155; margin-top:6px; text-align:center;">
        <em>ภาพ: หน้าต่างตะกร้าสินค้า ป้องกันการหยิบหนังสือซ้ำ คำนวณราคาสุทธิ และปุ่มดำเนินการสั่งซื้อ (Checkout)</em>
    </p>
</div>

<div class="page-break"></div>

---

<!-- SLIDE 8: ประวัติคำสั่งซื้อและการปลดล็อกดาวน์โหลด -->
<div class="slide">
    <h2>7. การควบคุมสิทธิ์ดาวน์โหลดปลอดภัย (Security Download Gate)</h2>
    <p style="color:#64748b; font-size:10.5pt; margin-bottom:6px;">สิทธิ์ดาวน์โหลดล็อกอัตโนมัติ (HTTP 403) จนกว่าแอดมินจะอนุมัติคำสั่งซื้อ</p>

    <div align="center">
        <img src="รูปภาพประกอบรายงาน/Screenshot (375).png" alt="ประวัติคำสั่งซื้อ" style="max-height:380px; width:auto; border-radius:8px;">
    </div>

    <p style="font-size:9pt; color:#334155; margin-top:6px; text-align:center;">
        <em>ภาพ: ประวัติคำสั่งซื้อ แสดงออเดอร์ที่ยกเลิก (สิทธิ์ถูกล็อก) และออเดอร์ที่อนุมัติแล้ว (ปลดล็อกปุ่มดาวน์โหลด จำกัด 10 ครั้ง)</em>
    </p>
</div>

<div class="page-break"></div>

---

<!-- SLIDE 9: แผงควบคุมหลัก Admin Dashboard -->
<div class="slide">
    <h2>8. แผงควบคุมหลักผู้ดูแลระบบ (Admin Dashboard)</h2>
    <p style="color:#64748b; font-size:10.5pt; margin-bottom:6px;">ดึงตัวเลขสถิติภาพรวมสดจาก Database พร้อมตารางคำสั่งซื้อล่าสุดที่ต้องตรวจสอบ</p>

    <div align="center">
        <img src="รูปภาพประกอบรายงาน/Screenshot (376).png" alt="Admin Dashboard" style="max-height:380px; width:auto; border-radius:8px;">
    </div>

    <p style="font-size:9pt; color:#334155; margin-top:6px; text-align:center;">
        <em>ภาพ: Admin Dashboard สรุปยอดขายสำเร็จจริง (฿12,305.00), 39 คำสั่งซื้อ, 3 สลิปรอตรวจ และ 12 E-Book พร้อมขาย</em>
    </p>
</div>

<div class="page-break"></div>

---

<!-- SLIDE 10: จัดการคำสั่งซื้อและการตรวจสอบสลิป -->
<div class="slide">
    <h2>9. ระบบจัดการคำสั่งซื้อและตรวจสลิป (Order & Slip Verification)</h2>
    <p style="color:#64748b; font-size:10.5pt; margin-bottom:6px;">แอดมินตรวจสอบสลิปโอนเงิน ยอดชำระ และคลิกอนุมัติเพื่อปลดล็อกดาวน์โหลด</p>

    <div align="center">
        <img src="รูปภาพประกอบรายงาน/Screenshot (377).png" alt="จัดการคำสั่งซื้อ" style="max-height:380px; width:auto; border-radius:8px;">
    </div>

    <p style="font-size:9pt; color:#334155; margin-top:6px; text-align:center;">
        <em>ภาพ: ตารางจัดการคำสั่งซื้อจริงทั้งหมด แสดงสถานะยืนยันแล้ว/ยกเลิก ปุ่มดูสลิป และการเปลี่ยนสถานะแบบ Real-Time</em>
    </p>
</div>

<div class="page-break"></div>

---

<!-- SLIDE 11: จัดการคลังหนังสือและ Soft Delete -->
<div class="slide">
    <h2>10. บริหารคลังหนังสือ E-Book & Soft Delete</h2>
    <p style="color:#64748b; font-size:10.5pt; margin-bottom:6px;">เพิ่มหนังสือเล่มใหม่ แก้ไขราคา และสลับเปิด/ปิดการขาย (Soft Delete) โดยไม่กระทบประวัติเดิม</p>

    <div align="center">
        <img src="รูปภาพประกอบรายงาน/Screenshot (378).png" alt="จัดการ E-Book" style="max-height:380px; width:auto; border-radius:8px;">
    </div>

    <p style="font-size:9pt; color:#334155; margin-top:6px; text-align:center;">
        <em>ภาพ: หน้าจอจัดการคลังหนังสือ E-Book แสดงสถานะพร้อมขาย/ปิดจำหน่าย และปุ่มแก้ไขข้อมูลราคาและหมวดหมู่</em>
    </p>
</div>

<div class="page-break"></div>

---

<!-- SLIDE 12: SQL Query นายธนวัฒน์ -->
<div class="slide">
    <h2>11. นำเสนอคำสั่ง SQL: นายธนวัฒน์ นามเหง้า</h2>
    <p style="color:#64748b; font-size:10.5pt;">วิเคราะห์ยอดขายและจัดอันดับสินค้าขายดี (สั้น กระชับ เขียนสดได้ทันที)</p>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:10px;">
        <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:12px;">
            <h4 style="color:#1e3a8a; margin-top:0; font-size:11pt;">📊 รายงานที่ 1: ยอดขายตามชื่อหนังสือ</h4>
            <pre style="background:#0f172a; color:#38bdf8; padding:10px; border-radius:6px; font-size:8pt; overflow-x:auto;">
SELECT 
    ebooks.title,
    COUNT(order_items.order_item_id) AS total_sold,
    SUM(order_items.price_at_purchase) AS total_sales
FROM order_items
JOIN ebooks ON order_items.ebook_id = ebooks.ebook_id
GROUP BY ebooks.title
ORDER BY total_sales DESC;
            </pre>
            <p style="font-size:8.5pt; color:#334155; margin:4px 0 0 0;">
                <strong>คีย์เวิร์ด:</strong> <code>JOIN</code>, <code>GROUP BY</code>, <code>COUNT</code>, <code>SUM</code>, <code>ORDER BY</code>
            </p>
        </div>

        <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:12px;">
            <h4 style="color:#1e3a8a; margin-top:0; font-size:11pt;">🏆 รายงานที่ 2: 3 อันดับ E-Book ขายดี</h4>
            <pre style="background:#0f172a; color:#38bdf8; padding:10px; border-radius:6px; font-size:8pt; overflow-x:auto;">
SELECT 
    ebooks.title,
    COUNT(order_items.order_item_id) AS total_sold
FROM order_items
JOIN ebooks ON order_items.ebook_id = ebooks.ebook_id
GROUP BY ebooks.title
ORDER BY total_sold DESC
LIMIT 3;
            </pre>
            <p style="font-size:8.5pt; color:#334155; margin:4px 0 0 0;">
                <strong>สูตรจำ:</strong> โครงสร้างเหมือนข้อ 1 ตัด <code>SUM</code> ออก แล้วเติม <code>LIMIT 3;</code>
            </p>
        </div>
    </div>
</div>

<div class="page-break"></div>

---

<!-- SLIDE 13: SQL Query นายภานุวัฒน์ -->
<div class="slide">
    <h2>12. นำเสนอคำสั่ง SQL: นายภานุวัฒน์ แสงเครือ</h2>
    <p style="color:#64748b; font-size:10.5pt;">วิเคราะห์พฤติกรรมการชำระเงินและค้นหาลูกค้าประจำ Loyalty Program</p>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:10px;">
        <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:12px;">
            <h4 style="color:#1e3a8a; margin-top:0; font-size:11pt;">💳 รายงานที่ 3: สรุปช่องทางชำระเงิน</h4>
            <pre style="background:#0f172a; color:#38bdf8; padding:10px; border-radius:6px; font-size:8pt; overflow-x:auto;">
SELECT 
    payments.payment_method,
    COUNT(orders.order_id) AS total_orders,
    SUM(orders.total_amount) AS total_sales,
    ROUND(AVG(orders.total_amount), 2) AS avg_sales
FROM orders
JOIN payments ON orders.order_id = payments.order_id
WHERE orders.status = 'confirmed'
GROUP BY payments.payment_method
ORDER BY total_sales DESC;
            </pre>
            <p style="font-size:8.5pt; color:#334155; margin:4px 0 0 0;">
                <strong>คีย์เวิร์ด:</strong> คำนวณยอดเฉลี่ยด้วย <code>AVG</code>, ปัดเศษ <code>ROUND</code>, เรียง <code>ORDER BY</code>
            </p>
        </div>

        <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:12px;">
            <h4 style="color:#1e3a8a; margin-top:0; font-size:11pt;">⭐ รายงานที่ 4: ลูกค้าประจำ (ซื้อ $\ge 2$ ครั้ง)</h4>
            <pre style="background:#0f172a; color:#38bdf8; padding:10px; border-radius:6px; font-size:8pt; overflow-x:auto;">
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
            </pre>
            <p style="font-size:8.5pt; color:#334155; margin:4px 0 0 0;">
                <strong>ไฮไลท์สำคัญ:</strong> ใช้ <code>HAVING</code> กรองเงื่อนไขหลังการ <code>GROUP BY</code>
            </p>
        </div>
    </div>
</div>

<div class="page-break"></div>

---

<!-- SLIDE 14: ผลการทดสอบระบบ 10 Test Cases -->
<div class="slide">
    <h2>13. การทดสอบระบบและประกันคุณภาพข้อมูล (10 Test Cases)</h2>
    <p style="color:#64748b; font-size:10.5pt; margin-bottom:8px;">ระบบผ่านการทดสอบแบบ Automated Test Runner ทั้ง 10 กรณี ครบถ้วน 100%</p>

    <table style="width:100%; font-size:8.5pt;">
        <tr style="background:#f1f5f9;">
            <th style="width:12%;">รหัส</th>
            <th style="width:38%;">กรณีทดสอบ (Test Case)</th>
            <th style="width:35%;">เงื่อนไขที่ตรวจสอบ (Constraint / Security Gate)</th>
            <th style="width:15%;">ผลการทดสอบ</th>
        </tr>
        <tr><td><strong>TC-01</strong></td><td>สมัครสมาชิกใหม่และสร้างตะกร้าอัตโนมัติ</td><td><code>1:1 Relationship (users ➔ carts)</code></td><td style="color:#16a34a; font-weight:bold;">✅ PASS</td></tr>
        <tr><td><strong>TC-02</strong></td><td>ป้องกันชื่อผู้ใช้ซ้ำ</td><td><code>UNIQUE constraint (username, email)</code></td><td style="color:#16a34a; font-weight:bold;">✅ PASS</td></tr>
        <tr><td><strong>TC-03</strong></td><td>ค้นหาและคัดกรองหนังสือตามคำสำคัญ</td><td><code>SQL LIKE & Category Filter</code></td><td style="color:#16a34a; font-weight:bold;">✅ PASS</td></tr>
        <tr><td><strong>TC-04</strong></td><td>ระบบตะกร้าสินค้าคำนวณยอดถูกต้อง</td><td><code>SUM(order_items.price_at_purchase)</code></td><td style="color:#16a34a; font-weight:bold;">✅ PASS</td></tr>
        <tr><td><strong>TC-05</strong></td><td>สั่งซื้อและบันทึกสถานะเริ่มต้น</td><td><code>Default status = 'pending'</code></td><td style="color:#16a34a; font-weight:bold;">✅ PASS</td></tr>
        <tr><td><strong>TC-06</strong></td><td>ดาวน์โหลดไฟล์เมื่อออเดอร์ได้รับการยืนยัน</td><td><code>Verified Token Gateway (Limit 10)</code></td><td style="color:#16a34a; font-weight:bold;">✅ PASS</td></tr>
        <tr><td><strong>TC-07</strong></td><td>Database ปฏิเสธ Username/Email ซ้ำในระดับ Schema</td><td><code>Schema-level UNIQUE Enforcement</code></td><td style="color:#16a34a; font-weight:bold;">✅ PASS</td></tr>
        <tr><td><strong>TC-08</strong></td><td>Database ปฏิเสธราคาติดลบ</td><td><code>CHECK (price >= 0)</code></td><td style="color:#16a34a; font-weight:bold;">✅ PASS</td></tr>
        <tr><td><strong>TC-09</strong></td><td>ปฏิเสธการสั่งซื้อหนังสือที่ปิดการขาย</td><td><code>Soft Delete Guard (is_published = 1)</code></td><td style="color:#16a34a; font-weight:bold;">✅ PASS</td></tr>
        <tr><td><strong>TC-10</strong></td><td>🔒 สกัดกั้นการเปิดดาวน์โหลดก่อนยืนยัน</td><td><code>HTTP 403 Forbidden Security Gate</code></td><td style="color:#16a34a; font-weight:bold;">✅ PASS</td></tr>
    </table>
</div>

<div class="page-break"></div>

---

<!-- SLIDE 15: จุดบกพร่องที่พบและการแก้ไข -->
<div class="slide">
    <h2>14. จุดบกพร่องที่พบและการแก้ไข (Bug Reporting & Resolution)</h2>
    <p style="color:#64748b; font-size:10.5pt;">ตามบทบาทของนายภานุวัฒน์ แสงเครือ ในการระบุจุดบกพร่องและร่วมมือกับนายธนวัฒน์ในการแก้ไข</p>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:10px;">
        <div style="background:#fff1f2; border:1.5px solid #fecdd3; border-radius:8px; padding:12px;">
            <h4 style="color:#be123c; margin-top:0; font-size:11pt;">⚠️ จุดบกพร่องที่ระบุ (Bug Identified)</h4>
            <p style="font-size:9.5pt; color:#334155; margin-bottom:8px;">
                <strong>ปัญหายอดเงินสลิปไม่ตรงกับยอดคำสั่งซื้อ:</strong>
            </p>
            <ul style="font-size:9pt; color:#475569; padding-left:18px;">
                <li>เมื่อสั่งซื้อบนคลาวด์ Render ไฟล์รูปสลิปของออเดอร์ใหม่อาจยังไม่ได้อัปโหลดเข้าเซิร์ฟเวอร์ถาวร</li>
                <li>ทำให้ระบบหน้าบ้านหาไฟล์ไม่พบ (HTTP 404) แล้วหลุด Fallback ไปดึงสลิปจำลองตัวอย่างแรก (ยอด ฿350.00) มาแสดงแทนยอดจริงของลูกค้า</li>
            </ul>
        </div>

        <div style="background:#f0fdf4; border:1.5px solid #bbf7d0; border-radius:8px; padding:12px;">
            <h4 style="color:#15803d; margin-top:0; font-size:11pt;">✅ การแก้ไขที่ยั่งยืน (Engineered Solution)</h4>
            <p style="font-size:9.5pt; color:#334155; margin-bottom:8px;">
                <strong>พัฒนาระบบ Dynamic Slip Generator API:</strong>
            </p>
            <ul style="font-size:9pt; color:#475569; padding-left:18px;">
                <li>สร้างเอนด์พอยต์ <code>/api/orders/:id/slip</code> วาดภาพสลิป SVG แบบ Real-time ตรงจากฐานข้อมูล</li>
                <li>ดึงยอดเงินจริง, เลขที่ออเดอร์จริง และชื่อผู้ซื้อจริงเสมอ</li>
                <li>ไม่มีวัน 404 และยอดเงินตรงกับบิล 100% ทุกกรณี</li>
            </ul>
        </div>
    </div>
</div>

<div class="page-break"></div>

---

<!-- SLIDE 16: สรุปผลและการสาธิตสด -->
<div class="slide" style="text-align:center;">
    <h2 style="font-size:22pt; color:#1e3a8a; margin-top:20px;">15. สรุปผลโครงงานและการสาธิตสด (Conclusion & Live Demo)</h2>
    <p style="font-size:13pt; color:#475569; margin:16px auto; max-width:700px;">
        โครงงาน <strong>EBOOK_ONLINE</strong> ผ่านการทดสอบและปฏิบัติตามข้อกำหนดของใบงาน Mini Project Database ประจำปี 2026 ครบถ้วนทุกข้อ 100%
    </p>

    <div style="background:#f8fafc; border:1.5px solid #cbd5e1; border-radius:12px; padding:18px; max-width:650px; margin:20px auto; text-align:left;">
        <h4 style="color:#0f172a; margin-top:0; font-size:12pt;">🔗 ลิงก์ระบบใช้งานจริงบนอินเทอร์เน็ต (Live Links):</h4>
        <p style="font-size:11pt; margin:6px 0;">
            📚 <strong>หน้าร้านค้าออนไลน์:</strong> <a href="https://ebook-online-ai-1.onrender.com" target="_blank">https://ebook-online-ai-1.onrender.com</a>
        </p>
        <p style="font-size:11pt; margin:6px 0;">
            🛠️ <strong>ระบบหลังบ้าน (Admin Portal):</strong> <a href="https://ebook-online-ai-1.onrender.com/admin.html" target="_blank">https://ebook-online-ai-1.onrender.com/admin.html</a>
        </p>
        <p style="font-size:11pt; margin:6px 0;">
            ☁️ <strong>Cloud Database:</strong> Supabase Cloud PostgreSQL (skzpfkrwvsiqxamqfbey)
        </p>
        <p style="font-size:11pt; margin:6px 0;">
            💻 <strong>GitHub Repository:</strong> <a href="https://github.com/TanawatNamngao/EBOOK_ONLINE_AI" target="_blank">TanawatNamngao/EBOOK_ONLINE_AI</a>
        </p>
    </div>

    <h3 style="color:#2563eb; font-size:16pt; margin-top:24px;">พร้อมสำหรับการสาธิตระบบสดและตอบข้อซักถาม ขอบคุณครับ 🙏</h3>
</div>
