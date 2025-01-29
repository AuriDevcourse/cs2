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

// Predefined skin names with their corresponding images
const SKIN_NAMES = {
    'Driver Gloves Lunar Weave': '/static/lunar_weave_driver_gloves.png',
    'Bowie Knife Black Laminate': '/static/black_laminate_bowie_knife.png',
    'Shadow Daggers Urban Masked': '/static/urban_masked_shadow_daggers.png',
    'AK47 Vulcan': '/static/vulcan_ak47.png'
};

// Predefined image mapping with normalized keys
const ITEM_IMAGES = {
    'driver gloves lunar weave': '/static/lunar_weave_driver_gloves.png',
    'bowie knife black laminate': '/static/black_laminate_bowie_knife.png',
    'shadow daggers urban masked': '/static/urban_masked_shadow_daggers.png',
    'vulcan ak-47': '/static/vulcan_ak47.png'
};

function getItemImage(itemName) {
    return SKIN_NAMES[itemName] || '/static/default_item.png';
}

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
            const subcategorySelect = document.getElementById('itemSubcategory');
            
            // Populate subcategories
            populateSubcategories(this.value);
            
            // Enable the subcategory dropdown
            if (subcategorySelect) {
                subcategorySelect.disabled = false;
            }
        });
    }

    if (filterCategory) {
        filterCategory.addEventListener('change', function() {
            updateFilterSubcategories();
            currentFilters.category = this.value;
            currentFilters.subcategory = ''; // Reset subcategory
            loadItems();
        });
    }

    // Status change handlers
    if (itemStatus) {
        itemStatus.addEventListener('change', function() {
            toggleUnlockDateVisibility(this.value, 'unlockDateContainer', 'unlockDate');
            const sellingPriceGroup = document.getElementById('sellingPriceGroup');
            const soldPriceGroup = document.getElementById('soldPriceGroup');
            
            // Show/hide selling price field
            sellingPriceGroup.style.display = this.value === 'Selling' ? 'block' : 'none';
            
            // Show/hide sold price field
            soldPriceGroup.style.display = this.value === 'Sold' ? 'block' : 'none';
            
            // Clear fields when not visible
            if (this.value !== 'Selling') {
                document.getElementById('sellingPrice').value = '';
            }
            if (this.value !== 'Sold') {
                document.getElementById('soldPrice').value = '';
            }
        });
    }

    if (filterStatus) {
        filterStatus.addEventListener('change', function() {
            currentFilters.status = this.value;
            loadItems();
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
            toggleUnlockDateVisibility(this.value, 'editUnlockDateGroup', 'editUnlockDate');
            const sellingPriceGroup = document.getElementById('editSellingPriceGroup');
            const soldPriceGroup = document.getElementById('editSoldPriceGroup');
            
            // Show/hide selling price field
            sellingPriceGroup.style.display = this.value === 'Selling' ? 'block' : 'none';
            
            // Show/hide sold price field
            soldPriceGroup.style.display = this.value === 'Sold' ? 'block' : 'none';
            
            // Clear fields when not visible
            if (this.value !== 'Selling') {
                document.getElementById('editSellingPrice').value = '';
            }
            if (this.value !== 'Sold') {
                document.getElementById('editSoldPrice').value = '';
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

    // Add event listener for status change in both add and edit modals
    const addStatusSelect = document.getElementById('itemStatus');
    const editStatusSelect = document.getElementById('editStatus');

    if (addStatusSelect) {
        addStatusSelect.addEventListener('change', function() {
            toggleUnlockDateVisibility(this.value, 'unlockDateContainer', 'unlockDate');
        });
    }

    if (editStatusSelect) {
        editStatusSelect.addEventListener('change', function() {
            toggleUnlockDateVisibility(this.value, 'editUnlockDateGroup', 'editUnlockDate');
        });
    }

    // Add event listeners for image preview
    const addItemNameInput = document.getElementById('itemName');
    const addItemImagePreview = document.getElementById('addItemImagePreview');
    
    if (addItemNameInput && addItemImagePreview) {
        addItemNameInput.addEventListener('input', function() {
            const selectedSkin = this.value;
            const imageUrl = SKIN_NAMES[selectedSkin] || '/static/default_item.png';
            addItemImagePreview.src = imageUrl;
            addItemImagePreview.alt = selectedSkin || 'Item Preview';
        });
    }

    const editItemNameInput = document.getElementById('editName');
    const editItemImagePreview = document.getElementById('editItemImagePreview');
    
    if (editItemNameInput && editItemImagePreview) {
        editItemNameInput.addEventListener('input', function() {
            const selectedSkin = this.value;
            const imageUrl = SKIN_NAMES[selectedSkin] || '/static/default_item.png';
            editItemImagePreview.src = imageUrl;
            editItemImagePreview.alt = selectedSkin || 'Item Preview';
        });
    }

    // Load initial data
    loadItems();

    setupFormSkinNames();
});

async function handleFormSubmit(event) {
    event.preventDefault();
    
    try {
        // Validate required fields
        const requiredFields = ['itemName', 'itemCategory', 'itemSubcategory', 'itemStatus', 'itemPurchaseSource'];
        let isValid = true;
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field.value.trim()) {
                field.classList.add('is-invalid');
                isValid = false;
            } else {
                field.classList.remove('is-invalid');
            }
        });
        
        if (!isValid) {
            showToast('Validation Error', 'Please fill in all required fields.');
            return;
        }

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

        // Handle purchase price/coins based on purchase source
        if (formData.purchase_source === 'Trading') {
            const coins = document.getElementById('purchaseCoins').value;
            formData.purchase_coins = coins ? parseFloat(coins) : null;
        } else {
            const price = document.getElementById('purchasePrice').value;
            formData.purchase_price = price ? parseFloat(price) : null;
        }

        // Handle additional fields based on status
        if (formData.status === 'Selling') {
            const sellingPrice = document.getElementById('sellingPrice').value;
            formData.selling_price = sellingPrice ? parseFloat(sellingPrice) : null;
        } else if (formData.status === 'Sold') {
            const soldPrice = document.getElementById('soldPrice').value;
            formData.sold_price = soldPrice ? parseFloat(soldPrice) : null;
        } else if (formData.status === 'Tradelock') {
            const unlockDate = document.getElementById('unlockDate').value;
            formData.unlock_date = unlockDate || null;
        }

        // Send data to server
        const response = await fetch('/api/items', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        // Reset form and show success toast
        showToast('Success', 'Item added successfully');
        const modal = bootstrap.Modal.getInstance(document.getElementById('addItemModal'));
        modal.hide();
        loadItems();
    } catch (error) {
        console.error('Error saving item:', error);
        showToast('Error', error.message || 'Failed to save item');
    }
}

async function submitEditForm(event) {
    event.preventDefault();
    
    try {
        // Get form values
        const formData = {
            id: document.getElementById('editItemId').value,
            name: document.getElementById('editName').value.trim(),
            category: document.getElementById('editCategory').value,
            subcategory: document.getElementById('editSubcategory').value,
            float: document.getElementById('editFloat').value ? parseFloat(document.getElementById('editFloat').value) : null,
            status: document.getElementById('editStatus').value,
            purchase_source: document.getElementById('editPurchaseSource').value,
            purchase_price: null,
            purchase_coins: null,
            selling_price: null,
            sold_price: null,
            unlock_date: null,
            notes: document.getElementById('editNotes').value.trim() || null
        };

        // Handle purchase price/coins based on purchase source
        if (formData.purchase_source === 'Trading') {
            const coins = document.getElementById('editPurchaseCoins').value;
            formData.purchase_coins = coins ? parseFloat(coins) : null;
        } else {
            const price = document.getElementById('editPurchasePrice').value;
            formData.purchase_price = price ? parseFloat(price) : null;
        }

        // Handle additional fields based on status
        if (formData.status === 'Selling') {
            const sellingPrice = document.getElementById('editSellingPrice').value;
            formData.selling_price = sellingPrice ? parseFloat(sellingPrice) : null;
        } else if (formData.status === 'Sold') {
            const soldPrice = document.getElementById('editSoldPrice').value;
            formData.sold_price = soldPrice ? parseFloat(soldPrice) : null;
        } else if (formData.status === 'Tradelock') {
            const unlockDate = document.getElementById('editUnlockDate').value;
            formData.unlock_date = unlockDate || null;
        }

        // Send data to server
        const response = await fetch(`/api/items/${formData.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        // Reset form and show success toast
        showToast('Success', 'Item updated successfully');
        const modal = bootstrap.Modal.getInstance(document.getElementById('editItemModal'));
        modal.hide();
        loadItems();
    } catch (error) {
        console.error('Error updating item:', error);
        showToast('Error', error.message || 'Failed to update item');
    }
}

function getFloatDescription(floatValue) {
    if (floatValue <= 0.07) return 'Factory New';
    if (floatValue <= 0.15) return 'Minimal Wear';
    if (floatValue <= 0.38) return 'Field-Tested';
    if (floatValue <= 0.45) return 'Well-Worn';
    return 'Battle-Scarred';
}

function createFloatBar(floatValue) {
    const categories = [
        { name: 'fn', min: 0, max: 0.07, width: 1.35135 },
        { name: 'mw', min: 0.07, max: 0.15, width: 10.8108 },
        { name: 'ft', min: 0.15, max: 0.38, width: 31.0811 },
        { name: 'ww', min: 0.38, max: 0.45, width: 9.45946 },
        { name: 'bs', min: 0.45, max: 1, width: 47.2973 }
    ];

    const floatBar = document.createElement('div');
    floatBar.style.height = '100%';
    floatBar.style.borderRadius = '4px';
    floatBar.style.overflow = 'hidden';
    floatBar.style.display = 'flex';

    categories.forEach(cat => {
        const segment = document.createElement('div');
        segment.classList.add('float-bar-width', `progress-width-${cat.name}`);
        segment.style.width = `${cat.width}%`;
        segment.style.backgroundColor = getFloatBarColor(cat.name);
        floatBar.appendChild(segment);
    });

    return floatBar;
}

function getFloatBarColor(category) {
    const colors = {
        'fn': '#4b9f45',   // Green for Factory New
        'mw': '#a4d36c',   // Light Green for Minimal Wear
        'ft': '#d4b654',   // Yellow for Field-Tested
        'ww': '#ce8c35',   // Orange for Well-Worn
        'bs': '#b0483b'    // Red for Battle-Scarred
    };
    return colors[category] || '#888';
}

function createItemRow(item) {
    // Create card container
    const card = document.createElement('div');
    card.classList.add('card', 'mb-2', 'h-100');
    card.style.borderRadius = '12px';
    card.style.backgroundColor = 'var(--module-background-color)';
    card.style.color = '#fff';
    card.style.position = 'relative';
    card.style.border = '1px solid rgba(255,255,255,0.1)';

    // Card body
    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body', 'd-flex', 'flex-column');
    cardBody.style.gap = '10px';
    cardBody.style.padding = '10px';
    cardBody.style.color = '#fff';

    // Row 1: Item Name
    const nameElement = document.createElement('h5');
    nameElement.textContent = item.name;
    nameElement.classList.add('card-title');
    nameElement.style.margin = '0';
    nameElement.style.fontSize = '14px';
    nameElement.style.fontWeight = '600';
    nameElement.style.whiteSpace = 'nowrap';
    nameElement.style.overflow = 'hidden';
    nameElement.style.textOverflow = 'ellipsis';
    nameElement.style.color = '#fff';

    // Row 2: Float Description
    const floatDescElement = document.createElement('p');
    floatDescElement.textContent = getFloatDescription(item.float);
    floatDescElement.classList.add('card-text');
    floatDescElement.style.margin = '0';
    floatDescElement.style.color = 'rgba(255,255,255,0.7)';
    floatDescElement.style.fontSize = '12px';

    // Row 3: Item Image
    const imageContainer = document.createElement('div');
    imageContainer.style.width = '100%';
    imageContainer.style.height = '200px';  
    imageContainer.style.display = 'flex';
    imageContainer.style.justifyContent = 'center';
    imageContainer.style.alignItems = 'center';

    const itemImage = document.createElement('img');
    itemImage.src = getItemImage(item.name);
    itemImage.style.width = '100%';  
    itemImage.style.height = '100%';
    itemImage.style.objectFit = 'contain';
    itemImage.alt = item.name;

    imageContainer.appendChild(itemImage);

    // Row 4: Price
    const priceElement = document.createElement('p');
    priceElement.textContent = `$${formatPrice(item.price)}`;
    priceElement.classList.add('card-text');
    priceElement.style.margin = '0';
    priceElement.style.fontWeight = 'bold';
    priceElement.style.fontSize = '12px';
    priceElement.style.color = '#fff';

    // Row 5: Float Bar
    const floatBarContainer = document.createElement('div');
    floatBarContainer.style.width = '100%';
    floatBarContainer.style.height = '8px';
    floatBarContainer.style.marginTop = '5px';

    const floatBar = createFloatBar(item.float);
    floatBarContainer.appendChild(floatBar);

    // Assemble card
    cardBody.appendChild(nameElement);
    cardBody.appendChild(floatDescElement);
    cardBody.appendChild(imageContainer);
    cardBody.appendChild(priceElement);
    cardBody.appendChild(floatBarContainer);

    card.appendChild(cardBody);

    // Action buttons
    const cardActions = document.createElement('div');
    cardActions.classList.add('card-footer', 'd-flex', 'justify-content-between', 'p-1');
    cardActions.style.backgroundColor = 'var(--module-highlight-background-color)';
    cardActions.style.borderTop = '1px solid rgba(255,255,255,0.1)';

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.classList.add('btn', 'btn-sm', 'btn-outline-primary', 'w-50', 'm-1');
    editButton.style.fontSize = '10px';
    editButton.style.color = '#fff';
    editButton.onclick = () => editItem(item.id);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('btn', 'btn-sm', 'btn-outline-danger', 'w-50', 'm-1');
    deleteButton.style.fontSize = '10px';
    deleteButton.style.color = '#fff';
    deleteButton.onclick = () => deleteItem(item.id);

    cardActions.appendChild(editButton);
    cardActions.appendChild(deleteButton);

    card.appendChild(cardActions);

    // Wrap card in a column for grid layout
    const cardColumn = document.createElement('div');
    cardColumn.classList.add('col', 'p-1');
    cardColumn.appendChild(card);

    return cardColumn;
}

function loadItems() {
    fetch('/api/items')
        .then(response => {
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(items => {
            console.log('Loaded items:', items);
            
            // Validate items
            if (!Array.isArray(items)) {
                throw new Error('Received data is not an array');
            }
            
            allItems = items;
            filterAndRenderItems(allItems);
        })
        .catch(error => {
            console.error('Error loading items:', error);
            showToast('Error', `Failed to load items: ${error.message}`);
        });
}

function filterAndRenderItems(items) {
    const sellingItemsContainer = document.getElementById('sellingItemsContainer');
    if (!sellingItemsContainer) return;

    // Clear previous content
    sellingItemsContainer.innerHTML = '';

    // Create a single row
    const itemRow = document.createElement('div');
    itemRow.classList.add('row', 'g-2');
    itemRow.style.display = 'flex';
    itemRow.style.flexWrap = 'nowrap';
    itemRow.style.overflowX = 'auto';

    // Filter selling items
    const sellingItems = items.filter(item => item.status === 'Selling');
    
    // Render items (limit to 10)
    sellingItems.slice(0, 10).forEach(item => {
        const itemColumn = createItemRow(item);
        itemColumn.classList.add('col-auto');  // Use col-auto to prevent wrapping
        itemColumn.style.flex = '0 0 auto';    // Prevent flex growth
        itemColumn.style.width = '300px';      // Increased width to accommodate full-width images
        itemRow.appendChild(itemColumn);
    });

    // Append the row to the container
    sellingItemsContainer.appendChild(itemRow);

    // Update dashboard
    updateDashboard(items);
}

function updateDashboard(items) {
    // Check if dashboard elements exist before updating
    const totalItemsElement = document.getElementById('totalItemsCount');
    const sellingItemsElement = document.getElementById('sellingItemsCount');
    const tradelockItemsElement = document.getElementById('tradelockItemsCount');
    const soldItemsElement = document.getElementById('soldItemsCount');

    if (totalItemsElement) totalItemsElement.textContent = items.length;
    if (sellingItemsElement) sellingItemsElement.textContent = items.filter(item => item.status === 'Selling').length;
    if (tradelockItemsElement) tradelockItemsElement.textContent = items.filter(item => item.status === 'Tradelock').length;
    if (soldItemsElement) soldItemsElement.textContent = items.filter(item => item.status === 'Sold').length;
}

function populateSubcategories(category, targetId = 'itemSubcategory') {
    const subcategorySelect = document.getElementById(targetId);
    subcategorySelect.innerHTML = '<option value="">Select Subcategory</option>';
    
    if (category && subcategories[category]) {
        subcategories[category].forEach(subcategory => {
            const option = document.createElement('option');
            option.value = subcategory;
            option.textContent = subcategory;
            subcategorySelect.appendChild(option);
        });
    }
}

function updateFilterSubcategories() {
    const filterCategory = document.getElementById('filterCategory');
    const filterSubcategory = document.getElementById('filterSubcategory');
    
    filterSubcategory.innerHTML = '<option value="">All Subcategories</option>';
    
    if (filterCategory.value && subcategories[filterCategory.value]) {
        subcategories[filterCategory.value].forEach(subcategory => {
            const option = document.createElement('option');
            option.value = subcategory;
            option.textContent = subcategory;
            filterSubcategory.appendChild(option);
        });
    }
}

function resetForm() {
    const form = document.getElementById('addItemForm');
    if (form) {
        form.reset();
    }
    
    // Reset category and subcategory
    const categorySelect = document.getElementById('itemCategory');
    const subcategorySelect = document.getElementById('itemSubcategory');
    
    if (categorySelect) {
        categorySelect.selectedIndex = 0;
    }
    
    if (subcategorySelect) {
        subcategorySelect.innerHTML = '<option value="">Select Subcategory</option>';
        subcategorySelect.disabled = false;
    }
    
    // Reset status-related containers
    const statusSelect = document.getElementById('itemStatus');
    if (statusSelect) {
        statusSelect.selectedIndex = 0;
        
        const sellingPriceGroup = document.getElementById('sellingPriceGroup');
        const soldPriceGroup = document.getElementById('soldPriceGroup');
        const unlockDateGroup = document.getElementById('unlockDateGroup');
        
        if (sellingPriceGroup) sellingPriceGroup.style.display = 'none';
        if (soldPriceGroup) soldPriceGroup.style.display = 'none';
        if (unlockDateGroup) unlockDateGroup.style.display = 'none';
    }
    
    // Reset purchase source-related containers
    const purchaseSourceSelect = document.getElementById('itemPurchaseSource');
    if (purchaseSourceSelect) {
        purchaseSourceSelect.selectedIndex = 0;
        
        const purchaseCoinsContainer = document.getElementById('purchaseCoinsContainer');
        const purchasePriceContainer = document.getElementById('purchasePriceContainer');
        
        if (purchaseCoinsContainer) purchaseCoinsContainer.style.display = 'none';
        if (purchasePriceContainer) purchasePriceContainer.style.display = 'block';
    }
}

function toggleUnlockDateVisibility(status, containerID, inputID) {
    const container = document.getElementById(containerID);
    const input = document.getElementById(inputID);
    
    if (status === 'Tradelock') {
        container.style.display = 'block';
        input.required = true;
    } else {
        container.style.display = 'none';
        input.required = false;
        input.value = ''; // Clear the date when not in Tradelock
    }
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
window.editItem = function(itemId) {
    fetch(`/api/items/${itemId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch item details');
            }
            return response.json();
        })
        .then(item => {
            // Populate form fields
            document.getElementById('editItemId').value = item.id;
            document.getElementById('editName').value = item.name;
            document.getElementById('editCategory').value = item.category;
            
            // Trigger subcategory population
            const editCategorySelect = document.getElementById('editCategory');
            const event = new Event('change');
            editCategorySelect.dispatchEvent(event);
            
            // Set subcategory after a short delay to ensure it's populated
            setTimeout(() => {
                document.getElementById('editSubcategory').value = item.subcategory;
            }, 50);

            document.getElementById('editFloat').value = item.float || '';
            document.getElementById('editPurchaseSource').value = item.purchase_source;
            
            // Set purchase price or coins
            if (item.purchase_source === 'Trading') {
                document.getElementById('editPurchaseCoinsGroup').style.display = 'block';
                document.getElementById('editPurchasePriceGroup').style.display = 'none';
                document.getElementById('editPurchaseCoins').value = item.purchase_coins || '';
            } else {
                document.getElementById('editPurchaseCoinsGroup').style.display = 'none';
                document.getElementById('editPurchasePriceGroup').style.display = 'block';
                document.getElementById('editPurchasePrice').value = item.purchase_price || '';
            }

            // Set status and related fields
            document.getElementById('editStatus').value = item.status;
            const editStatusEvent = new Event('change');
            document.getElementById('editStatus').dispatchEvent(editStatusEvent);

            // Set additional fields based on status
            if (item.status === 'Selling') {
                document.getElementById('editSellingPrice').value = item.selling_price || '';
            } else if (item.status === 'Sold') {
                document.getElementById('editSoldPrice').value = item.sold_price || '';
            } else if (item.status === 'Tradelock') {
                document.getElementById('editUnlockDate').value = item.unlock_date || '';
            }

            // Set notes
            document.getElementById('editNotes').value = item.notes || '';

            // Set image preview
            const editItemImagePreview = document.getElementById('editItemImagePreview');
            editItemImagePreview.src = getItemImage(item.name);
            editItemImagePreview.alt = item.name;

            // Show the modal
            const modal = new bootstrap.Modal(document.getElementById('editItemModal'));
            modal.show();
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('Error', 'Failed to load item details');
        });
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

function setupFormSkinNames() {
    const skinNameSelects = [
        document.getElementById('itemName'), 
        document.getElementById('editName')
    ];

    skinNameSelects.forEach(select => {
        if (select) {
            // Clear existing options
            select.innerHTML = '<option value="">Select Skin</option>';
            
            // Add predefined skin names
            Object.keys(SKIN_NAMES).forEach(skinName => {
                const option = document.createElement('option');
                option.value = skinName;
                option.textContent = skinName;
                select.appendChild(option);
            });

            // Add event listener for image preview
            select.addEventListener('change', function() {
                const previewElement = document.getElementById('addItemImagePreview') || 
                                       document.getElementById('editItemImagePreview');
                if (previewElement) {
                    const selectedSkin = this.value;
                    const imageUrl = SKIN_NAMES[selectedSkin] || '/static/default_item.png';
                    previewElement.src = imageUrl;
                    previewElement.alt = selectedSkin || 'Item Preview';
                }
            });
        }
    });
}
