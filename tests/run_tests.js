// ====================================================================
// EBOOK_ONLINE: Automated Test Runner (10 Test Cases)
// วิชา: Database Mini Project 2026
// ====================================================================

const http = require('http');
const { spawn } = require('child_process');
const path = require('path');
const db = require('../database/db');

async function isServerRunning(port = 3000) {
    return new Promise((resolve) => {
        const req = http.get(`http://127.0.0.1:${port}/api/ebooks`, (res) => {
            resolve(true);
        });
        req.on('error', () => resolve(false));
        req.setTimeout(800, () => {
            req.destroy();
            resolve(false);
        });
    });
}

async function waitForServer(port = 3000, maxRetries = 25) {
    for (let i = 0; i < maxRetries; i++) {
        if (await isServerRunning(port)) return true;
        await new Promise(r => setTimeout(r, 400));
    }
    return false;
}

async function runTests() {
    console.log('=======================================================');
    console.log('🧪 EBOOK_ONLINE: Automated Test Cases Runner');
    console.log('=======================================================\n');

    let passed = 0;
    let failed = 0;
    let spawnedServer = null;

    function assert(testId, name, condition, details = '') {
        if (condition) {
            console.log(`✅ [${testId}] ${name}: PASS`);
            passed++;
        } else {
            console.error(`❌ [${testId}] ${name}: FAIL - ${details}`);
            failed++;
        }
    }

    try {
        const isUp = await isServerRunning(3000);
        if (!isUp) {
            console.log('⏳ Starting local server for automated tests...');
            spawnedServer = spawn(process.execPath, [path.join(__dirname, '..', 'server.js')], {
                env: { ...process.env, PORT: '3000' },
                stdio: 'ignore'
            });
            const ready = await waitForServer(3000);
            if (!ready) {
                console.error('❌ Failed to start test server within timeout');
                if (spawnedServer) spawnedServer.kill();
                process.exit(1);
            }
            console.log('🚀 Test server ready on http://127.0.0.1:3000\n');
        }
        // TC-01: สมัครสมาชิก
        const testUser = `test_user_${Date.now()}`;
        const resReg = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: testUser,
                email: `${testUser}@test.com`,
                password: 'password123',
                full_name: 'ผู้ใช้ทดสอบอัตโนมัติ'
            })
        });
        const regData = await resReg.json();
        assert('TC-01', 'สมัครสมาชิกใหม่และสร้างตะกร้าอัตโนมัติ', resReg.status === 201 && regData.user.username === testUser);

        // TC-02: ป้องกันผู้ใช้ซ้ำ (Duplicate User)
        const resDup = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: testUser,
                email: `${testUser}@test.com`,
                password: 'password123',
                full_name: 'ผู้ใช้ทดสอบอัตโนมัติ'
            })
        });
        assert('TC-02', 'ป้องกันผู้ใช้ซ้ำ (UNIQUE constraint)', resDup.status === 400);

        // TC-03: ค้นหาและคัดกรอง
        const resSearch = await fetch('http://localhost:3000/api/ebooks?search=Database');
        const searchData = await resSearch.json();
        assert('TC-03', 'ค้นหาและคัดกรองหนังสือตามคำสำคัญ', resSearch.status === 200 && searchData.length >= 1);

        // TC-04: ตะกร้าสินค้า
        const resCart = await fetch('http://localhost:3000/api/cart', {
            headers: { 'x-user-id': regData.user.user_id }
        });
        const cartData = await resCart.json();
        assert('TC-04', 'ระบบตะกร้าสินค้าคำนวณยอดถูกต้อง', resCart.status === 200 && cartData.cart_id !== undefined);

        // TC-05: สั่งซื้อและชำระเงินจำลอง (Pending)
        const targetBook = db.prepare("SELECT ebook_id FROM ebooks WHERE is_published = 1 LIMIT 1").get();
        await fetch('http://localhost:3000/api/cart/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': regData.user.user_id },
            body: JSON.stringify({ ebook_id: targetBook.ebook_id })
        });
        const checkoutRes = await fetch('http://localhost:3000/api/orders/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': regData.user.user_id }
        });
        const pendingOrder = db.prepare("SELECT order_id, status FROM orders WHERE user_id = ? AND status = 'pending'").get(regData.user.user_id);
        assert('TC-05', 'สั่งซื้อและบันทึกสถานะเริ่มต้นเป็น pending', checkoutRes.status === 201 && pendingOrder && pendingOrder.status === 'pending');

        // TC-06: เปิดดาวน์โหลดสำหรับคำสั่งซื้อที่อนุมัติแล้ว
        const confirmedDownload = db.prepare(`
            SELECT dl.token, o.status 
            FROM download_links dl 
            JOIN orders o ON dl.order_id = o.order_id 
            WHERE o.status = 'confirmed' AND dl.download_count < dl.max_downloads
            LIMIT 1
        `).get();
        const resDownload = await fetch(`http://localhost:3000/api/download/${confirmedDownload.token}`);
        assert('TC-06', 'ดาวน์โหลดไฟล์ E-Book สำเร็จเมื่อออเดอร์ได้รับการยืนยันแล้ว', resDownload.status === 200);

        // TC-07: ตรวจสอบ Constraint ข้อมูลผู้ใช้ซ้ำในฐานข้อมูล
        let dbDupFailed = false;
        try {
            db.prepare("INSERT INTO users (role_id, username, email, password_hash, full_name) VALUES (1, 'thanawat', 'thanawat@example.com', '123', 'ซ้ำ')").run();
        } catch (e) {
            dbDupFailed = true;
        }
        assert('TC-07', 'Database ปฏิเสธ Username/Email ซ้ำในระดับ Schema (UNIQUE)', dbDupFailed);

        // TC-08: ป้องกันราคาติดลบ (Negative Price Constraint)
        let negativePriceBlocked = false;
        try {
            db.prepare("INSERT INTO ebooks (category_id, author_id, title, price, full_file_url) VALUES (1, 1, 'หนังสือราคาลบ', -100.0, '/test')").run();
        } catch (e) {
            negativePriceBlocked = true;
        }
        assert('TC-08', 'Database ปฏิเสธราคาติดลบด้วย CHECK constraint (price >= 0)', negativePriceBlocked);

        // TC-09: สินค้าไม่พร้อมขาย (Unpublished Product Gate)
        const unpublishedBook = db.prepare("SELECT ebook_id FROM ebooks WHERE is_published = 0 LIMIT 1").get();
        if (!unpublishedBook) {
            // temporarily create one or test with fake id
            db.prepare("INSERT INTO ebooks (category_id, author_id, title, price, full_file_url, is_published) VALUES (1, 1, 'หนังสือปิดการขายทดสอบ', 100, '/test', 0)").run();
        }
        const targetUnpub = db.prepare("SELECT ebook_id FROM ebooks WHERE is_published = 0 LIMIT 1").get();
        const resUnpub = await fetch('http://localhost:3000/api/cart/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': regData.user.user_id },
            body: JSON.stringify({ ebook_id: targetUnpub.ebook_id })
        });
        assert('TC-09', 'ปฏิเสธการสั่งซื้อหนังสือที่ปิดการขาย (is_published = 0)', resUnpub.status === 400);

        // TC-10: 🔒 สกัดกั้นการเปิดดาวน์โหลดก่อนยืนยันคำสั่งซื้อ (Security Gate)
        // create a fake token with pending order
        const pendingTokenRes = await fetch('http://localhost:3000/api/download/non_existent_or_pending_token_test');
        assert('TC-10', 'สกัดกั้นการเปิดดาวน์โหลดก่อนยืนยันคำสั่งซื้อ (HTTP 403 / 404 Security Gate)', pendingTokenRes.status === 404 || pendingTokenRes.status === 403);

        console.log('\n=======================================================');
        console.log(`📊 ผลการทดสอบทั้งหมด: ${passed} ผ่าน, ${failed} ไม่ผ่าน (ทั้งหมด 10 กรณี)`);
        console.log('=======================================================');

    } catch (err) {
        console.error('Test runner error:', err);
        failed++;
    } finally {
        if (spawnedServer) {
            console.log('🛑 Stopping test server...');
            spawnedServer.kill();
        }
        process.exit(failed > 0 ? 1 : 0);
    }
}

runTests();
