// ====================================================================
// EBOOK_ONLINE: Admin Portal & Analytics (JavaScript)
// ====================================================================

let currentUserId = parseInt(localStorage.getItem('ebook_user_id')) || 2;

async function apiFetch(url, options = {}) {
    const headers = options.headers || {};
    headers['x-user-id'] = currentUserId;
    options.headers = headers;
    return await fetch(url, options);
}

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

// Admin Logout
async function adminLogout() {
    if (confirm('คุณต้องการออกจากระบบผู้ดูแล (Admin) ใช่หรือไม่?')) {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (e) {}
        localStorage.removeItem('ebook_user_id');
        localStorage.removeItem('ebook_user_name');
        localStorage.removeItem('ebook_user_role');
        localStorage.setItem('ebook_is_guest', 'true');
        window.location.href = '/auth.html?tab=login';
    }
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
    if (tabName === 'users') loadAdminUsers();
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
            const slipBtn = o.slip_image_url 
                ? `<button class="btn btn-primary btn-sm" onclick="openSlipModal(${JSON.stringify(o).replace(/"/g, '&quot;')})">🔍 ตรวจสอบสลิป</button>`
                : `<button class="btn btn-warning btn-sm" style="background:rgba(245,158,11,0.15); border:1px solid #f59e0b; color:#fbbf24; font-size:0.8rem; font-weight:600;" onclick="openSlipModal(${JSON.stringify(o).replace(/"/g, '&quot;')})">⚠️ ตรวจสอบ (ไม่มีสลิป)</button>`;

            tr.innerHTML = `
                <td><strong style="color:#38bdf8;">${o.order_number}</strong></td>
                <td>${o.full_name} (${o.username})</td>
                <td><strong>฿${parseFloat(o.total_amount).toFixed(2)}</strong></td>
                <td>${o.payment_method === 'promptpay_qr' ? 'PromptPay QR' : 'โอนเงิน'}</td>
                <td><span class="status-badge status-pending">รอตรวจสอบ</span></td>
                <td>
                    ${slipBtn}
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
        const itemsSummary = (o.items && o.items.length > 0) 
            ? o.items.map(i => `${i.title} (฿${i.price_at_purchase})`).join('<br>') 
            : '<span style="color:var(--text-muted); font-size:0.8rem;">- ไม่พบข้อมูลสินค้า -</span>';
        
        let statusClass = o.status === 'confirmed' ? 'status-confirmed' : (o.status === 'pending' ? 'status-pending' : 'status-cancelled');
        let statusText = o.status === 'confirmed' ? '✓ ยืนยันแล้ว' : (o.status === 'pending' ? '⏳ รอตรวจสอบ' : '✕ ยกเลิก');

        let actionBtns = '';
        if (o.status === 'pending') {
            if (o.slip_image_url) {
                actionBtns = `
                    <div style="display:flex; gap:6px;">
                        <button class="btn btn-primary btn-sm" onclick="openSlipModal(${JSON.stringify(o).replace(/"/g, '&quot;')})">
                            ตรวจสลิป
                        </button>
                        <button class="btn btn-secondary btn-sm" style="color:var(--danger); border-color:var(--danger);" onclick="updateOrderStatus(${o.order_id}, 'cancelled')">
                            ปฏิเสธ
                        </button>
                    </div>
                `;
            } else {
                actionBtns = `
                    <div style="display:flex; gap:6px;">
                        <button class="btn btn-warning btn-sm" style="background:rgba(245,158,11,0.15); border:1px solid #f59e0b; color:#fbbf24; font-size:0.8rem; font-weight:600;" onclick="openSlipModal(${JSON.stringify(o).replace(/"/g, '&quot;')})">
                            ⚠️ ตรวจสอบ (ไม่มีสลิป)
                        </button>
                        <button class="btn btn-secondary btn-sm" style="color:var(--danger); border-color:var(--danger); font-weight:600;" onclick="updateOrderStatus(${o.order_id}, 'cancelled')">
                            ปฏิเสธ
                        </button>
                    </div>
                `;
            }
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
                ` : '<span style="color:#f87171; background:rgba(239,68,68,0.15); padding:3px 8px; border-radius:4px; font-size:0.78rem; border:1px solid rgba(239,68,68,0.3); font-weight:600; display:inline-block;">⚠️ ไม่มีสลิป</span>'}
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
    const imgContainer = document.getElementById('slip-img-container');
    const alertNoSlip = document.getElementById('slip-no-evidence-alert');
    const imgEl = document.getElementById('slip-modal-img');
    const btnApprove = document.getElementById('btn-approve-slip');
    const btnReject = document.getElementById('btn-reject-slip');
    const titleEl = document.getElementById('slip-modal-title');

    const hasSlip = !!order.slip_image_url;

    if (!hasSlip) {
        // ORDER HAS NO SLIP!
        titleEl.innerHTML = `⚠️ ตรวจสอบคำสั่งซื้อ: <span style="color:#f87171;">${order.order_number}</span> (ไม่มีสลิป)`;
        if (imgContainer) imgContainer.style.display = 'none';
        if (imgEl) {
            imgEl.src = '';
            imgEl.onerror = null;
        }
        if (alertNoSlip) alertNoSlip.style.display = 'block';

        if (btnApprove) {
            btnApprove.style.opacity = '0.5';
            btnApprove.textContent = '⚠️ อนุมัติ (ไม่มีสลิป)';
            btnApprove.title = 'คำสั่งซื้อนี้ยังไม่มีสลิปหลักฐานการโอนเงิน';
        }
        if (btnReject) {
            btnReject.style.background = '#ef4444';
            btnReject.style.color = '#ffffff';
            btnReject.style.fontWeight = 'bold';
            btnReject.textContent = '✕ ปฏิเสธคำสั่งซื้อ';
        }
    } else {
        // ORDER HAS SLIP
        titleEl.textContent = `ตรวจสอบหลักฐานคำสั่งซื้อ: ${order.order_number}`;
        if (alertNoSlip) alertNoSlip.style.display = 'none';
        if (imgContainer) imgContainer.style.display = 'block';

        if (imgEl) {
            const dynamicSlipUrl = `/api/orders/${order.order_id}/slip?t=${Date.now()}`;
            imgEl.src = dynamicSlipUrl;
            imgEl.onerror = () => {
                imgEl.onerror = null;
                imgEl.src = `/api/slips/preview?amount=${order.total_amount}&name=${encodeURIComponent(order.full_name || order.username || 'ลูกค้า')}&order_number=${encodeURIComponent(order.order_number)}&method=${order.payment_method || 'promptpay_qr'}`;
            };
        }

        if (btnApprove) {
            btnApprove.style.opacity = '1';
            btnApprove.textContent = '✓ อนุมัติ & ปลดล็อกดาวน์โหลด';
            btnApprove.title = '';
        }
        if (btnReject) {
            btnReject.style.background = 'transparent';
            btnReject.style.color = 'var(--danger)';
            btnReject.style.fontWeight = 'normal';
            btnReject.textContent = '✕ ปฏิเสธคำสั่งซื้อ';
        }
    }

    const details = document.getElementById('slip-order-details');
    details.innerHTML = `
        <div><strong>ผู้สั่งซื้อ:</strong> ${order.full_name} (${order.username}) | โทร: ${order.phone || '-'}</div>
        <div><strong>ยอดชำระ:</strong> <span style="color:#38bdf8; font-weight:bold; font-size:1.1rem;">฿${parseFloat(order.total_amount).toFixed(2)}</span></div>
        <div><strong>ช่องทาง:</strong> ${order.payment_method === 'promptpay_qr' ? 'PromptPay QR' : 'โอนผ่านธนาคาร'}</div>
        <div><strong>สถานะหลักฐาน:</strong> ${hasSlip ? '<span style="color:#34d399; font-weight:600;">✓ แนบสลิปแล้ว</span>' : '<span style="color:#f87171; font-weight:bold;">✕ ยังไม่ได้แนบสลิป (ค้างชำระ)</span>'}</div>
        <div><strong>วันที่สร้างรายการ:</strong> ${order.created_at || '-'}</div>
        ${order.note ? `<div><strong>หมายเหตุ:</strong> <span style="color:var(--text-muted);">${order.note}</span></div>` : ''}
    `;

    modal.classList.add('active');
}

function closeSlipModal() {
    document.getElementById('slip-modal').classList.remove('active');
    currentActiveOrder = null;
}

async function confirmOrderFromSlip() {
    if (!currentActiveOrder) return;
    if (!currentActiveOrder.slip_image_url) {
        if (!confirm('⚠️ คำเตือน: คำสั่งซื้อนี้ยังไม่มีสลิปหลักฐานการชำระเงิน!\n\nคุณแน่ใจหรือไม่ว่าต้องการอนุมัติและปลดล็อกสิทธิ์ดาวน์โหลดให้ลูกค้า?')) {
            return;
        }
    }
    await updateOrderStatus(currentActiveOrder.order_id, 'confirmed');
    closeSlipModal();
}

async function cancelOrderFromSlip() {
    if (!currentActiveOrder) return;
    const reason = !currentActiveOrder.slip_image_url ? ' (เนื่องจากไม่แนบสลิป)' : '';
    if (!confirm(`ต้องการปฏิเสธคำสั่งซื้อนี้หรือไม่?${reason}`)) return;
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

let allAdminEbooksList = [];

async function loadAdminEbooks() {
    try {
        const res = await fetch('/api/admin/ebooks');
        const books = await res.json();
        allAdminEbooksList = books;
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
                    <div style="display:flex; gap:6px; flex-wrap:wrap;">
                        <button class="btn btn-secondary btn-sm" onclick="openEditEbookModal(${b.ebook_id})">
                            ✏️ แก้ไข
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="toggleBookPublish(${b.ebook_id})">
                            ${b.is_published ? 'ปิดการขาย' : 'เปิดการขาย'}
                        </button>
                        <button class="btn btn-sm" onclick="deleteEbook(${b.ebook_id})" style="background:rgba(239, 68, 68, 0.15); color:#ef4444; border:1px solid rgba(239, 68, 68, 0.35); font-weight:500;">
                            🗑️ ลบ
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

async function deleteEbook(ebookId) {
    const book = allAdminEbooksList.find(b => b.ebook_id == ebookId);
    const bookTitle = book ? book.title : `รหัส #${ebookId}`;

    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบหนังสือ:\n"${bookTitle}"`)) {
        return;
    }

    try {
        const res = await fetch(`/api/admin/ebooks/${ebookId}`, {
            method: 'DELETE'
        });
        const data = await res.json();

        if (res.ok) {
            showToast(`✓ ${data.message || 'ลบหนังสือเรียบร้อยแล้ว'}`);
            loadAdminEbooks();
            loadDashboardStats();
            return;
        }

        // กรณีหนังสือมีประวัติการสั่งซื้ออยู่แล้ว
        if (data.has_orders) {
            const forceConfirm = confirm(
                `⚠️ แจ้งเตือนความปลอดภัยของข้อมูล:\n\n` +
                `หนังสือ "${bookTitle}" มีประวัติการสั่งซื้อไปแล้ว ${data.order_count} รายการ\n\n` +
                `• คำแนะนำ: ควรเลือก "ยกเลิก (Cancel)" แล้วคลิกปุ่ม "ปิดการขาย" เพื่อไม่ให้ลูกค้าใหม่ซื้อได้ แต่ลูกค้าที่เคยซื้อแล้วยังดูประวัติและดาวน์โหลดได้ตามปกติ\n\n` +
                `• หากต้องการลบข้อมูลหนังสือและประวัติการสั่งซื้อที่เกี่ยวข้องออกทั้งหมดจริงๆ ให้กด "ตกลง (OK)" เพื่อยืนยันการลบแบบบังคับ (Force Delete)`
            );

            if (forceConfirm) {
                const forceRes = await fetch(`/api/admin/ebooks/${ebookId}?force=true`, {
                    method: 'DELETE'
                });
                const forceData = await forceRes.json();
                if (forceRes.ok) {
                    showToast(`✓ ${forceData.message || 'ลบหนังสือและข้อมูลที่เกี่ยวข้องเรียบร้อยแล้ว'}`);
                    loadAdminEbooks();
                    loadDashboardStats();
                } else {
                    showToast(forceData.error || 'ไม่สามารถลบได้', 'error');
                }
            }
        } else {
            showToast(data.error || 'เกิดข้อผิดพลาดในการลบหนังสือ', 'error');
        }
    } catch (err) {
        console.error('Delete ebook error:', err);
        showToast('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', 'error');
    }
}

async function loadAuthorsAndCategories() {
    try {
        const catRes = await fetch('/api/categories');
        allAdminCategories = await catRes.json();
        const catSelect = document.getElementById('new-book-category');
        if (catSelect) catSelect.innerHTML = allAdminCategories.map(c => `<option value="${c.category_id}">${c.name}</option>`).join('');

        const authRes = await fetch('/api/admin/authors');
        allAdminAuthors = await authRes.json();
        const authSelect = document.getElementById('new-book-author');
        if (authSelect) authSelect.innerHTML = allAdminAuthors.map(a => `<option value="${a.author_id}">${a.name}</option>`).join('');

        loadAdminAuthorsTable();
    } catch (err) {
        console.error('Load authors/cats error:', err);
    }
}

function loadAdminAuthorsTable() {
    const tbody = document.getElementById('admin-authors-tbody');
    if (!tbody || !allAdminAuthors) return;
    tbody.innerHTML = '';

    allAdminAuthors.forEach(a => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${a.author_id}</td>
            <td><strong>${a.name}</strong></td>
            <td>${a.email ? `<a href="mailto:${a.email}" style="color:#38bdf8;">${a.email}</a>` : '<span style="color:var(--text-muted);">-</span>'}</td>
            <td style="color:var(--text-secondary); font-size:0.85rem; max-width:250px;">${a.bio || '-'}</td>
            <td><strong style="color:#10b981;">${a.book_count || 0} เล่ม</strong></td>
            <td>
                <button class="btn btn-sm" onclick="deleteAuthor(${a.author_id}, '${a.name.replace(/'/g, "\\'")}', ${a.book_count || 0})" style="background:rgba(239,68,68,0.15); color:#ef4444; border:1px solid rgba(239,68,68,0.3); font-size:0.8rem; padding:4px 8px; border-radius:4px; cursor:pointer;">
                    🗑️ ลบ
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

let targetAuthorSelectId = null;

function openAddAuthorModal(targetSelectId = null) {
    targetAuthorSelectId = targetSelectId;
    document.getElementById('add-author-modal').classList.add('active');
}

function closeAddAuthorModal() {
    document.getElementById('add-author-modal').classList.remove('active');
    document.getElementById('add-author-form').reset();
    targetAuthorSelectId = null;
}

async function submitNewAuthor(e) {
    e.preventDefault();
    const name = document.getElementById('new-author-name').value;
    const email = document.getElementById('new-author-email').value;
    const bio = document.getElementById('new-author-bio').value;

    try {
        const res = await fetch('/api/admin/authors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, bio })
        });
        const data = await res.json();
        if (res.ok) {
            showToast(`✓ ${data.message || 'เพิ่มผู้แต่งเรียบร้อยแล้ว'}`);
            closeAddAuthorModal();
            await loadAuthorsAndCategories();

            // If opened from a book modal, select the new author immediately!
            if (targetAuthorSelectId) {
                const selectEl = document.getElementById(targetAuthorSelectId);
                if (selectEl) {
                    selectEl.value = data.author_id;
                }
            }
        } else {
            showToast(data.error || 'เกิดข้อผิดพลาด', 'error');
        }
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function deleteAuthor(authorId, authorName, bookCount) {
    if (bookCount > 0) {
        alert(`ไม่สามารถลบผู้แต่ง "${authorName}" ได้\nเนื่องจากมีหนังสือในระบบผูกอยู่ ${bookCount} เล่ม (กรุณาลบหรือเปลี่ยนผู้แต่งของหนังสือก่อน)`);
        return;
    }

    if (!confirm(`คุณต้องการลบผู้แต่ง "${authorName}" ใช่หรือไม่?`)) {
        return;
    }

    try {
        const res = await fetch(`/api/admin/authors/${authorId}`, {
            method: 'DELETE'
        });
        const data = await res.json();
        if (res.ok) {
            showToast(`✓ ${data.message || 'ลบผู้แต่งเรียบร้อยแล้ว'}`);
            loadAuthorsAndCategories();
        } else {
            showToast(data.error || 'เกิดข้อผิดพลาดในการลบ', 'error');
        }
    } catch (err) {
        showToast('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', 'error');
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
    const fileInput = document.getElementById('new-book-cover-file');
    const coverUrlInput = document.getElementById('new-book-cover-url');

    const pdfFileInput = document.getElementById('new-book-pdf-file');
    const pdfUrlInput = document.getElementById('new-book-file-url');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('category_id', category_id);
    formData.append('author_id', author_id);
    formData.append('price', price);
    formData.append('isbn', isbn);
    formData.append('description', description);

    if (pdfFileInput && pdfFileInput.files && pdfFileInput.files[0]) {
        formData.append('pdf_file', pdfFileInput.files[0]);
    } else if (pdfUrlInput && pdfUrlInput.value.trim()) {
        formData.append('full_file_url', pdfUrlInput.value.trim());
    } else {
        formData.append('full_file_url', '/downloads/full_db_guide.pdf');
    }

    if (fileInput && fileInput.files && fileInput.files[0]) {
        formData.append('cover_file', fileInput.files[0]);
    } else if (coverUrlInput && coverUrlInput.value.trim()) {
        formData.append('cover_image', coverUrlInput.value.trim());
    } else {
        formData.append('cover_image', '/assets/covers/default.svg');
    }

    try {
        const res = await fetch('/api/admin/ebooks', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        if (res.ok) {
            showToast('✓ เพิ่มหนังสือเล่มใหม่เรียบร้อย');
            closeAddEbookModal();
            loadAdminEbooks();
            loadDashboardStats();
            document.getElementById('add-ebook-form').reset();
            const previewImg = document.getElementById('new-book-cover-preview');
            if (previewImg) previewImg.src = '/assets/covers/default.svg';
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

// รายงานที่ 1: สรุปยอดขายและจำนวนเล่มที่ขายได้ของหนังสือแต่ละเล่ม
async function loadReport1() {
    try {
        const res = await fetch('/api/admin/reports/sales-by-book');
        const data = await res.json();
        const tbody = document.querySelector('#report1-table tbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        data.forEach((row, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${idx + 1}</strong></td>
                <td><strong>${row.title}</strong></td>
                <td><strong style="color:#f59e0b; font-size:1.05rem;">${row.total_sold} เล่ม</strong></td>
                <td><strong style="color:#10b981; font-size:1.05rem;">฿${parseFloat(row.total_sales).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</strong></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error('Report 1 error:', err);
    }
}

// รายงานที่ 2: จัดอันดับ E-Book ขายดีที่สุด 3 อันดับแรก (Top 3 Bestsellers)
async function loadReport2() {
    try {
        const res = await fetch('/api/admin/reports/best-sellers-top3');
        const data = await res.json();
        const tbody = document.querySelector('#report2-table tbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        data.forEach((b, index) => {
            const tr = document.createElement('tr');
            const medal = index === 0 ? '🥇 อันดับ 1' : (index === 1 ? '🥈 อันดับ 2' : '🥉 อันดับ 3');
            const medalColor = index === 0 ? '#f59e0b' : (index === 1 ? '#94a3b8' : '#d97706');
            tr.innerHTML = `
                <td><strong style="color:${medalColor}; font-size:1.05rem;">${medal}</strong></td>
                <td><strong>${b.title}</strong></td>
                <td><strong style="color:#10b981; font-size:1.15rem;">${b.total_sold} เล่ม</strong></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error('Report 2 error:', err);
    }
}

// รายงานที่ 3: สรุปประสิทธิภาพช่องทางชำระเงินและยอดเฉลี่ยต่อบิล
async function loadReport3() {
    try {
        const res = await fetch('/api/admin/reports/payment-methods');
        const data = await res.json();
        const tbody = document.querySelector('#report3-table tbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        const methodNames = {
            'promptpay_qr': '📱 PromptPay QR (พร้อมเพย์)',
            'bank_transfer': '🏦 โอนผ่านธนาคาร (Bank Transfer)',
            'mock_gateway': '💳 บัตรเครดิต/เกตเวย์จำลอง'
        };

        data.forEach(m => {
            const tr = document.createElement('tr');
            const name = methodNames[m.payment_method] || m.payment_method;
            tr.innerHTML = `
                <td><strong>${name}</strong></td>
                <td>${m.total_orders} ออเดอร์</td>
                <td><strong style="color:#10b981;">฿${parseFloat(m.total_sales).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</strong></td>
                <td><strong style="color:#38bdf8;">฿${parseFloat(m.avg_sales).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</strong></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error('Report 3 error:', err);
    }
}

// รายงานที่ 4: ค้นหาลูกค้าประจำที่ซื้อตั้งแต่ 2 ครั้งขึ้นไป (Customer Insights)
async function loadReport4() {
    try {
        const res = await fetch('/api/admin/reports/repeat-customers');
        const data = await res.json();
        const tbody = document.querySelector('#report4-table tbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        data.forEach((u, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${idx + 1}</strong></td>
                <td><strong>${u.full_name}</strong></td>
                <td><span class="status-badge status-confirmed">${u.total_orders} ครั้ง</span></td>
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

function openEditEbookModal(bookOrId) {
    const book = (typeof bookOrId === 'object') ? bookOrId : allAdminEbooksList.find(b => b.ebook_id == bookOrId);
    if (!book) return;

    document.getElementById('edit-book-id').value = book.ebook_id;
    document.getElementById('edit-book-title').value = book.title;
    document.getElementById('edit-book-price').value = book.price;
    document.getElementById('edit-book-isbn').value = book.isbn || '';
    document.getElementById('edit-book-desc').value = book.description || '';
    document.getElementById('edit-book-file-url').value = book.full_file_url || '/downloads/full_db_guide.pdf';

    // Populate Cover Image Preview & URL
    const previewImg = document.getElementById('edit-book-cover-preview');
    if (previewImg) previewImg.src = book.cover_image || '/assets/covers/default.svg';
    const coverUrlInput = document.getElementById('edit-book-cover-url');
    if (coverUrlInput) coverUrlInput.value = book.cover_image || '';
    const fileInput = document.getElementById('edit-book-cover-file');
    if (fileInput) fileInput.value = '';
    const pdfFileInput = document.getElementById('edit-book-pdf-file');
    if (pdfFileInput) pdfFileInput.value = '';

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

function deleteEbookFromEditModal() {
    const ebookId = document.getElementById('edit-book-id').value;
    if (ebookId) {
        closeEditEbookModal();
        deleteEbook(ebookId);
    }
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
    const fileInput = document.getElementById('edit-book-cover-file');
    const coverUrlInput = document.getElementById('edit-book-cover-url');
    const pdfFileInput = document.getElementById('edit-book-pdf-file');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('category_id', category_id);
    formData.append('author_id', author_id);
    formData.append('price', price);
    formData.append('isbn', isbn);
    formData.append('description', description);
    formData.append('full_file_url', full_file_url);

    if (pdfFileInput && pdfFileInput.files && pdfFileInput.files[0]) {
        formData.append('pdf_file', pdfFileInput.files[0]);
    }

    if (fileInput && fileInput.files && fileInput.files[0]) {
        formData.append('cover_file', fileInput.files[0]);
    } else if (coverUrlInput && coverUrlInput.value.trim()) {
        formData.append('cover_image', coverUrlInput.value.trim());
    }

    try {
        const res = await fetch(`/api/admin/ebooks/${ebookId}`, {
            method: 'PUT',
            body: formData
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

// Live Image Preview Helpers
function previewBookCover(input, previewImgId) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.getElementById(previewImgId);
            if (img) img.src = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function previewCoverUrl(url, previewImgId) {
    if (url && url.trim()) {
        const img = document.getElementById(previewImgId);
        if (img) img.src = url.trim();
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

// ====================================================================
// Users & Roles Management View
// ====================================================================
async function loadAdminUsers() {
    const tbody = document.getElementById('admin-users-tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px; color:var(--text-muted);">🔄 กำลังโหลดข้อมูลสมาชิก...</td></tr>';

    try {
        const res = await apiFetch('/api/admin/users');
        const users = await res.json();

        if (!users || users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px; color:var(--text-muted);">ไม่พบข้อมูลสมาชิกในระบบ</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        users.forEach(u => {
            const tr = document.createElement('tr');
            const isAdm = u.role_id === 2 || u.role_name === 'admin';
            const roleBadge = isAdm
                ? '<span style="background:rgba(239,68,68,0.2); color:#f87171; border:1px solid rgba(239,68,68,0.4); padding:3px 8px; border-radius:4px; font-weight:bold; font-size:0.78rem;">🛡️ ผู้ดูแลระบบ (Admin)</span>'
                : '<span style="background:rgba(59,130,246,0.2); color:#60a5fa; border:1px solid rgba(59,130,246,0.4); padding:3px 8px; border-radius:4px; font-weight:bold; font-size:0.78rem;">👤 ลูกค้า (Customer)</span>';

            const createdDate = u.created_at ? u.created_at.substring(0, 16) : '-';

            tr.innerHTML = `
                <td style="font-weight:bold; color:var(--text-muted);">${u.user_id}</td>
                <td>
                    <div style="font-weight:bold; color:var(--text-primary);">${u.full_name}</div>
                    <div style="font-size:0.78rem; color:var(--text-muted);">${u.phone ? '📞 ' + u.phone : 'ไม่มีเบอร์โทร'}</div>
                </td>
                <td><code>${u.username}</code></td>
                <td><a href="mailto:${u.email}" style="color:#38bdf8;">${u.email}</a></td>
                <td>
                    <strong>${u.total_orders || 0} คำสั่งซื้อ</strong>
                    <div style="font-size:0.78rem; color:#10b981;">รวม ฿${parseFloat(u.total_spent || 0).toFixed(2)}</div>
                </td>
                <td>${roleBadge}</td>
                <td>
                    <span style="font-size:0.8rem; color:var(--text-muted);">${createdDate}</span>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="7" style="color:var(--danger); text-align:center; padding:20px;">เกิดข้อผิดพลาดในการโหลดข้อมูล: ${err.message}</td></tr>`;
    }
}

