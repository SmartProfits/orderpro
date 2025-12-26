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
    } catch(e) {
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
    } catch(e) {}
}

// Global State
let stockMap = {};
let currentUser = null;
let userRole = "User";
let selectedItems = {};
let currentView = localStorage.getItem('view-mode') || 'list';
let splashShown = false; // Track splash state
window.allProducts = {};

// Product Categories Data (RESTORED WITH IMAGES)
 const categories = {
            BanHeang: [
                { id: 101, name: "BH Tambun Original" }, { id: 102, name: "BH Tambun Pandan" }, { id: 103, name: "BH Tambun White Lotus" },
                { id: 104, name: "BH Tau Sar Pheah" }, { id: 166, name: "BH Tau Sar Pheah Spicy Shrimp" },
                { id: 170, name: "BH Tau Shar Pheah Durian" }, { id: 171, name: "BH Tau Shar Pheah Salted Egg" },
                { id: 172, name: "BH Tau Shar Pheah Almond" }, { id: 173, name: "BH Tau Shar Pheah Cheese" },
                { id: 174, name: "BH Tau Shar Pheah Original" }, { id: 175, name: "BH Tau Shar Pheah Matcha" },
                { id: 176, name: "BH Tau Shar Pheah Paprika Seaweed" }, { id: 178, name: "BH Tau Shar Pheah White Coffee" },
                { id: 179, name: "BH Tau Shar Pheah Cempedak" }, { id: 180, name: "BH Tau Shar Pheah Strawberry" },
                { id: 105, name: "BH Heong Pheah" }, { id: 106, name: "BH Beh Teh Saw" }, { id: 107, name: "BH Phong Pheah" },
                { id: 108, name: "BH Pepper Biscuit" }, { id: 109, name: "BH Hup Toh Soh" },
                { id: 110, name: "BH Omelette Crisp Chocolate" }, { id: 111, name: "BH Omelette Crisp Pandan" },
                { id: 112, name: "BH Kai Chai Biscuit" }, { id: 113, name: "BH Almond Slice" },
                { id: 114, name: "BH Almond Slice Salted Egg" }, { id: 115, name: "BH Durian Crisp" },
                { id: 116, name: "BH Coconut Crisp" }, { id: 117, name: "BH Salted Fish Crisp" },
                { id: 118, name: "BH Salted Egg Crisp" }, { id: 119, name: "BH Cheese Crisp" },
                { id: 120, name: "BH Chic Kut Teh" }, { id: 121, name: "BH Ginger Slice" },
                { id: 122, name: "BH Dried Mango" }, { id: 123, name: "BH Kacang Tumbuk" },
                { id: 124, name: "BH Gula Kacang" }, { id: 125, name: "BH Black Sesame Peanut" },
                { id: 126, name: "BH Shat Kek Ma" }, { id: 127, name: "BH Shat Kek Ma (Brown Sugar)" },
                { id: 128, name: "BH Coconut Biscuits" }, { id: 129, name: "BH Freeze Dried Durian 50g" },
                { id: 130, name: "BH Freeze Dried Mango 50g" }, { id: 131, name: "BH Freeze Dried Durian 30g" },
                { id: 160, name: "BH Freeze Dried Mango 30g" }, { id: 161, name: "BH Freeze Dried Cempedak 25g" },
                { id: 162, name: "BH Freeze Dried Jackfruit 30g" }, { id: 167, name: "BH Freeze Dried Strawberry 20g" },
                { id: 132, name: "BH Butter Cookies" }, { id: 133, name: "BH Chocolate Cookies" },
                { id: 134, name: "BH Raisin Cookies" }, { id: 135, name: "BH Almond Cookies" },
                { id: 136, name: "BH Pineapple Tart" }, { id: 137, name: "BH Red Bean Mochi" },
                { id: 138, name: "BH Peanut Mochi" }, { id: 139, name: "BH Green Tea Mochi" },
                { id: 140, name: "BH Durian Mochi" }, { id: 141, name: "BH Yam Mochi" },
                { id: 142, name: "BH Mochi Milk Yam Filling" }, { id: 143, name: "BH Mochi Milk Mango Filling" },
                { id: 144, name: "BH Mochi Milk Green Tea" }, { id: 145, name: "BH Sotong Cuttlefish" },
                { id: 146, name: "BH Gula Sotong Cuttlefish" }, { id: 147, name: "BH Satay Fish" },
                { id: 148, name: "BH Fillet Cracker With Anchovy" }, { id: 149, name: "BH Fillet Cracker With Seaweed" },
                { id: 150, name: "BH Sakura Shrimp" }, { id: 151, name: "BH Frugurt Yogurt Blueberry" },
                { id: 152, name: "BH Frugurt Yogurt Peach" }, { id: 153, name: "BH Frugurt Yogurt Mango" },
                { id: 154, name: "BH Durian Pudding" }, { id: 155, name: "BH Coconut Pudding" },
                { id: 156, name: "BH Dodol Durian" }, { id: 157, name: "BH Dodol Coconut" },
                { id: 158, name: "BH Dodol Pandan" }, { id: 159, name: "BH Durian Beh Teh Saw" },
                { id: 168, name: "Coconut Chip 50g" }, { id: 163, name: "Fruity Marshmallow" },
                { id: 164, name: "Matcha Marshmallow" }, { id: 165, name: "Durian Marshmallow" },
                { id: 190, name: "BH Original Cracker" },{ id: 191, name: "BH Chocolate Cracker" },
                { id: 192, name: "BH Original Cracker (Durian)" },{ id: 193, name: "BH Chocolate Cracker (Mango)" },
                { id: 177, name: "BH Shopping Bag" }
            ],
            HoeHup: [
              { id: 201, name: "HH Durian Tart" },        { id: 202, name: "HH Mango Tart" },           { id: 203, name: "HH Dried Fruit Mango" },
{ id: 204, name: "HH Durian Wafer Roll" },  { id: 205, name: "HH Mango Wafer Roll" },     { id: 206, name: "HH Omelette Crisp Durian" },
{ id: 207, name: "HH Coconut Ori Cookies" },{ id: 208, name: "HH Coconut Pandan Cookies" },{ id: 209, name: "HH Dodol Original" },
{ id: 210, name: "HH Dodol Kopi" },          { id: 211, name: "HH Dodol Durian" },         { id: 212, name: "HH Freeze Dried Mango" },
{ id: 213, name: "HH Freeze Dried Durian" }, { id: 214, name: "Salted Egg Fish Skin" },    { id: 215, name: "Salted Egg Fish Skin Spicy" },
{ id: 216, name: "Salted Egg Salmon Skin" }, { id: 217, name: "Salted Egg Salmon Skin Spicy" }, { id: 218, name: "Musang King Durian Candy" },
{ id: 219, name: "HH Durian Cookies" },      { id: 220, name: "Fish Chips Classic" },      { id: 221, name: "HH Crisp - So Original" },
{ id: 222, name: "HH Crisp - So Seaweed" },  { id: 223, name: "HH Crisp - So Shrimp" },    { id: 224, name: "Salted Egg Fish Chips" },
{ id: 225, name: "Salted Egg Fish Chips Mala" }, { id: 226, name: "Cuttlefish Red" },       { id: 227, name: "Cuttlefish Lemon" },
{ id: 228, name: "Cuttlefish Honey" },       { id: 229, name: "Cuttlefish Floss Original" },{ id: 230, name: "Cuttlefish Massive" },
{ id: 231, name: "Cuttlefish Whole" },       { id: 232, name: "Cuttlefish Roasted" },      { id: 233, name: "Cuttlefish Chili" },
{ id: 234, name: "Cuttlefish Slices" },      { id: 235, name: "Cuttlefish Sugar" },        { id: 236, name: "Five Star Cuttlefish" }

            ],
        
            Chocolate: [
                { id: 314, name: "Sabah Tea Chocolate Original", unit: 'pc', defaultQuantity: 70 }, { id: 315, name: "Sabah Tea Chocolate Mangosteen", unit: 'pc', defaultQuantity: 70 },
                { id: 316, name: "Sabah Tea Chocolate Tenom Coffee", unit: 'pc', defaultQuantity: 70 }, { id: 317, name: "Sabah Tea Chocolate Durian", unit: 'pc', defaultQuantity: 70 },
                { id: 301, name: "AD Chocolate Durian", unit: 'pc', defaultQuantity: 50 }, { id: 302, name: "AD Chocolate Sabah Tea", unit: 'pc', defaultQuantity: 50 },
                { id: 303, name: "AD Chocolate Mango", unit: 'pc', defaultQuantity: 50 }, { id: 304, name: "AD Chocolate Chili", unit: 'pc', defaultQuantity: 50 },
                { id: 305, name: "AD Chocolate Dark", unit: 'pc', defaultQuantity: 50 }, { id: 306, name: "AD Chocolate Coffee", unit: 'pc', defaultQuantity: 50 },
                { id: 307, name: "AD Chocolate Banana", unit: 'pc', defaultQuantity: 50 }, { id: 308, name: "AD Chocolate Tiramisu", unit: 'pc', defaultQuantity: 50 },
                { id: 309, name: "AD Chocolate Mint", unit: 'pc', defaultQuantity: 50 }, { id: 310, name: "AD Chocolate Rambutan", unit: 'pc', defaultQuantity: 50 },
                { id: 311, name: "AD Chocolate Soursup", unit: 'pc', defaultQuantity: 50 }, { id: 312, name: "AD Chocolate Coconut", unit: 'pc', defaultQuantity: 50 },
                { id: 313, name: "AD Chocolate Mangosteen", unit: 'pc', defaultQuantity: 50 }
            ],
            Seafood: [
                { id: 401, name: "Tiger Prawn 3/7" }, { id: 402, name: "Flower Prawn 7/12" }, { id: 403, name: "Flower Prawn 12/18" },
                { id: 404, name: "Flower Prawn 18/25" }, { id: 405, name: "Flower Prawn 25/35" }, { id: 406, name: "Yellow Prawn 10/20" },
                { id: 407, name: "Yellow Prawn 26/35" }, { id: 408, name: "Sunoh" }, { id: 409, name: "Hoi Tai Kai" },
                { id: 410, name: "Kerapu Tikus" }, { id: 411, name: "Telur Ikan" },{ id: 412, name: "Scallop" },
                { id: 413, name: "Slipper Lobster" }, { id: 414, name: "Udang Kering" },{ id: 415, name: "Kua Chi Lap" },
                { id: 416, name: "Conch Meat" }, { id: 417, name: "Crab Meat" },{ id: 418, name: "Hoi Li" },
                { id: 419, name: "Ikan Bilis Mata Biru" }, { id: 420, name: "Sotong Kering" },{ id: 421, name: "Black Empurau (1.5kg-2kg)" },
                { id: 422, name: "Black Empurau (3.5kg up)" }, { id: 423, name: "Isi Keratang" },{ id: 424, name: "Baby Lobster" },
                { id: 425, name: "Sea Cucumber Tusen" }, { id: 426, name: "Ikan bilis mata biru besar" },{ id: 427, name: "Sotong Cumi-Cumi" },
                { id: 428, name: "Ikan Masin Tipis" }, { id: 429, name: "Sea Cucumber Susu" }
            ],
            Coffee: [
                { id: 501, name: "BH White Coffee Mini" }, { id: 502, name: "BH White Coffee NS Mini" }, { id: 503, name: "BH Durian White Coffee Mini" },
                { id: 504, name: "BH Teh Tarik Mini" }, { id: 516, name: "BH Teh Tarik Mini 5 packet" }, { id: 505, name: "BH W/Coffee" },
                { id: 506, name: "BH W/Coffee No Sugar" }, { id: 507, name: "BH Kopi O 2in1" }, { id: 508, name: "BH Kopi O No Sugar" },
                { id: 509, name: "BH Teh Tarik" }, { id: 510, name: "BH Durian White Coffee" }, { id: 511, name: "Kopi Tenom Silver" },
                { id: 512, name: "Kopi Tenom Gold" }, { id: 513, name: "Kopi Tenom Blue" }, { id: 514, name: "Kopi Tenom Green" },
                { id: 515, name: "Kopi Tenom Red" }
            ],
            Amplang: [
                { id: 601, name: "Amplang Ikan", unit: 'bdl', defaultQuantity: 1 }, { id: 602, name: "Amplang Udang", unit: 'bdl', defaultQuantity: 1 },
                { id: 603, name: "Amplang Sotong", unit: 'bdl', defaultQuantity: 1 }, { id: 604, name: "Amplang Ikan 30Pkt", unit: 'bdl', defaultQuantity: 1 },
                { id: 605, name: "Amplang Udang 30pkt", unit: 'bdl', defaultQuantity: 1 }, { id: 606, name: "Amplang Pandan 180g", unit: 'bdl', defaultQuantity: 1 },
                { id: 607, name: "Amplang Tomyum 180g", unit: 'bdl', defaultQuantity: 1 }, { id: 608, name: "Amplang Sotong 200g", unit: 'bdl', defaultQuantity: 1 },
                { id: 609, name: "Amplang Udang 200g", unit: 'bdl', defaultQuantity: 1 }, { id: 610, name: "Amplang Ikan 200g", unit: 'bdl', defaultQuantity: 1 },
                { id: 611, name: "Amplang Cheese 200g", unit: 'bdl', defaultQuantity: 1 }, { id: 612, name: "Amplang Ayam", unit: 'bdl', defaultQuantity: 1 }
            ],
            Other: [
                { id: 701, name: "Fruity Gummy Assorted" }, { id: 702, name: "Fruity Gummy Mango" }, { id: 720, name: "Sour Gummy Blackcurrant" },
                { id: 711, name: "Sour Gummy Apple" }, { id: 710, name: "Sour Gummy Orange" }, { id: 703, name: "Durian Kuih" }, { id: 704, name: "Anchovy Blue" },
                { id: 705, name: "Anchovy Green" }, { id: 706, name: "Anchovy Red" }, { id: 707, name: "Anchovy Yellow" },
                { id: 713, name: "A1 Bak Kut Teh" }, { id: 708, name: "Prawn Cracker 500g", unit: 'pkt' }, { id: 709, name: "Fish Maw", unit: 'pkt' }
            ],
            Wrapping: [
                { id: 801, name: "Wrapping Machine", unit: 'roll' }, { id: 802, name: "Wrapping Mini", unit: 'roll' }, { id: 809, name: "Neck Pillow", unit: 'pc' }
            ],
            Office: [
                { id: 901, name: "Assorted candy", unit: 'ctn' }, { id: 902, name: "Assorted jelly", unit: 'ctn' },
                { id: 903, name: "Dried mango", unit: 'ctn' }, { id: 904, name: "Coconut milk candy", unit: 'ctn' },
                { id: 905, name: "Durian milk candy", unit: 'ctn' }, { id: 906, name: "Bird Nest Candy", unit: 'ctn' },
                { id: 907, name: "Traditional Coconut Candy", unit: 'ctn' }, { id: 908, name: "Kuih Cincin Mini (office)", unit: 'ctn' },
                { id: 909, name: "Kuih Cincin Besar (office)", unit: 'ctn' }, { id: 910, name: "Kerepek Pisang Manis", unit: 'ctn' },{ id: 911, name: "Kerepek Pisang Masin", unit: 'ctn' }
            ]
        };

// ==========================================
// SPLASH SCREEN LOGIC
// ==========================================
function playOpeningAnimation(callback) {
    const splash = document.getElementById('splashScreen');
    const mainContent = document.getElementById('mainAppContent');
    
    splash.style.display = 'flex';
    mainContent.style.opacity = '0';
    
    // 持续时间：2.5秒，既不卡顿又能展示动画
    setTimeout(() => {
        splash.style.opacity = '0';
        setTimeout(() => {
            splash.style.display = 'none';
            splash.style.opacity = '1'; // Reset for next time if needed
            mainContent.style.opacity = '1';
            if (callback) callback();
        }, 500); // Fade out duration
    }, 2500);
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
                    <span class="product-unit-badge" id="unitBadge${product.id}" style="display: none;"></span>
                    ${isStillNew ? '<span style="position:absolute; top:5px; left:5px; background:red; color:white; font-size:10px; padding:2px 4px; border-radius:4px; z-index:5">NEW</span>' : ''}
                    ${imageHTML}
                    <span class="product-name" onclick="document.getElementById('item${product.id}').click()">${product.name}</span>
                    <span class="stock-info" id="stock${product.id}" style="font-size:0.8rem; color: var(--accent-color); margin-bottom:6px;">Checking...</span>
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
                
                const newBadge = isStillNew ? '<span style="background:red; color:white; font-size:10px; padding:1px 4px; border-radius:4px; margin-left:5px;">NEW</span>' : '';

                div.innerHTML = `
                    <div style="display:flex; align-items:center; flex:1;">
                        <input type="checkbox" id="item${product.id}" ${isChecked} onchange="saveItem(${product.id}, '${product.name}')">
                        <label for="item${product.id}">
                            <div style="display:flex; align-items:center;">
                                ${product.name} ${newBadge}
                                ${viewImageButton}
                            </div>
                            <span id="stock${product.id}" style="font-size:0.8rem; color: var(--accent-color);">Checking...</span>
                        </label>
                    </div>
                    <span class="product-unit-badge" id="unitBadge${product.id}" style="display: none;"></span>
                    <div class="quantity-controls-wrapper">
                            <button class="quantity-btn" onclick="changeQuantity(${product.id}, -1)"><span class="material-icons-round">remove</span></button>
                            <input type="number" id="quantity${product.id}" min="1" value="${currentQuantity}" readonly>
                            <button class="quantity-btn" onclick="changeQuantity(${product.id}, 1)"><span class="material-icons-round">add</span></button>
                    </div>
                `;
            }
            productList.appendChild(div);
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
    initAdminPanel();
    showAdminTab('users');
}

function showAdminTab(tabName) {
    playEffect('click');
    document.querySelectorAll('.admin-tab-content').forEach(tab => tab.style.display = 'none');
    document.querySelectorAll('.tab-button').forEach(button => button.classList.remove('active'));
    document.getElementById(tabName + '-tab').style.display = 'block';
    document.querySelector(`.tab-button[onclick="showAdminTab('${tabName}')"]`).classList.add('active');
    
    if (tabName === 'products') {
        const sel = document.getElementById('categorySelect');
        if (sel.value) loadProductsForAdmin();
    }
    if (tabName === 'announcement') {
        loadAnnouncementSettings();
    }
}

function initAdminPanel() {
    const sel = document.getElementById('categorySelect');
    sel.innerHTML = '<option value="">-- Select Category --</option>';
    Object.keys(categories).forEach(c => {
        const o = document.createElement('option');
        o.value = c;
        o.text = c;
        sel.add(o);
    });
}

// --- User Management ---
function loadUsersList() {
    document.getElementById('pendingUsersList').innerHTML = 'Loading...';
    document.getElementById('allUsersList').innerHTML = 'Loading...';

    db.ref('users').once('value').then(snapshot => {
        const pendingDiv = document.getElementById('pendingUsersList');
        const allDiv = document.getElementById('allUsersList');
        pendingDiv.innerHTML = '';
        allDiv.innerHTML = '';

        if (!snapshot.exists()) {
            pendingDiv.innerHTML = '<p>No pending users.</p>';
            allDiv.innerHTML = '<p>No users found.</p>';
            return;
        }

        snapshot.forEach(child => {
            const uid = child.key;
            const user = child.val();
            
            // Render Pending
            if (user.status === 'pending') {
                pendingDiv.innerHTML += `
                    <div class="user-card">
                        <div class="user-name">${user.name} (${user.email})</div>
                        <div style="margin-top:5px;">
                            <button class="action-button approve" onclick="approveUser('${uid}')">Approve</button>
                        </div>
                    </div>
                `;
            }

            // Render All Users (Permissions Logic)
            if (userRole === 'Admin' && user.role === 'SAdmin') return; // Admin can't see SAdmin

            let actions = '';
            if (userRole === 'SAdmin' && uid !== currentUser.uid) {
                if (user.role === 'User') actions += `<button class="action-button promote" onclick="changeUserRole('${uid}','User','Admin')">Make Admin</button>`;
                if (user.role === 'Admin') actions += `<button class="action-button demote" onclick="changeUserRole('${uid}','Admin','User')">Demote</button>`;
                actions += `<button class="action-button delete" onclick="deleteUser('${uid}')">Delete</button>`;
            }
            if (user.status === 'pending') actions = `<button class="action-button approve" onclick="approveUser('${uid}')">Activate</button>` + actions;

            const statusColor = user.status === 'active' ? 'var(--success-color)' : 'orange';
            allDiv.innerHTML += `
                <div class="user-card">
                    <div class="user-name">${user.name}</div>
                    <div class="user-status">
                        <span style="color:${statusColor}">● ${user.status}</span>
                        <span style="background:rgba(255,255,255,0.1); padding:2px 6px; border-radius:4px;">${user.role}</span>
                    </div>
                    <div style="margin-top:8px;">${actions}</div>
                </div>
            `;
        });

        if (pendingDiv.innerHTML === '') pendingDiv.innerHTML = '<p style="color:var(--text-secondary)">No pending users.</p>';
    });
}

function approveUser(uid) {
    playEffect('success');
    db.ref(`users/${uid}`).update({ status: 'active' }).then(() => { alert('Approved'); loadUsersList(); });
}

function changeUserRole(uid, oldRole, newRole) {
    if(confirm(`Change role from ${oldRole} to ${newRole}?`)) {
        playEffect('click');
        db.ref(`users/${uid}`).update({ role: newRole }).then(() => { alert('Role updated'); loadUsersList(); });
    }
}

function deleteUser(uid) {
    if(confirm('Delete this user permanently?')) {
        playEffect('click');
        db.ref(`users/${uid}`).remove().then(() => { alert('Deleted'); loadUsersList(); });
    }
}

// --- Product Management ---
function loadProductsForAdmin() {
    const cat = document.getElementById('categorySelect').value;
    const div = document.getElementById('productManagementList');
    if (!cat) return;
    
    const products = categories[cat];
    div.innerHTML = 'Loading...';

    Promise.all([
        db.ref('newProducts').once('value'),
        db.ref('productBoxes').once('value')
    ]).then(([newSnap, boxSnap]) => {
        const newData = newSnap.val() || {};
        const boxData = boxSnap.val() || {};
        div.innerHTML = '';

        products.forEach(p => {
            const isNew = newData[p.id];
            const newUntil = isNew ? new Date(isNew.until) : null;
            const isStillNew = isNew && newUntil > new Date();
            const boxCount = boxData[p.id] || 0;

            div.innerHTML += `
                <div class="product-item ${isStillNew ? 'new-product' : ''}">
                    <div style="font-weight:bold; margin-bottom:5px;">${p.name} ${isStillNew ? '🔥' : ''}</div>
                    <label style="font-size:0.85rem; display:block;">Unit Count: 
                        <input type="number" value="${boxCount}" onchange="saveProductBoxCount(${p.id}, this.value)" style="width:60px; padding:4px;">
                    </label>
                    <div style="margin-top:8px;">
                        ${isStillNew ? 
                            `<button class="action-button delete" onclick="toggleNewProduct(${p.id}, false)">Remove New Tag</button>` :
                            `<button class="action-button promote" onclick="toggleNewProduct(${p.id}, true)">Mark as New</button>`
                        }
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
    if(state) {
        const until = new Date();
        until.setDate(until.getDate() + 7);
        db.ref(`newProducts/${pid}`).set({ markedAt: Date.now(), until: until.getTime() }).then(() => loadProductsForAdmin());
    } else {
        db.ref(`newProducts/${pid}`).remove().then(() => loadProductsForAdmin());
    }
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
            document.getElementById('announcementStartTime').value = data.startTime ? new Date(data.startTime).toISOString().slice(0,16) : '';
            document.getElementById('announcementEndTime').value = data.endTime ? new Date(data.endTime).toISOString().slice(0,16) : '';
            
            // Status Display
            const now = Date.now();
            let status = 'Expired';
            let color = 'grey';
            if (now < data.startTime) { status = 'Pending'; color = 'orange'; }
            else if (now <= data.endTime) { status = 'Active'; color = 'green'; }
            
            statusDiv.innerHTML = `<b style="color:${color}">${status}</b><br>Text: ${data.text}<br><button onclick="cancelCurrentAnnouncement()" class="action-button delete" style="margin-top:5px;">Cancel</button>`;
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
        createdBy: currentUser.uid
    };
    
    db.ref('announcement').set(data).then(() => { alert('Saved'); loadAnnouncementSettings(); });
}

function cancelCurrentAnnouncement() {
    if(confirm('Cancel?')) db.ref('announcement').update({ enabled: false }).then(() => loadAnnouncementSettings());
}

function previewAnnouncement() {
    playEffect('click');
    const text = document.getElementById('announcementText').value;
    const prev = document.getElementById('announcementPreview');
    prev.querySelector('div').textContent = text;
    
    const bgType = document.getElementById('announcementBgType').value;
    if(bgType === 'solid') prev.style.background = document.getElementById('announcementBgColor').value;
    else if(bgType === 'custom') prev.style.background = `linear-gradient(45deg, ${document.getElementById('announcementGradientStart').value}, ${document.getElementById('announcementGradientEnd').value})`;
    else prev.style.background = 'linear-gradient(45deg, #ff6b6b, #4ecdc4)';
    
    prev.style.color = document.getElementById('announcementTextColor').value;
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

document.getElementById('imageModal').onclick = function(e) {
    if(e.target === this) closeImageModal();
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
    if(enable) {
        onBtn.style.backgroundColor = 'var(--primary-color)'; onBtn.style.color = 'white';
        offBtn.style.backgroundColor = 'var(--surface-color)'; offBtn.style.color = 'var(--text-primary)';
    } else {
        offBtn.style.backgroundColor = 'var(--primary-color)'; offBtn.style.color = 'white';
        onBtn.style.backgroundColor = 'var(--surface-color)'; onBtn.style.color = 'var(--text-primary)';
    }
}

function selectShop(element, value) {
    playEffect('select');
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
    if(btn) btn.remove();
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
            if(nameEl && nameEl.textContent !== 'Not logged in') userName = nameEl.textContent;
    } catch(e){}

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
        
        result += `🎆 *(${storeName})* ${hasAddOn ? '💥(ADD ON)' : ''}\n`;
        result += `🥳 *(${userName})*\n`;
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
                // 巧克力按品种算1个，其他按数量算（保留你之前的逻辑）
                if(p.name.includes("Chocolate")) totalItems += 1; 
                else totalItems += parseInt(quantity);
                break;
            }
        }
    }

    result += `📦 Total Items: *${totalItems}*\n`;

    // 定义分类对应的 Emoji (优化点)
    const categoryIcons = {
        'BanHeang': '', 'HoeHup': '', 'Chocolate': '', 
        'Sotong': '', 'Coffee': '', 'Amplang': '', 
        'Other': '', 'Wrapping': '', 'Office': ''
    };

    // 构建商品列表
    for (const [cat, items] of Object.entries(categorizedItems)) {
        if (items.length > 0) {
            // 获取对应图标，如果没有则不显示
            const icon = categoryIcons[cat] || '';
            
            result += `\n✨ ${cat} ${icon} ✨\n`;
            
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

    result += '\n_Happy New Year 2️⃣0️⃣2️⃣6️⃣_';

    return result;
}
function loadQuantitiesFromFirebase() {
    ['office', 'kepayan'].forEach(loc => {
        stockDb.ref(`inventory/${loc}`).on('value', snap => {
            const data = snap.val();
            if(data) {
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
        const label = document.querySelector(`label[for="item${id}"]`);
        if (label) {
            const container = label.querySelector('div'); // The flex container inside label
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
            if(badge) {
                if(boxData[pid] > 0) {
                    badge.style.display = 'block';
                    badge.textContent = `Unit: ${boxData[pid]}`;
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
            if(id <= 603) stock = Math.floor(stock/60);
            else if(id <= 605) stock = Math.floor(stock/30);
            else if([606,609,610,611,612].includes(parseInt(id))) stock = Math.floor(stock/80);
            else stock = Math.floor(stock/70);
        }
        const stockEl = document.getElementById(`stock${id}`);
        if (stockEl) {
            stockEl.textContent = stock === 0 ? '(No Stock)' : `(Stock: ${stock})`;
            if(stock === 0) stockEl.classList.add('zero-stock');
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
    
    // Play sound based on action
    if (change > 0) {
        playEffect('add');
    } else if (val > 1) {
        playEffect('remove');
    } else {
        // At minimum quantity
        playEffect('remove');
    }

    val = Math.max(1, val + change);
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
    if(term.length === 0) { sugg.style.display = 'none'; return; }
    const matches = Object.values(window.allProducts).filter(p => p.name.toLowerCase().includes(term));
    matches.slice(0, 5).forEach(p => {
        const d = document.createElement('div');
        d.style.padding = '12px';
        d.style.borderBottom = '1px solid var(--border-color)';
        d.textContent = p.name;
        d.onclick = () => { selectProductFromSearch(p); sugg.style.display='none'; };
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
    if(theme === 'dark') document.body.classList.add('dark-mode');
    localStorage.setItem('dark-mode', theme === 'dark' ? 'enabled' : 'disabled');
}

// Modified Auth Listener for Splash Screen
auth.onAuthStateChanged(user => {
    if (user) {
        // User is logged in
        document.getElementById('authContainer').style.display = 'none';
        
        if (!splashShown) {
            // Play animation if first load
            playOpeningAnimation(() => {
                splashShown = true;
            });
        }

        currentUser = user;
        db.ref(`users/${user.uid}`).once('value').then(snap => {
            const val = snap.val();
            if(val) {
                userRole = val.role;
                document.getElementById('dashboardUserName').textContent = val.name;
                document.getElementById('dashboardUserRole').textContent = val.role;
                if(val.role === 'Admin' || val.role === 'SAdmin') {
                    document.getElementById('dashboardAdminButton').style.display = 'flex';
                }
                if(val.status === 'pending') {
                    // Re-show auth container if pending
                    document.getElementById('authContainer').style.display = 'flex';
                    document.getElementById('pendingForm').style.display = 'block';
                    document.getElementById('loginForm').style.display = 'none';
                }
            }
        });
        loadQuantitiesFromFirebase();
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
    try { playEffect('click'); } catch(e) { console.error(e); }
    
    const emailField = document.getElementById('loginEmail');
    const passField = document.getElementById('loginPassword');
    
    const e = emailField.value.trim(); 
    const p = passField.value;
    
    if(!e || !p) {
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
    try { playEffect('click'); } catch(e) {}
    
    const e = document.getElementById('registerEmail').value.trim();
    const p = document.getElementById('registerPassword').value;
    const n = document.getElementById('registerName').value.trim();
    
    if(!e || !p || !n) { alert("Please fill all fields"); return; }

    const btn = document.getElementById('registerButton');
    const originalText = btn.innerText;
    btn.innerText = "Creating Account...";
    btn.disabled = true;

    auth.createUserWithEmailAndPassword(e, p).then(creds => {
        db.ref(`users/${creds.user.uid}`).set({ email:e, name:n, role:'User', status:'pending', createdAt: Date.now() })
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
    const text = generateText(true);
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
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
function toggleItems(){}

window.addEventListener('load', () => {
    initAllProducts();
    const savedTheme = localStorage.getItem('dark-mode');
    if(savedTheme === 'disabled') changeTheme('light');
    toggleView(currentView);
    toggleVibration(localStorage.getItem('vibration-enabled') !== 'disabled');
    
    db.ref('announcement').on('value', snap => {
        const data = snap.val();
        const banner = document.getElementById('announcementBanner');
        const textEl = document.getElementById('announcementScrollText');
        
        if(data && data.enabled) {
            // Simply show if enabled
            // Ensure text is set
            if(data.text) {
                textEl.textContent = data.text; // Fix: ensure text is assigned
                banner.style.display = 'block';
                
                // Apply styles
                banner.style.background = data.background && data.background.color ? data.background.color : 
                    (data.background && data.background.type === 'custom' ? 
                    `linear-gradient(45deg, ${data.background.startColor}, ${data.background.endColor})` : 
                    'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1)');
                    
                banner.style.fontSize = data.fontSize || '14px';
                banner.style.color = data.textColor || 'white';
                textEl.style.animationDuration = data.speed || '15s';
            }
        } else {
            banner.style.display = 'none';
        }
    });
    
    // Periodic check for new product expiration
        setInterval(() => {
        const now = Date.now();
        db.ref('newProducts').once('value').then(snap => {
            snap.forEach(child => {
                if(child.val().until < now) child.ref.remove();
            });
        });
    }, 3600000); // Check every hour
});