// Global variables and state
let allItems = [];
let currentFilters = {
    category: '',
    subcategory: '',
    status: ''
};
let currentItemId = null;

// Subcategories mapping
const subcategories = {
    'Knives': ['Bayonet', 'Bowie Knife', 'Butterfly Knife', 'Classic Knife', 'Falchion Knife', 'Flip Knife', 'Gut Knife', 'Huntsman Knife', 'Karambit', 'M9 Bayonet', 'Navaja Knife', 'Nomad Knife', 'Paracord Knife', 'Shadow Daggers', 'Skeleton Knife', 'Stiletto Knife', 'Survival Knife', 'Talon Knife', 'Ursus Knife'],
    'Gloves': ['Bloodhound Gloves', 'Driver Gloves', 'Hand Wraps', 'Hydra Gloves', 'Moto Gloves', 'Specialist Gloves', 'Sport Gloves'],
    'Rifles': ['AK-47', 'AUG', 'FAMAS', 'Galil AR', 'M4A1-S', 'M4A4', 'SG 553', 'AWP', 'G3SG1', 'SCAR-20', 'SSG 08'],
    'Pistols': ['CZ75-Auto', 'Desert Eagle', 'Dual Berettas', 'Five-SeveN', 'Glock-18', 'P2000', 'P250', 'R8 Revolver', 'Tec-9', 'USP-S'],
    'SMGs': ['MAC-10', 'MP5-SD', 'MP7', 'MP9', 'P90', 'PP-Bizon', 'UMP-45'],
    'Shotguns': ['MAG-7', 'Nova', 'Sawed-Off', 'XM1014'],
    'Machine Guns': ['M249', 'Negev'],
    'Agents': ['CT Agents', 'T Agents']
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Bootstrap components
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Get references to DOM elements
    const addItemBtn = document.getElementById('addItemBtn');
    const addItemModal = document.getElementById('addItemModal');
    const addItemForm = document.getElementById('addItemForm');
    const itemCategory = document.getElementById('itemCategory');
    const itemStatus = document.getElementById('itemStatus');
    const itemPurchaseSource = document.getElementById('itemPurchaseSource');
    const filterCategory = document.getElementById('filterCategory');
    const filterStatus = document.getElementById('filterStatus');
    const editItemModal = document.getElementById('editItemModal');
    const editItemForm = document.getElementById('editItemForm');

    // Add event listeners
    if (addItemBtn) {
        addItemBtn.addEventListener('click', function() {
            resetForm();
            const modal = new bootstrap.Modal(addItemModal);
            modal.show();
        });
    }

    // Form submission handler
    if (addItemForm) {
        addItemForm.addEventListener('submit', handleFormSubmit);
    }

    if (editItemForm) {
        editItemForm.addEventListener('submit', submitEditForm);
    }

    // Category change handlers
    if (itemCategory) {
        itemCategory.addEventListener('change', function() {
            populateSubcategories(this.value);
        });
    }

    if (filterCategory) {
        filterCategory.addEventListener('change', function() {
            currentFilters.category = this.value;
            filterAndRenderItems();
        });
    }

    // Status change handlers
    if (itemStatus) {
        itemStatus.addEventListener('change', function() {
            const sellingPriceGroup = document.getElementById('sellingPriceGroup');
            const soldPriceGroup = document.getElementById('soldPriceGroup');
            const unlockDateGroup = document.getElementById('unlockDateGroup');
            
            // Show/hide selling price field
            sellingPriceGroup.style.display = this.value === 'Selling' ? 'block' : 'none';
            
            // Show/hide sold price field
            soldPriceGroup.style.display = this.value === 'Sold' ? 'block' : 'none';
            
            // Show/hide unlock date field
            unlockDateGroup.style.display = this.value === 'Tradelock' ? 'block' : 'none';
            
            // Clear fields when not visible
            if (this.value !== 'Selling') {
                document.getElementById('sellingPrice').value = '';
            }
            if (this.value !== 'Sold') {
                document.getElementById('soldPrice').value = '';
            }
            if (this.value !== 'Tradelock') {
                document.getElementById('unlockDate').value = '';
            }
        });
    }

    if (filterStatus) {
        filterStatus.addEventListener('change', function() {
            currentFilters.status = this.value;
            filterAndRenderItems();
        });
    }

    // Purchase source change handler
    if (itemPurchaseSource) {
        itemPurchaseSource.addEventListener('change', function() {
            const purchaseCoinsContainer = document.getElementById('purchaseCoinsContainer');
            const purchasePriceContainer = document.getElementById('purchasePriceContainer');
            
            if (this.value === 'Trading') {
                purchaseCoinsContainer.style.display = 'block';
                purchasePriceContainer.style.display = 'none';
            } else {
                purchaseCoinsContainer.style.display = 'none';
                purchasePriceContainer.style.display = 'block';
            }
        });
    }

    // Edit form status change handler
    const editStatus = document.getElementById('editStatus');
    if (editStatus) {
        editStatus.addEventListener('change', function() {
            const sellingPriceGroup = document.getElementById('editSellingPriceGroup');
            const soldPriceGroup = document.getElementById('editSoldPriceGroup');
            const unlockDateGroup = document.getElementById('editUnlockDateGroup');
            
            // Show/hide selling price field
            sellingPriceGroup.style.display = this.value === 'Selling' ? 'block' : 'none';
            
            // Show/hide sold price field
            soldPriceGroup.style.display = this.value === 'Sold' ? 'block' : 'none';
            
            // Show/hide unlock date field
            unlockDateGroup.style.display = this.value === 'Tradelock' ? 'block' : 'none';
            
            // Clear fields when not visible
            if (this.value !== 'Selling') {
                document.getElementById('editSellingPrice').value = '';
            }
            if (this.value !== 'Sold') {
                document.getElementById('editSoldPrice').value = '';
            }
            if (this.value !== 'Tradelock') {
                document.getElementById('editUnlockDate').value = '';
            }
        });
    }

    // Edit form purchase source change handler
    const editPurchaseSource = document.getElementById('editPurchaseSource');
    if (editPurchaseSource) {
        editPurchaseSource.addEventListener('change', function() {
            const purchaseCoinsGroup = document.getElementById('editPurchaseCoinsGroup');
            const purchasePriceGroup = document.getElementById('editPurchasePriceGroup');
            
            if (this.value === 'Trading') {
                purchaseCoinsGroup.style.display = 'block';
                purchasePriceGroup.style.display = 'none';
                document.getElementById('editPurchasePrice').value = '';
            } else {
                purchaseCoinsGroup.style.display = 'none';
                purchasePriceGroup.style.display = 'block';
                document.getElementById('editPurchaseCoins').value = '';
            }
        });
    }

    // Edit form category change handler
    const editCategory = document.getElementById('editCategory');
    if (editCategory) {
        editCategory.addEventListener('change', function() {
            populateSubcategories(this.value, 'editSubcategory');
        });
    }

    // Load initial data
    loadItems();
});

async function handleFormSubmit(event) {
    event.preventDefault();
    
    try {
        // Get form values
        const formData = {
            name: document.getElementById('itemName').value.trim(),
            category: document.getElementById('itemCategory').value,
            subcategory: document.getElementById('itemSubcategory').value,
            float: document.getElementById('itemFloat').value ? parseFloat(document.getElementById('itemFloat').value) : null,
            status: document.getElementById('itemStatus').value,
            purchase_source: document.getElementById('itemPurchaseSource').value,
            purchase_price: null,
            purchase_coins: null,
            selling_price: null,
            sold_price: null,
            unlock_date: null,
            notes: document.getElementById('itemNotes').value.trim() || null
        };

        // Validate required fields
        if (!formData.name || !formData.category || !formData.subcategory || !formData.status) {
            throw new Error('Please fill in all required fields');
        }

        // Handle purchase price/coins based on purchase source
        if (formData.purchase_source === 'Trading') {
            const coins = document.getElementById('purchaseCoins').value;
            formData.purchase_coins = coins ? parseInt(coins) : null;
        } else {
            const price = document.getElementById('purchasePrice').value;
            formData.purchase_price = price ? parseFloat(price) : null;
        }

        // Handle status-specific fields
        switch (formData.status) {
            case 'Selling':
                const sellingPrice = document.getElementById('sellingPrice').value;
                formData.selling_price = sellingPrice ? parseFloat(sellingPrice) : null;
                break;
            case 'Sold':
                const soldPrice = document.getElementById('soldPrice').value;
                formData.sold_price = soldPrice ? parseFloat(soldPrice) : null;
                break;
            case 'Tradelock':
                formData.unlock_date = document.getElementById('unlockDate').value || null;
                break;
        }

        const itemId = currentItemId;
        const method = itemId ? 'PUT' : 'POST';
        const url = itemId ? `/api/items/${itemId}` : '/api/items';

        console.log('Sending data:', formData); // Debug log

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to save item');
        }

        const result = await response.json();
        console.log('Server response:', result); // Debug log

        // Close modal and refresh
        const modal = bootstrap.Modal.getInstance(document.getElementById('addItemModal'));
        modal.hide();
        
        // Reset form and state
        resetForm();
        currentItemId = null;
        
        // Reload items
        await loadItems();
        showToast('Success', `Item ${itemId ? 'updated' : 'added'} successfully`);
    } catch (error) {
        console.error('Error saving item:', error);
        showToast('Error', error.message || 'Failed to save item. Please try again.');
    }
}

async function submitEditForm(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('editName').value,
        category: document.getElementById('editCategory').value,
        subcategory: document.getElementById('editSubcategory').value,
        float: parseFloat(document.getElementById('editFloat').value) || null,
        status: document.getElementById('editStatus').value,
        purchase_source: document.getElementById('editPurchaseSource').value,
        purchase_price: document.getElementById('editPurchaseSource').value === 'Trading' ?
            null : parseFloat(document.getElementById('editPurchasePrice').value) || null,
        purchase_coins: document.getElementById('editPurchaseSource').value === 'Trading' ?
            parseInt(document.getElementById('editPurchaseCoins').value) || null : null,
        selling_price: document.getElementById('editStatus').value === 'Selling' ?
            parseFloat(document.getElementById('editSellingPrice').value) || null : null,
        sold_price: document.getElementById('editStatus').value === 'Sold' ?
            parseFloat(document.getElementById('editSoldPrice').value) || null : null,
        unlock_date: document.getElementById('editStatus').value === 'Tradelock' ?
            document.getElementById('editUnlockDate').value : null,
        notes: document.getElementById('editNotes').value
    };

    try {
        const itemId = document.getElementById('editItemId').value;
        const response = await fetch(`/api/items/${itemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update item');
        }

        // Close modal and refresh items
        const modal = bootstrap.Modal.getInstance(document.getElementById('editItemModal'));
        modal.hide();
        loadItems();
        showToast('Success', 'Item updated successfully');
    } catch (error) {
        console.error('Error:', error);
        showToast('Error', error.message);
    }
}

function loadItems() {
    fetch('/api/items')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(items => {
            console.log('Loaded items:', items);
            allItems = items;
            filterAndRenderItems();
        })
        .catch(error => {
            console.error('Error loading items:', error);
            showToast('Error', 'Failed to load items');
        });
}

function filterAndRenderItems() {
    console.log('Filtering items:', allItems);
    const filteredItems = allItems.filter(item => {
        if (currentFilters.category && item.category !== currentFilters.category) return false;
        if (currentFilters.subcategory && item.subcategory !== currentFilters.subcategory) return false;
        if (currentFilters.status && item.status !== currentFilters.status) return false;
        return true;
    });

    console.log('Filtered items:', filteredItems);
    renderItems(filteredItems);
    updateDashboard(filteredItems);
}

function renderItems(items) {
    const sellingContainer = document.getElementById('sellingItemsContainer');
    const tradelockContainer = document.getElementById('tradelockItemsContainer');
    const inventoryContainer = document.getElementById('inventoryItemsContainer');
    const soldContainer = document.getElementById('soldItemsContainer');
    
    // Clear existing items
    sellingContainer.innerHTML = '';
    tradelockContainer.innerHTML = '';
    inventoryContainer.innerHTML = '';
    soldContainer.innerHTML = '';
    
    items.forEach(item => {
        const row = document.createElement('tr');
        let displayPrice, potentialProfit;
        
        if (item.status === 'Selling') {
            displayPrice = item.selling_price;
            potentialProfit = item.selling_price - item.purchase_price;
        } else if (item.status === 'Sold') {
            displayPrice = item.sold_price;
            potentialProfit = item.sold_price - item.purchase_price;
        }
        
        // Basic content that's the same for all statuses
        row.innerHTML = `
            <td title="${item.name}">${item.name}</td>
            <td title="${item.subcategory}">${item.subcategory}</td>
            <td><span class="badge ${getFloatClass(item.float)}" title="${item.float || 'N/A'}">${item.float || 'N/A'}</span></td>
            <td title="${item.purchase_source}">${item.purchase_source}</td>
            <td title="${formatPrice(item.purchase_price)}">${formatPrice(item.purchase_price)}</td>
            <td title="${displayPrice ? formatPrice(displayPrice) : '-'}">${displayPrice ? formatPrice(displayPrice) : '-'}</td>
            <td title="${potentialProfit ? formatPrice(potentialProfit) : '-'}">${potentialProfit ? formatPrice(potentialProfit) : '-'}</td>
            <td class="action-column">
                <button class="btn btn-sm btn-primary" onclick="editItem(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                    <span class="material-icons">edit</span>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteItem('${item.id}')">
                    <span class="material-icons">delete</span>
                </button>
            </td>
        `;

        // Add row to appropriate container based on status
        switch(item.status) {
            case 'Selling':
                sellingContainer.appendChild(row);
                break;
            case 'Tradelock':
                tradelockContainer.appendChild(row);
                break;
            case 'Available':
                inventoryContainer.appendChild(row);
                break;
            case 'Sold':
                soldContainer.appendChild(row);
                break;
        }
    });

    // Update dashboard
    updateDashboard(items);
}

function updateDashboard(items) {
    // Update total items count
    const totalItems = items.length;
    document.getElementById('totalItems').textContent = totalItems;

    // Update active items (not sold)
    const activeItems = items.filter(item => item.status !== 'Sold').length;
    document.getElementById('activeItems').textContent = activeItems;

    // Update total value (sum of purchase prices)
    const totalValue = items
        .filter(item => item.status !== 'Sold')
        .reduce((sum, item) => sum + (item.purchase_price || 0), 0);
    document.getElementById('totalValue').textContent = formatPrice(totalValue);
}

function populateSubcategories(category, targetId = 'itemSubcategory') {
    const subcategorySelect = document.getElementById(targetId);
    subcategorySelect.innerHTML = '<option value="" disabled selected>Select type</option>';
    
    if (category && subcategories[category]) {
        subcategories[category].forEach(sub => {
            const option = document.createElement('option');
            option.value = sub;
            option.textContent = sub;
            subcategorySelect.appendChild(option);
        });
    }
}

function resetForm() {
    const form = document.getElementById('addItemForm');
    form.reset();
    currentItemId = null;
    
    // Reset and disable subcategory
    const subcategorySelect = document.getElementById('itemSubcategory');
    subcategorySelect.innerHTML = '<option value="" disabled selected>Select type</option>';
    subcategorySelect.disabled = true;
    
    // Hide conditional containers
    document.getElementById('sellingPriceGroup').style.display = 'none';
    document.getElementById('soldPriceGroup').style.display = 'none';
    document.getElementById('unlockDateGroup').style.display = 'none';
    document.getElementById('purchaseCoinsGroup').style.display = 'none';
    document.getElementById('purchasePriceGroup').style.display = 'block';
}

function formatPrice(price) {
    if (price === null || price === undefined) return 'N/A';
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(price);
}

function getFloatClass(float) {
    if (!float) return 'bg-secondary';
    if (float <= 0.07) return 'bg-info';
    if (float <= 0.15) return 'bg-primary';
    if (float <= 0.37) return 'bg-success';
    if (float <= 0.44) return 'bg-warning';
    return 'bg-danger';
}

function showToast(title, message) {
    const toast = document.querySelector('.toast');
    const toastTitle = document.getElementById('toastTitle');
    const toastMessage = document.getElementById('toastMessage');
    
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
}

// Make functions available globally
window.editItem = function(item) {
    console.log('Editing item:', item);
    currentItemId = item.id;
    
    // Populate form fields
    document.getElementById('editItemId').value = item.id;
    document.getElementById('editName').value = item.name;
    document.getElementById('editCategory').value = item.category;
    populateSubcategories(item.category, 'editSubcategory');
    document.getElementById('editSubcategory').value = item.subcategory;
    document.getElementById('editFloat').value = item.float || '';
    document.getElementById('editPurchaseSource').value = item.purchase_source;
    document.getElementById('editStatus').value = item.status;
    document.getElementById('editNotes').value = item.notes || '';

    // Handle purchase price/coins based on source
    if (item.purchase_source === 'Trading') {
        document.getElementById('editPurchaseCoinsGroup').style.display = 'block';
        document.getElementById('editPurchasePriceGroup').style.display = 'none';
        document.getElementById('editPurchaseCoins').value = item.purchase_coins || '';
    } else {
        document.getElementById('editPurchasePriceGroup').style.display = 'block';
        document.getElementById('editPurchaseCoinsGroup').style.display = 'none';
        document.getElementById('editPurchasePrice').value = item.purchase_price || '';
    }

    // Show/hide selling price field
    const sellingPriceGroup = document.getElementById('editSellingPriceGroup');
    sellingPriceGroup.style.display = item.status === 'Selling' ? 'block' : 'none';
    document.getElementById('editSellingPrice').value = item.selling_price || '';

    // Show/hide sold price field
    const soldPriceGroup = document.getElementById('editSoldPriceGroup');
    soldPriceGroup.style.display = item.status === 'Sold' ? 'block' : 'none';
    document.getElementById('editSoldPrice').value = item.sold_price || '';

    // Show/hide unlock date field
    const unlockDateGroup = document.getElementById('editUnlockDateGroup');
    unlockDateGroup.style.display = item.status === 'Tradelock' ? 'block' : 'none';
    if (item.unlock_date) {
        const unlockDate = new Date(item.unlock_date);
        document.getElementById('editUnlockDate').value = unlockDate.toISOString().slice(0, 16);
    }

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('editItemModal'));
    modal.show();
};

window.deleteItem = function(itemId) {
    if (!confirm('Are you sure you want to delete this item?')) {
        return;
    }

    fetch(`/api/items/${itemId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        showToast('Success', 'Item deleted successfully');
        loadItems();
    })
    .catch(error => {
        console.error('Error deleting item:', error);
        showToast('Error', 'Failed to delete item');
    });
};
