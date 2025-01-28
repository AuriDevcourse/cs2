document.addEventListener('DOMContentLoaded', function() {
    // Initialize Bootstrap components
    const addItemModal = new bootstrap.Modal(document.getElementById('addItemModal'));
    
    // Get DOM elements
    const addItemBtn = document.getElementById('addItemBtn');
    const addItemForm = document.getElementById('addItemForm');
    const saveItemBtn = document.getElementById('saveItemBtn');
    const toggleFilters = document.getElementById('toggleFilters');
    const filterSection = document.getElementById('filterSection');
    const selectAllCheckbox = document.getElementById('selectAllItems');
    const categoryFilter = document.getElementById('filterCategory');
    const subcategoryFilter = document.getElementById('filterSubcategory');
    const statusFilter = document.getElementById('filterStatus');
    const itemCategory = document.getElementById('itemCategory');
    const itemSubcategory = document.getElementById('itemSubcategory');
    const itemPurchaseSource = document.getElementById('itemPurchaseSource');
    const purchasePriceContainer = document.getElementById('purchasePriceContainer');
    const purchaseCoinsContainer = document.getElementById('purchaseCoinsContainer');

    // State management
    let allItems = [];
    let selectedItems = new Set();
    let currentFilters = {
        category: '',
        subcategory: '',
        status: ''
    };

    // Subcategories mapping
    const subcategories = {
        'Knives': [
            'Bayonet', 'Bowie Knife', 'Butterfly Knife', 'Classic Knife', 'Falchion Knife',
            'Flip Knife', 'Gut Knife', 'Huntsman Knife', 'Karambit', 'Kukri Knife',
            'M9 Bayonet', 'Navaja Knife', 'Nomad Knife', 'Paracord Knife', 'Shadow Daggers',
            'Skeleton Knife', 'Stiletto Knife', 'Survival Knife', 'Talon Knife', 'Ursus Knife'
        ],
        'Gloves': [
            'Bloodhound Gloves', 'Broken Fang Gloves', 'Driver Gloves', 'Hand Wraps',
            'Hydra Gloves', 'Moto Gloves', 'Specialist Gloves', 'Sport Gloves'
        ],
        'Rifles': [
            'AK-47', 'AUG', 'AWP', 'FAMAS', 'G3SG1', 'Galil AR', 'M4A1-S', 'M4A4',
            'SCAR-20', 'SG 553', 'SSG 08'
        ],
        'Pistols': [
            'CZ75-Auto', 'Desert Eagle', 'Dual Berettas', 'Five-SeveN', 'Glock-18',
            'P2000', 'P250', 'R8 Revolver', 'Tec-9', 'USP-S'
        ],
        'SMGs': [
            'MAC-10', 'MP5-SD', 'MP7', 'MP9', 'P90', 'PP-Bizon', 'UMP-45'
        ],
        'Shotguns': [
            'MAG-7', 'Nova', 'Sawed-Off', 'XM1014'
        ],
        'Machine Guns': [
            'M249', 'Negev'
        ],
        'Agents': [
            'CT', 'T'
        ]
    };

    // Event listeners
    if (addItemBtn) addItemBtn.addEventListener('click', () => {
        resetForm();
        addItemModal.show();
    });
    if (addItemForm) addItemForm.addEventListener('submit', handleAddItem);
    if (saveItemBtn) saveItemBtn.addEventListener('click', handleSaveItem);
    if (selectAllCheckbox) selectAllCheckbox.addEventListener('change', handleSelectAll);
    if (toggleFilters) toggleFilters.addEventListener('click', toggleFilterSection);
    if (itemPurchaseSource) itemPurchaseSource.addEventListener('change', updatePurchaseFields);
    if (itemCategory) itemCategory.addEventListener('change', () => updateSubcategories(itemCategory, itemSubcategory));
    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => {
            currentFilters.category = categoryFilter.value;
            updateSubcategories(categoryFilter, subcategoryFilter);
            filterAndRenderItems();
        });
    }
    if (subcategoryFilter) {
        subcategoryFilter.addEventListener('change', () => {
            currentFilters.subcategory = subcategoryFilter.value;
            filterAndRenderItems();
        });
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', () => {
            currentFilters.status = statusFilter.value;
            filterAndRenderItems();
        });
    }

    // Load items on page load
    loadItems();

    function handleAddItem(event) {
        event.preventDefault();
        handleSaveItem();
    }

    function handleSaveItem() {
        const formData = {
            id: document.getElementById('itemId').value || null,
            name: document.getElementById('itemName').value,
            category: document.getElementById('itemCategory').value,
            subcategory: document.getElementById('itemSubcategory').value,
            float: parseFloat(document.getElementById('itemFloat').value) || null,
            purchase_source: document.getElementById('itemPurchaseSource').value,
            purchase_price: null,
            purchase_coins: null,
            status: document.getElementById('itemStatus').value,
            notes: document.getElementById('itemNotes').value || ''
        };

        // Validate required fields
        if (!formData.name || !formData.category || !formData.subcategory || !formData.purchase_source || !formData.status) {
            showToast('Error', 'Please fill in all required fields');
            return;
        }

        // Set purchase price based on source
        if (formData.purchase_source === 'Trading') {
            formData.purchase_coins = parseFloat(document.getElementById('purchaseCoins').value) || null;
            if (formData.purchase_coins) {
                formData.purchase_price = convertCoinstoEUR(formData.purchase_coins);
            }
        } else {
            formData.purchase_price = parseFloat(document.getElementById('purchasePrice').value) || null;
        }

        // Send data to server
        const url = formData.id ? `/api/items/${formData.id}` : '/api/items';
        const method = formData.id ? 'PUT' : 'POST';

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
            showToast('Success', `Item ${formData.id ? 'updated' : 'added'} successfully`);
            addItemModal.hide();
            resetForm();
            loadItems();
        })
        .catch(error => {
            showToast('Error', error.message);
            console.error('Error:', error);
        });
    }

    function resetForm() {
        addItemForm.reset();
        document.getElementById('itemId').value = '';
        document.getElementById('itemStatus').value = '';
        updatePurchaseFields();
        updateSubcategories(itemCategory, itemSubcategory);
    }

    function loadItems() {
        fetch('/api/items')
            .then(response => response.json())
            .then(items => {
                allItems = items;
                filterAndRenderItems();
            })
            .catch(error => {
                showToast('Error', 'Failed to load items');
                console.error('Error loading items:', error);
            });
    }

    function filterAndRenderItems() {
        const filteredItems = allItems.filter(item => {
            if (currentFilters.category && item.category !== currentFilters.category) return false;
            if (currentFilters.subcategory && item.subcategory !== currentFilters.subcategory) return false;
            if (currentFilters.status && item.status !== currentFilters.status) return false;
            return true;
        });

        renderItems(filteredItems);
        updateDashboard();
    }

    function renderItems(items) {
        const tbody = document.getElementById('itemsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" value="${item.id}">
                    </div>
                </td>
                <td>${item.subcategory || '-'}</td>
                <td>${item.name}</td>
                <td>
                    <div class="float-value ${getFloatClass(item.float)}">
                        ${item.float ? item.float.toFixed(8) : '-'}
                        ${item.float ? `<div class="float-indicator"></div>` : ''}
                    </div>
                </td>
                <td>${item.purchase_source}</td>
                <td>${formatPrice(item.purchase_price)}</td>
                <td>
                    <span class="badge ${getStatusBadgeClass(item.status)}">
                        ${item.status}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary edit-btn" title="Edit">
                        <span class="material-icons">edit</span>
                    </button>
                    <button class="btn btn-sm btn-danger delete-btn" title="Delete">
                        <span class="material-icons">delete</span>
                    </button>
                </td>
            `;

            // Add event listeners
            const editBtn = row.querySelector('.edit-btn');
            const deleteBtn = row.querySelector('.delete-btn');
            const checkbox = row.querySelector('.form-check-input');

            editBtn.addEventListener('click', () => editItem(item));
            deleteBtn.addEventListener('click', () => deleteItem(item.id));
            checkbox.addEventListener('change', (e) => toggleItemSelection(item.id, e.target.checked));

            tbody.appendChild(row);
        });
    }

    function updateDashboard() {
        const totalItems = allItems.length;
        const tradelockItems = allItems.filter(item => item.status === 'Tradelock').length;
        const inventoryItems = allItems.filter(item => item.status === 'Inventory').length;
        const onSaleItems = allItems.filter(item => item.status === 'On Sale').length;
        const soldItems = allItems.filter(item => item.status === 'Sold').length;

        document.getElementById('totalItems').textContent = totalItems;
        document.getElementById('activeItems').textContent = tradelockItems;
        document.getElementById('inventoryItems').textContent = inventoryItems;
    }

    function updateSubcategories(categorySelect, subcategorySelect) {
        const category = categorySelect.value;
        
        subcategorySelect.innerHTML = '<option value="">Select Subcategory</option>';
        subcategorySelect.disabled = !category;
        
        if (category && subcategories[category]) {
            subcategories[category].forEach(sub => {
                subcategorySelect.innerHTML += `<option value="${sub}">${sub}</option>`;
            });
        }
    }

    function updatePurchaseFields() {
        const source = itemPurchaseSource.value;
        if (source === 'Trading') {
            purchasePriceContainer.style.display = 'none';
            purchaseCoinsContainer.style.display = 'block';
            document.getElementById('purchasePrice').value = '';
        } else {
            purchasePriceContainer.style.display = 'block';
            purchaseCoinsContainer.style.display = 'none';
            document.getElementById('purchaseCoins').value = '';
        }
    }

    function convertCoinstoEUR(coins) {
        return coins * 0.67; // 1 CSFloat coin ≈ 0.67 EUR
    }

    function getFloatClass(float) {
        if (!float) return '';
        if (float <= 0.07) return 'float-fn';
        if (float <= 0.15) return 'float-mw';
        if (float <= 0.38) return 'float-ft';
        if (float <= 0.45) return 'float-ww';
        return 'float-bs';
    }

    function getStatusBadgeClass(status) {
        switch (status) {
            case 'Tradelock':
                return 'bg-warning';
            case 'Inventory':
                return 'bg-success';
            case 'On Sale':
                return 'bg-primary';
            case 'Sold':
                return 'bg-secondary';
            default:
                return 'bg-secondary';
        }
    }

    function formatPrice(price) {
        return price ? `${parseFloat(price).toFixed(2)} EUR` : '-';
    }

    function toggleFilterSection() {
        const icon = toggleFilters.querySelector('.material-icons');
        if (filterSection.style.display === 'none') {
            filterSection.style.display = 'block';
            icon.textContent = 'expand_less';
        } else {
            filterSection.style.display = 'none';
            icon.textContent = 'expand_more';
        }
    }

    function showToast(title, message) {
        // Implement toast notification
        console.log(`${title}: ${message}`);
    }

    function editItem(item) {
        document.getElementById('itemId').value = item.id;
        document.getElementById('itemName').value = item.name;
        document.getElementById('itemCategory').value = item.category;
        updateSubcategories(itemCategory, itemSubcategory);
        document.getElementById('itemSubcategory').value = item.subcategory;
        document.getElementById('itemFloat').value = item.float || '';
        document.getElementById('itemPurchaseSource').value = item.purchase_source;
        
        if (item.purchase_source === 'Trading') {
            document.getElementById('purchaseCoins').value = item.purchase_coins || '';
        } else {
            document.getElementById('purchasePrice').value = item.purchase_price || '';
        }
        
        document.getElementById('itemStatus').value = item.status;
        document.getElementById('itemNotes').value = item.notes || '';

        updatePurchaseFields();
        addItemModal.show();
    }

    function deleteItem(itemId) {
        if (!confirm('Are you sure you want to delete this item?')) return;

        fetch(`/api/items/${itemId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            showToast('Success', 'Item deleted successfully');
            loadItems();
        })
        .catch(error => {
            showToast('Error', 'Failed to delete item');
        });
    }

    function handleSelectAll(e) {
        const checkboxes = document.querySelectorAll('#itemsTableBody .form-check-input');
        checkboxes.forEach(checkbox => {
            checkbox.checked = e.target.checked;
            toggleItemSelection(checkbox.value, e.target.checked);
        });
    }

    function toggleItemSelection(itemId, isSelected) {
        if (isSelected) {
            selectedItems.add(itemId);
        } else {
            selectedItems.delete(itemId);
        }
    }
});
