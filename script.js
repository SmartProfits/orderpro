// ==========================================
// CONFIGURATION & INITIALIZATION
// ==========================================

const authFirebaseConfig = {
    apiKey: "AIzaSyCiwlw10jP3RTyLZ69bh0fAqZjUSwD59Xc",
    authDomain: "order-pro-c0af9.firebaseapp.com",
    databaseURL: "https://order-pro-c0af9-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "order-pro-c0af9",
    storageBucket: "order-pro-c0af9.firebasestorage.app",
    messagingSenderId: "1062589065402",
    appId: "1:1062589065402:web:499c586bdfb399a461ba83",
    measurementId: "G-4W7C1FKW1M"
};

const stockFirebaseConfig = {
    apiKey: "AIzaSyDAK5KVv9oln2qS5EfNzox1snM19wa83-o",
    authDomain: "smart-profits-stock.firebaseapp.com",
    databaseURL: "https://smart-profits-stock-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "smart-profits-stock",
    storageBucket: "smart-profits-stock.firebasestorage.app",
    messagingSenderId: "1029424292465",
    appId: "1:1029424292465:web:6de46925db8818d462b1d0",
    measurementId: "G-R0K4Q7JTGE"
};

// Initialize Firebase
const authApp = firebase.initializeApp(authFirebaseConfig);
const db = authApp.database();
const auth = authApp.auth();
const stockApp = firebase.initializeApp(stockFirebaseConfig, "stock");
const stockDb = stockApp.database();

// Advanced Sound Effect System using Web Audio API
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playEffect(type) {
    try {
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const gainNode = audioCtx.createGain();
        gainNode.connect(audioCtx.destination);

        if (type === 'add') {
            // High pitch short beep (Increase)
            playTone(880, 0.1, 'sine');
        } else if (type === 'remove') {
            // Low pitch short beep (Decrease)
            playTone(440, 0.1, 'sine');
        } else if (type === 'select') {
            // Soft pop (Selection)
            playTone(600, 0.05, 'triangle');
        } else if (type === 'success') {
            // Success chime (WhatsApp)
            playTone(523.25, 0.1, 'sine'); // C5
            setTimeout(() => playTone(659.25, 0.2, 'sine'), 100); // E5
        } else {
            // Default click
            playTone(800, 0.03, 'sine');
        }

        // Trigger vibration as backup
        if (localStorage.getItem('vibration-enabled') !== 'disabled' && window.navigator.vibrate) {
            window.navigator.vibrate(10);
        }
    } catch (e) {
        console.error("Audio play failed", e);
    }
}

function playTone(freq, duration, type) {
    try {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = type;
        oscillator.frequency.value = freq;

        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) { }
}

// Global State
let stockMap = {};
let currentUser = null;
let userRole = "User";
let selectedItems = {};
let currentView = localStorage.getItem('view-mode') || 'list';
let splashShown = false; // Track splash state
window.allProducts = {};

// Product Categories Data - Loaded dynamically from Firebase
let categories = {};
let categoryOrder = [];

// Default Category Emoji Icons Map (fallback to 🏷️ if not listed)
let categoryIcons = {
    'BanHeang': '🍪',
    'HoeHup': '🥮',
    'Chocolate': '🍫',
    'Oriental': '🍵',
    'Coffee': '☕',
    'Amplang': '🌕',
    'Other': '🎁',
    'Wrapping': '🧸',
    'Office': '📦',
    'Sotong': '🦑',
    'Snack': '🍿',
    'Tea': '🍵'
};

function getOrderedCategoryKeys() {
    const existing = Object.keys(categories);
    const ordered = [];
    if (Array.isArray(categoryOrder)) {
        categoryOrder.forEach(cat => {
            if (existing.includes(cat) && !ordered.includes(cat)) {
                ordered.push(cat);
            }
        });
    }
    existing.forEach(cat => {
        if (!ordered.includes(cat)) {
            ordered.push(cat);
        }
    });
    return ordered;
}

function getCategoryIcon(catName) {
    return categoryIcons[catName] || '🏷️';
}

// Render dynamic category cards in home view (3 per row)
function renderCategoryGrid() {
    const container = document.getElementById('categoryContainer');
    if (!container) return;

    // Preserve current selection if any
    const checkedRadio = document.querySelector('input[name="category"]:checked');
    const currentSelected = checkedRadio ? checkedRadio.value : null;

    container.innerHTML = '';

    const catKeys = getOrderedCategoryKeys();
    if (catKeys.length === 0) {
        container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary); padding: 20px;">No categories available</div>';
        return;
    }

    catKeys.forEach(cat => {
        const card = document.createElement('div');
        card.className = 'category-card';
        if (cat === currentSelected) {
            card.classList.add('selected');
        }
        card.onclick = function () { selectCategory(this, cat); };

        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'category';
        radio.value = cat;
        radio.id = 'cat_' + cat.replace(/\s+/g, '_');
        radio.style.display = 'none';
        if (cat === currentSelected) {
            radio.checked = true;
        }

        const iconSpan = document.createElement('span');
        iconSpan.className = 'category-icon';
        iconSpan.textContent = getCategoryIcon(cat);

        const label = document.createElement('label');
        label.textContent = cat;

        card.appendChild(radio);
        card.appendChild(iconSpan);
        card.appendChild(label);
        container.appendChild(card);
    });

    // If currently selected category still exists, refresh products view
    if (currentSelected && categories[currentSelected]) {
        const productList = document.getElementById('productList');
        if (productList && productList.style.display !== 'none') {
            loadProducts(categories[currentSelected]);
        }
    }
}

// ==========================================
// FIREBASE CATEGORIES MANAGEMENT
// ==========================================

// Load categories, order, and icons from Firebase
function loadCategoriesFromFirebase() {
    return Promise.all([
        db.ref('categories').once('value'),
        db.ref('categoryOrder').once('value'),
        db.ref('categoryIcons').once('value')
    ]).then(([catSnap, orderSnap, iconsSnap]) => {
        if (catSnap.exists()) {
            categories = catSnap.val() || {};
        } else {
            console.warn("Categories node is empty in Firebase.");
            categories = {};
        }

        if (orderSnap.exists() && Array.isArray(orderSnap.val())) {
            categoryOrder = orderSnap.val();
        } else {
            categoryOrder = Object.keys(categories);
        }

        if (iconsSnap.exists() && iconsSnap.val()) {
            categoryIcons = { ...categoryIcons, ...iconsSnap.val() };
        }

        initAllProducts();
        renderCategoryGrid();
        initAdminPanel();
        return true;
    }).catch(error => {
        console.error("Error loading categories from Firebase:", error);
        categories = {};
        categoryOrder = [];
        initAllProducts();
        renderCategoryGrid();
        return false;
    });
}

// ==========================================
// SPLASH SCREEN LOGIC
// ==========================================
function playOpeningAnimation(callback) {
    const splash = document.getElementById('splashScreen');
    const mainContent = document.getElementById('mainAppContent');

    splash.style.display = 'flex';
    mainContent.style.opacity = '0';

    setTimeout(() => {
        splash.style.transform = 'scale(1.05)';
        splash.style.opacity = '0';
        setTimeout(() => {
            splash.style.display = 'none';
            splash.style.opacity = '1';
            splash.style.transform = 'scale(1)';
            mainContent.style.opacity = '1';
            if (callback) callback();
        }, 600);
    }, 2800);
}

// ==========================================
// LOGIC RESTORATION
// ==========================================

function initAllProducts() {
    window.allProducts = {};
    Object.entries(categories).forEach(([category, products]) => {
        products.forEach(product => {
            window.allProducts[product.id] = product;
        });
    });
}

// Intersection Observer for fade-in
const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-visible');
            fadeObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

// Touch Ripple Effect for Native App Feel
document.addEventListener('click', function (e) {
    const target = e.target.closest('.shop-card, .category-card, button, .bottom-nav-item');
    if (!target) return;

    const circle = document.createElement('span');
    const diameter = Math.max(target.clientWidth, target.clientHeight);
    const radius = diameter / 2;

    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left - radius;
    const y = e.clientY - rect.top - radius;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${x}px`;
    circle.style.top = `${y}px`;
    circle.classList.add('ripple');

    const oldPosition = getComputedStyle(target).position;
    if (oldPosition === 'static') target.style.position = 'relative';
    if (target.tagName === 'BUTTON') target.style.overflow = 'hidden';

    target.appendChild(circle);
    setTimeout(() => circle.remove(), 600);
});

// Render Products with Image Support
function loadProducts(products) {
    const productList = document.getElementById('productList');
    productList.innerHTML = '';

    // Get new product info from cache or similar if needed, here we just load
    // We need to fetch the 'new products' status to add badges
    Promise.all([
        db.ref('newProducts').once('value'),
        db.ref('productBoxes').once('value')
    ]).then(([newProductsSnapshot, productBoxesSnapshot]) => {
        const newProductsData = newProductsSnapshot.val() || {};

        // Sort Logic
        const sortedProducts = [...products].sort((a, b) => {
            const stockA = stockMap[a.name] || 0;
            const stockB = stockMap[b.name] || 0;
            if ((stockA > 0) === (stockB > 0)) return 0;
            return stockA > 0 ? -1 : 1;
        });

        sortedProducts.forEach(product => {
            const div = document.createElement('div');
            div.setAttribute('data-product-id', product.id);

            // Check for New Status
            const isNew = newProductsData[product.id];
            const newUntil = isNew ? new Date(isNew.until) : null;
            const isStillNew = isNew && newUntil && newUntil > new Date();
            if (isStillNew) div.classList.add('new-product-glow');

            const isChecked = selectedItems[product.id] ? 'checked' : '';
            const defaultQuantity = product.defaultQuantity || 1;
            const currentQuantity = selectedItems[product.id] || defaultQuantity;
            const newBadge = isStillNew ? `<span class="product-new-badge">NEW</span>` : '';

            if (currentView === 'grid') {
                // Grid View with Image Support
                const hasImage = product.imageUrl ? true : false;
                const imageHTML = hasImage ?
                    `<div class="product-image" onclick="showImage('${product.imageUrl}', '${product.name}'); event.stopPropagation();">
                        <img src="${product.imageUrl}" alt="${product.name}" onerror="this.style.display='none';this.parentNode.innerHTML='<span class=\'material-icons-round\' style=\'font-size:32px;color:var(--text-secondary)\'>inventory_2</span>'">
                        </div>` :
                    `<div class="product-image"><span class="material-icons-round" style="font-size: 32px; color: var(--text-secondary);">inventory_2</span></div>`;

                div.innerHTML = `
                    <input type="checkbox" id="item${product.id}" ${isChecked} onchange="saveItem(${product.id}, '${product.name}')">
                    ${imageHTML}
                    <span class="product-name" onclick="document.getElementById('item${product.id}').click()">${product.name}</span>
                    <div class="product-meta-row" style="justify-content:center; margin-bottom: 8px;">
                        ${newBadge}
                        <span class="product-unit-badge" id="unitBadge${product.id}" style="display: none;"></span>
                    </div>
                    <div id="stock${product.id}" class="stock-info" style="color: var(--accent-color); font-size: 0.8rem; margin-bottom: 10px;">Checking...</div>
                    <div class="quantity-controls-wrapper">
                        <button class="quantity-btn" onclick="changeQuantity(${product.id}, 1)"><span class="material-icons-round">add</span></button>
                        <input type="number" id="quantity${product.id}" min="1" value="${currentQuantity}" readonly>
                        <button class="quantity-btn" onclick="changeQuantity(${product.id}, -1)"><span class="material-icons-round">remove</span></button>
                    </div>
                `;
            } else {
                // List View with Image Button
                const viewImageButton = product.imageUrl ?
                    `<button class="view-image-btn" onclick="showImage('${product.imageUrl}', '${product.name}'); event.stopPropagation();">
                        <span class="material-icons-outlined" style="font-size: 14px; margin-right: 2px;">image</span> View
                    </button>` : '';

                div.innerHTML = `
                    <div style="display:flex; align-items:flex-start; flex:1;">
                        <div style="display:flex; flex-direction:column; align-items:center; margin-right:12px; flex-shrink:0; padding-top:2px;">
                            <input type="checkbox" id="item${product.id}" ${isChecked} onchange="saveItem(${product.id}, '${product.name}')" style="margin-right:0; margin-bottom:6px;">
                            ${newBadge ? newBadge.replace('product-new-badge', 'product-new-badge small-badge') : ''}
                        </div>
                        <label for="item${product.id}" style="flex:1;">
                            <div class="product-name-text">
                                ${product.name}
                            </div>
                            <div class="product-meta-row">
                                <span id="stock${product.id}" class="stock-info" style="color: var(--accent-color);">Checking...</span>
                            </div>
                        </label>
                    </div>
                    
                    <div style="display:flex; flex-direction:column; align-items:flex-end; gap:8px;">
                        <div class="quantity-controls-wrapper">
                                <button class="quantity-btn" onclick="changeQuantity(${product.id}, -1)"><span class="material-icons-round">remove</span></button>
                                <input type="number" id="quantity${product.id}" min="1" value="${currentQuantity}" readonly>
                                <button class="quantity-btn" onclick="changeQuantity(${product.id}, 1)"><span class="material-icons-round">add</span></button>
                        </div>
                        <div class="action-btn-row">
                            <div class="unit-slot">
                                <span class="product-unit-badge" id="unitBadge${product.id}" style="display: none;"></span>
                            </div>
                            <div class="view-slot">
                                ${viewImageButton}
                            </div>
                        </div>
                    </div>
                `;
            }
            div.classList.add('fade-up-item');
            productList.appendChild(div);
            fadeObserver.observe(div);
        });

        // Trigger stock update to fill in numbers
        loadQuantitiesFromFirebase();
        updateProductBoxDisplay();
    });
}

// ==========================
// ADMIN PANEL LOGIC RESTORED
// ==========================

function openAdminPanel() {
    playEffect('click');
    document.getElementById('adminPanel').style.display = 'flex';
    loadUsersList();
    // Reload categories to ensure we have latest data
    loadCategoriesFromFirebase().then(() => {
        initAdminPanel();
        showAdminTab('users');
    });
}

function showAdminTab(tabName) {
    playEffect('click');
    document.querySelectorAll('.admin-tab-content').forEach(tab => tab.style.display = 'none');
    document.querySelectorAll('.tab-button').forEach(button => button.classList.remove('active'));
    document.getElementById(tabName + '-tab').style.display = 'block';
    const activeBtn = document.querySelector(`.tab-button[onclick="showAdminTab('${tabName}')"]`);
    if (activeBtn) activeBtn.classList.add('active');

    if (tabName === 'categories') {
        loadCategoriesForAdmin();
    }
    if (tabName === 'products') {
        const sel = document.getElementById('categorySelect');
        if (sel.value) loadProductsForAdmin();
    }
    if (tabName === 'announcement') {
        loadAnnouncementSettings();
        loadRestDays();
    }
}

function initAdminPanel() {
    const sel = document.getElementById('categorySelect');
    if (!sel) return;
    const currentVal = sel.value;
    sel.innerHTML = '<option value="">-- Select Category --</option>';
    getOrderedCategoryKeys().forEach(c => {
        const o = document.createElement('option');
        o.value = c;
        o.text = `${getCategoryIcon(c)} ${c}`;
        sel.add(o);
    });
    if (currentVal && categories[currentVal]) {
        sel.value = currentVal;
    }
}

// --- User Management ---
function loadUsersList() {
    document.getElementById('pendingUsersList').innerHTML = '<div style="padding:20px; text-align:center; color:var(--text-secondary);">Loading...</div>';
    document.getElementById('allUsersList').innerHTML = '<div style="padding:20px; text-align:center; color:var(--text-secondary);">Loading...</div>';

    db.ref('users').once('value').then(snapshot => {
        const pendingDiv = document.getElementById('pendingUsersList');
        const allDiv = document.getElementById('allUsersList');
        pendingDiv.innerHTML = '';
        allDiv.innerHTML = '';

        if (!snapshot.exists()) {
            pendingDiv.innerHTML = '<p style="text-align:center; padding:20px; color:var(--text-secondary);">No pending users.</p>';
            allDiv.innerHTML = '<p style="text-align:center; padding:20px; color:var(--text-secondary);">No users found.</p>';
            return;
        }

        snapshot.forEach(child => {
            const uid = child.key;
            const user = child.val();

            // Render Pending
            if (user.status === 'pending') {
                pendingDiv.innerHTML += `
                    <div class="user-card">
                        <div class="user-name">${user.name}</div>
                        <div style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:12px;">${user.email}</div>
                        <div style="display:flex; gap:8px;">
                            <button class="action-button approve" onclick="approveUser('${uid}')">
                                <span class="material-icons-round" style="font-size:16px; margin-right:4px;">check_circle</span>Approve
                            </button>
                        </div>
                    </div>
                `;
            }

            // Render All Users (Permissions Logic)
            if (userRole === 'Admin' && user.role === 'SAdmin') return; // Admin can't see SAdmin

            let actions = '';
            if (userRole === 'SAdmin' && uid !== currentUser.uid) {
                if (user.role === 'User') actions += `<button class="action-button promote" onclick="changeUserRole('${uid}','User','Admin')"><span class="material-icons-round" style="font-size:16px; margin-right:4px;">admin_panel_settings</span>Admin</button>`;
                if (user.role === 'Admin') actions += `<button class="action-button demote" onclick="changeUserRole('${uid}','Admin','User')"><span class="material-icons-round" style="font-size:16px; margin-right:4px;">person</span>User</button>`;
                actions += `<button class="action-button delete" onclick="deleteUser('${uid}')"><span class="material-icons-round" style="font-size:16px; margin-right:4px;">delete</span>Delete</button>`;
            }
            if (user.status === 'pending') actions = `<button class="action-button approve" onclick="approveUser('${uid}')"><span class="material-icons-round" style="font-size:16px; margin-right:4px;">check_circle</span>Activate</button>` + actions;

            const statusColor = user.status === 'active' ? 'var(--success-color)' : 'orange';
            const statusBg = user.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)';

            allDiv.innerHTML += `
                <div class="user-card">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        <div class="user-name">${user.name}</div>
                        <span style="font-size:0.7rem; color:var(--text-secondary); opacity:0.6;">${uid.substring(0, 6)}</span>
                    </div>
                    <div class="user-status">
                        <span style="color:${statusColor}; background:${statusBg}">● ${user.status.toUpperCase()}</span>
                        <span style="background:var(--bg-color); color:var(--text-secondary); border:1px solid var(--border-color);">${user.role.toUpperCase()}</span>
                    </div>
                    <div style="display:flex; flex-wrap:wrap; gap:4px;">${actions}</div>
                </div>
            `;
        });

        if (pendingDiv.innerHTML === '') pendingDiv.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-secondary);">No pending users.</div>';
    });
}

function approveUser(uid) {
    playEffect('success');
    db.ref(`users/${uid}`).update({ status: 'active' }).then(() => { alert('Approved'); loadUsersList(); });
}

function changeUserRole(uid, oldRole, newRole) {
    if (confirm(`Change role from ${oldRole} to ${newRole}?`)) {
        playEffect('click');
        db.ref(`users/${uid}`).update({ role: newRole }).then(() => { alert('Role updated'); loadUsersList(); });
    }
}

function deleteUser(uid) {
    if (confirm('Delete this user permanently?')) {
        playEffect('click');
        db.ref(`users/${uid}`).remove().then(() => { alert('Deleted'); loadUsersList(); });
    }
}

// --- Product Management ---
function loadProductsForAdmin() {
    const cat = document.getElementById('categorySelect').value;
    const div = document.getElementById('productManagementList');
    if (!cat) {
        div.innerHTML = '<div style="padding:40px; text-align:center; color:var(--text-secondary);"><span class="material-icons-round" style="font-size:48px; display:block; margin-bottom:12px; opacity:0.3;">category</span>Please select a category</div>';
        return;
    }

    const products = categories[cat] || [];
    div.innerHTML = '<div style="padding:20px; text-align:center; color:var(--text-secondary);">Loading products...</div>';

    Promise.all([
        db.ref('newProducts').once('value'),
        db.ref('productBoxes').once('value')
    ]).then(([newSnap, boxSnap]) => {
        const newData = newSnap.val() || {};
        const boxData = boxSnap.val() || {};
        div.innerHTML = '';

        if (products.length === 0) {
            div.innerHTML = '<div style="padding:40px; text-align:center; color:var(--text-secondary);">No products in this category. Click "Add Product" to add one.</div>';
            return;
        }

        products.forEach(p => {
            const isNew = newData[p.id];
            const newUntil = isNew ? new Date(isNew.until) : null;
            const isStillNew = isNew && newUntil > new Date();
            const boxCount = boxData[p.id] || 0;
            const unit = p.unit || 'ctn';
            const defaultQty = p.defaultQuantity || 1;

            div.innerHTML += `
                <div class="product-item ${isStillNew ? 'new-product' : ''}">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
                        <div>
                            <div style="font-weight:800; color:var(--text-primary); margin-bottom:4px;">${p.name}</div>
                            <div style="font-size:0.75rem; color:var(--text-secondary);">ID: <span style="color:var(--primary-color);font-weight:700;">${p.id}</span> | Unit: ${unit} | Default: ${defaultQty}</div>
                        </div>
                        ${isStillNew ? '<span style="background:var(--danger-color); color:white; font-size:10px; padding:2px 8px; border-radius:10px; font-weight:800; box-shadow:0 0 10px rgba(239, 68, 68, 0.3);">NEW</span>' : ''}
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px; background: var(--bg-color); padding: 12px; border-radius: 12px; border: 1px solid var(--border-color);">
                        <span class="material-icons-round" style="font-size:20px; color:var(--text-secondary);">inventory_2</span>
                        <label style="font-size:0.85rem; font-weight:600; flex:1;">Unit Count </label>
                        <input type="number" value="${boxCount}" onchange="saveProductBoxCount(${p.id}, this.value)" 
                            style="width:70px; background:var(--surface-color); border:1px solid var(--border-color); padding:6px 10px; border-radius:8px; text-align:center; font-weight:700;">
                    </div>

                    <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                        <button class="action-button promote" onclick="editProduct(${p.id}, '${cat}')" style="margin:0;">
                            <span class="material-icons-round" style="font-size:16px; margin-right:4px;">edit</span>Edit
                        </button>
                        ${isStillNew ?
                    `<button class="action-button delete" onclick="toggleNewProduct(${p.id}, false)" style="margin:0;">
                                <span class="material-icons-round" style="font-size:16px; margin-right:4px;">star_outline</span>Unmark
                             </button>` :
                    `<button class="action-button promote" onclick="toggleNewProduct(${p.id}, true)" style="margin:0;">
                                <span class="material-icons-round" style="font-size:16px; margin-right:4px;">stars</span>Mark New
                             </button>`
                }
                        <button class="action-button delete" onclick="deleteProduct(${p.id}, '${cat}')" style="margin:0;">
                            <span class="material-icons-round" style="font-size:16px; margin-right:4px;">delete_forever</span>Delete
                        </button>
                    </div>
                </div>
            `;
        });
    });
}


function saveProductBoxCount(pid, val) {
    db.ref(`productBoxes/${pid}`).set(parseInt(val)).then(() => console.log('Box count saved'));
}

function toggleNewProduct(pid, state) {
    if (state) {
        const until = new Date();
        until.setDate(until.getDate() + 7);
        db.ref(`newProducts/${pid}`).set({ markedAt: Date.now(), until: until.getTime() }).then(() => {
            loadProductsForAdmin();
        });
    } else {
        db.ref(`newProducts/${pid}`).remove().then(() => loadProductsForAdmin());
    }
}

// ==========================================
// CATEGORY ARRANGEMENT & MANAGEMENT (3 per row)
// ==========================================
let editingCategoryName = null;
let draggedCat = null;

function loadCategoriesForAdmin() {
    const grid = document.getElementById('categoryManagementGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const keys = getOrderedCategoryKeys();
    if (keys.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--text-secondary);"><span class="material-icons-round" style="font-size: 48px; display: block; margin-bottom: 12px; opacity: 0.3;">category</span>No categories found. Click "Add Category" above to create one.</div>';
        return;
    }

    keys.forEach((cat, index) => {
        const prods = categories[cat] || [];
        const icon = getCategoryIcon(cat);
        const isFirst = index === 0;
        const isLast = index === keys.length - 1;

        const card = document.createElement('div');
        card.className = 'admin-cat-card';
        card.setAttribute('draggable', 'true');
        card.setAttribute('data-category', cat);
        card.setAttribute('data-index', index);

        card.innerHTML = `
            <span class="cat-rank-badge">#${index + 1}</span>
            <div class="admin-cat-icon">${icon}</div>
            <div class="admin-cat-name" title="${cat}">${cat}</div>
            <div class="admin-cat-count">${prods.length} items</div>
            <div class="admin-cat-actions">
                <button type="button" class="cat-btn" title="Move Left / Previous" onclick="moveCategory(${index}, -1); event.stopPropagation();" ${isFirst ? 'disabled' : ''} style="flex: 1;">
                    <span class="material-icons-round" style="font-size: 16px;">arrow_back</span>
                </button>
                <button type="button" class="cat-btn" title="Move Right / Next" onclick="moveCategory(${index}, 1); event.stopPropagation();" ${isLast ? 'disabled' : ''} style="flex: 1;">
                    <span class="material-icons-round" style="font-size: 16px;">arrow_forward</span>
                </button>
            </div>
        `;

        // HTML5 Drag and Drop Handlers
        card.addEventListener('dragstart', handleCatDragStart);
        card.addEventListener('dragover', handleCatDragOver);
        card.addEventListener('dragleave', handleCatDragLeave);
        card.addEventListener('drop', handleCatDrop);
        card.addEventListener('dragend', handleCatDragEnd);

        grid.appendChild(card);
    });
}

function handleCatDragStart(e) {
    draggedCat = this.getAttribute('data-category');
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', draggedCat);
}

function handleCatDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    this.classList.add('drag-over');
}

function handleCatDragLeave() {
    this.classList.remove('drag-over');
}

function handleCatDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    const targetCat = this.getAttribute('data-category');
    if (!draggedCat || draggedCat === targetCat) return;

    const keys = getOrderedCategoryKeys();
    const fromIdx = keys.indexOf(draggedCat);
    const toIdx = keys.indexOf(targetCat);
    if (fromIdx !== -1 && toIdx !== -1) {
        keys.splice(fromIdx, 1);
        keys.splice(toIdx, 0, draggedCat);
        categoryOrder = keys;
        playEffect('select');
        saveCategoryOrderToFirebase();
    }
}

function handleCatDragEnd() {
    this.classList.remove('dragging');
    document.querySelectorAll('.admin-cat-card').forEach(c => c.classList.remove('drag-over'));
}

function moveCategory(index, delta) {
    playEffect('click');
    const keys = getOrderedCategoryKeys();
    const targetIdx = index + delta;
    if (targetIdx < 0 || targetIdx >= keys.length) return;

    const temp = keys[index];
    keys[index] = keys[targetIdx];
    keys[targetIdx] = temp;
    categoryOrder = keys;
    saveCategoryOrderToFirebase();
}

function saveCategoryOrderToFirebase() {
    return db.ref('categoryOrder').set(categoryOrder).then(() => {
        renderCategoryGrid();
        initAdminPanel();
        loadCategoriesForAdmin();
    }).catch(err => {
        alert("Error saving category order: " + err.message);
    });
}

// Add/Edit Product Functions
let editingProductId = null;
let editingCategory = null;

function showAddProductModal() {
    playEffect('click');
    editingProductId = null;
    editingCategory = null;
    document.getElementById('productModalTitle').textContent = 'Add Product';
    document.getElementById('productModalId').value = '';
    document.getElementById('productModalName').value = '';
    document.getElementById('productModalUnit').value = '';
    document.getElementById('productModalDefaultQuantity').value = '1';

    // Populate category select
    const catSelect = document.getElementById('productModalCategory');
    catSelect.innerHTML = '<option value="">-- Select Category --</option>';
    getOrderedCategoryKeys().forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = `${getCategoryIcon(cat)} ${cat}`;
        catSelect.appendChild(option);
    });

    const addCatOption = document.createElement('option');
    addCatOption.value = '__NEW_CATEGORY__';
    addCatOption.textContent = '➕ + Create New Category...';
    catSelect.appendChild(addCatOption);

    catSelect.onchange = function () {
        if (this.value === '__NEW_CATEGORY__') {
            const newCat = prompt("Enter new category name:");
            if (newCat && newCat.trim()) {
                const trimmed = newCat.trim();
                let opt = Array.from(catSelect.options).find(o => o.value === trimmed);
                if (!opt) {
                    opt = document.createElement('option');
                    opt.value = trimmed;
                    opt.textContent = `🏷️ ${trimmed}`;
                    catSelect.insertBefore(opt, addCatOption);
                }
                catSelect.value = trimmed;
            } else {
                catSelect.value = currentCat || '';
            }
        }
    };

    // Pre-select if category is already selected in admin panel
    const currentCat = document.getElementById('categorySelect').value;
    if (currentCat) {
        catSelect.value = currentCat;
    }

    document.getElementById('productModal').style.display = 'flex';
}

function closeProductModal() {
    playEffect('click');
    document.getElementById('productModal').style.display = 'none';
    editingProductId = null;
    editingCategory = null;
}

function editProduct(productId, category) {
    playEffect('click');
    editingProductId = productId;
    editingCategory = category;

    document.getElementById('productModalId').disabled = false; // Reset disabled state

    const product = categories[category].find(p => p.id === productId);
    if (!product) {
        alert('Product not found');
        return;
    }

    document.getElementById('productModalTitle').textContent = 'Edit Product';
    document.getElementById('productModalId').value = product.id;
    document.getElementById('productModalId').disabled = true; // Can't change ID
    document.getElementById('productModalName').value = product.name;
    document.getElementById('productModalUnit').value = product.unit || '';
    document.getElementById('productModalDefaultQuantity').value = product.defaultQuantity || 1;

    // Populate category select
    const catSelect = document.getElementById('productModalCategory');
    catSelect.innerHTML = '<option value="">-- Select Category --</option>';
    catSelect.onchange = null;
    getOrderedCategoryKeys().forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = `${getCategoryIcon(cat)} ${cat}`;
        if (cat === category) option.selected = true;
        catSelect.appendChild(option);
    });

    document.getElementById('productModal').style.display = 'flex';
}

function saveProduct() {
    playEffect('success');
    const cat = document.getElementById('productModalCategory').value;
    const id = parseInt(document.getElementById('productModalId').value);
    const name = document.getElementById('productModalName').value.trim();
    const unit = document.getElementById('productModalUnit').value.trim();
    const defaultQuantity = parseInt(document.getElementById('productModalDefaultQuantity').value) || 1;

    if (!cat || !id || !name) {
        alert('Please fill in Category, ID, and Name');
        return;
    }

    const productData = {
        id: id,
        name: name
    };

    if (unit) productData.unit = unit;
    productData.defaultQuantity = defaultQuantity;

    if (editingProductId && editingCategory) {
        // Edit mode
        const oldIndex = categories[editingCategory].findIndex(p => p.id === editingProductId);
        if (oldIndex === -1) {
            alert('Product not found');
            return;
        }

        // Remove from old category if category changed
        if (editingCategory !== cat) {
            categories[editingCategory].splice(oldIndex, 1);
        } else {
            // Update in place
            categories[cat][oldIndex] = productData;
        }

        // Add to new category if category changed
        if (editingCategory !== cat) {
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(productData);
            if (!categoryOrder.includes(cat)) categoryOrder.push(cat);
        }
    } else {
        // Add mode - check if ID already exists
        let idExists = false;
        for (const [catKey, products] of Object.entries(categories)) {
            if (products.some(p => p.id === id)) {
                idExists = true;
                break;
            }
        }

        if (idExists) {
            alert(`Product ID ${id} already exists. Please use Edit instead.`);
            return;
        }

        // Add new product
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(productData);
        if (!categoryOrder.includes(cat)) categoryOrder.push(cat);
    }

    // Sort products by ID in the category
    if (categories[cat]) {
        categories[cat].sort((a, b) => a.id - b.id);
    }

    // Save to Firebase
    Promise.all([
        db.ref('categories').set(categories),
        db.ref('categoryOrder').set(categoryOrder)
    ]).then(() => {
        initAllProducts(); // Update allProducts
        renderCategoryGrid(); // Refresh UI category grid
        initAdminPanel(); // Refresh admin category dropdown
        const catSelect = document.getElementById('categorySelect');
        if (catSelect) catSelect.value = cat;
        loadProductsForAdmin(); // Refresh admin list
        closeProductModal();
        alert('Product saved successfully!');
    }).catch(error => {
        alert('Error saving product: ' + error.message);
    });
}

function deleteProduct(productId, category) {
    if (!confirm(`Delete product ID ${productId} from ${category}? This cannot be undone.`)) {
        return;
    }

    playEffect('click');
    const products = categories[category];
    const index = products.findIndex(p => p.id === productId);

    if (index === -1) {
        alert('Product not found');
        return;
    }

    products.splice(index, 1);

    // Save to Firebase
    db.ref('categories').set(categories).then(() => {
        initAllProducts(); // Update allProducts
        renderCategoryGrid(); // Refresh UI category grid
        initAdminPanel(); // Refresh admin category dropdown
        loadProductsForAdmin(); // Refresh admin list
        alert('Product deleted successfully!');
    }).catch(error => {
        alert('Error deleting product: ' + error.message);
    });
}

// --- Announcement Management ---
function toggleAnnouncement() {
    const enabled = document.getElementById('announcementEnabled').checked;
    document.getElementById('announcementSettings').style.display = enabled ? 'block' : 'none';
}

function toggleBgSettings() {
    const type = document.getElementById('announcementBgType').value;
    document.getElementById('solidColorSettings').style.display = type === 'solid' ? 'block' : 'none';
    document.getElementById('customGradientSettings').style.display = type === 'custom' ? 'block' : 'none';
}

function loadAnnouncementSettings() {
    db.ref('announcement').once('value').then(snap => {
        const data = snap.val();
        const statusDiv = document.getElementById('announcementStatusContent');

        if (data && data.enabled) {
            document.getElementById('announcementEnabled').checked = true;
            document.getElementById('announcementSettings').style.display = 'block';
            document.getElementById('announcementText').value = data.text || '';
            document.getElementById('announcementStartTime').value = data.startTime ? new Date(data.startTime).toISOString().slice(0, 16) : '';
            document.getElementById('announcementEndTime').value = data.endTime ? new Date(data.endTime).toISOString().slice(0, 16) : '';

            // Status Display
            const now = Date.now();
            let status = 'Expired';
            let color = 'grey';
            if (now < data.startTime) { status = 'Pending'; color = 'orange'; }
            else if (now <= data.endTime) { status = 'Active'; color = 'green'; }

            const creator = data.createdByName ? `<br>By: ${data.createdByName}` : '';
            statusDiv.innerHTML = `<b style="color:${color}">${status}</b><br>Text: ${data.text}${creator}<br><button onclick="cancelCurrentAnnouncement()" class="action-button delete" style="margin-top:5px;">Cancel</button>`;
        } else {
            document.getElementById('announcementEnabled').checked = false;
            document.getElementById('announcementSettings').style.display = 'none';
            statusDiv.innerHTML = 'No active announcement.';
        }

    });
}

function saveAnnouncementSettings() {
    playEffect('success');
    const enabled = document.getElementById('announcementEnabled').checked;
    if (!enabled) {
        db.ref('announcement').set({ enabled: false }).then(() => alert('Announcement disabled'));
        return;
    }

    // Get creator name from dashboard or user object
    const creatorName = document.getElementById('dashboardUserName').textContent || "Admin";

    const data = {
        enabled: true,
        text: document.getElementById('announcementText').value,
        startTime: new Date(document.getElementById('announcementStartTime').value).getTime(),
        endTime: new Date(document.getElementById('announcementEndTime').value).getTime(),
        fontSize: document.getElementById('announcementFontSize').value,
        textColor: document.getElementById('announcementTextColor').value,
        speed: document.getElementById('announcementSpeed').value,
        background: {
            type: document.getElementById('announcementBgType').value,
            color: document.getElementById('announcementBgColor').value,
            startColor: document.getElementById('announcementGradientStart').value,
            endColor: document.getElementById('announcementGradientEnd').value
        },
        createdBy: currentUser.uid,
        createdByName: creatorName // Store the name
    };

    db.ref('announcement').set(data).then(() => { alert('Saved'); loadAnnouncementSettings(); });
}

function cancelCurrentAnnouncement() {
    if (confirm('Cancel?')) db.ref('announcement').update({ enabled: false }).then(() => loadAnnouncementSettings());
}

function previewAnnouncement() {
    playEffect('click');
    const text = document.getElementById('announcementText').value;
    const creatorName = document.getElementById('dashboardUserName').textContent || "Admin";
    const prev = document.getElementById('announcementPreview');
    const inner = prev.querySelector('div');
    inner.textContent = `[${creatorName}]: ${text}`;

    const bgType = document.getElementById('announcementBgType').value;
    if (bgType === 'solid') prev.style.background = document.getElementById('announcementBgColor').value;
    else if (bgType === 'custom') prev.style.background = `linear-gradient(45deg, ${document.getElementById('announcementGradientStart').value}, ${document.getElementById('announcementGradientEnd').value})`;
    else prev.style.background = 'linear-gradient(90deg, #6366f1, #a855f7)';

    prev.style.color = document.getElementById('announcementTextColor').value;
    prev.style.fontSize = document.getElementById('announcementFontSize').value;

    // Add marquee to preview too
    inner.style.animation = 'none';
    inner.offsetHeight; /* reflow */
    inner.style.display = 'inline-block';
    inner.style.paddingLeft = '100%';
    inner.style.whiteSpace = 'nowrap';
    prev.style.animation = `marquee ${document.getElementById('announcementSpeed').value || '15s'} linear infinite`;
}

// --- Bulletin Board & Rest Days Logic ---

function loadRestDays() {
    db.ref('restDays').once('value').then(snap => {
        const val = snap.val();
        if (val) {
            document.getElementById('restDaysText').value = val;
            renderRestDayBanner(val);
        }
    });
}

function saveRestDays() {
    playEffect('success');
    const val = document.getElementById('restDaysText').value.trim();
    db.ref('restDays').set(val).then(() => {
        alert('Rest days updated!');
        renderRestDayBanner(val);
    });
}

function renderRestDayBanner(text) {
    const mainContent = document.getElementById('mainAppContent');
    let banner = document.getElementById('restDayBanner');

    if (!text) {
        if (banner) banner.remove();
        return;
    }

    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'restDayBanner';
        banner.className = 'rest-day-banner fade-up-item';
        // Insert after H1
        const h1 = mainContent.querySelector('h1');
        h1.parentNode.insertBefore(banner, h1.nextSibling);
    }

    banner.innerHTML = `
        <span class="material-icons-round">info</span>
        <div><b>Warehouse Rest Day:</b> ${text}</div>
    `;
    banner.classList.add('fade-visible');
}

function loadNewArrivals() {
    const listDiv = document.getElementById('bulletinList');

    db.ref('newProducts').on('value', snap => {
        if (!snap.exists()) {
            listDiv.innerHTML = '<div class="bulletin-empty">No new products today</div>';
            return;
        }

        const newItems = [];
        snap.forEach(child => {
            const pid = child.key;
            const data = child.val();
            const product = window.allProducts[pid];
            if (product) {
                newItems.push({
                    name: product.name,
                    id: product.id,
                    markedAt: data.markedAt,
                    dateStr: new Date(data.markedAt).toLocaleDateString('en-GB')
                });
            }
        });

        // Sort by most recent
        newItems.sort((a, b) => b.markedAt - a.markedAt);

        listDiv.innerHTML = '';
        if (newItems.length === 0) {
            listDiv.innerHTML = '<div class="bulletin-empty">No updates yet</div>';
            return;
        }

        newItems.slice(0, 10).forEach(item => {
            const div = document.createElement('div');
            div.className = 'bulletin-item';
            div.onclick = () => openNewArrivalsModal();
            div.style.cursor = 'pointer';

            div.innerHTML = `
                <div class="bulletin-item-header">
                    <div class="bulletin-item-title">
                        <span class="material-icons-round" style="font-size:16px; color:var(--primary-color)">new_releases</span>
                        ${item.name}
                    </div>
                </div>
                <div style="margin: 4px 0 0 0; font-size: 0.75rem; color: var(--text-secondary); display: flex; align-items: center; gap: 4px;">
                    Added: <b>${item.dateStr}</b>
                </div>
            `;
            listDiv.appendChild(div);
        });
    });
}

function openNewArrivalsModal() {
    playEffect('click');
    document.getElementById('newArrivalsModal').style.display = 'flex';
    toggleDashboard(); // Close sidebar
    loadNewArrivalsModalContent(); // Refresh list in modal
}

function closeNewArrivalsModal() {
    playEffect('click');
    document.getElementById('newArrivalsModal').style.display = 'none';
}

function loadNewArrivalsModalContent() {
    const listDiv = document.getElementById('newArrivalsModalList');
    listDiv.innerHTML = '<div style="text-align:center; padding: 20px;">Loading list...</div>';

    db.ref('newProducts').once('value').then(snap => {
        if (!snap.exists()) {
            listDiv.innerHTML = '<div class="bulletin-empty">No products marked as NEW right now.</div>';
            return;
        }

        const newItems = [];
        snap.forEach(child => {
            const pid = child.key;
            const data = child.val();
            const product = window.allProducts[pid];
            if (product) {
                newItems.push({
                    name: product.name,
                    id: product.id,
                    markedAt: data.markedAt,
                    dateStr: new Date(data.markedAt).toLocaleDateString('en-GB'),
                    imageUrl: product.imageUrl || ''
                });
            }
        });

        // Sort by most recent
        newItems.sort((a, b) => b.markedAt - a.markedAt);

        listDiv.innerHTML = '';
        newItems.forEach(item => {
            const div = document.createElement('div');
            div.className = 'user-card'; // Reuse admin styling for cards
            div.style.padding = '12px';

            const isInCart = selectedItems[item.id] !== undefined;
            const btnText = isInCart ? 'Update' : 'Add';
            const btnIcon = isInCart ? 'refresh' : 'add_shopping_cart';

            div.innerHTML = `
                <div style="display: flex; gap: 12px; align-items: flex-start;">
                    ${item.imageUrl ? `<img src="${item.imageUrl}" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover;">` : `<div style="width: 60px; height: 60px; background: var(--bg-color); display: flex; align-items: center; justify-content: center; border-radius: 8px;"><span class="material-icons" style="font-size: 24px; color: var(--text-secondary);">campaign</span></div>`}
                    <div style="flex: 1;">
                        <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 4px;">${item.name}</div>
                        <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 8px;">Added on: <b>${item.dateStr}</b></div>
                        
                        <div style="display: flex; gap: 10px; align-items: center; justify-content: flex-end;">
                            <div class="quantity-controls-wrapper" style="margin:0; padding:2px; background:var(--bg-color); height:32px; display:flex; align-items:center; justify-content:center; border:1px solid var(--border-color); border-radius:8px; width:100px;">
                                <button class="quantity-btn" onclick="changeQuantityFromModal(${item.id}, -1)" style="flex:1; width:28px; height:28px; min-width:28px; padding:0; background:transparent; display:flex; align-items:center; justify-content:center;"><span class="material-icons-round" style="font-size:16px;">remove</span></button>
                                <input type="number" id="modalQty${item.id}" value="${selectedItems[item.id] || 1}" readonly style="flex:1; width:34px; font-size:1rem; border:none; background:transparent; text-align:center; padding:0; margin:0; outline:none; color:var(--text-primary); font-weight:700; line-height:32px; -webkit-appearance:none; -moz-appearance:textfield;">
                                <button class="quantity-btn" onclick="changeQuantityFromModal(${item.id}, 1)" style="flex:1; width:28px; height:28px; min-width:28px; padding:0; background:transparent; display:flex; align-items:center; justify-content:center;"><span class="material-icons-round" style="font-size:16px;">add</span></button>
                            </div>
                            <button id="modalAddBtn${item.id}" onclick="addFromModal(${item.id})" class="action-button promote" style="margin:0; padding:6px 15px; font-size:0.8rem; height:32px; min-width:80px;">
                                <span class="material-icons" style="font-size:16px; margin-right:4px;">${btnIcon}</span>${btnText}
                            </button>
                        </div>
                    </div>
                </div>
            `;
            listDiv.appendChild(div);
        });
    });
}

function changeQuantityFromModal(pid, change) {
    const input = document.getElementById(`modalQty${pid}`);
    if (!input) return;
    let val = parseInt(input.value) || 1;

    const product = window.allProducts && window.allProducts[pid];
    const step = (product && product.defaultQuantity && Number(product.defaultQuantity) > 1) ? Number(product.defaultQuantity) : 1;

    val = Math.max(step, val + (change * step));
    input.value = val;
    playEffect(change > 0 ? 'add' : 'remove');

    // Auto-update if already in cart
    if (selectedItems[pid] !== undefined) {
        selectedItems[pid] = val;
        updatePreview();
        const mainQty = document.getElementById(`quantity${pid}`);
        if (mainQty) mainQty.value = val;
    }
}

function addFromModal(pid) {
    const input = document.getElementById(`modalQty${pid}`);
    if (!input) return;
    const val = parseInt(input.value) || 1;

    selectedItems[pid] = val;
    updatePreview();
    playEffect('success');

    const btn = document.getElementById(`modalAddBtn${pid}`);
    if (btn) {
        btn.innerHTML = '<span class="material-icons" style="font-size:16px; margin-right:4px;">done</span>Added';
        btn.style.background = 'var(--success-color)';
        setTimeout(() => {
            btn.innerHTML = '<span class="material-icons" style="font-size:16px; margin-right:4px;">refresh</span>Update';
            btn.style.background = '';
        }, 2000);
    }

    const mainCheck = document.getElementById(`item${pid}`);
    if (mainCheck) mainCheck.checked = true;
    const mainQty = document.getElementById(`quantity${pid}`);
    if (mainQty) mainQty.value = val;
}



// ==========================================
// STANDARD LOGIC
// ==========================================

function showImage(url, name) {
    playEffect('click');
    document.getElementById('modalImage').src = url;
    document.getElementById('imageModal').style.display = 'flex';
}

function closeImageModal() {
    playEffect('click');
    document.getElementById('imageModal').style.display = 'none';
}

document.getElementById('imageModal').onclick = function (e) {
    if (e.target === this) closeImageModal();
}

// View Toggle
function toggleView(viewMode) {
    playEffect('click');
    currentView = viewMode;
    localStorage.setItem('view-mode', viewMode);

    const productList = document.getElementById('productList');
    const listBtn = document.getElementById('listViewBtn');
    const gridBtn = document.getElementById('gridViewBtn');

    if (viewMode === 'list') {
        productList.classList.remove('grid-view');
        listBtn.classList.add('active');
        gridBtn.classList.remove('active');
    } else {
        productList.classList.add('grid-view');
        listBtn.classList.remove('active');
        gridBtn.classList.add('active');
    }

    const selectedCategory = document.querySelector('input[name="category"]:checked');
    if (selectedCategory && categories[selectedCategory.value]) {
        loadProducts(categories[selectedCategory.value]);
    }
    vibrate();
}

// Interaction Helpers
function vibrate(duration = 10) {
    // This is kept for backward compat if vibrate called directly
    playEffect('click');
}

function toggleVibration(enable) {
    localStorage.setItem('vibration-enabled', enable ? 'enabled' : 'disabled');
    const onBtn = document.getElementById('vibration-on-btn');
    const offBtn = document.getElementById('vibration-off-btn');
    playEffect('click');
    if (enable) {
        onBtn.style.backgroundColor = 'var(--primary-color)'; onBtn.style.color = 'white';
        offBtn.style.backgroundColor = 'var(--surface-color)'; offBtn.style.color = 'var(--text-primary)';
    } else {
        offBtn.style.backgroundColor = 'var(--primary-color)'; offBtn.style.color = 'white';
        onBtn.style.backgroundColor = 'var(--surface-color)'; onBtn.style.color = 'var(--text-primary)';
    }
}

function selectShop(element, value) {
    playEffect('select');

    // Angelic magic dust
    if (typeof confetti === 'function') {
        const rect = element.getBoundingClientRect();
        const originX = (rect.left + rect.width / 2) / window.innerWidth;
        const originY = (rect.top + rect.height / 2) / window.innerHeight;

        confetti({
            particleCount: 60,
            spread: 120,
            origin: { x: originX, y: originY },
            colors: ['#ffffff', '#fde047', '#fef08a'], // White & Gold
            ticks: 200,
            gravity: -0.1, // Float upwards magically
            startVelocity: 15,
            shapes: ['circle'],
            scalar: 0.8,
            zIndex: 9999
        });
    }

    document.querySelectorAll('.shop-card').forEach(card => card.classList.remove('selected'));
    element.classList.add('selected');
    element.querySelector('input[type="radio"]').checked = true;
    document.querySelector('.shop-container').classList.add('single-selected');
    if (!document.querySelector('.reselect-btn')) {
        const btn = document.createElement('button');
        btn.className = 'reselect-btn';
        btn.innerHTML = '<span class="material-icons-round" style="font-size:16px; margin-right:4px;">arrow_back</span> Change Shop';
        btn.onclick = reselectShop;
        document.querySelector('.shop-container').appendChild(btn);
    }
    document.getElementById('categoryTitle').style.display = 'block';
    document.getElementById('categoryContainer').style.display = 'grid';
    document.getElementById('searchContainer').style.display = 'flex';
    setTimeout(() => { document.getElementById('categoryTitle').scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
    toggleItems();
    updatePreview();
}

function reselectShop() {
    playEffect('click');
    document.querySelector('.shop-container').classList.remove('single-selected');
    document.querySelectorAll('.shop-card').forEach(c => c.classList.remove('selected'));
    const btn = document.querySelector('.reselect-btn');
    if (btn) btn.remove();
    document.getElementById('categoryTitle').style.display = 'none';
    document.getElementById('categoryContainer').style.display = 'none';
    document.getElementById('searchContainer').style.display = 'none';
    document.getElementById('productList').style.display = 'none';
    document.getElementById('selectItemsTitle').style.display = 'none';
}

function selectCategory(element, value) {
    playEffect('select');
    document.querySelectorAll('.category-card').forEach(card => card.classList.remove('selected'));
    element.classList.add('selected');
    element.querySelector('input[type="radio"]').checked = true;
    document.getElementById('selectItemsTitle').style.display = 'flex';
    document.getElementById('productList').style.display = 'flex';
    if (categories[value]) loadProducts(categories[value]);
    setTimeout(() => { document.getElementById('selectItemsTitle').scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
}

function togglePreview() {
    playEffect('click');
    const win = document.getElementById('preview-window');
    const badge = document.getElementById('orderCountBadge');
    if (win.style.display === 'none') {
        win.style.display = 'block';
    } else {
        win.style.display = 'none';
    }
}

function updatePreview() {
    const content = document.getElementById('preview-content');
    const itemsCount = Object.keys(selectedItems).length;
    const badge = document.getElementById('orderCountBadge');
    if (itemsCount > 0) {
        badge.textContent = itemsCount;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
        document.getElementById('preview-window').style.display = 'none';
    }
    const text = generateText(false);
    content.innerHTML = text.replace(/\n/g, '<br>');
}

function generateText(forWhatsApp) {
    let result = '';
    let selectedStore = document.querySelector('input[name="store"]:checked');
    let hasAddOn = document.getElementById('addOnCheckbox').checked;
    let totalItems = 0;

    // 获取用户名
    let userName = currentUser ? (currentUser.email ? currentUser.email.split('@')[0] : "Guest") : "Guest";
    try {
        const nameEl = document.querySelector('#dashboardUserName');
        if (nameEl && nameEl.textContent !== 'Not logged in') userName = nameEl.textContent;
    } catch (e) { }

    // --- 新增：日期和时间逻辑 ---
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const dateStr = `${day}/${month}/${year}`;

    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0点显示为12点
    const timeStr = `${String(hours).padStart(2, '0')}:${minutes}${ampm}`;
    // ---------------------------

    // 构建头部信息
    if (selectedStore) {
        // 去除value中可能自带的星号，防止重复
        let storeName = selectedStore.value.replace(/\*/g, '');

        result += `🏪 *(${storeName})* ${hasAddOn ? '💥(ADD ON)' : ''}\n`;
        result += `👤 *(${userName})*\n`;
        result += `📅 ${dateStr}\n`;
        result += `🕠 ${timeStr}\n\n`;
    }

    // 处理商品分类和计数
    const categorizedItems = {};
    Object.keys(categories).forEach(c => categorizedItems[c] = []);

    for (const [id, quantity] of Object.entries(selectedItems)) {
        for (const [cat, products] of Object.entries(categories)) {
            const p = products.find(i => i.id == id);
            if (p) {
                categorizedItems[cat].push({ ...p, quantity });
                // 以 Default Quantity 数量算成 1 (比如 Default Quantity 25, order 50 就算成 2)
                const defQty = (p.defaultQuantity && Number(p.defaultQuantity) > 0) ? Number(p.defaultQuantity) : 1;
                const qtyNum = Number(quantity) || 0;
                totalItems += (qtyNum / defQty);
                break;
            }
        }
    }

    const formattedTotalItems = Number.isInteger(totalItems) ? totalItems : parseFloat(totalItems.toFixed(2));
    result += `📦 Total Items: *${formattedTotalItems}*\n`;

    // 构建商品列表
    for (const [cat, items] of Object.entries(categorizedItems)) {
        if (items.length > 0) {
            const icon = categoryIcons[cat] ? ` ${categoryIcons[cat]}` : '';
            result += `\n🔹🔸🔹 ${cat}${icon} 🔹🔸🔹\n`;

            items.forEach(item => {
                const unit = item.unit || 'ctn'; // 默认单位 ctn

                if (forWhatsApp) {
                    // WhatsApp 纯文本格式
                    // 建议：可以在数量上加粗 (例如 *1 ctn*) 方便查看，这里暂时按照你的要求不加
                    result += `${item.name} - ${item.quantity} ${unit}\n`;
                } else {
                    // 网页预览格式 (HTML)
                    const stock = stockMap[item.name] || 0;
                    // 如果无库存，红色显示名字
                    const nameHtml = stock === 0 ? `<span style="color:var(--danger-color)">${item.name}</span>` : item.name;
                    result += `${nameHtml} - <b>${item.quantity} ${unit}</b>\n`;
                }
            });
        }
    }

    result += '\n_App Version 2.6_';

    return result;
}
function loadQuantitiesFromFirebase() {
    ['office', 'kepayan'].forEach(loc => {
        stockDb.ref(`inventory/${loc}`).on('value', snap => {
            const data = snap.val();
            if (data) {
                Object.values(data).forEach(item => {
                    // Update Stock
                    stockMap[item.name] = Math.max(stockMap[item.name] || 0, item.quantity);

                    // Update Image if exists (Restored Functionality)
                    if (item.imageUrl) {
                        // Find product by name in our local data
                        Object.values(window.allProducts).forEach(product => {
                            if (product.name === item.name) {
                                product.imageUrl = item.imageUrl;
                                updateProductImageInDOM(product.id, item.imageUrl);
                            }
                        });
                    }
                });
                updateStockDisplay();
            }
        });
    });
}

// Helper to update image in DOM without full reload
function updateProductImageInDOM(id, url) {
    // Handle Grid View
    if (currentView === 'grid') {
        const productCard = document.querySelector(`div[data-product-id="${id}"]`);
        if (productCard) {
            const imgContainer = productCard.querySelector('.product-image');
            if (imgContainer && !imgContainer.querySelector('img')) {
                imgContainer.innerHTML = `<img src="${url}" alt="Product" style="width:100%; height:100%; object-fit:cover;" onclick="showImage('${url}', ''); event.stopPropagation();">`;
                // Add onclick to parent to handle click if needed
                imgContainer.setAttribute('onclick', `showImage('${url}', ''); event.stopPropagation();`);
            }
        }
    }
    // Handle List View
    else {
        const productCard = document.querySelector(`div[data-product-id="${id}"]`);
        if (productCard) {
            const container = productCard.querySelector('.image-btn-container');
            if (container && !container.querySelector('.view-image-btn')) {
                const btn = document.createElement('button');
                btn.className = 'view-image-btn';
                btn.innerHTML = '<span class="material-icons-outlined" style="font-size: 14px; margin-right: 2px;">image</span> View';
                btn.onclick = (e) => { showImage(url, ''); e.stopPropagation(); };
                container.appendChild(btn);
            }
        }
    }
}

function updateProductBoxDisplay() {
    // Also check box counts
    db.ref('productBoxes').once('value').then(snap => {
        const boxData = snap.val() || {};
        Object.keys(boxData).forEach(pid => {
            const badge = document.getElementById(`unitBadge${pid}`);
            if (badge) {
                if (boxData[pid] > 0) {
                    badge.style.display = 'inline-flex';
                    badge.innerHTML = `<span class="material-icons-outlined" style="font-size:14px; margin-right:2px;">inventory_2</span> Unit: ${boxData[pid]}`;
                } else {
                    badge.style.display = 'none';
                }
            }
        });
    });
}

function updateStockDisplay() {
    for (const [id, product] of Object.entries(window.allProducts)) {
        let stock = stockMap[product.name] || 0;
        if ([601, 602, 603, 604, 605, 606, 609, 610, 611, 612, 607, 608].includes(parseInt(id))) {
            if (id <= 603) stock = Math.floor(stock / 60);
            else if (id <= 605) stock = Math.floor(stock / 30);
            else if ([606, 609, 610, 611, 612].includes(parseInt(id))) stock = Math.floor(stock / 80);
            else stock = Math.floor(stock / 70);
        } else {
            // Apply formatting for all other products if they have decimals
            if (typeof stock === 'number' && stock % 1 !== 0) {
                stock = Number(stock).toFixed(2);
            }
        }
        const stockEl = document.getElementById(`stock${id}`);
        if (stockEl) {
            stockEl.textContent = stock === 0 ? '(No Stock)' : `(Stock: ${stock})`;
            if (stock === 0) stockEl.classList.add('zero-stock');
            else stockEl.classList.remove('zero-stock');
        }
    }
}

function saveItem(id, name) {
    playEffect('select'); // Selection sound
    const checkbox = document.getElementById('item' + id);
    const qtyInput = document.getElementById('quantity' + id);
    if (checkbox.checked) {
        selectedItems[id] = qtyInput.value;
    } else {
        delete selectedItems[id];
    }
    updatePreview();
}

function changeQuantity(id, change) {
    const input = document.getElementById('quantity' + id);
    const checkbox = document.getElementById('item' + id);
    let val = parseInt(input.value) || 1;

    const product = window.allProducts && window.allProducts[id];
    const step = (product && product.defaultQuantity && Number(product.defaultQuantity) > 1) ? Number(product.defaultQuantity) : 1;

    // Play sound based on action
    if (change > 0) {
        playEffect('add');
    } else if (val > step) {
        playEffect('remove');
    } else {
        // At minimum quantity
        playEffect('remove');
    }

    val = Math.max(step, val + (change * step));
    input.value = val;

    if (selectedItems[id] || checkbox.checked) {
        checkbox.checked = true;
        selectedItems[id] = val;
        updatePreview();
    }
}

function searchProduct() {
    const term = document.getElementById('productSearch').value.toLowerCase();
    const sugg = document.getElementById('suggestions');
    sugg.innerHTML = '';
    if (term.length === 0) { sugg.style.display = 'none'; return; }
    const matches = Object.values(window.allProducts).filter(p => p.name.toLowerCase().includes(term));
    matches.slice(0, 5).forEach(p => {
        const d = document.createElement('div');
        d.style.padding = '12px';
        d.style.borderBottom = '1px solid var(--border-color)';
        d.textContent = p.name;
        d.onclick = () => { selectProductFromSearch(p); sugg.style.display = 'none'; };
        sugg.appendChild(d);
    });
    sugg.style.display = matches.length ? 'block' : 'none';
}

function selectProductFromSearch(product) {
    playEffect('select');
    const list = document.getElementById('productList');
    list.innerHTML = '';
    const div = document.createElement('div');
    div.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:space-between; width:100%;">
            <label>${product.name}</label>
            <div class="quantity-controls-wrapper">
                <button class="quantity-btn" onclick="changeQuantity(${product.id}, 1)"><span class="material-icons-round">add</span></button>
                <input type="number" id="quantity${product.id}" value="1" style="width:40px; text-align:center;">
            </div>
            <input type="checkbox" id="item${product.id}" checked style="display:none;">
        </div>
    `;
    list.appendChild(div);
    saveItem(product.id, product.name);
}

function toggleSettings() {
    playEffect('click');
    const panel = document.getElementById('settings-panel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

function toggleDashboard() {
    playEffect('click');
    const dash = document.getElementById('side-dashboard');
    const over = document.getElementById('dashboard-overlay');
    const isHidden = dash.style.display === 'none';
    dash.style.display = isHidden ? 'flex' : 'none';
    over.style.display = isHidden ? 'block' : 'none';
}

function changeTheme(theme) {
    playEffect('click');
    document.body.classList.remove('dark-mode');
    if (theme === 'dark') document.body.classList.add('dark-mode');
    localStorage.setItem('dark-mode', theme === 'dark' ? 'enabled' : 'disabled');
}

// Modified Auth Listener for Splash Screen
auth.onAuthStateChanged(user => {
    if (user) {
        // User is logged in
        document.getElementById('authContainer').style.display = 'none';

        // Load categories if not already loaded
        loadCategoriesFromFirebase();

        if (!splashShown) {
            // Play animation if first load
            playOpeningAnimation(() => {
                splashShown = true;
            });
        }

        currentUser = user;
        db.ref(`users/${user.uid}`).once('value').then(snap => {
            const val = snap.val();
            if (val) {
                userRole = val.role;
                document.getElementById('dashboardUserName').textContent = val.name;
                document.getElementById('dashboardUserRole').textContent = val.role;
                if (val.role === 'Admin' || val.role === 'SAdmin') {
                    document.getElementById('dashboardAdminButton').style.display = 'flex';
                }
                if (val.status === 'pending') {
                    // Re-show auth container if pending
                    document.getElementById('authContainer').style.display = 'flex';
                    document.getElementById('pendingForm').style.display = 'block';
                    document.getElementById('loginForm').style.display = 'none';
                }
            }
        });
        loadQuantitiesFromFirebase();
        loadRestDays();
        loadNewArrivals();
    } else {
        // User Not Logged In
        document.getElementById('authContainer').style.display = 'flex';
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('pendingForm').style.display = 'none';
        document.getElementById('mainAppContent').style.opacity = '0'; // Hide main content
        splashShown = false; // Reset
    }
});

// Robust Login Logic with Safety Checks
document.getElementById('loginButton').onclick = () => {
    try { playEffect('click'); } catch (e) { console.error(e); }

    const emailField = document.getElementById('loginEmail');
    const passField = document.getElementById('loginPassword');

    const e = emailField.value.trim();
    const p = passField.value;

    if (!e || !p) {
        alert("Please enter email and password");
        return;
    }

    const btn = document.getElementById('loginButton');
    const originalText = btn.innerText;
    btn.innerText = "Logging in...";
    btn.disabled = true;

    auth.signInWithEmailAndPassword(e, p)
        .then(() => {
            btn.innerText = originalText;
            btn.disabled = false;
            // Auth state change handles the rest including animation
        })
        .catch(error => {
            btn.innerText = originalText;
            btn.disabled = false;
            alert("Login Failed: " + error.message);
        });
};

// Robust Register Logic
document.getElementById('registerButton').onclick = () => {
    try { playEffect('click'); } catch (e) { }

    const e = document.getElementById('registerEmail').value.trim();
    const p = document.getElementById('registerPassword').value;
    const n = document.getElementById('registerName').value.trim();

    if (!e || !p || !n) { alert("Please fill all fields"); return; }

    const btn = document.getElementById('registerButton');
    const originalText = btn.innerText;
    btn.innerText = "Creating Account...";
    btn.disabled = true;

    auth.createUserWithEmailAndPassword(e, p).then(creds => {
        db.ref(`users/${creds.user.uid}`).set({ email: e, name: n, role: 'User', status: 'pending', createdAt: Date.now() })
            .then(() => {
                btn.innerText = originalText;
                btn.disabled = false;
                // onAuthStateChanged handles the rest
            });
    }).catch(error => {
        btn.innerText = originalText;
        btn.disabled = false;
        alert("Registration Failed: " + error.message);
    });
};

function switchToRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.getElementById('authTitle').textContent = 'Register';
}
function switchToLogin() {
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('authTitle').textContent = 'Welcome Back';
}
function logout() { auth.signOut(); window.location.reload(); }
function backToLogin() { logout(); }

function copyAndSendWhatsApp() {
    playEffect('success');

    if (typeof confetti === 'function') {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#6366f1', '#10b981', '#14b8a6', '#f59e0b'],
            zIndex: 10000
        });
    }

    const text = generateText(true);
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    setTimeout(() => { window.open(url, '_blank'); }, 800);
}

function confirmAndSendWhatsApp() {
    // Same logic as copy but used in modal
    copyAndSendWhatsApp();
    closeFullscreenConfirm();
}

function closeFullscreenConfirm() {
    playEffect('click');
    document.getElementById('fullscreenConfirm').style.display = 'none';
}
function toggleItems() { }

window.addEventListener('load', () => {
    // Load categories from Firebase first
    loadCategoriesFromFirebase().then(() => {
        const savedTheme = localStorage.getItem('dark-mode');
        if (savedTheme === 'disabled') changeTheme('light');
        toggleView(currentView);
        toggleVibration(localStorage.getItem('vibration-enabled') !== 'disabled');
    });

    db.ref('announcement').on('value', snap => {
        const data = snap.val();
        const banner = document.getElementById('announcementBanner');
        const textEl = document.getElementById('announcementScrollText');

        if (data && data.enabled) {
            if (data.text) {
                const name = data.createdByName ? `[${data.createdByName}]: ` : '';
                textEl.textContent = name + data.text;
                banner.style.display = 'flex';
                document.body.style.paddingTop = '62px'; // 38px banner + 24px normal padding


                // Apply styles
                banner.style.background = data.background && data.background.color ? data.background.color :
                    (data.background && data.background.type === 'custom' ?
                        `linear-gradient(45deg, ${data.background.startColor}, ${data.background.endColor})` :
                        'linear-gradient(45deg, #6366f1, #a855f7)');

                banner.style.fontSize = data.fontSize || '14px';
                banner.style.color = data.textColor || 'white';

                // Reset animation
                textEl.style.animation = 'none';
                textEl.offsetHeight; // trigger reflow
                textEl.style.animation = `marquee ${data.speed || '15s'} linear infinite`;
            }
        } else {
            banner.style.display = 'none';
            document.body.style.paddingTop = '24px'; // Reset to default
        }
    });


    // Periodic check for new product expiration
    setInterval(() => {
        const now = Date.now();
        db.ref('newProducts').once('value').then(snap => {
            snap.forEach(child => {
                if (child.val().until < now) child.ref.remove();
            });
        });
    }, 3600000); // Check every hour

    // 启动系统自动更新检测与监听
    if (typeof initSystemUpdateListener === 'function') {
        initSystemUpdateListener();
    }
});

// ==========================================================
// MANDATORY SYSTEM UPDATE MODAL (ENGLISH UI & 2S ANIMATION)
// ==========================================================
let isAppUpdating = false;
let updateTestMode = false;
let pendingUpdateFingerprint = '';
const appSessionStartTime = Date.now(); // 记录本次页面打开时间

// 弹出更新模态窗口（全英文，仅有Update Now按钮）
function openUpdateModal(newVersion, isTest, fingerprint) {
    if (isAppUpdating) return;
    updateTestMode = !!isTest;
    pendingUpdateFingerprint = fingerprint || '';

    const overlay = document.getElementById('appUpdateOverlay');
    const versionText = document.getElementById('updateVersionText');
    const btn = document.getElementById('btnUpdateNow');
    const btnText = document.getElementById('btnUpdateText');
    const progressArea = document.getElementById('updateProgressArea');
    const progressBar = document.getElementById('updateProgressBar');

    if (versionText) {
        versionText.textContent = newVersion ? 
            `A new update (${newVersion}) is available. Tap below to update now.` : 
            `A new update is available. Please tap update to continue.`;
    }

    if (btn) {
        btn.disabled = false;
        btn.style.display = 'flex';
        if (btnText) btnText.textContent = "Update Now";
    }

    if (progressArea) {
        progressArea.style.display = 'none';
    }
    if (progressBar) {
        progressBar.style.transition = 'none';
        progressBar.style.width = '0%';
    }

    if (overlay) {
        overlay.style.display = 'flex';
    }
}

// 兼容别名
function triggerAppUpdate(newVersion, isTest, fingerprint) {
    openUpdateModal(newVersion, isTest, fingerprint);
}

// 用户点击唯一的 "Update Now" 按钮
function confirmAndUpdateApp() {
    if (isAppUpdating) return;
    isAppUpdating = true;

    const btn = document.getElementById('btnUpdateNow');
    const btnText = document.getElementById('btnUpdateText');
    const progressArea = document.getElementById('updateProgressArea');
    const progressBar = document.getElementById('updateProgressBar');

    if (btn) {
        btn.disabled = true;
        if (btnText) btnText.textContent = "Updating...";
    }

    if (progressArea) {
        progressArea.style.display = 'block';
    }

    try { playEffect('success'); } catch (e) {}

    // 触发 2 秒平滑进度条
    if (progressBar) {
        progressBar.style.transition = 'none';
        progressBar.style.width = '0%';
        void progressBar.offsetWidth; // 触发 reflow
        progressBar.style.transition = 'width 2s linear';
        progressBar.style.width = '100%';
    }

    setTimeout(() => {
        if (updateTestMode) {
            // 测试模式：动画结束后关闭弹窗
            const overlay = document.getElementById('appUpdateOverlay');
            if (overlay) overlay.style.display = 'none';
            if (progressArea) progressArea.style.display = 'none';
            if (btn) {
                btn.disabled = false;
                if (btnText) btnText.textContent = "Update Now";
            }
            isAppUpdating = false;
            updateTestMode = false;
            alert('Update animation test completed! In production, this will clear all cache and reload.');
            return;
        }

        // 记录已经接受的指纹，刷新后绝不再重复弹窗
        if (pendingUpdateFingerprint) {
            sessionStorage.setItem('app_current_fingerprint', pendingUpdateFingerprint);
            localStorage.setItem('app_last_accepted_fingerprint', pendingUpdateFingerprint);
        }

        // 真实更新：抹除全部 CacheStorage 缓存并强制刷新
        if ('caches' in window) {
            caches.keys().then(names => Promise.all(names.map(n => caches.delete(n))))
                .finally(() => {
                    window.location.reload(true);
                });
        } else {
            window.location.reload(true);
        }
    }, 2000);
}

// ==========================================================
// 全自动文件改动指纹检测（无需手动改版本号，改代码即可触发）
// ==========================================================
let currentFileFingerprint = sessionStorage.getItem('app_current_fingerprint') || 
                             localStorage.getItem('app_last_accepted_fingerprint') || '';

function calculateSimpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return 'h_' + Math.abs(hash);
}

// 自动检查 index.html 是否有任何改动
function checkForAppUpdates() {
    const checkUrl = './index.html?_nocache=' + Date.now();

    // 优先使用轻量级 HEAD 请求检查 ETag / Last-Modified
    fetch(checkUrl, { method: 'HEAD', cache: 'no-store' })
        .then(response => {
            const etag = response.headers.get('etag');
            const lastMod = response.headers.get('last-modified');
            const headerFingerprint = etag || lastMod;

            if (headerFingerprint) {
                return headerFingerprint;
            }

            // 备用方案：抓取文本比对哈希
            return fetch(checkUrl, { cache: 'no-store' })
                .then(r => r.text())
                .then(text => calculateSimpleHash(text));
        })
        .then(latestFingerprint => {
            if (!latestFingerprint) return;

            // 首次启动时记录指纹
            if (!currentFileFingerprint) {
                currentFileFingerprint = latestFingerprint;
                sessionStorage.setItem('app_current_fingerprint', latestFingerprint);
                localStorage.setItem('app_last_accepted_fingerprint', latestFingerprint);
                return;
            }

            // 只要发现指纹变了（代表你修改了 index.html 或重新 push 了代码）
            if (latestFingerprint !== currentFileFingerprint) {
                console.log('[AutoDetect] 检测到代码更新！旧指纹:', currentFileFingerprint, '新指纹:', latestFingerprint);
                // 弹出英文 Update 模态窗口，等待用户点击 Update Now
                openUpdateModal('Latest', false, latestFingerprint);
            }
        })
        .catch(err => {
            // 静默处理离线情况
        });
}

// 启动更新监听系统
function initSystemUpdateListener() {
    if (typeof db !== 'undefined' && db) {
        // 关键修复：立即清除之前卡死在 Firebase 里的旧版本死循环残留
        db.ref('system_version').remove().catch(() => {});

        // 监听安全的基于时间戳的实时广播
        db.ref('broadcast_update_signal').on('value', snap => {
            const data = snap.val();
            // 只有当广播是在本次页面打开之后发出的，才触发一次
            if (data && data.timestamp && data.timestamp > appSessionStartTime) {
                const lastHandledTime = Number(localStorage.getItem('app_last_handled_broadcast') || 0);
                if (data.timestamp > lastHandledTime) {
                    localStorage.setItem('app_last_handled_broadcast', data.timestamp);
                    console.log('[BroadcastSignal] 收到新广播更新信号:', data.version);
                    openUpdateModal(data.version || 'Latest', false);
                }
            }
        });
    }

    // 页面可见性改变（从后台切回前台 / 老人唤醒手机）时立即检测
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            checkForAppUpdates();
        }
    });

    // 启动时立即检测一次
    checkForAppUpdates();

    // 每隔 2 分钟轮询一次
    setInterval(checkForAppUpdates, 2 * 60 * 1000);
}

// 管理员面板：测试 2 秒升级动画
function testUpdateAnimation() {
    openUpdateModal('v2.5.1', true);
}

// 管理员面板：一键广播全员升级（安全单次广播，不会死循环）
function broadcastSystemUpdate() {
    const nextVer = prompt('Enter the new version to broadcast to all users (e.g. 2.5.1):', '2.5.1');
    if (!nextVer) return;

    if (confirm(`Broadcast update [${nextVer}] to all active devices?\nActive devices will see the update popup once and reload safely.`)) {
        db.ref('broadcast_update_signal').set({
            version: nextVer,
            timestamp: Date.now()
        }).then(() => {
            alert('Broadcast sent safely! Active devices will now prompt once.');
        }).catch(err => {
            alert('Broadcast failed: ' + err.message);
        });
    }
}

// 应急重置按钮
function clearAllBroadcasts() {
    if (typeof db !== 'undefined' && db) {
        db.ref('broadcast_update_signal').remove();
        db.ref('system_version').remove();
        alert('All broadcast update signals cleared successfully!');
    }
}


