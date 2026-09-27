// ====================================================================
// EBOOK_ONLINE: Admin Portal & Analytics (JavaScript)
// ====================================================================

let currentActiveOrder = null;
let allAdminOrders = [];
let allAdminCategories = [];
let allAdminAuthors = [];

document.addEventListener('DOMContentLoaded', () => {
    loadDashboardStats();
    loadAdminOrders();
    loadAdminEbooks();
    loadAdminCategories();
    loadAuthorsAndCategories();
    loadAllReports();
    loadAdminUsers();
});

// Toast Helper
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    const icon = type === 'success' ? '✅' : (type === 'error' ? '❌' : 'ℹ️');
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.transition = 'all 0.3s ease';
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// Switch Sidebar Tabs
function switchAdminTab(tabName) {
    document.querySelectorAll('.admin-nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById(`nav-tab-${tabName}`).classList.add('active');

    const views = ['dashboard', 'orders', 'ebooks', 'reports', 'users'];
    views.forEach(v => {
        const el = document.getElementById(`view-${v}`);
        if (el) el.style.display = (v === tabName) ? 'block' : 'none';
    });

    const titles = {
        'dashboard': 'แผงควบคุมหลัก (Dashboard)',
        'orders': 'จัดการคำสั่งซื้อและตรวจสอบหลักฐานการชำระเงิน',
        'ebooks': 'จัดการคลังหนังสือ E-Book & หมวดหมู่',
        'reports': 'รายงานวิเคราะห์ข้อมูลจริง 4 หัวข้อ (Analytics Reports)',
        'users': 'จัดการสมาชิกและสิทธิ์การใช้งาน (User Management)'
    };
    document.getElementById('admin-view-title').textContent = titles[tabName] || 'Admin Portal';

    if (tabName === 'reports') loadAllReports();
    if (tabName === 'orders') loadAdminOrders();
    if (tabName === 'dashboard') loadDashboardStats();
}

// Switch Report Sub-tabs
function switchReportTab(tabIndex, btn) {
    document.querySelectorAll('.report-nav-btn').forEach(b => {
        b.classList.remove('btn-primary', 'active');
        b.classList.add('btn-secondary');
    });
    btn.classList.add('btn-primary', 'active');
    btn.classList.remove('btn-secondary');

    for (let i = 1; i <= 4; i++) {
        document.getElementById(`report-tab-${i}`).style.display = (i === tabIndex) ? 'block' : 'none';
    }
}

// ====================================================================
// 1. Dashboard Stats
// ====================================================================

async function loadDashboardStats() {
    try {
        const res = await fetch('/api/admin/dashboard-stats');
        const data = await res.json();

        document.getElementById('stat-total-sales').textContent = `฿${parseFloat(data.total_sales).toLocaleString('th-TH', { minimumFractionDigits: 2 })}`;
        document.getElementById('stat-total-orders').textContent = data.total_orders;
        document.getElementById('stat-pending-orders').textContent = data.pending_orders;
        document.getElementById('stat-total-books').textContent = data.total_ebooks;
        document.getElementById('stat-total-users').textContent = data.total_users;

        const badge = document.getElementById('badge-pending-count');
        if (data.pending_orders > 0) {
            badge.style.display = 'inline-flex';
            badge.textContent = data.pending_orders;
        } else {
            badge.style.display = 'none';
        }

        // Load recent orders in dashboard
        const ordersRes = await fetch('/api/admin/orders?status=pending');
        const pendingOrders = await ordersRes.json();
        const tbody = document.querySelector('#dashboard-recent-orders-table tbody');
        
        if (pendingOrders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:20px;">✓ ไม่มีคำสั่งซื้อที่รอการตรวจสอบในขณะนี้</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        pendingOrders.slice(0, 5).forEach(o => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong style="color:#38bdf8;">${o.order_number}</strong></td>
                <td>${o.full_name} (${o.username})</td>
                <td><strong>฿${parseFloat(o.total_amount).toFixed(2)}</strong></td>
                <td>${o.payment_method === 'promptpay_qr' ? 'PromptPay QR' : 'โอนเงิน'}</td>
                <td><span class="status-badge status-pending">รอตรวจสอบ</span></td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="openSlipModal(${JSON.stringify(o).replace(/"/g, '&quot;')})">
                        🔍 ตรวจสอบสลิป
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (err) {
        console.error('Dashboard stats error:', err);
    }
}

// ====================================================================
// 2. Orders Management
// ====================================================================

async function loadAdminOrders(status = 'all') {
    try {
        let url = `/api/admin/orders`;
        if (status && status !== 'all') url += `?status=${status}`;

        const res = await fetch(url);
        allAdminOrders = await res.json();
        renderAdminOrders(allAdminOrders);
    } catch (err) {
        console.error('Load admin orders error:', err);
    }
}

function filterAdminOrders(status, btn) {
    document.querySelectorAll('.order-filter-btn').forEach(b => {
        b.classList.remove('btn-primary', 'active');
        b.classList.add('btn-secondary');
    });
    btn.classList.add('btn-primary', 'active');
    btn.classList.remove('btn-secondary');
    loadAdminOrders(status);
}

function searchAdminOrders(query) {
    const q = query.toLowerCase().trim();
    if (!q) {
        renderAdminOrders(allAdminOrders);
        return;
    }
    const filtered = allAdminOrders.filter(o => 
        o.order_number.toLowerCase().includes(q) || 
        o.full_name.toLowerCase().includes(q) || 
        o.username.toLowerCase().includes(q)
    );
    renderAdminOrders(filtered);
}

function renderAdminOrders(orders) {
    const tbody = document.getElementById('admin-orders-tbody');
    if (!orders || orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--text-muted);">ไม่พบคำสั่งซื้อตามเงื่อนไข</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    orders.forEach(o => {
        const tr = document.createElement('tr');
        const itemsSummary = o.items ? o.items.map(i => `${i.title} (฿${i.price_at_purchase})`).join('<br>') : '-';
        
        let statusClass = o.status === 'confirmed' ? 'status-confirmed' : (o.status === 'pending' ? 'status-pending' : 'status-cancelled');
        let statusText = o.status === 'confirmed' ? '✓ ยืนยันแล้ว' : (o.status === 'pending' ? '⏳ รอตรวจสอบ' : '✕ ยกเลิก');

        let actionBtns = '';
        if (o.status === 'pending') {
            actionBtns = `
                <div style="display:flex; gap:6px;">
                    <button class="btn btn-primary btn-sm" onclick="openSlipModal(${JSON.stringify(o).replace(/"/g, '&quot;')})">
                        ตรวจสลิป
                    </button>
                    <button class="btn btn-secondary btn-sm" style="color:var(--danger);" onclick="updateOrderStatus(${o.order_id}, 'cancelled')">
                        ปฏิเสธ
                    </button>
                </div>
            `;
        } else if (o.status === 'confirmed') {
            actionBtns = `<span style="color:#10b981; font-size:0.85rem;">อนุมัติสิทธิ์แล้ว</span>`;
        } else {
            actionBtns = `<span style="color:var(--danger); font-size:0.85rem;">ยกเลิกแล้ว</span>`;
        }

        tr.innerHTML = `
            <td>
                <strong>${o.order_number}</strong><br>
                <span style="font-size:0.75rem; color:var(--text-muted);">${o.created_at}</span>
            </td>
            <td>
                <strong>${o.full_name}</strong><br>
                <span style="font-size:0.78rem; color:var(--text-muted);">${o.email}</span>
            </td>
            <td style="font-size:0.85rem; max-width:250px;">${itemsSummary}</td>
            <td><strong style="color:#38bdf8;">฿${parseFloat(o.total_amount).toFixed(2)}</strong></td>
            <td>
                ${o.slip_image_url ? `
                    <button class="btn btn-secondary btn-sm" onclick="openSlipModal(${JSON.stringify(o).replace(/"/g, '&quot;')})">
                        📷 ดูสลิป
                    </button>
                ` : '<span style="color:var(--text-muted); font-size:0.8rem;">ไม่มีสลิป</span>'}
            </td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>${actionBtns}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Slip Review Modal
function openSlipModal(order) {
    currentActiveOrder = order;
    const modal = document.getElementById('slip-modal');
    document.getElementById('slip-modal-title').textContent = `ตรวจสอบหลักฐานคำสั่งซื้อ: ${order.order_number}`;
    const imgEl = document.getElementById('slip-modal-img');
    imgEl.src = order.slip_image_url || '/assets/slips/slip_mock_01.png';
    imgEl.onerror = () => {
        imgEl.onerror = null;
        imgEl.src = '/assets/slips/slip_mock_01.svg';
    };

    const details = document.getElementById('slip-order-details');
    details.innerHTML = `
        <div><strong>ผู้สั่งซื้อ:</strong> ${order.full_name} (${order.username}) | โทร: ${order.phone || '-'}</div>
        <div><strong>ยอดชำระ:</strong> <span style="color:#38bdf8; font-weight:bold; font-size:1.1rem;">฿${parseFloat(order.total_amount).toFixed(2)}</span></div>
        <div><strong>ช่องทางจำลอง:</strong> ${order.payment_method === 'promptpay_qr' ? 'PromptPay QR' : 'โอนผ่านธนาคาร'}</div>
        <div><strong>วันที่แจ้งโอน:</strong> ${order.paid_at || order.created_at}</div>
    `;

    modal.classList.add('active');
}

function closeSlipModal() {
    document.getElementById('slip-modal').classList.remove('active');
    currentActiveOrder = null;
}

async function confirmOrderFromSlip() {
    if (!currentActiveOrder) return;
    await updateOrderStatus(currentActiveOrder.order_id, 'confirmed');
    closeSlipModal();
}

async function cancelOrderFromSlip() {
    if (!currentActiveOrder) return;
    if (!confirm('ต้องการปฏิเสธคำสั่งซื้อนี้หรือไม่?')) return;
    await updateOrderStatus(currentActiveOrder.order_id, 'cancelled');
    closeSlipModal();
}

async function updateOrderStatus(orderId, newStatus) {
    try {
        const res = await fetch(`/api/admin/orders/${orderId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus, note: newStatus === 'confirmed' ? 'ผู้ดูแลอนุมัติคำสั่งซื้อและสร้างสิทธิ์ดาวน์โหลด' : 'ปฏิเสธคำสั่งซื้อ' })
        });
        const data = await res.json();
        if (res.ok) {
            showToast(data.message);
            loadDashboardStats();
            loadAdminOrders();
        } else {
            showToast(data.error || 'เกิดข้อผิดพลาด', 'error');
        }
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// ====================================================================
// 3. E-Books Management
// ====================================================================

async function loadAdminEbooks() {
    try {
        const res = await fetch('/api/admin/ebooks');
        const books = await res.json();
        const tbody = document.getElementById('admin-ebooks-tbody');
        tbody.innerHTML = '';

        books.forEach(b => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${b.cover_image}" style="width:38px; height:50px; object-fit:cover; border-radius:4px;" alt=""></td>
                <td>
                    <strong>${b.title}</strong><br>
                    <span style="font-size:0.75rem; color:var(--text-muted);">${b.isbn || 'ไม่มี ISBN'}</span>
                </td>
                <td>${b.category_name}</td>
                <td>${b.author_name}</td>
                <td><strong style="color:#38bdf8;">฿${parseFloat(b.price).toFixed(2)}</strong></td>
                <td>
                    <span class="status-badge ${b.is_published ? 'status-confirmed' : 'status-cancelled'}">
                        ${b.is_published ? '✓ พร้อมขาย' : 'ปิดจำหน่าย'}
                    </span>
                </td>
                <td>
                    <div style="display:flex; gap:6px;">
                        <button class="btn btn-secondary btn-sm" onclick="openEditEbookModal(${JSON.stringify(b).replace(/"/g, '&quot;')})">
                            ✏️ แก้ไข
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="toggleBookPublish(${b.ebook_id})">
                            ${b.is_published ? 'ปิดการขาย' : 'เปิดการขาย'}
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error('Load admin ebooks error:', err);
    }
}

async function toggleBookPublish(ebookId) {
    try {
        const res = await fetch(`/api/admin/ebooks/${ebookId}/toggle`, { method: 'PUT' });
        const data = await res.json();
        if (res.ok) {
            showToast(data.message);
            loadAdminEbooks();
            loadDashboardStats();
        }
    } catch (err) {
        showToast('เกิดข้อผิดพลาด', 'error');
    }
}

async function loadAuthorsAndCategories() {
    try {
        const catRes = await fetch('/api/categories');
        allAdminCategories = await catRes.json();
        const catSelect = document.getElementById('new-book-category');
        catSelect.innerHTML = allAdminCategories.map(c => `<option value="${c.category_id}">${c.name}</option>`).join('');

        const authRes = await fetch('/api/admin/authors');
        allAdminAuthors = await authRes.json();
        const authSelect = document.getElementById('new-book-author');
        authSelect.innerHTML = allAdminAuthors.map(a => `<option value="${a.author_id}">${a.name}</option>`).join('');
    } catch (err) {
        console.error('Load authors/cats error:', err);
    }
}

function openAddEbookModal() {
    document.getElementById('add-ebook-modal').classList.add('active');
}
function closeAddEbookModal() {
    document.getElementById('add-ebook-modal').classList.remove('active');
}

async function submitNewEbook(e) {
    e.preventDefault();
    const title = document.getElementById('new-book-title').value;
    const category_id = document.getElementById('new-book-category').value;
    const author_id = document.getElementById('new-book-author').value;
    const price = document.getElementById('new-book-price').value;
    const isbn = document.getElementById('new-book-isbn').value;
    const description = document.getElementById('new-book-desc').value;

    try {
        const res = await fetch('/api/admin/ebooks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title, category_id, author_id, price, isbn, description,
                cover_image: '/assets/covers/default.svg',
                full_file_url: '/downloads/full_db_guide.pdf'
            })
        });
        const data = await res.json();
        if (res.ok) {
            showToast('✓ เพิ่มหนังสือเล่มใหม่เรียบร้อย');
            closeAddEbookModal();
            loadAdminEbooks();
            loadDashboardStats();
            document.getElementById('add-ebook-form').reset();
        } else {
            showToast(data.error || 'เกิดข้อผิดพลาด', 'error');
        }
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// ====================================================================
// 4. The 4 Analytical Reports (ไฮไลท์ของโครงงาน)
// ====================================================================

async function loadAllReports() {
    loadReport1();
    loadReport2();
    loadReport3();
    loadReport4();
}

// รายงานที่ 1: ยอดขายตามช่วงเวลา
async function loadReport1() {
    try {
        const res = await fetch('/api/admin/reports/sales-over-time');
        const data = await res.json();
        const tbody = document.querySelector('#report1-table tbody');
        tbody.innerHTML = '';

        data.monthly.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${row.sale_period}</strong></td>
                <td>${row.total_orders} ออเดอร์</td>
                <td><strong style="color:#10b981;">฿${parseFloat(row.gross_sales).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</strong></td>
                <td>฿${parseFloat(row.average_order_value).toFixed(2)}</td>
                <td>฿${parseFloat(row.min_order_amount).toFixed(2)}</td>
                <td>฿${parseFloat(row.max_order_amount).toFixed(2)}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error('Report 1 error:', err);
    }
}

// รายงานที่ 2: E-Book ขายดีที่สุด
async function loadReport2() {
    try {
        const res = await fetch('/api/admin/reports/best-sellers');
        const data = await res.json();
        const tbody = document.querySelector('#report2-table tbody');
        tbody.innerHTML = '';

        data.forEach((b, index) => {
            const tr = document.createElement('tr');
            const medal = index === 0 ? '🥇 ' : (index === 1 ? '🥈 ' : (index === 2 ? '🥉 ' : ''));
            tr.innerHTML = `
                <td><strong>${medal}#${index + 1}</strong></td>
                <td><strong>${b.ebook_title}</strong></td>
                <td>${b.author_name}</td>
                <td><span class="status-badge" style="background:rgba(56,189,248,0.1); color:#38bdf8;">${b.category_name}</span></td>
                <td>฿${parseFloat(b.current_price).toFixed(2)}</td>
                <td><strong style="color:#f59e0b; font-size:1.05rem;">${b.total_copies_sold} เล่ม</strong></td>
                <td><strong style="color:#10b981;">฿${parseFloat(b.total_revenue).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</strong></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error('Report 2 error:', err);
    }
}

// รายงานที่ 3: ยอดขายตามหมวดหมู่
async function loadReport3() {
    try {
        const res = await fetch('/api/admin/reports/sales-by-category');
        const data = await res.json();
        const tbody = document.querySelector('#report3-table tbody');
        tbody.innerHTML = '';

        data.forEach(c => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${c.category_name}</strong></td>
                <td>${c.total_active_titles} เล่ม</td>
                <td>${c.total_items_sold} รายการ</td>
                <td><strong style="color:#10b981;">฿${parseFloat(c.total_category_revenue).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</strong></td>
                <td>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <div style="flex:1; height:8px; background:var(--bg-surface-elevated); border-radius:4px; overflow:hidden;">
                            <div style="width:${c.revenue_percentage}%; height:100%; background:linear-gradient(90deg, #6366f1, #38bdf8);"></div>
                        </div>
                        <span style="font-weight:bold; font-size:0.85rem; width:45px;">${c.revenue_percentage}%</span>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error('Report 3 error:', err);
    }
}

// รายงานที่ 4: พฤติกรรมลูกค้าและคำสั่งซื้อ
async function loadReport4() {
    try {
        const res = await fetch('/api/admin/reports/customer-insights');
        const data = await res.json();
        const tbody = document.querySelector('#report4-table tbody');
        tbody.innerHTML = '';

        data.customers.forEach(u => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${u.full_name}</strong></td>
                <td>${u.username} <span style="color:var(--text-muted); font-size:0.8rem;">(${u.email})</span></td>
                <td><strong>${u.total_orders}</strong></td>
                <td><span class="status-badge status-confirmed">${u.confirmed_orders}</span></td>
                <td><span class="status-badge status-pending">${u.pending_orders}</span></td>
                <td><span class="status-badge status-cancelled">${u.cancelled_orders}</span></td>
                <td><strong style="color:#10b981; font-size:1.05rem;">฿${parseFloat(u.total_spent).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</strong></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error('Report 4 error:', err);
    }
}

// ====================================================================
// 5. Users & Roles
// ====================================================================

async function loadAdminUsers() {
    try {
        const res = await fetch('/api/admin/users');
        const users = await res.json();
        const tbody = document.getElementById('admin-users-tbody');
        tbody.innerHTML = '';

        users.forEach(u => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${u.user_id}</td>
                <td><strong>${u.full_name}</strong></td>
                <td>${u.username}</td>
                <td>${u.email}</td>
                <td>${u.total_orders} ออเดอร์</td>
                <td>
                    <span class="status-badge ${u.role_id === 2 ? 'status-confirmed' : 'status-pending'}">
                        ${u.role_name === 'admin' ? '🛡️ ผู้ดูแลระบบ (Admin)' : '👤 ลูกค้า (Customer)'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="toggleUserRole(${u.user_id}, ${u.role_id})">
                        ${u.role_id === 2 ? 'เปลี่ยนเป็นลูกค้า' : 'เลื่อนขั้นเป็น Admin'}
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error('Load admin users error:', err);
    }
}

async function toggleUserRole(userId, currentRoleId) {
    const newRoleId = currentRoleId === 2 ? 1 : 2;
    try {
        const res = await fetch(`/api/admin/users/${userId}/role`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role_id: newRoleId })
        });
        if (res.ok) {
            showToast('ปรับปรุงสิทธิ์บทบาทสำเร็จ');
            loadAdminUsers();
        }
    } catch (err) {
        showToast('เกิดข้อผิดพลาด', 'error');
    }
}

// ====================================================================
// 6. Edit E-Book Modal Functions (ตรงตามข้อ 3: แก้ไขราคาและลิงก์ดาวน์โหลด)
// ====================================================================

function openEditEbookModal(book) {
    document.getElementById('edit-book-id').value = book.ebook_id;
    document.getElementById('edit-book-title').value = book.title;
    document.getElementById('edit-book-price').value = book.price;
    document.getElementById('edit-book-isbn').value = book.isbn || '';
    document.getElementById('edit-book-desc').value = book.description || '';
    document.getElementById('edit-book-file-url').value = book.full_file_url || '/downloads/full_db_guide.pdf';

    const catSelect = document.getElementById('edit-book-category');
    catSelect.innerHTML = allAdminCategories.map(c => 
        `<option value="${c.category_id}" ${c.category_id == book.category_id ? 'selected' : ''}>${c.name}</option>`
    ).join('');

    const authSelect = document.getElementById('edit-book-author');
    authSelect.innerHTML = allAdminAuthors.map(a => 
        `<option value="${a.author_id}" ${a.author_id == book.author_id ? 'selected' : ''}>${a.name}</option>`
    ).join('');

    document.getElementById('edit-ebook-modal').classList.add('active');
}

function closeEditEbookModal() {
    document.getElementById('edit-ebook-modal').classList.remove('active');
}

async function submitEditEbook(e) {
    e.preventDefault();
    const ebookId = document.getElementById('edit-book-id').value;
    const title = document.getElementById('edit-book-title').value;
    const category_id = document.getElementById('edit-book-category').value;
    const author_id = document.getElementById('edit-book-author').value;
    const price = document.getElementById('edit-book-price').value;
    const isbn = document.getElementById('edit-book-isbn').value;
    const description = document.getElementById('edit-book-desc').value;
    const full_file_url = document.getElementById('edit-book-file-url').value;

    try {
        const res = await fetch(`/api/admin/ebooks/${ebookId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title, category_id, author_id, price, isbn, description, full_file_url
            })
        });
        const data = await res.json();
        if (res.ok) {
            showToast('✓ แก้ไขข้อมูลหนังสือและลิงก์ดาวน์โหลดสำเร็จ');
            closeEditEbookModal();
            loadAdminEbooks();
        } else {
            showToast(data.error || 'เกิดข้อผิดพลาด', 'error');
        }
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// ====================================================================
// 7. Categories Management Functions (ตรงตามข้อ 3: จัดการหมวดหมู่)
// ====================================================================

async function loadAdminCategories() {
    try {
        const res = await fetch('/api/categories');
        allAdminCategories = await res.json();
        const tbody = document.getElementById('admin-categories-tbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        allAdminCategories.forEach(c => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${c.category_id}</td>
                <td><strong>${c.name}</strong></td>
                <td><code>${c.slug}</code></td>
                <td style="color:var(--text-secondary); font-size:0.85rem;">${c.description || '-'}</td>
                <td><strong style="color:#38bdf8;">${c.book_count || 0} เล่ม</strong></td>
                <td>
                    <span class="status-badge ${c.is_active ? 'status-confirmed' : 'status-cancelled'}">
                        ${c.is_active ? '✓ ใช้งานอยู่' : 'ปิดใช้งาน'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="toggleCategoryActive(${c.category_id}, ${c.is_active})">
                        ${c.is_active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error('Load admin categories error:', err);
    }
}

function openAddCategoryModal() {
    document.getElementById('add-category-modal').classList.add('active');
}
function closeAddCategoryModal() {
    document.getElementById('add-category-modal').classList.remove('active');
}

async function submitNewCategory(e) {
    e.preventDefault();
    const name = document.getElementById('new-cat-name').value;
    const slug = document.getElementById('new-cat-slug').value;
    const description = document.getElementById('new-cat-desc').value;

    try {
        const res = await fetch('/api/admin/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, slug, description })
        });
        const data = await res.json();
        if (res.ok) {
            showToast('✓ เพิ่มหมวดหมู่หนังสือสำเร็จ');
            closeAddCategoryModal();
            loadAdminCategories();
            loadAuthorsAndCategories();
            document.getElementById('add-category-form').reset();
        } else {
            showToast(data.error || 'เกิดข้อผิดพลาด', 'error');
        }
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function toggleCategoryActive(catId, currentActive) {
    const newStatus = currentActive === 1 ? 0 : 1;
    try {
        const res = await fetch(`/api/admin/categories/${catId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_active: newStatus })
        });
        if (res.ok) {
            showToast('ปรับปรุงสถานะหมวดหมู่สำเร็จ');
            loadAdminCategories();
            loadAuthorsAndCategories();
        }
    } catch (err) {
        showToast('เกิดข้อผิดพลาด', 'error');
    }
}

// ====================================================================
// 8. CSV Export Functions (ตรงตามข้อ 3: export รายงานและข้อมูล)
// ====================================================================

function downloadCSV(csvContent, filename) {
    // Add UTF-8 BOM for Thai language support in MS Excel
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`✓ ดาวน์โหลดไฟล์ ${filename}.csv เรียบร้อย`);
}

function exportOrdersToCSV() {
    if (!allAdminOrders || allAdminOrders.length === 0) {
        showToast('ไม่มีข้อมูลคำสั่งซื้อที่จะส่งออก', 'error');
        return;
    }

    let csv = 'เลขคำสั่งซื้อ,ชื่อลูกค้า,ชื่อบัญชี,อีเมล,ยอดเงิน (บาท),ช่องทางชำระเงิน,สถานะคำสั่งซื้อ,สถานะชำระเงิน,วันที่สั่งซื้อ\n';
    allAdminOrders.forEach(o => {
        csv += `"${o.order_number}","${o.full_name}","${o.username}","${o.email}",${o.total_amount},"${o.payment_method}","${o.status}","${o.payment_status}","${o.created_at}"\n`;
    });

    downloadCSV(csv, 'orders_export');
}

function exportReportToCSV(reportNum, filename) {
    const table = document.getElementById(`report${reportNum}-table`);
    if (!table) return;

    let csv = '';
    const rows = table.querySelectorAll('tr');
    rows.forEach(r => {
        const cols = r.querySelectorAll('th, td');
        const rowData = [];
        cols.forEach(c => {
            let text = c.innerText.replace(/"/g, '""').trim();
            // remove non-breaking spaces or currency icons if needed
            rowData.push(`"${text}"`);
        });
        csv += rowData.join(',') + '\n';
    });

    downloadCSV(csv, `report_${reportNum}_${filename}`);
}
