document.addEventListener('DOMContentLoaded', function() {
    // --- Product Filter Logic (Existing) ---
    const filterButtons = document.querySelectorAll('.btn-filter');
    const productItems = document.querySelectorAll('.product-item');

    function clearProductMessages() {
        const container = document.querySelector('.product-catalog-container');
        if (container) {
            // Remove the search message (which uses .alert-info)
            let searchMsg = container.querySelector('.alert-info');
            if (searchMsg) searchMsg.remove();
            
            // Remove the category message (which uses .alert-success)
            let categoryMsg = container.querySelector('.alert-success');
            if (categoryMsg) categoryMsg.remove();
        }
    }
    // --- End Message Management ---

    // --- Product Filter Logic (Existing) ---
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 🛑 FIX: Clear the search result message when a category is selected
            clearProductMessages(); // <-- ADD THIS LINE

            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            const filter = this.dataset.filter;

            productItems.forEach(item => {
                if (filter === 'all' || item.dataset.category.includes(filter)) {
                    item.style.display = 'block'; 
                } else {
                    item.style.display = 'none'; 
                }
            });
        });
    });

    // --- Cart Management Functions (Updated for Badge) ---

    // Function to get the current cart from Local Storage
    window.getCart = function() { // Make function global
        const cart = localStorage.getItem('bone_e_cart');
        return cart ? JSON.parse(cart).map(item => ({
            ...item,
            price: parseFloat(item.price)
        })) : [];
    }

    // Function to save the cart to Local Storage and update the count
    window.saveCart = function(cart) { // Make function global
        localStorage.setItem('bone_e_cart', JSON.stringify(cart));
        updateCartCount();
        // Optional: Trigger cart page reload if it's open (for real-time updates)
        if (typeof renderCartItems === 'function') {
             renderCartItems();
        }
    }

    // Function to update the cart count in the navbar badge
    window.updateCartCount = function() {
        const cart = getCart();
        const totalItems = cart.length;
        
        // Ensure the ID matches the new ID added to the cart icon in cart.html
        const cartBadge = document.getElementById('cart-count');
        
        if (cartBadge) {
            if (totalItems > 0) {
                cartBadge.textContent = totalItems;
                cartBadge.style.display = 'block'; 
            } else {
                cartBadge.style.display = 'none'; 
            }
        }
    }

    // --- Animation Logic (Existing) ---
    function triggerButtonAnimation(buttonElement) {
        buttonElement.classList.add('btn-added-animation');
        setTimeout(() => {
            buttonElement.classList.remove('btn-added-animation');
        }, 500); 
    }

    // 1. 'BUY NOW' FUNCTION (Adds item and redirects to the cart)
    window.addToCartAndGoToCart = function(product, buttonElement) {
        let cart = getCart();
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({...product, quantity: 1});
        }

        saveCart(cart);
        triggerButtonAnimation(buttonElement); 

        // Redirect after a slight delay to allow the animation to start and the save to complete
        setTimeout(() => {
            window.location.href = 'cart.html'; 
        }, 300); 
        console.log(`Product added and redirecting to cart.html...`);
    }

    // ⭐️ NEW: 'ADD TO CART' FUNCTION for index.html (Adds 1 item and shows toast)
    window.addToCartAndShowToast = function(product, buttonElement) {
        let quantityToAdd = 1; // Always 1 for direct add

        let cart = getCart();
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += quantityToAdd;
        } else {
            cart.push({ ...product, quantity: quantityToAdd });
        }

        saveCart(cart);
        triggerButtonAnimation(buttonElement); 

        // Toast message logic (reusing existing product page logic)
        const toastElement = document.getElementById('cartToast');
        const toastMessage = document.getElementById('toast-message');
        toastMessage.innerHTML = `<strong>${product.name}</strong> (${quantityToAdd}) added to your cart. <a href="cart.html" class="fw-bold text-decoration-none">View Cart</a>`;
        const toast = new bootstrap.Toast(toastElement);
        toast.show();

        console.log(`${product.name} (${quantityToAdd}) added to cart (single-click).`);
    }
    // ⭐️ END NEW FUNCTION

    // 2. 'ADD TO CART' FUNCTION (Adds item and shows an alert) - Uses Modal
    window.addToCartAndAlert = function(product, buttonElement) {
  // Get modal elements
  const modal = new bootstrap.Modal(document.getElementById('addToCartModal'));
  const modalImg = document.getElementById('modal-product-image');
  const modalName = document.getElementById('modal-product-name');
  const modalPrice = document.getElementById('modal-product-price');
  const qtyInput = document.getElementById('modal-quantity');
  const btnIncrease = document.getElementById('qty-increase');
  const btnDecrease = document.getElementById('qty-decrease');
  const btnConfirm = document.getElementById('confirmAddToCart');

  // Set product details
  modalImg.src = product.image;
  modalName.textContent = product.name;
  modalPrice.textContent = `₱${product.price.toFixed(2)}`;
  qtyInput.value = 1;

  // Handle + and – buttons
  btnIncrease.onclick = () => qtyInput.value = parseInt(qtyInput.value) + 1;
  btnDecrease.onclick = () => {
    if (parseInt(qtyInput.value) > 1) qtyInput.value = parseInt(qtyInput.value) - 1;
  };

  // Confirm button logic
  btnConfirm.onclick = () => {
    const quantityToAdd = parseInt(qtyInput.value);
    if (quantityToAdd < 1 || isNaN(quantityToAdd)) return;

    let cart = getCart();
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantityToAdd;
    } else {
      cart.push({ ...product, quantity: quantityToAdd });
    }

    saveCart(cart);
    modal.hide();

    // Optional toast message (reusing existing logic)
    const toastElement = document.getElementById('cartToast');
    const toastMessage = document.getElementById('toast-message');
    toastMessage.innerHTML = `<strong>${product.name}</strong> (${quantityToAdd}) added to your cart. <a href="cart.html" class="fw-bold text-decoration-none">View Cart</a>`;
    const toast = new bootstrap.Toast(toastElement);
    toast.show();

    console.log(`${product.name} (${quantityToAdd}) added to cart.`);
  };

  // Show the modal
  modal.show();
};
const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');

    if (category) {
        // Highlight and apply the filter
        const targetButton = document.querySelector(`.btn-filter[data-filter="${category}"]`);
        if (targetButton) {
            targetButton.click();
            targetButton.classList.add('active');

            // Optional: show message above products
            const container = document.querySelector('.product-catalog-container');
            const msg = document.createElement('div');
            msg.className = 'alert alert-success text-center fw-semibold mb-4';
            msg.textContent = `Showing products under "${category.replace('-', ' ')}"`;
            container.prepend(msg);
        }
    }


    // Run this when the page loads to show the correct cart count
    document.addEventListener('DOMContentLoaded', updateCartCount);
    updateCartCount();

    
});

document.addEventListener('DOMContentLoaded', function () {
  const urlParams = new URLSearchParams(window.location.search);
  const searchTerm = urlParams.get('search');

  if (searchTerm) {
    const query = searchTerm.toLowerCase();
    const productItems = document.querySelectorAll('.product-item');
    let matches = 0;

    productItems.forEach(item => {
      const name = item.querySelector('.product-name')?.textContent.toLowerCase() || '';
      if (name.includes(query)) {
        item.style.display = 'block';
        matches++;
      } else {
        item.style.display = 'none';
      }
    });

    // Optional message display
    const container = document.querySelector('.product-catalog-container');
    const msg = document.createElement('div');
    msg.className = 'alert alert-info text-center fw-semibold mb-3';
    msg.textContent = matches > 0
      ? `Search results for "${searchTerm}"`
      : `No products found for "${searchTerm}"`;
    container.prepend(msg);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');

  searchForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
      window.location.href = `products.html?search=${encodeURIComponent(query)}`;
    }
  });
});