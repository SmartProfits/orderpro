        <script>
        // 分类商品
			        const categories = {
    BanHeang: [
        { id: 101, name: "BH Tambun Original" },
        { id: 102, name: "BH Tambun Pandan" },
        { id: 103, name: "BH Tambun White Lotus" },
        { id: 104, name: "BH Tau Sar Pheah" },
        { id: 105, name: "BH Heong Pheah" },
        { id: 106, name: "BH Beh Teh Saw" },
        { id: 107, name: "BH Phong Pheah" },
        { id: 108, name: "BH Pepper Biscuit" },
        { id: 109, name: "BH Hup Toh Soh" },
        { id: 110, name: "BH Omlette Crisp Chocolate" },
        { id: 111, name: "BH Omlette Crisp Pandan" },
        { id: 112, name: "BH Kai Chai Biscuit" },
        { id: 113, name: "BH Almond Slice" },
        { id: 114, name: "BH Almond Slice Salted Egg" },
        { id: 115, name: "BH Durian Crisp" },
        { id: 116, name: "BH Coconut Crisp" },
        { id: 117, name: "BH Salted Fish Crisp" },
        { id: 118, name: "BH Salted Egg Crisp" },
        { id: 119, name: "BH Cheese Crisp" },
        { id: 120, name: "BH Chic Kut Teh" },
        { id: 121, name: "BH Ginger Slice" },
        { id: 122, name: "BH Dried Mango" },
        { id: 123, name: "BH Kacang Tumbuk" },
        { id: 124, name: "BH Gula Kacang" },
        { id: 125, name: "BH Black Sesame Peanut" },
        { id: 126, name: "BH Shat Kek Ma" },
        { id: 127, name: "BH Shat Kek Ma (Brown Sugar)" },
        { id: 128, name: "BH Coconut Biscuits" },
        { id: 129, name: "BH FD Durian 50g" },
        { id: 130, name: "BH FD Mango 50g" },
        { id: 131, name: "BH FD Durian 30g" },
        { id: 132, name: "BH Butter Cookies" },
        { id: 133, name: "BH Chocolate Cookies" },
        { id: 134, name: "BH Raisin Cookies" },
        { id: 135, name: "BH Almond Cookies" },
        { id: 136, name: "BH Pineapple Tart" },
        { id: 137, name: "BH Red Bean Mochi" },
        { id: 138, name: "BH Peanut Mochi" },
        { id: 139, name: "BH Green Tea Mochi" },
        { id: 140, name: "BH Durian Mochi" },
        { id: 141, name: "BH Yam Mochi" },
        { id: 142, name: "BH Mochi Milk Yam Filling" },
        { id: 143, name: "BH Mochi Milk Mango Filling" },
        { id: 144, name: "BH Mochi Milk Green Tea" },
        { id: 145, name: "BH Sotong Cuttlefish" },
        { id: 146, name: "BH Gula Cuttlefish" },
        { id: 147, name: "BH Satay Fish" },
        { id: 148, name: "BH Fillet Cracker With Anchovy" },
        { id: 149, name: "BH Fillet Cracker With Seaweed" },
        { id: 150, name: "BH Sakura Shrimp" },
        { id: 151, name: "BH Frugurt Yogurt Blueberry" },
        { id: 152, name: "BH Frugurt Yogurt Peach" },
        { id: 153, name: "BH Frugurt Yogurt Mango" },
        { id: 154, name: "BH Durian Pudding" },
        { id: 155, name: "BH Coconut Pudding" },
        { id: 156, name: "BH Dodol Durian" },
        { id: 157, name: "BH Dodol Coconut" },
        { id: 158, name: "BH Dodol Pandan" },
        { id: 159, name: "BH Durian Beh Teh Saw" }
    ],
    HopHup: [
        { id: 201, name: "HT Durian Tart" },
        { id: 202, name: "HT Mango Tart" },
        { id: 203, name: "HT Durian Wafer Roll" },
        { id: 204, name: "HT Mango Wafer Roll🆕" },
        { id: 205, name: "HT Omelette Durian" },
        { id: 206, name: "HT Coconut Ori Cookies" },
        { id: 207, name: "HT Coconut Pandan Cookies" },
        { id: 208, name: "HT Dodol Original🆕" },
        { id: 209, name: "HT Dodol Kopi" },
        { id: 210, name: "HT Dodol Durian" },
        { id: 211, name: "HT Freeze Dried Mango" },
        { id: 212, name: "HT Freeze Dried Durian" },
        { id: 213, name: "Salted Egg Fish Skin" },
        { id: 214, name: "Salted Egg Fish Skin Spicy" },
        { id: 215, name: "Salted Egg Salmon Skin" },
        { id: 216, name: "Musang King Durian Candy" },
        { id: 217, name: "HT Durian Cookies🆕" },
        { id: 218, name: "Fish Chips Classic🆕" },
        { id: 219, name: "Salted Egg Fish Chips🆕" },
        { id: 220, name: "Salted Egg Fish Chips Mala🆕" }
    ],
    Chocolate: [
        { id: 301, name: "AD Chocolate Durian", unit: 'pc', defaultQuantity: 50 },
        { id: 302, name: "AD Chocolate Sabah Tea", unit: 'pc', defaultQuantity: 50 },
        { id: 303, name: "AD Chocolate Mango", unit: 'pc', defaultQuantity: 50 },
        { id: 304, name: "AD Chocolate Chili", unit: 'pc', defaultQuantity: 50 },
        { id: 305, name: "AD Chocolate Dark", unit: 'pc', defaultQuantity: 50 },
        { id: 306, name: "AD Chocolate Coffee", unit: 'pc', defaultQuantity: 50 },
        { id: 307, name: "AD Chocolate Banana", unit: 'pc', defaultQuantity: 50 },
        { id: 308, name: "AD Chocolate Tiramisu", unit: 'pc', defaultQuantity: 50 },
        { id: 309, name: "AD Chocolate Mint", unit: 'pc', defaultQuantity: 50 },
        { id: 310, name: "AD Chocolate Rambutan", unit: 'pc', defaultQuantity: 50 },
        { id: 311, name: "AD Chocolate Soursup", unit: 'pc', defaultQuantity: 50 },
        { id: 312, name: "AD Chocolate Coconut", unit: 'pc', defaultQuantity: 50 },
        { id: 313, name: "AD Chocolate Mangosteen", unit: 'pc', defaultQuantity: 50 }
    ],
    Sotong: [
        { id: 401, name: "Cuttlefish Red" },
        { id: 402, name: "Cuttlefish Lemon" },
        { id: 403, name: "Cuttlefish Honey" },
        { id: 404, name: "Cuttlefish Floss Original" },
        { id: 405, name: "Cuttlefish Massive" },
        { id: 406, name: "Cuttlefish Whole" },
        { id: 407, name: "Cuttlefish Roasted" },
        { id: 408, name: "Cuttlefish Chili" },
        { id: 409, name: "Cuttle Fish Slices🆕" },
        { id: 410, name: "Cuttle Fish Sugar🆕" },
        { id: 411, name: "Five Star Cuttlefish" }
    ],
    Coffee: [
        { id: 501, name: "BH W/Coffee(Mini)" },
        { id: 502, name: "BH W/Coffee(Mini)No Sugar" },
        { id: 503, name: "BH Durian W/Coffee(Mini)" },
        { id: 504, name: "BH Teh Tarik(Mini)" },
        { id: 505, name: "BH W/Coffee" },
        { id: 506, name: "BH W/Coffee No Sugar" },
        { id: 507, name: "BH Kopi O 2in1" },
        { id: 508, name: "BH Kopi O No Sugar" },
        { id: 509, name: "BH Teh Tarik" },
        { id: 510, name: "BH Durian White Coffee" },
        { id: 511, name: "Kopi Tenom Silver" },
        { id: 512, name: "Kopi Tenom Gold" },
        { id: 513, name: "Kopi Tenom Blue" },
        { id: 514, name: "Kopi Tenom Green" },
        { id: 515, name: "Kopi Tenom Red" }
    ],
    Amplang: [
        { id: 601, name: "Amplang Ikan" },
        { id: 602, name: "Amplang Udang" },
        { id: 603, name: "Amplang Sotong" }
    ],
    Other: [
        { id: 701, name: "Fruity Gummy Assorted" },
        { id: 702, name: "Fruity Gummy Mango" },
        { id: 703, name: "Durian Kuih" },
        { id: 704, name: "Anchovy Blue" },
        { id: 705, name: "Anchovy Green" },
        { id: 706, name: "Anchovy Red" },
        { id: 707, name: "Anchovy Yellow" }
    ]
};



        let selectedItems = {};

        function loadProducts(products) {
            const productList = document.getElementById('productList');
            productList.innerHTML = '';

            products.forEach(product => {
                const defaultQuantity = product.defaultQuantity || 1;
                const div = document.createElement('div');
                div.innerHTML = `
                    <input type="checkbox" id="item${product.id}" onchange="saveItem(${product.id}, '${product.name}')">
                    <label for="item${product.id}">${product.name}</label>
                    <button class="quantity-btn" onclick="changeQuantity(${product.id}, 1)">+</button>
                    <input type="number" id="quantity${product.id}" min="1" value="${defaultQuantity}" onchange="saveQuantity(${product.id})">
                    <button class="quantity-btn" onclick="changeQuantity(${product.id}, -1)">-</button>
                `;
                productList.appendChild(div);

                if (selectedItems[product.id]) {
                    document.getElementById('item' + product.id).checked = true;
                    document.getElementById('quantity' + product.id).value = selectedItems[product.id];
                }
            });
        }

        function saveItem(id, name) {
            const checkbox = document.getElementById('item' + id);
            const quantity = document.getElementById('quantity' + id).value || 1;

            if (checkbox.checked) {
                selectedItems[id] = quantity;
            } else {
                delete selectedItems[id];
            }
        }

        function saveQuantity(id) {
            const quantity = document.getElementById('quantity' + id).value || 1;
            if (selectedItems[id]) {
                selectedItems[id] = quantity;
            }
        }

        function changeQuantity(id, change) {
            const quantityInput = document.getElementById('quantity' + id);
            let currentQuantity = parseInt(quantityInput.value) || 1;
            currentQuantity = Math.max(1, currentQuantity + change);
            quantityInput.value = currentQuantity;
            saveQuantity(id);
        }

        function toggleItems() {
            let selectedStore = document.querySelector('input[name="store"]:checked');
            let checkboxes = document.querySelectorAll('#productList input[type="checkbox"]');
            let quantities = document.querySelectorAll('#productList input[type="number"]');

            if (selectedStore) {
                checkboxes.forEach(checkbox => checkbox.disabled = false);
                quantities.forEach(quantity => quantity.disabled = false);
            } else {
                checkboxes.forEach(checkbox => checkbox.disabled = true);
                quantities.forEach(quantity => quantity.disabled = true);
            }
        }

        function showCategory() {
            let selectedCategory = document.querySelector('input[name="category"]:checked');
            if (selectedCategory) {
                let categoryValue = selectedCategory.value;
                let productsToShow = categories[categoryValue];
                if (productsToShow) {
                    loadProducts(productsToShow);
                }
            }
            toggleItems();
        }

        function generateText() {
            let result = '';
            let selectedStore = document.querySelector('input[name="store"]:checked');
            let hasAddOn = document.getElementById('addOnCheckbox').checked;

            if (selectedStore) {
                result += '🎄 Kedai: ' + selectedStore.value;
                if (hasAddOn) {
                    result += ' 💥Add On💥';
                }
                result += '\n\n';
            } else {
                result += '🎄 Kedai: 未选择\n';
            }

            const categorizedItems = {};
            Object.keys(categories).forEach(category => {
                categorizedItems[category] = [];
            });

            for (const [id, quantity] of Object.entries(selectedItems)) {
                for (const [category, products] of Object.entries(categories)) {
                    const product = products.find(p => p.id == id);
                    if (product) {
                        const unit = product.unit === 'pc' ? 'pc' : 'ctn';
                        categorizedItems[category].push({
                            name: product.name,
                            quantity: quantity,
                            unit: unit
                        });
                        break;
                    }
                }
            }

            for (const [category, items] of Object.entries(categorizedItems)) {
                if (items.length > 0) {
                    result += `\n=== ${category} ===\n`;
                    items.forEach(item => {
                        result += `${item.name} - ${item.quantity} ${item.unit}\n`;
                    });
                }
            }

            result += '\n🎄 Airport Stock Order: smartprofits.github.io/order/ 🎄';
            document.getElementById('result').innerText = result;
            return result;
        }

        function copyAndSendWhatsApp() {
            let text = generateText();
            navigator.clipboard.writeText(text).then(() => {
                alert('文字已复制，现在跳转到WhatsApp');
                let whatsappURL = `https://wa.me/?text=${encodeURIComponent(text)}`;
                window.location.href = whatsappURL;
            }).catch(err => {
                console.error('无法复制', err);
            });
        }

        

        function searchProduct() {
            const searchText = document.getElementById('productSearch').value.toLowerCase();
            const suggestionsContainer = document.getElementById('suggestions');
            suggestionsContainer.innerHTML = '';

            if (searchText.length === 0) return;

            const allProducts = Object.values(categories).flat();
            const matchingProducts = allProducts.filter(product => 
                product.name.toLowerCase().includes(searchText)
            );

            matchingProducts.forEach(product => {
                const div = document.createElement('div');
                div.textContent = product.name;
                div.onclick = () => selectProduct(product);
                suggestionsContainer.appendChild(div);
            });
        }

        function selectProduct(product) {
            const productSearch = document.getElementById('productSearch');
            productSearch.value = '';
            const productList = document.getElementById('productList');
            productList.innerHTML = '';

            const div = document.createElement('div');
            div.innerHTML = `
                <input type="checkbox" id="item${product.id}" checked onchange="saveItem(${product.id}, '${product.name}')">
                <label for="item${product.id}">${product.name}</label>
                <button class="quantity-btn" onclick="changeQuantity(${product.id}, 1)">+</button>
                <input type="number" id="quantity${product.id}" min="1" value="1" onchange="saveQuantity(${product.id})">
                <button class="quantity-btn" onclick="changeQuantity(${product.id}, -1)">-</button>
            `;
            productList.appendChild(div);

            saveItem(product.id, product.name);
            document.getElementById('suggestions').innerHTML = '';
        }

        // 页面加载时初始化
        window.onload = function() {

    
    // 添加自动播放音乐
    const music = document.getElementById('backgroundMusic');
    music.play().catch(function(error) {
        console.log("自动播放失败：", error);
        isMusicPlaying = false;
        document.getElementById('musicToggle').innerHTML = '🔈 播放音乐';
    });
}
        div.innerHTML = `
    <input type="checkbox" id="item${product.id}" onchange="saveItem(${product.id}, '${product.name}')">
    <label for="item${product.id}">${product.name}</label>
    <div class="quantity-control">
        <button class="quantity-btn" onclick="changeQuantity(${product.id}, -1)">-</button>
        <input type="number" id="quantity${product.id}" min="1" value="${defaultQuantity}" onchange="saveQuantity(${product.id})">
        <button class="quantity-btn" onclick="changeQuantity(${product.id}, 1)">+</button>
    </div>
`;

// 在 selectProduct 函数中也要修改相应的 HTML
div.innerHTML = `
    <input type="checkbox" id="item${product.id}" checked onchange="saveItem(${product.id}, '${product.name}')">
    <label for="item${product.id}">${product.name}</label>
    <div class="quantity-control">
        <button class="quantity-btn" onclick="changeQuantity(${product.id}, -1)">-</button>
        <input type="number" id="quantity${product.id}" min="1" value="1" onchange="saveQuantity(${product.id})">
        <button class="quantity-btn" onclick="changeQuantity(${product.id}, 1)">+</button>
    </div>
    
`;
div.innerHTML = `
    <input type="checkbox" id="item${product.id}" onchange="saveItem(${product.id}, '${product.name}')">
    <label for="item${product.id}">${product.name}</label>
    <div class="quantity-control">
        <button class="quantity-btn" onclick="changeQuantity(${product.id}, -1)">-</button>
        <input type="number" id="quantity${product.id}" min="1" value="${defaultQuantity}" onchange="saveQuantity(${product.id})">
        <button class="quantity-btn" onclick="changeQuantity(${product.id}, 1)">+</button>
    </div>
`;

// 在 selectProduct 函数中也要修改相应的 HTML
div.innerHTML = `
    <input type="checkbox" id="item${product.id}" checked onchange="saveItem(${product.id}, '${product.name}')">
    <label for="item${product.id}">${product.name}</label>
    <div class="quantity-control">
        <button class="quantity-btn" onclick="changeQuantity(${product.id}, -1)">-</button>
        <input type="number" id="quantity${product.id}" min="1" value="1" onchange="saveQuantity(${product.id})">
        <button class="quantity-btn" onclick="changeQuantity(${product.id}, 1)">+</button>
    </div>
`;
// ... existing code ...

// 修改音乐控制相关的代码
// 修改音乐控制相关的代码
let isMusicPlaying = false;

// 修改音乐控制函数
function toggleMusic() {
    const music = document.getElementById('backgroundMusic');
    const musicBtn = document.getElementById('musicToggle');
    
    if (!music.paused) {
        // 如果音乐正在播放，就暂停
        music.pause();
        music.currentTime = 0;
        isMusicPlaying = false;
        musicBtn.innerHTML = '🔈 播放音乐';
    } else {
        // 如果音乐是暂停状态，尝试播放
        const playPromise = music.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                isMusicPlaying = true;
                musicBtn.innerHTML = '🔇 关闭音乐';
            }).catch(error => {
                console.log("播放失败：", error);
                isMusicPlaying = false;
                musicBtn.innerHTML = '🔈 播放音乐';
            });
        }
    }
}

// 修改 window.onload 函数
window.onload = function() {
    const savedMode = localStorage.getItem('dark-mode');
    if (savedMode === 'enabled') {
        document.body.classList.add('dark-mode');
        document.querySelector('.toggle-mode-btn').textContent = '🌞 Light Mode';
    }
    toggleItems();

    // 添加一个自动播放的尝试
    const music = document.getElementById('backgroundMusic');
    const musicBtn = document.getElementById('musicToggle');
    
    // 尝试自动播放
    document.addEventListener('click', function initAudioAutoplay() {
        const playPromise = music.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                isMusicPlaying = true;
                musicBtn.innerHTML = '🔇 关闭音乐';
                // 移除事件监听器，因为我们只需要它执行一次
                document.removeEventListener('click', initAudioAutoplay);
            }).catch(error => {
                console.log("自动播放失败：", error);
                isMusicPlaying = false;
                musicBtn.innerHTML = '🔈 播放音乐';
            });
        }
    }, { once: true }); // 使用 once 选项确保事件监听器只执行一次
}
    </script>