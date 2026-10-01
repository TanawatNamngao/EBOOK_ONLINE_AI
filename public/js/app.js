// ====================================================================
// EBOOK_ONLINE: Storefront Client Application (JavaScript)
// ====================================================================

// Global State
const isGuest = localStorage.getItem('ebook_is_guest') === 'true';
let currentUserId = isGuest ? null : (parseInt(localStorage.getItem('ebook_user_id')) || null);
let currentUserName = isGuest ? '' : (localStorage.getItem('ebook_user_name') || '');
let selectedCategory = 'all';
let searchQuery = '';
let currentSort = 'newest';
let activeMockSlipUrl = '/assets/slips/slip_mock_01.png';
let isSkipSlipSelected = false;
let currentCartData = { items: [], total_amount: 0 };

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
    if (!currentUserId || isGuest) {
        window.location.replace('/auth.html?tab=login');
        return;
    }
    updateUserBadgeDisplay();
    fetchCategories();
    fetchEbooks();
    fetchCart();

    // Check URL hash
    if (window.location.hash === '#orders') {
        openOrdersModal();
    }
});

// Helper for API fetch with User context
async function apiFetch(url, options = {}) {
    const headers = options.headers || {};
    if (currentUserId) {
        headers['x-user-id'] = currentUserId;
    }
    options.headers = headers;
    const response = await fetch(url, options);
    return response;
}

// Toast notification helper
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

// User Switcher
function toggleUserDropdown() {
    const drop = document.getElementById('user-dropdown');
    drop.style.display = drop.style.display === 'none' ? 'block' : 'none';
}

function switchUser(userId, fullName, username) {
    localStorage.removeItem('ebook_is_guest');
    currentUserId = userId;
    currentUserName = fullName;
    localStorage.setItem('ebook_user_id', userId);
    localStorage.setItem('ebook_user_name', fullName);
    localStorage.setItem('ebook_user_role', userId === 1 ? 'admin' : 'customer');
    updateUserBadgeDisplay();
    toggleUserDropdown();
    fetchCart();
    showToast(`สลับบัญชีใช้งานเป็น "${fullName}" เรียบร้อย`);
    if (document.getElementById('orders-modal').classList.contains('active')) {
        loadMyOrders();
    }
}

function updateUserBadgeDisplay() {
    const navUsername = document.getElementById('nav-username');
    const navAvatar = document.getElementById('nav-avatar');
    const orderModalUser = document.getElementById('orders-user-name');
    const logoutBtn = document.getElementById('btn-dropdown-logout');
    const profileBtn = document.getElementById('btn-profile-edit-btn');

    if (currentUserId && currentUserName) {
        if (navUsername) navUsername.textContent = currentUserName;
        if (navAvatar) navAvatar.textContent = currentUserName.charAt(0);
        if (orderModalUser) orderModalUser.textContent = currentUserName;
        if (logoutBtn) logoutBtn.style.display = 'flex';
        if (profileBtn) profileBtn.style.display = 'flex';
    } else {
        if (navUsername) navUsername.textContent = 'เข้าสู่ระบบ / สมัคร';
        if (navAvatar) navAvatar.textContent = '👤';
        if (orderModalUser) orderModalUser.textContent = 'ผู้เยี่ยมชม (ยังไม่ได้เข้าสู่ระบบ)';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (profileBtn) profileBtn.style.display = 'none';
    }
}

async function logoutUser() {
    if (confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (e) {}
        localStorage.removeItem('ebook_user_id');
        localStorage.removeItem('ebook_user_name');
        localStorage.removeItem('ebook_user_role');
        localStorage.setItem('ebook_is_guest', 'true');
        currentUserId = null;
        currentUserName = '';
        updateUserBadgeDisplay();
        const drop = document.getElementById('user-dropdown');
        if (drop) drop.style.display = 'none';
        showToast('ออกจากระบบเรียบร้อยแล้ว กำลังนำท่านไปหน้าระบบสมาชิก...', 'info');
        setTimeout(() => {
            window.location.href = '/auth.html?tab=login&logout=true';
        }, 800);
    }
}

// Close dropdown on outside click
window.addEventListener('click', (e) => {
    const switcher = document.getElementById('user-switcher-btn');
    const drop = document.getElementById('user-dropdown');
    if (!switcher.contains(e.target) && !drop.contains(e.target)) {
        drop.style.display = 'none';
    }
});

// ====================================================================
// Categories & E-Books
// ====================================================================

async function fetchCategories() {
    try {
        const res = await apiFetch('/api/categories');
        const categories = await res.json();
        const container = document.getElementById('categories-container');
        
        container.innerHTML = `
            <button class="cat-pill ${selectedCategory === 'all' ? 'active' : ''}" 
                    data-category="all" 
                    id="cat-pill-all"
                    onclick="filterCategory('all', this)">
                ทั้งหมด
            </button>
        `;

        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = `cat-pill ${selectedCategory == cat.category_id ? 'active' : ''}`;
            btn.id = `cat-pill-${cat.slug}`;
            btn.innerHTML = `${cat.name} <span style="opacity:0.6; font-size:0.8rem;">(${cat.book_count})</span>`;
            btn.onclick = () => filterCategory(cat.category_id, btn);
            container.appendChild(btn);
        });
    } catch (err) {
        console.error('Fetch categories error:', err);
    }
}

function filterCategory(catId, btnElement) {
    selectedCategory = catId;
    document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
    if (btnElement) btnElement.classList.add('active');
    fetchEbooks();
}

function handleSearch(val) {
    searchQuery = val.trim();
    // Debounce search
    clearTimeout(window.searchTimer);
    window.searchTimer = setTimeout(() => {
        fetchEbooks();
    }, 300);
}

function handleSortChange(sortVal) {
    currentSort = sortVal;
    fetchEbooks();
}

// Fallback cover generator in case of network glitch or image blocker
function getCoverDataUri(title, category, id) {
    const colors = [
        ['#1e3a8a', '#3b82f6'],
        ['#065f46', '#10b981'],
        ['#581c87', '#a855f7'],
        ['#9a3412', '#f97316'],
        ['#115e59', '#14b8a6'],
        ['#0e7490', '#06b6d4'],
        ['#9f1239', '#f43f5e'],
        ['#1e1b4b', '#6366f1'],
        ['#78350f', '#f59e0b'],
        ['#1d4ed8', '#38bdf8'],
        ['#991b1b', '#ef4444'],
        ['#1e293b', '#0ea5e9']
    ];
    const pair = colors[(id - 1) % colors.length] || ['#312e81', '#6366f1'];
    const escapeXml = (str) => (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const safeTitle = escapeXml((title || 'E-BOOK').substring(0, 30));
    const safeCat = escapeXml((category || 'EBOOK').substring(0, 8).toUpperCase());
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 580" width="400" height="580">
      <defs>
        <linearGradient id="fallback_grad_${id}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${pair[0]}" />
          <stop offset="100%" stop-color="${pair[1]}" />
        </linearGradient>
      </defs>
      <rect width="400" height="580" rx="16" fill="${pair[0]}" />
      <rect width="400" height="580" rx="16" fill="url(#fallback_grad_${id})" />
      <rect x="0" y="0" width="28" height="580" fill="rgba(0,0,0,0.3)" />
      <line x1="28" y1="0" x2="28" y2="580" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" />
      <rect x="46" y="44" width="80" height="26" rx="6" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.3)" stroke-width="1" />
      <text x="86" y="62" fill="#ffffff" font-family="'Segoe UI', sans-serif" font-weight="bold" font-size="12" text-anchor="middle">${safeCat}</text>
      <text x="340" y="64" fill="#fbbf24" font-family="'Segoe UI', sans-serif" font-weight="bold" font-size="18" text-anchor="middle">★</text>
      <circle cx="200" cy="190" r="45" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="2" stroke-dasharray="4 4" />
      <text x="200" y="200" fill="#ffffff" font-family="'Segoe UI', sans-serif" font-size="32" text-anchor="middle">📖</text>
      <g transform="translate(48, 280)">
        <text x="0" y="0" fill="#ffffff" font-family="'Segoe UI', sans-serif" font-weight="bold" font-size="20">${safeTitle}</text>
        <line x1="0" y1="28" x2="90" y2="28" stroke="rgba(255,255,255,0.6)" stroke-width="3" stroke-linecap="round"/>
      </g>
      <rect x="46" y="480" width="308" height="46" rx="10" fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
      <text x="64" y="509" fill="rgba(255,255,255,0.85)" font-family="'Segoe UI', sans-serif" font-size="13">DIGITAL E-BOOK EDITION</text>
      <text x="334" y="509" fill="#fbbf24" font-family="'Segoe UI', sans-serif" font-weight="bold" font-size="14" text-anchor="end">2026</text>
    </svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

function handleCoverError(img, id, title, cat) {
    img.onerror = null;
    img.src = getCoverDataUri(title, cat, id);
}

function escapeAttr(str) {
    if (!str) return '';
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// Compress image to lightweight JPEG before uploading
function compressImage(file, maxWidth = 800, maxHeight = 1200, quality = 0.85) {
    return new Promise((resolve) => {
        if (!file || !file.type || !file.type.startsWith('image/')) {
            return resolve(file);
        }
        if (file.type === 'image/svg+xml') {
            return resolve(file);
        }
        const img = new Image();
        const reader = new FileReader();
        reader.onload = (e) => {
            img.onload = () => {
                let { width, height } = img;
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => {
                    if (blob) {
                        const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });
                        resolve(compressedFile);
                    } else {
                        resolve(file);
                    }
                }, 'image/jpeg', quality);
            };
            img.onerror = () => resolve(file);
            img.src = e.target.result;
        };
        reader.onerror = () => resolve(file);
        reader.readAsDataURL(file);
    });
}

async function fetchEbooks() {
    const grid = document.getElementById('books-grid');
    const countLabel = document.getElementById('catalog-count-label');
    grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 40px; color: var(--text-muted);">🔄 กำลังค้นหาหนังสือ...</div>';

    let url = `/api/ebooks?sort=${currentSort}`;
    if (selectedCategory && selectedCategory !== 'all') url += `&category_id=${selectedCategory}`;
    if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

    try {
        const res = await apiFetch(url);
        const books = await res.json();

        countLabel.textContent = `พบหนังสือทั้งหมด ${books.length} เล่ม`;

        if (books.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align:center; padding: 60px 20px; background:var(--bg-surface); border:1px solid var(--border); border-radius:var(--radius-lg);">
                    <div style="font-size:2.5rem; margin-bottom:12px;">🔍</div>
                    <h3>ไม่พบหนังสือตามเงื่อนไขที่ค้นหา</h3>
                    <p style="color:var(--text-muted); margin-top:6px;">ลองค้นหาด้วยคำสำคัญอื่น หรือเลือกหมวดหมู่อื่น</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = '';
        books.forEach(b => {
            const card = document.createElement('div');
            card.className = 'book-card';
            card.id = `book-card-${b.ebook_id}`;

            const safeTitle = escapeAttr(b.title);
            const safeCat = escapeAttr(b.category_name);

            card.innerHTML = `
                <div class="book-cover-wrap" onclick="openBookDetail(${b.ebook_id})" style="cursor:pointer;">
                    <img src="${b.cover_image}" class="book-cover-img" alt="${b.title}" onerror="handleCoverError(this, ${b.ebook_id}, '${safeTitle}', '${safeCat}')">
                    <span class="book-badge-category">${b.category_name}</span>
                </div>
                <div class="book-info">
                    <h3 class="book-title" onclick="openBookDetail(${b.ebook_id})" style="cursor:pointer;" title="${b.title}">${b.title}</h3>
                    <div class="book-author">✍️ ${b.author_name}</div>
                    <div class="book-footer">
                        <div class="book-price">฿${parseFloat(b.price).toFixed(2)}</div>
                        <button class="btn btn-primary btn-sm" id="btn-add-cart-${b.ebook_id}" onclick="addToCart(${b.ebook_id}, event)">
                            🛒 ใส่ตะกร้า
                        </button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    } catch (err) {
        grid.innerHTML = `<div style="grid-column: 1/-1; color: var(--danger); text-align:center;">เกิดข้อผิดพลาดในการโหลดข้อมูล: ${err.message}</div>`;
    }
}

// ====================================================================
// Book Detail Modal
// ====================================================================

async function openBookDetail(ebookId) {
    const modal = document.getElementById('book-detail-modal');
    const content = document.getElementById('book-detail-content');
    content.innerHTML = '<div style="text-align:center; padding:40px;">🔄 กำลังโหลดข้อมูล...</div>';
    modal.classList.add('active');

    try {
        const res = await apiFetch(`/api/ebooks/${ebookId}`);
        const book = await res.json();

        content.innerHTML = `
            <div style="display:flex; gap:24px; flex-wrap:wrap;">
                <div style="width:200px; flex-shrink:0;">
                    <img src="${book.cover_image}" style="width:100%; border-radius:var(--radius-md); box-shadow:var(--shadow-md);" alt="${book.title}" onerror="handleCoverError(this, ${book.ebook_id}, '${escapeAttr(book.title)}', '${escapeAttr(book.category_name)}')">
                    <div style="margin-top:14px; text-align:center;">
                        <span class="status-badge ${book.is_published ? 'status-confirmed' : 'status-cancelled'}">
                            ${book.is_published ? '✓ พร้อมจำหน่าย' : 'ปิดจำหน่าย'}
                        </span>
                    </div>
                </div>
                <div style="flex:1; min-width:280px; display:flex; flex-direction:column;">
                    <div style="font-size:0.85rem; color:#38bdf8; font-weight:bold; margin-bottom:4px;">${book.category_name}</div>
                    <h2 style="font-size:1.45rem; line-height:1.25; margin-bottom:8px;">${book.title}</h2>
                    <div style="color:var(--text-muted); font-size:0.9rem; margin-bottom:12px;">ผู้แต่ง: <strong>${book.author_name}</strong></div>
                    ${book.isbn ? `<div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:12px;">ISBN: ${book.isbn}</div>` : ''}
                    
                    <div style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:20px; line-height:1.6; background:var(--bg-surface-elevated); padding:14px; border-radius:var(--radius-md); border:1px solid var(--border);">
                        ${book.description || 'ไม่มีคำอธิบายสำหรับหนังสือเล่มนี้'}
                    </div>

                    <div style="margin-top:auto; display:flex; align-items:center; justify-content:space-between; padding-top:16px; border-top:1px solid var(--border);">
                        <div style="font-size:1.6rem; font-weight:800; color:#38bdf8;">฿${parseFloat(book.price).toFixed(2)}</div>
                        <button class="btn btn-primary" id="btn-detail-add-cart" onclick="addToCart(${book.ebook_id})">
                            🛒 เพิ่มลงในตะกร้า
                        </button>
                    </div>
                </div>
            </div>
        `;
    } catch (err) {
        content.innerHTML = `<div style="color:var(--danger);">เกิดข้อผิดพลาด: ${err.message}</div>`;
    }
}

function closeBookDetailModal() {
    document.getElementById('book-detail-modal').classList.remove('active');
}

// ====================================================================
// Cart Management
// ====================================================================

function toggleCartDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    const isActive = drawer.classList.contains('active');
    if (isActive) {
        drawer.classList.remove('active');
        overlay.classList.remove('active');
    } else {
        drawer.classList.add('active');
        overlay.classList.add('active');
        fetchCart();
    }
}

async function fetchCart() {
    try {
        const res = await apiFetch('/api/cart');
        const data = await res.json();
        currentCartData = data;

        // Update badge
        document.getElementById('cart-item-count').textContent = data.item_count || 0;
        document.getElementById('cart-total-price').textContent = `฿${parseFloat(data.total_amount || 0).toFixed(2)}`;

        const list = document.getElementById('cart-items-list');
        if (!data.items || data.items.length === 0) {
            list.innerHTML = `
                <div style="text-align:center; padding:50px 20px; color:var(--text-muted);">
                    <div style="font-size:3rem; margin-bottom:12px;">🛒</div>
                    <p style="font-size:1.05rem; font-weight:600;">ตะกร้าของคุณยังว่างเปล่า</p>
                    <p style="font-size:0.85rem; margin-top:4px;">เลือกหนังสือที่สนใจจากหน้าร้านแล้วใส่ตะกร้าได้เลย</p>
                </div>
            `;
            document.getElementById('btn-proceed-checkout').disabled = true;
            return;
        }

        document.getElementById('btn-proceed-checkout').disabled = false;
        list.innerHTML = '';
        data.items.forEach(item => {
            const el = document.createElement('div');
            el.className = 'cart-item';
            el.id = `cart-item-${item.cart_item_id}`;
            el.innerHTML = `
                <img src="${item.cover_image}" class="cart-item-img" alt="${item.title}">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.title}</div>
                    <div style="font-size:0.75rem; color:var(--text-muted);">${item.author_name}</div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
                        <span class="cart-item-price">฿${parseFloat(item.price).toFixed(2)}</span>
                        <button class="btn btn-secondary btn-sm" style="color:var(--danger); padding:2px 8px;" onclick="removeFromCart(${item.cart_item_id})">
                            ลบ
                        </button>
                    </div>
                </div>
            `;
            list.appendChild(el);
        });
    } catch (err) {
        console.error('Fetch cart error:', err);
    }
}

async function addToCart(ebookId, event) {
    if (event) event.stopPropagation();
    if (!currentUserId) {
        showToast('กรุณาเข้าสู่ระบบก่อนเลือกซื้อหนังสือ', 'info');
        setTimeout(() => {
            window.location.href = '/auth.html?tab=login';
        }, 800);
        return;
    }
    try {
        const res = await apiFetch('/api/cart/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ebook_id: ebookId })
        });
        const data = await res.json();
        if (res.ok) {
            showToast('✓ เพิ่มหนังสือลงในตะกร้าแล้ว');
            fetchCart();
        } else {
            showToast(data.error || 'ไม่สามารถเพิ่มหนังสือได้', 'error');
        }
    } catch (err) {
        showToast('เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
    }
}

async function removeFromCart(itemId) {
    try {
        const res = await apiFetch(`/api/cart/items/${itemId}`, { method: 'DELETE' });
        if (res.ok) {
            showToast('ลบรายการออกจากตะกร้าแล้ว');
            fetchCart();
        }
    } catch (err) {
        showToast('ไม่สามารถลบรายการได้', 'error');
    }
}

async function clearCart() {
    if (!confirm('ต้องการล้างสินค้าในตะกร้าทั้งหมดหรือไม่?')) return;
    try {
        const res = await apiFetch('/api/cart', { method: 'DELETE' });
        if (res.ok) {
            showToast('ล้างตะกร้าเรียบร้อย');
            fetchCart();
        }
    } catch (err) {
        showToast('เกิดข้อผิดพลาด', 'error');
    }
}

// ====================================================================
// Checkout & Mock Payment Flow
// ====================================================================

function openCheckoutModal() {
    if (!currentCartData.items || currentCartData.items.length === 0) {
        showToast('ตะกร้าสินค้าว่างเปล่า', 'error');
        return;
    }
    toggleCartDrawer(); // close cart drawer

    const modal = document.getElementById('checkout-modal');
    modal.classList.add('active');

    const totalAmount = parseFloat(currentCartData.total_amount || 0);
    const totalFormatted = totalAmount.toFixed(2);

    // Build order summary
    const summary = document.getElementById('checkout-order-summary');
    let itemsHtml = currentCartData.items.map(i => `
        <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:0.9rem;">
            <span>${i.title}</span>
            <span style="color:#38bdf8; font-weight:600;">฿${parseFloat(i.price).toFixed(2)}</span>
        </div>
    `).join('');

    summary.innerHTML = `
        <div style="font-weight:bold; margin-bottom:8px; border-bottom:1px solid var(--border); padding-bottom:6px;">สรุปรายการที่สั่งซื้อ (${currentCartData.items.length} เล่ม)</div>
        ${itemsHtml}
        <div style="display:flex; justify-content:space-between; margin-top:10px; border-top:1px solid var(--border); padding-top:8px; font-weight:bold; font-size:1.1rem;">
            <span>ยอดชำระสุทธิ:</span>
            <span style="color:#38bdf8;">฿${totalFormatted}</span>
        </div>
    `;

    document.getElementById('checkout-qr-amount').textContent = `฿${totalFormatted}`;

    // Default state: NO SLIP attached until user explicitly clicks to attach or uploads file
    activeMockSlipUrl = null;
    isSkipSlipSelected = true;
    
    const fileInput = document.getElementById('slip-file-input');
    if (fileInput) fileInput.value = '';
    
    const container = document.getElementById('slip-preview-container');
    if (container) container.style.display = 'none';
    
    const previewImg = document.getElementById('checkout-slip-preview-img');
    if (previewImg) previewImg.src = '';
    
    const btnQuick = document.getElementById('btn-quick-slip');
    if (btnQuick) {
        btnQuick.style.borderColor = 'var(--border)';
        btnQuick.style.background = 'transparent';
        btnQuick.style.color = 'var(--text-secondary)';
        btnQuick.style.boxShadow = 'none';
    }
    
    const btnNoSlip = document.getElementById('btn-no-slip');
    if (btnNoSlip) {
        btnNoSlip.style.borderColor = '#ef4444';
        btnNoSlip.style.background = 'rgba(239,68,68,0.2)';
        btnNoSlip.style.color = '#ffffff';
        btnNoSlip.style.boxShadow = '0 0 10px rgba(239,68,68,0.3)';
    }

    const status = document.getElementById('slip-preview-status');
    if (status) {
        status.style.display = 'block';
        status.style.background = 'rgba(239,68,68,0.08)';
        status.style.border = '1px solid rgba(239,68,68,0.25)';
        status.style.color = '#f87171';
        status.innerHTML = '⚠️ <strong>ยังไม่ได้แนบสลิป</strong>: กดปุ่ม <em>"⚡ แนบสลิปจำลอง (1-Click)"</em> เพื่อแนบสลิป หรือกดปุ่มด้านล่างเพื่อสั่งซื้อแบบไม่แนบสลิป (ค้างชำระ)';
    }

    const btnSubmit = document.getElementById('btn-submit-order-payment');
    if (btnSubmit) {
        btnSubmit.textContent = 'ยืนยันการสั่งซื้อ (ยังไม่แนบสลิป / ค้างชำระ) ⏳';
        btnSubmit.style.background = '#64748b';
    }
}

function closeCheckoutModal() {
    document.getElementById('checkout-modal').classList.remove('active');
    activeMockSlipUrl = null;
    isSkipSlipSelected = true;
    const status = document.getElementById('slip-preview-status');
    const container = document.getElementById('slip-preview-container');
    const previewImg = document.getElementById('checkout-slip-preview-img');
    const fileInput = document.getElementById('slip-file-input');
    if (fileInput) fileInput.value = '';
    if (status) {
        status.style.display = 'none';
        status.innerHTML = '';
    }
    if (container) container.style.display = 'none';
    if (previewImg) previewImg.src = '';

    const btnSubmit = document.getElementById('btn-submit-order-payment');
    if (btnSubmit) {
        btnSubmit.textContent = 'ยืนยันการสั่งซื้อ (ยังไม่แนบสลิป / ค้างชำระ) ⏳';
        btnSubmit.style.background = '#64748b';
    }
}

function usePrebuiltMockSlip(isAuto = false) {
    isSkipSlipSelected = false;
    const totalAmount = parseFloat(currentCartData.total_amount || 0);
    const selectedMethod = document.querySelector('input[name="pay-method"]:checked')?.value || 'promptpay_qr';
    const timestamp = Date.now();
    
    // Dynamic slip preview matching the EXACT cart total amount & user name
    activeMockSlipUrl = `/api/slips/preview?amount=${encodeURIComponent(totalAmount)}&name=${encodeURIComponent(currentUserName || 'ลูกค้า EBOOK_ONLINE')}&method=${encodeURIComponent(selectedMethod)}&t=${timestamp}`;
    
    const status = document.getElementById('slip-preview-status');
    const container = document.getElementById('slip-preview-container');
    const previewImg = document.getElementById('checkout-slip-preview-img');
    const fileInput = document.getElementById('slip-file-input');
    if (fileInput) fileInput.value = '';

    const btnQuick = document.getElementById('btn-quick-slip');
    if (btnQuick) {
        btnQuick.style.borderColor = 'var(--primary)';
        btnQuick.style.background = 'rgba(99,102,241,0.25)';
        btnQuick.style.color = '#a5b4fc';
        btnQuick.style.boxShadow = '0 0 10px rgba(99,102,241,0.2)';
    }

    const btnNoSlip = document.getElementById('btn-no-slip');
    if (btnNoSlip) {
        btnNoSlip.style.borderColor = 'rgba(239,68,68,0.4)';
        btnNoSlip.style.background = 'rgba(239,68,68,0.06)';
        btnNoSlip.style.color = '#f87171';
        btnNoSlip.style.boxShadow = 'none';
    }
    
    if (status) {
        status.style.display = 'block';
        status.style.background = 'rgba(16,185,129,0.12)';
        status.style.border = '1px solid rgba(16,185,129,0.3)';
        status.style.color = '#34d399';
        status.innerHTML = `✓ สร้างสลิปจำลองตรงตามยอดชำระจริง (฿${totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}) เรียบร้อย พร้อมแจ้งชำระ`;
    }
    if (previewImg && container) {
        previewImg.src = activeMockSlipUrl;
        container.style.display = 'block';
    }

    const btnSubmit = document.getElementById('btn-submit-order-payment');
    if (btnSubmit) {
        btnSubmit.textContent = 'ยืนยันการสั่งซื้อและแจ้งชำระเงิน 🚀';
        btnSubmit.style.background = '';
    }

    if (!isAuto) {
        showToast(`แนบสลิปจำลองยอดเงิน ฿${totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} เรียบร้อย`);
    }
}

function selectNoSlipOption() {
    isSkipSlipSelected = true;
    activeMockSlipUrl = null;

    const fileInput = document.getElementById('slip-file-input');
    if (fileInput) fileInput.value = '';

    const container = document.getElementById('slip-preview-container');
    if (container) container.style.display = 'none';

    const previewImg = document.getElementById('checkout-slip-preview-img');
    if (previewImg) previewImg.src = '';

    const btnQuick = document.getElementById('btn-quick-slip');
    if (btnQuick) {
        btnQuick.style.borderColor = 'var(--border)';
        btnQuick.style.background = 'transparent';
        btnQuick.style.color = 'var(--text-secondary)';
        btnQuick.style.boxShadow = 'none';
    }

    const btnNoSlip = document.getElementById('btn-no-slip');
    if (btnNoSlip) {
        btnNoSlip.style.borderColor = '#ef4444';
        btnNoSlip.style.background = 'rgba(239,68,68,0.25)';
        btnNoSlip.style.color = '#ffffff';
        btnNoSlip.style.boxShadow = '0 0 12px rgba(239,68,68,0.35)';
    }

    const status = document.getElementById('slip-preview-status');
    if (status) {
        status.style.display = 'block';
        status.style.background = 'rgba(239,68,68,0.12)';
        status.style.border = '1px solid rgba(239,68,68,0.35)';
        status.style.color = '#f87171';
        status.innerHTML = '⚠️ <strong>เลือกสั่งซื้อโดยไม่แนบสลิป</strong>: รายการนี้จะอยู่ในสถานะ "รอชำระเงิน" (ไม่มีสลิป) เหมาะสำหรับนำไปเป็นตัวอย่างทดสอบการตรวจสอบหรือปฏิเสธคำสั่งซื้อในหน้า Admin';
    }

    const btnSubmit = document.getElementById('btn-submit-order-payment');
    if (btnSubmit) {
        btnSubmit.textContent = 'ยืนยันการสั่งซื้อ (ไม่แนบสลิป / ค้างชำระ) ⏳';
        btnSubmit.style.background = '#e11d48';
    }

    showToast('เลือกสั่งซื้อแบบไม่แนบสลิป (ตัวอย่างสำหรับยกเลิก)', 'info');
}

function handlePaymentMethodChange(radio) {
    document.querySelectorAll('input[name="pay-method"]').forEach(r => {
        const label = r.closest('label');
        if (label) {
            if (r.checked) {
                label.style.borderColor = 'var(--primary)';
                label.style.background = 'rgba(99,102,241,0.1)';
            } else {
                label.style.borderColor = 'var(--border)';
                label.style.background = 'transparent';
            }
        }
    });
    // Auto-update slip preview with new theme if active
    if (!isSkipSlipSelected && (activeMockSlipUrl || document.getElementById('slip-preview-container')?.style.display !== 'none')) {
        usePrebuiltMockSlip(true);
    }
}

function handleSlipFileChange(input) {
    if (input.files && input.files[0]) {
        isSkipSlipSelected = false;
        activeMockSlipUrl = null;
        const status = document.getElementById('slip-preview-status');
        const container = document.getElementById('slip-preview-container');
        const previewImg = document.getElementById('checkout-slip-preview-img');
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            if (previewImg && container) {
                previewImg.src = e.target.result;
                container.style.display = 'block';
            }
            if (status) {
                status.style.display = 'block';
                status.style.background = 'rgba(16,185,129,0.12)';
                status.style.border = '1px solid rgba(16,185,129,0.3)';
                status.style.color = '#34d399';
                status.innerHTML = `✓ แนบไฟล์ ${file.name} เรียบร้อย`;
            }
        };
        reader.readAsDataURL(file);

        const btnQuick = document.getElementById('btn-quick-slip');
        if (btnQuick) {
            btnQuick.style.borderColor = 'var(--border)';
            btnQuick.style.background = 'transparent';
            btnQuick.style.color = 'var(--text-secondary)';
            btnQuick.style.boxShadow = 'none';
        }
        const btnNoSlip = document.getElementById('btn-no-slip');
        if (btnNoSlip) {
            btnNoSlip.style.borderColor = 'rgba(239,68,68,0.4)';
            btnNoSlip.style.background = 'rgba(239,68,68,0.06)';
            btnNoSlip.style.color = '#f87171';
            btnNoSlip.style.boxShadow = 'none';
        }
        const btnSubmit = document.getElementById('btn-submit-order-payment');
        if (btnSubmit) {
            btnSubmit.textContent = 'ยืนยันการสั่งซื้อและแจ้งชำระเงิน 🚀';
            btnSubmit.style.background = '';
        }
    }
}

// In-app Slip Viewer Modal
function viewSlipModal(url, orderNum, totalAmount, paymentMethod) {
    const modal = document.getElementById('store-slip-modal');
    if (!modal) {
        window.open(url, '_blank');
        return;
    }
    const titleEl = document.getElementById('store-slip-modal-title');
    const imgEl = document.getElementById('store-slip-modal-img');
    const linkEl = document.getElementById('store-slip-download-link');

    if (titleEl) titleEl.textContent = `📄 หลักฐานสลิปคำสั่งซื้อ: ${orderNum || ''}`;
    if (imgEl) {
        const bustUrl = url + (url.includes('?') ? '&' : '?') + 't=' + Date.now();
        imgEl.src = bustUrl;
        imgEl.onerror = () => {
            imgEl.onerror = null;
            imgEl.src = `/api/slips/preview?amount=${totalAmount || 0}&order_number=${encodeURIComponent(orderNum || '')}&method=${paymentMethod || 'promptpay_qr'}`;
        };
    }
    if (linkEl) linkEl.href = url;
    modal.classList.add('active');
}

function closeStoreSlipModal() {
    const modal = document.getElementById('store-slip-modal');
    if (modal) modal.classList.remove('active');
}

async function submitOrderAndPayment() {
    const btn = document.getElementById('btn-submit-order-payment');
    btn.disabled = true;
    btn.textContent = '⏳ กำลังประมวลผลคำสั่งซื้อ...';

    try {
        // Step 1: Create Order from Cart
        const checkoutRes = await apiFetch('/api/orders/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const checkoutData = await checkoutRes.json();

        if (!checkoutRes.ok) {
            throw new Error(checkoutData.error || 'เกิดข้อผิดพลาดในการสั่งซื้อ');
        }

        const orderId = checkoutData.order.orderId;

        // Step 2: Submit Payment & Mock Slip
        const fileInput = document.getElementById('slip-file-input');
        const payMethod = document.querySelector('input[name="pay-method"]:checked')?.value || 'promptpay_qr';

        const formData = new FormData();
        formData.append('payment_method', payMethod);

        if (isSkipSlipSelected || (!fileInput.files.length && !activeMockSlipUrl)) {
            formData.append('skip_slip', 'true');
            formData.append('note', 'สั่งซื้อโดยยังไม่ได้แนบสลิป (ค้างชำระ/ตัวอย่างยกเลิก)');
        } else if (fileInput.files.length > 0) {
            const compressedSlip = await compressImage(fileInput.files[0]);
            formData.append('slip_image', compressedSlip);
            formData.append('note', 'แนบไฟล์สลิปจริงผ่านหน้าร้าน');
        } else {
            formData.append('slip_mock_url', activeMockSlipUrl);
            formData.append('note', 'แจ้งชำระเงินจำลองผ่านหน้าร้าน (แนบสลิปจำลอง)');
        }

        const payRes = await fetch(`/api/orders/${orderId}/payment`, {
            method: 'POST',
            headers: { 'x-user-id': currentUserId },
            body: formData
        });
        const payData = await payRes.json();

        if (!payRes.ok) {
            throw new Error(payData.error || 'เกิดข้อผิดพลาดในการแจ้งชำระเงิน');
        }

        closeCheckoutModal();
        fetchCart();
        
        if (isSkipSlipSelected || (!fileInput.files.length && !activeMockSlipUrl)) {
            showToast('🎉 สั่งซื้อสำเร็จ (ไม่มีสลิป) สถานะ: รอตรวจสอบ/รอชำระเงิน');
        } else {
            showToast('🎉 สั่งซื้อและส่งหลักฐานสำเร็จ! กรุณารอแอดมินยืนยัน');
        }
        openOrdersModal();

    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'ยืนยันการสั่งซื้อและแจ้งชำระเงิน 🚀';
    }
}

// ====================================================================
// My Orders & Secure Download Gateway Viewer
// ====================================================================

function openOrdersModal() {
    if (!currentUserId) {
        showToast('กรุณาเข้าสู่ระบบก่อนดูประวัติคำสั่งซื้อ', 'info');
        setTimeout(() => {
            window.location.href = '/auth.html?tab=login';
        }, 800);
        return;
    }
    const modal = document.getElementById('orders-modal');
    modal.classList.add('active');
    loadMyOrders();
}

function closeOrdersModal() {
    document.getElementById('orders-modal').classList.remove('active');
}

async function loadMyOrders() {
    const container = document.getElementById('orders-list-container');
    container.innerHTML = '<div style="text-align:center; padding:30px; color:var(--text-muted);">🔄 กำลังโหลดประวัติคำสั่งซื้อ...</div>';

    try {
        const res = await apiFetch('/api/orders/my');
        const orders = await res.json();

        if (orders.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding:40px; color:var(--text-muted); background:var(--bg-surface-elevated); border-radius:var(--radius-md);">
                    <div style="font-size:2.5rem; margin-bottom:8px;">📦</div>
                    <p>คุณยังไม่มีประวัติคำสั่งซื้อ</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        orders.forEach(ord => {
            const ordCard = document.createElement('div');
            ordCard.className = 'order-history-card';
            ordCard.style.cssText = 'background:var(--bg-surface-elevated); border:1px solid var(--border); border-radius:var(--radius-md); padding:18px; margin-bottom:14px;';
            ordCard.id = `order-card-${ord.order_id}`;

            let statusLabel = '';
            let statusBadgeClass = '';
            if (ord.status === 'confirmed') {
                statusLabel = '✓ ยืนยันแล้ว (อนุมัติสิทธิ์)';
                statusBadgeClass = 'status-confirmed';
            } else if (ord.status === 'pending') {
                statusLabel = '⏳ รอผู้ดูแลตรวจสอบการชำระเงิน';
                statusBadgeClass = 'status-pending';
            } else {
                statusLabel = '✕ ยกเลิกคำสั่งซื้อ';
                statusBadgeClass = 'status-cancelled';
            }

            // Render Items
            let itemsHtml = ord.items.map(item => {
                let downloadSection = '';
                if (!item.download_locked && item.token) {
                    if (item.download_count >= item.max_downloads) {
                        downloadSection = `
                            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                                <span style="font-size:0.8rem; color:#f87171; background:rgba(239,68,68,0.12); padding:5px 10px; border-radius:6px; border:1px solid rgba(239,68,68,0.3); font-weight:600;">
                                    🔒 ครบ ${item.download_count}/${item.max_downloads} ครั้ง (หมดโควตา)
                                </span>
                                <button type="button" class="btn btn-primary btn-sm" onclick="reorderEbook(${item.ebook_id})" style="background:#0284c7; padding:5px 12px; font-size:0.8rem;">
                                    🛒 สั่งซื้อเพื่อรับสิทธิ์ใหม่
                                </button>
                            </div>
                        `;
                    } else {
                        downloadSection = `
                            <a href="/api/download/${item.token}" class="btn btn-primary btn-sm" target="_blank" style="background:#059669; text-decoration:none;">
                                📥 ดาวน์โหลด E-Book (${item.download_count}/${item.max_downloads} ครั้ง)
                            </a>
                        `;
                    }
                } else {
                    downloadSection = `
                        <span style="font-size:0.8rem; color:#f59e0b; background:rgba(245,158,11,0.1); padding:4px 8px; border-radius:4px; border:1px solid rgba(245,158,11,0.3);">
                            🔒 สิทธิ์ดาวน์โหลดถูกล็อก (${item.lock_reason || 'รอการยืนยัน'})
                        </span>
                    `;
                }

                return `
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.05); gap:12px; flex-wrap:wrap;">
                        <div style="display:flex; align-items:center; gap:12px;">
                            <img src="${item.cover_image}" style="width:40px; height:55px; object-fit:cover; border-radius:4px;" alt="">
                            <div>
                                <div style="font-weight:600; font-size:0.95rem;">${item.title}</div>
                                <div style="font-size:0.8rem; color:var(--text-muted);">${item.author_name} | ราคาซื้อ: ฿${parseFloat(item.price_at_purchase).toFixed(2)}</div>
                            </div>
                        </div>
                        <div>
                            ${downloadSection}
                        </div>
                    </div>
                `;
            }).join('');

                let orderBottomActions = '';
                if (ord.status === 'pending') {
                    if (ord.slip_image_url) {
                        orderBottomActions = `
                            <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
                                <button type="button" class="btn btn-secondary btn-sm" onclick="viewSlipModal('${ord.slip_image_url || '/api/orders/' + ord.order_id + '/slip'}', '${ord.order_number}', ${ord.total_amount}, '${ord.payment_method}')" style="font-size:0.8rem; padding:4px 10px; color:#38bdf8; border-color:rgba(56,189,248,0.4);">🔍 ดูสลิปที่แนบ</button>
                                <button type="button" class="btn btn-secondary btn-sm" onclick="openAttachSlipModal(${ord.order_id}, '${ord.order_number}', ${ord.total_amount})" style="font-size:0.8rem; padding:4px 10px; color:#a5b4fc; border-color:rgba(99,102,241,0.4);">✏️ แก้ไขสลิป</button>
                                <button type="button" class="btn btn-sm" onclick="cancelMyOrder(${ord.order_id}, '${ord.order_number}')" style="background:rgba(239,68,68,0.12); color:#ef4444; border:1px solid rgba(239,68,68,0.3); font-size:0.8rem; padding:4px 10px; border-radius:6px; cursor:pointer;">✕ ยกเลิกคำสั่งซื้อ</button>
                            </div>
                        `;
                    } else {
                        orderBottomActions = `
                            <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                                <span style="color:#f87171; font-size:0.82rem; font-weight:600;">⚠️ ยังไม่ได้แนบสลิป</span>
                                <button type="button" class="btn btn-primary btn-sm" onclick="openAttachSlipModal(${ord.order_id}, '${ord.order_number}', ${ord.total_amount})" style="font-size:0.82rem; padding:5px 12px; background:linear-gradient(135deg, #0284c7, #2563eb); font-weight:600; border-radius:6px; box-shadow:0 2px 8px rgba(37,99,235,0.3);">📤 แนบสลิปชำระเงิน</button>
                                <button type="button" class="btn btn-sm" onclick="cancelMyOrder(${ord.order_id}, '${ord.order_number}')" style="background:rgba(239,68,68,0.12); color:#ef4444; border:1px solid rgba(239,68,68,0.3); font-size:0.82rem; padding:5px 12px; border-radius:6px; cursor:pointer;">✕ ขอยกเลิกคำสั่งซื้อ</button>
                            </div>
                        `;
                    }
                } else if (ord.status === 'confirmed') {
                    orderBottomActions = `
                        <div style="display:flex; gap:6px; align-items:center;">
                            ${ord.slip_image_url ? `<button type="button" class="btn btn-secondary btn-sm" onclick="viewSlipModal('${ord.slip_image_url || '/api/orders/' + ord.order_id + '/slip'}', '${ord.order_number}', ${ord.total_amount}, '${ord.payment_method}')" style="font-size:0.8rem; padding:4px 10px; color:#38bdf8; border-color:rgba(56,189,248,0.4);">🔍 ดูสลิป</button>` : ''}
                            <span style="color:#10b981; font-size:0.8rem; font-weight:600;">✓ ชำระแล้วและอนุมัติสิทธิ์</span>
                        </div>
                    `;
                } else if (ord.status === 'cancelled') {
                    orderBottomActions = `
                        <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                            <span style="color:var(--text-muted); font-size:0.82rem;">✕ คำสั่งซื้อนี้ถูกยกเลิกแล้ว</span>
                            <button type="button" class="btn btn-secondary btn-sm" onclick="openAttachSlipModal(${ord.order_id}, '${ord.order_number}', ${ord.total_amount})" style="font-size:0.78rem; padding:3px 10px; color:#38bdf8; border-color:rgba(56,189,248,0.3);">📤 แนบสลิปใหม่เพื่อสั่งซื้อต่อ</button>
                        </div>
                    `;
                }

                ordCard.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; border-bottom:1px solid var(--border); padding-bottom:10px; flex-wrap:wrap; gap:8px;">
                        <div>
                            <span style="font-size:1rem; font-weight:700; color:#38bdf8;">${ord.order_number}</span>
                            <div style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">สั่งซื้อเมื่อ: ${ord.created_at}</div>
                        </div>
                        <div style="text-align:right;">
                            <span class="status-badge ${statusBadgeClass}">${statusLabel}</span>
                            <div style="font-size:1.15rem; font-weight:bold; color:var(--text-primary); margin-top:4px;">ยอดรวม: ฿${parseFloat(ord.total_amount).toFixed(2)}</div>
                        </div>
                    </div>

                    <div style="margin-bottom:8px;">
                        ${itemsHtml}
                    </div>

                    <div style="font-size:0.85rem; color:var(--text-muted); display:flex; justify-content:space-between; align-items:center; margin-top:12px; padding-top:10px; border-top:1px solid rgba(255,255,255,0.06); flex-wrap:wrap; gap:8px;">
                        <span>ช่องทาง: ${ord.payment_method === 'promptpay_qr' ? 'PromptPay QR' : 'โอนเงิน'}</span>
                        ${orderBottomActions}
                    </div>
                `;
                container.appendChild(ordCard);
            });

        } catch (err) {
            container.innerHTML = `<div style="color:var(--danger); padding:20px;">เกิดข้อผิดพลาด: ${err.message}</div>`;
        }
    }

    // Customer cancels order
    async function cancelMyOrder(orderId, orderNumber) {
        if (!confirm(`คุณต้องการยกเลิกคำสั่งซื้อ "${orderNumber}" ใช่หรือไม่?\n\n(หากยกเลิกแล้ว สถานะคำสั่งซื้อจะเปลี่ยนเป็น "ยกเลิกแล้ว")`)) {
            return;
        }

        try {
            const res = await fetch(`/api/orders/${orderId}/cancel`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-user-id': currentUserId 
                }
            });
            const data = await res.json();
            if (res.ok) {
                showToast('✓ ' + (data.message || 'ยกเลิกคำสั่งซื้อเรียบร้อยแล้ว'));
                loadMyOrders();
            } else {
                showToast(data.error || 'ไม่สามารถยกเลิกคำสั่งซื้อได้', 'error');
            }
        } catch (err) {
            showToast('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', 'error');
        }
    }

    // Modal Attach / Edit Slip Functions
    let currentAttachOrderId = null;
    let currentAttachOrderNumber = '';
    let currentAttachTotalAmount = 0;
    let attachMockSlipUrl = null;

    function openAttachSlipModal(orderId, orderNumber, totalAmount) {
        currentAttachOrderId = orderId;
        currentAttachOrderNumber = orderNumber;
        currentAttachTotalAmount = parseFloat(totalAmount) || 0;
        attachMockSlipUrl = null;

        document.getElementById('attach-slip-order-num').textContent = orderNumber;
        document.getElementById('attach-slip-amount').textContent = `฿${currentAttachTotalAmount.toFixed(2)}`;
        document.getElementById('attach-qr-amount').textContent = `฿${currentAttachTotalAmount.toFixed(2)}`;

        const fileInput = document.getElementById('attach-slip-file-input');
        if (fileInput) fileInput.value = '';

        const status = document.getElementById('attach-slip-status');
        if (status) {
            status.style.display = 'none';
            status.innerHTML = '';
        }

        const container = document.getElementById('attach-slip-preview-container');
        if (container) container.style.display = 'none';

        const previewImg = document.getElementById('attach-slip-preview-img');
        if (previewImg) previewImg.src = '';

        const btnQuick = document.getElementById('btn-attach-quick-slip');
        if (btnQuick) {
            btnQuick.style.background = 'rgba(99,102,241,0.15)';
            btnQuick.style.borderColor = 'var(--primary)';
            btnQuick.style.color = '#a5b4fc';
        }

        document.getElementById('attach-slip-modal').classList.add('active');
    }

    function closeAttachSlipModal() {
        document.getElementById('attach-slip-modal').classList.remove('active');
        currentAttachOrderId = null;
        attachMockSlipUrl = null;
    }

    function useAttachMockSlip() {
        const timestamp = Date.now();
        attachMockSlipUrl = `/api/slips/preview?amount=${encodeURIComponent(currentAttachTotalAmount)}&name=${encodeURIComponent(currentUserName || 'ลูกค้า EBOOK_ONLINE')}&order_number=${encodeURIComponent(currentAttachOrderNumber)}&method=promptpay_qr&t=${timestamp}`;

        const fileInput = document.getElementById('attach-slip-file-input');
        if (fileInput) fileInput.value = '';

        const status = document.getElementById('attach-slip-status');
        const container = document.getElementById('attach-slip-preview-container');
        const previewImg = document.getElementById('attach-slip-preview-img');

        if (previewImg) previewImg.src = attachMockSlipUrl;
        if (container) container.style.display = 'block';

        if (status) {
            status.style.display = 'block';
            status.style.background = 'rgba(16,185,129,0.12)';
            status.style.border = '1px solid rgba(16,185,129,0.3)';
            status.style.color = '#34d399';
            status.innerHTML = `✓ แนบสลิปจำลองตรงตามยอด <strong>฿${currentAttachTotalAmount.toFixed(2)}</strong> เรียบร้อยแล้ว`;
        }

        const btnQuick = document.getElementById('btn-attach-quick-slip');
        if (btnQuick) {
            btnQuick.style.background = 'rgba(16,185,129,0.2)';
            btnQuick.style.borderColor = '#10b981';
            btnQuick.style.color = '#34d399';
        }
    }

    function handleAttachSlipFileChange(input) {
        if (input.files && input.files[0]) {
            attachMockSlipUrl = null;
            const file = input.files[0];
            const status = document.getElementById('attach-slip-status');
            const container = document.getElementById('attach-slip-preview-container');
            const previewImg = document.getElementById('attach-slip-preview-img');

            const reader = new FileReader();
            reader.onload = function(e) {
                if (previewImg && container) {
                    previewImg.src = e.target.result;
                    container.style.display = 'block';
                }
                if (status) {
                    status.style.display = 'block';
                    status.style.background = 'rgba(16,185,129,0.12)';
                    status.style.border = '1px solid rgba(16,185,129,0.3)';
                    status.style.color = '#34d399';
                    status.innerHTML = `✓ แนบไฟล์รูป <strong>${file.name}</strong> เรียบร้อยแล้ว`;
                }
            };
            reader.readAsDataURL(file);

            const btnQuick = document.getElementById('btn-attach-quick-slip');
            if (btnQuick) {
                btnQuick.style.background = 'transparent';
                btnQuick.style.borderColor = 'var(--border)';
                btnQuick.style.color = 'var(--text-secondary)';
            }
        }
    }

    async function submitAttachSlip() {
        if (!currentAttachOrderId) return;

        const fileInput = document.getElementById('attach-slip-file-input');
        const hasFile = fileInput && fileInput.files && fileInput.files.length > 0;

        if (!hasFile && !attachMockSlipUrl) {
            showToast('กรุณากดแนบสลิปจำลอง หรือเลือกไฟล์รูปภาพก่อนบันทึก', 'error');
            return;
        }

        const btnSubmit = document.getElementById('btn-submit-attach-slip');
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'กำลังส่งหลักฐาน... ⏳';

        try {
            const formData = new FormData();
            formData.append('payment_method', 'promptpay_qr');

            if (hasFile) {
                const compressedSlip = await compressImage(fileInput.files[0]);
                formData.append('slip_image', compressedSlip);
                formData.append('note', 'แนบไฟล์สลิปเพิ่มเติมโดยลูกค้า');
            } else {
                formData.append('slip_mock_url', attachMockSlipUrl);
                formData.append('note', 'แนบสลิปจำลองเพิ่มเติมโดยลูกค้า');
            }

            const res = await fetch(`/api/orders/${currentAttachOrderId}/payment`, {
                method: 'POST',
                headers: { 'x-user-id': currentUserId },
                body: formData
            });

            const data = await res.json();
            if (res.ok) {
                showToast('✓ ' + (data.message || 'แนบสลิปชำระเงินเรียบร้อยแล้ว'));
                closeAttachSlipModal();
                loadMyOrders();
            } else {
                showToast(data.error || 'เกิดข้อผิดพลาดในการส่งสลิป', 'error');
            }
        } catch (err) {
            showToast('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', 'error');
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.textContent = 'บันทึกและส่งสลิป 🚀';
        }
    }

// ====================================================================
// User Profile Logic
// ====================================================================
async function openProfileModal() {
    toggleUserDropdown(); // Close the dropdown if open
    document.getElementById('profile-modal').classList.add('active');
    
    // Fetch current user data
    try {
        const res = await apiFetch('/api/auth/me');
        const data = await res.json();
        if (res.ok && data.user) {
            document.getElementById('edit-profile-name').value = data.user.full_name || '';
            document.getElementById('edit-profile-phone').value = data.user.phone || '';
        } else {
            showToast('ไม่สามารถดึงข้อมูลโปรไฟล์ได้', 'error');
        }
    } catch (err) {
        showToast('ข้อผิดพลาดเครือข่าย', 'error');
    }
}

function closeProfileModal() {
    document.getElementById('profile-modal').classList.remove('active');
}

async function submitEditProfile(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-submit-profile');
    btn.disabled = true;
    btn.innerHTML = '🔄 กำลังบันทึก...';
    
    const fullName = document.getElementById('edit-profile-name').value;
    const phone = document.getElementById('edit-profile-phone').value;
    
    try {
        const res = await apiFetch('/api/auth/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ full_name: fullName, phone: phone })
        });
        const data = await res.json();
        
        if (res.ok) {
            showToast('แก้ไขข้อมูลส่วนตัวสำเร็จ!', 'success');
            // Update local state
            currentUserName = data.user.full_name;
            localStorage.setItem('ebook_user_name', data.user.full_name);
            updateUserBadgeDisplay();
            closeProfileModal();
        } else {
            showToast(data.error || 'เกิดข้อผิดพลาดในการบันทึก', 'error');
        }
    } catch (err) {
        showToast('ข้อผิดพลาดเครือข่าย', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'บันทึกข้อมูล ➔';
    }
}

async function reorderEbook(ebookId) {
    closeOrdersModal();
    await addToCart(ebookId);
    toggleCartDrawer();
}

