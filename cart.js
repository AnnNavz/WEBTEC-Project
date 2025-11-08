document.addEventListener('DOMContentLoaded', function() {
    // getCart(), saveCart(), and updateCartCount() are available globally from products.js

    const cartItemsContainer = document.getElementById('cart-items-container');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const summaryCard = document.querySelector('.cart-summary-card');
    
    // Constants for calculation 
    const TAX_RATE = 0.00; 
    const DISCOUNT_RATE = 0.15; 

    // --- MODAL SETUP ---
    const clearCartButton = document.getElementById('clear-cart-btn');
    const confirmModalElement = document.getElementById('confirmDeleteModal');
    const confirmModal = confirmModalElement ? new bootstrap.Modal(confirmModalElement) : null;
    const confirmMessage = document.getElementById('confirmMessage');
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    let pendingAction = null;

    // Function to show confirmation modal
    function showConfirm(message, onConfirm) {
        if (!confirmModal) return onConfirm(); // Fallback
        confirmMessage.textContent = message;
        pendingAction = onConfirm;
        confirmModal.show();
    }

    // When "Confirm" is clicked on the modal
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            if (typeof pendingAction === 'function') {
                pendingAction();
            }
            confirmModal.hide();
        });
    }
    // --- END MODAL SETUP ---
    
    // --- Universal Removal Toast Function ---
    // This function shows a removal toast and does NOT reset the content to "Order Placed!"
    function showRemovalToast(message, headerText = 'Item Removed!') {
        const toastElement = document.getElementById('checkoutToast'); 
        if (toastElement) {
            // 1. Change the toast content to a removal message
            toastElement.querySelector('.toast-body').innerHTML = message;
            const toastHeader = toastElement.querySelector('.toast-header');
            if(toastHeader) {
                // Temporarily change color/header for removal notification
                toastHeader.classList.remove('bg-success'); 
                toastHeader.classList.add('bg-danger');   
                toastHeader.querySelector('strong').textContent = headerText; 
            }
            new bootstrap.Toast(toastElement).show();
            // No setTimeout here, preventing the "Order Placed" reset.
        }
    }
    // --- End Toast Function ---

    // --- Helper Functions (No Change) ---

    function formatCurrency(amount) {
        return `$${amount.toFixed(2)}`;
    }

    function getCheckedCartItems(fullCart) {
        const checkedItems = [];
        document.querySelectorAll('.cart-item-card').forEach(card => {
            const checkbox = card.querySelector('.form-check-input');
            if (checkbox && checkbox.checked) {
                const productId = card.dataset.productId;
                const item = fullCart.find(p => p.id === productId);
                if (item) {
                    checkedItems.push(item);
                }
            }
        });
        return checkedItems;
    }

    function calculateCartTotals(checkedItems) {
        let subtotal = checkedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        let discount = subtotal * DISCOUNT_RATE;
        let finalSubtotal = subtotal - discount;
        
        let taxes = finalSubtotal * TAX_RATE; 
        let total = finalSubtotal + taxes;

        return { 
            originalSubtotal: subtotal,
            discount: discount,
            finalSubtotal: finalSubtotal,
            taxes: taxes, 
            total: total 
        };
    }

    function updateSummaryDisplay(totals, fullCart) {
        document.getElementById('cart-subtotal').textContent = formatCurrency(totals.finalSubtotal);
        document.getElementById('cart-original-total').textContent = formatCurrency(totals.originalSubtotal);
        
        const discountMessage = totals.discount > 0 
            ? `(You saved ${formatCurrency(totals.discount)}!)` 
            : '';
        document.getElementById('cart-discount-message').textContent = discountMessage;
        
    }

    window.updateCartCount = function() {
    const cart = getCart();
    
    // 🛑 FIX: Change from total items to total unique products
    // Original: const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalUniqueProducts = cart.length; // Count the number of items/objects in the cart array
    // 🛑 END FIX
    
    const cartBadge = document.getElementById('cart-item-count');
    
    if (cartBadge) {
        if (totalUniqueProducts > 0) { // Use totalUniqueProducts for the check
            cartBadge.textContent = totalUniqueProducts; 
        }
    }
}
    
    window.updateCartView = function() {
        const fullCart = getCart();
        const checkedItems = getCheckedCartItems(fullCart);
        const totals = calculateCartTotals(checkedItems);
        updateSummaryDisplay(totals, fullCart);
        updateSelectAllState(); 
    }

    // --- Core Render Function (No Change) ---
   window.renderCartItems = function() {
        const cart = getCart(); 
        cartItemsContainer.innerHTML = ''; 

        if (cart.length === 0) {
            emptyCartMessage.classList.remove('d-none');
            cartItemsContainer.style.display = 'block'; 
            cartItemsContainer.appendChild(emptyCartMessage);
            if (summaryCard) summaryCard.style.display = 'block'; 
            
        } else {
            emptyCartMessage.classList.add('d-none');
            if (summaryCard) summaryCard.style.display = 'block';
        }

        cart.forEach(item => {
            const currentPrice = item.price;
            const itemTotal = currentPrice * item.quantity;
            
            const itemElement = document.createElement('div');
            itemElement.classList.add('card', 'cart-item-card', 'd-flex', 'flex-row', 'align-items-center');
            itemElement.dataset.productId = item.id;

            itemElement.innerHTML = `
                <input class="form-check-input me-3 item-checkbox" type="checkbox" checked data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                
                <div class="cart-item-info">
                    <p class="cart-item-name mb-1">${item.name}</p>
                    <p class="cart-item-meta mb-2">ID: ${item.id}</p>
                    
                    <div class="d-flex align-items-center mb-2">
                        <div class="quantity-controls me-3">
                            <button class="qty-minus" data-id="${item.id}"><i class="bi bi-dash"></i></button>
                            <input type="number" class="qty-input" value="${item.quantity}" min="1" data-id="${item.id}" readonly>
                            <button class="qty-plus" data-id="${item.id}"><i class="bi bi-plus"></i></button>
                        </div>
                    </div>
                    
                    <div class="cart-item-actions">
                        <a href="#" class="remove-item" data-id="${item.id}">Remove</a>
                        <a href="#" class="save-for-later" data-id="${item.id}">Save for Later</a>
                    </div>
                </div>

                <div class="cart-price-col">
                    <p class="current-price mb-1 item-total">${formatCurrency(itemTotal)}</p>
                    <p class="original-price text-decoration-line-through mb-0">${formatCurrency(currentPrice)}</p>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
        });

        attachEventListeners();
        updateCartView(); 
    }

    // --- State and Event Handlers (No Change to logic) ---
    
    function updateQuantity(productId, newQuantity) {
        let cart = getCart();
        const itemIndex = cart.findIndex(item => item.id === productId);

        if (itemIndex > -1) {
            cart[itemIndex].quantity = newQuantity;
            saveCart(cart); 
            renderCartItems(); 
        }
    }

    function removeItem(productId) {
        let cart = getCart();
        const itemToRemove = cart.find(item => item.id === productId);
        
        const deletionAction = () => {
            const newCart = cart.filter(item => item.id !== productId);
            saveCart(newCart);
            renderCartItems(); 
            if (window.updateCartCount) window.updateCartCount();

            showRemovalToast(`**${itemToRemove.name}** removed from cart.`); 
        };

        if (itemToRemove) {
            showConfirm(`Are you sure you want to remove **${itemToRemove.name}** from your cart?`, deletionAction);
        } else {
            showConfirm("Are you sure you want to remove this item?", deletionAction);
        }
    }

    function updateSelectAllState() {
        const itemCheckboxes = document.querySelectorAll('.cart-item-card .form-check-input');
        const selectAllCheckbox = document.getElementById('select-all');

        if (!selectAllCheckbox || itemCheckboxes.length === 0) {
            if (selectAllCheckbox) selectAllCheckbox.disabled = true;
            return;
        }

        const checkedCount = document.querySelectorAll('.cart-item-card .form-check-input:checked').length;
        
        selectAllCheckbox.disabled = false;
        selectAllCheckbox.checked = checkedCount === itemCheckboxes.length;
    }


    function attachEventListeners() {
        
        document.querySelectorAll('.qty-minus, .qty-plus, .remove-item').forEach(el => {
            el.removeEventListener('click', handleCartAction);
            el.addEventListener('click', handleCartAction);
        });
        
        function handleCartAction(e) {
            e.preventDefault();
            const id = e.currentTarget.dataset.id;
            
            if (e.currentTarget.classList.contains('remove-item')) {
                removeItem(id);
            } else {
                const isPlus = e.currentTarget.classList.contains('qty-plus');
                const input = document.querySelector(`.qty-input[data-id="${id}"]`);
                let newQty = parseInt(input.value) + (isPlus ? 1 : -1);
                if (newQty < 1) newQty = 1;
                updateQuantity(id, newQty);
            }
        }
        
        const selectAllCheckbox = document.getElementById('select-all');
        const itemCheckboxes = document.querySelectorAll('.cart-item-card .form-check-input');
        
        if (selectAllCheckbox) {
            selectAllCheckbox.removeEventListener('change', handleSelectAll);
            selectAllCheckbox.addEventListener('change', handleSelectAll);
        }

        function handleSelectAll() {
            const isChecked = this.checked;
            document.querySelectorAll('.cart-item-card .form-check-input').forEach(checkbox => {
                checkbox.checked = isChecked;
            });
            updateCartView(); 
        }

        itemCheckboxes.forEach(checkbox => {
            checkbox.removeEventListener('change', updateCartView); 
            checkbox.addEventListener('change', updateCartView); 
        });
    }

    // Initial render when the page loads
    renderCartItems();
    
    if (window.updateCartCount) {
        window.updateCartCount(); 
    }

    // --- CHECKOUT BUTTON LISTENER (No Change) ---
    document.querySelector('.btn-checkout').addEventListener('click', function(e) {
        e.preventDefault();
        
        const fullCart = getCart();
        const checkedItems = getCheckedCartItems(fullCart);
        
        if (checkedItems.length === 0) {
            alert("Please select at least one item to check out.");
            return;
        }
        
        saveCart([]); 

        // 2. Setup the Toast Notification (Setting content back to "Order Placed" for checkout)
        const toastElement = document.getElementById('checkoutToast');
        if (toastElement) {
            const toastHeader = toastElement.querySelector('.toast-header');
            if(toastHeader) {
                toastHeader.classList.remove('bg-danger');
                toastHeader.classList.add('bg-success');
                toastHeader.querySelector('strong').textContent = 'Order Placed!';
            }
            toastElement.querySelector('.toast-body').innerHTML = `Thank you for your order! Your simulated checkout was successful.
            <p class="small text-muted mb-0 mt-1">Order #BONE-E-001 has been confirmed.</p>`;
        }
        
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
        
        setTimeout(() => {
            renderCartItems(); 
        }, 1000); 
    });
    // --- End Checkout Button Listener ---
    
    // --- REMOVE ALL BUTTON LISTENER (FIXED TO CHECK FOR EMPTY CART) ---
    if (clearCartButton) {
        clearCartButton.addEventListener('click', function () {
            const currentCart = getCart();

            // 🛑 NEW: Check if cart is already empty
            if (currentCart.length === 0) {
                showRemovalToast('Your cart is already empty. There is nothing to remove.', 'Cart Empty');
                return; // Stop execution, skip the confirmation modal
            }
            
            // If cart is NOT empty, proceed with confirmation
            showConfirm("Are you sure you want to remove all items from your cart?", () => {
                // If confirmed, perform deletion
                saveCart([]); // Clear the cart
                renderCartItems(); // Re-render the empty cart view
                if (window.updateCartCount) window.updateCartCount();

                // Call the fixed toast function
                showRemovalToast('All items have been removed from your cart.', 'Cart Cleared!');
            });
        });
    }
    // --- End Remove All Button Listener ---
    
}); // End of main DOMContentLoaded