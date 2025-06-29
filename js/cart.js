// Shopping Cart Management System
// Uses localStorage for persistence across browser sessions

class CartManager {
    constructor() {
        this.cart = this.loadCartFromStorage();
        this.shippingRates = {
            standard: 0,
            express: 9.99,
            overnight: 24.99
        };
        this.taxRate = 0.08; // 8% tax rate
        this.promoCodes = {
            'WELCOME10': { discount: 0.10, type: 'percentage', description: '10% off your order' },
            'HANDMADE15': { discount: 0.15, type: 'percentage', description: '15% off handmade items' },
            'FREESHIP': { discount: 0, type: 'free_shipping', description: 'Free shipping' },
            'SAVE5': { discount: 5, type: 'fixed', description: '$5 off your order' }
        };
        this.appliedPromoCode = null;
        
        this.initializeEventListeners();
        this.updateCartCount();
        
        // Make cart manager available globally
        window.cartManager = this;
    }

    // Load cart from localStorage
    loadCartFromStorage() {
        try {
            const cartData = localStorage.getItem('artisan_cart');
            return cartData ? JSON.parse(cartData) : [];
        } catch (error) {
            console.error('Error loading cart from storage:', error);
            return [];
        }
    }

    // Save cart to localStorage
    saveCartToStorage() {
        try {
            localStorage.setItem('artisan_cart', JSON.stringify(this.cart));
        } catch (error) {
            console.error('Error saving cart to storage:', error);
        }
    }

    // Add item to cart
    addToCart(productId, quantity = 1) {
        // Get product data from global products array
        const product = this.getProductById(productId);
        if (!product) {
            console.error('Product not found:', productId);
            return false;
        }

        if (!product.inStock) {
            this.showNotification('Sorry, this item is out of stock.', 'error');
            return false;
        }

        // Check if item already exists in cart
        const existingItem = this.cart.find(item => item.productId === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                productId: productId,
                quantity: quantity,
                addedAt: new Date().toISOString()
            });
        }

        this.saveCartToStorage();
        this.updateCartCount();
        this.showNotification(`${product.name} added to cart!`, 'success');
        
        return true;
    }

    // Remove item from cart
    removeFromCart(productId) {
        const initialLength = this.cart.length;
        this.cart = this.cart.filter(item => item.productId !== productId);
        
        if (this.cart.length < initialLength) {
            this.saveCartToStorage();
            this.updateCartCount();
            this.refreshCartPage();
            this.showNotification('Item removed from cart', 'success');
            return true;
        }
        return false;
    }

    // Update item quantity
    updateQuantity(productId, newQuantity) {
        if (newQuantity <= 0) {
            return this.removeFromCart(productId);
        }

        const item = this.cart.find(item => item.productId === productId);
        if (item) {
            item.quantity = newQuantity;
            this.saveCartToStorage();
            this.refreshCartPage();
            return true;
        }
        return false;
    }

    // Clear entire cart
    clearCart() {
        if (this.cart.length === 0) {
            this.showNotification('Cart is already empty', 'info');
            return;
        }

        if (confirm('Are you sure you want to clear your cart?')) {
            this.cart = [];
            this.appliedPromoCode = null;
            this.saveCartToStorage();
            this.updateCartCount();
            this.refreshCartPage();
            this.showNotification('Cart cleared', 'success');
        }
    }

    // Get cart item count
    getCartItemCount() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    // Get cart total (subtotal)
    getCartSubtotal() {
        return this.cart.reduce((total, item) => {
            const product = this.getProductById(item.productId);
            return total + (product ? product.price * item.quantity : 0);
        }, 0);
    }

    // Calculate shipping cost
    getShippingCost() {
        const shippingMethod = document.querySelector('input[name="shipping"]:checked');
        const method = shippingMethod ? shippingMethod.value : 'standard';
        
        // Free shipping promo code
        if (this.appliedPromoCode && this.promoCodes[this.appliedPromoCode].type === 'free_shipping') {
            return 0;
        }
        
        return this.shippingRates[method] || 0;
    }

    // Calculate tax
    getTax() {
        const subtotal = this.getCartSubtotal();
        return subtotal * this.taxRate;
    }

    // Apply promo code discount
    getDiscountAmount() {
        if (!this.appliedPromoCode || !this.promoCodes[this.appliedPromoCode]) {
            return 0;
        }

        const promo = this.promoCodes[this.appliedPromoCode];
        const subtotal = this.getCartSubtotal();

        switch (promo.type) {
            case 'percentage':
                return subtotal * promo.discount;
            case 'fixed':
                return Math.min(promo.discount, subtotal);
            case 'free_shipping':
                return 0; // Handled in shipping calculation
            default:
                return 0;
        }
    }

    // Get total cart value
    getCartTotal() {
        const subtotal = this.getCartSubtotal();
        const shipping = this.getShippingCost();
        const tax = this.getTax();
        const discount = this.getDiscountAmount();
        
        return Math.max(0, subtotal + shipping + tax - discount);
    }

    // Get product by ID from global products or sample data
    getProductById(productId) {
        // Try to get from global currentProducts first
        if (typeof window.currentProducts !== 'undefined') {
            return window.currentProducts.find(p => p.id === productId);
        }
        
        // Fallback to sample products from app.js
        if (typeof window.sampleProducts !== 'undefined') {
            return window.sampleProducts.find(p => p.id === productId);
        }
        
        // Last resort: get from localStorage or return null
        const savedProducts = localStorage.getItem('artisan_products');
        if (savedProducts) {
            const products = JSON.parse(savedProducts);
            return products.find(p => p.id === productId);
        }
        
        return null;
    }

    // Update cart count display
    updateCartCount() {
        const cartCountElements = document.querySelectorAll('.cart-count');
        const count = this.getCartItemCount();
        
        cartCountElements.forEach(element => {
            element.textContent = count;
            element.style.display = count > 0 ? 'flex' : 'none';
        });
    }

    // Initialize cart page if we're on cart.html
    initializeCartPage() {
        if (window.location.pathname.includes('cart.html')) {
            this.renderCartPage();
            this.setupCartPageEventListeners();
        }
    }

    // Render cart page content
    renderCartPage() {
        const emptyCart = document.getElementById('empty-cart');
        const cartLayout = document.getElementById('cart-layout');
        
        if (this.cart.length === 0) {
            if (emptyCart) emptyCart.style.display = 'block';
            if (cartLayout) cartLayout.style.display = 'none';
            return;
        }
        
        if (emptyCart) emptyCart.style.display = 'none';
        if (cartLayout) cartLayout.style.display = 'grid';
        
        this.renderCartItems();
        this.updateOrderSummary();
    }

    // Render cart items
    renderCartItems() {
        const cartItemsContainer = document.getElementById('cart-items');
        if (!cartItemsContainer) return;
        
        const cartItemsHTML = this.cart.map(item => {
            const product = this.getProductById(item.productId);
            if (!product) return '';
            
            return `
                <div class="cart-item" data-product-id="${product.id}">
                    <div class="cart-item-image">
                        ${this.generateProductImage(product.category, product.name)}
                    </div>
                    <div class="cart-item-info">
                        <h4>${product.name}</h4>
                        <p>${product.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                    </div>
                    <div class="cart-item-price">$${product.price.toFixed(2)}</div>
                    <div class="cart-item-quantity">
                        <button type="button" onclick="cartManager.updateQuantity(${product.id}, ${item.quantity - 1})">-</button>
                        <input type="number" value="${item.quantity}" min="1" max="10" 
                               onchange="cartManager.updateQuantity(${product.id}, parseInt(this.value))">
                        <button type="button" onclick="cartManager.updateQuantity(${product.id}, ${item.quantity + 1})">+</button>
                    </div>
                    <button class="cart-item-remove" onclick="cartManager.removeFromCart(${product.id})" 
                            title="Remove from cart">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        }).join('');
        
        cartItemsContainer.innerHTML = cartItemsHTML;
    }

    // Update order summary
    updateOrderSummary() {
        const subtotal = this.getCartSubtotal();
        const shipping = this.getShippingCost();
        const tax = this.getTax();
        const discount = this.getDiscountAmount();
        const total = this.getCartTotal();
        
        // Update summary values
        const subtotalElement = document.getElementById('subtotal');
        const shippingElement = document.getElementById('shipping');
        const taxElement = document.getElementById('tax');
        const totalElement = document.getElementById('total');
        
        if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
        if (shippingElement) shippingElement.textContent = `$${shipping.toFixed(2)}`;
        if (taxElement) taxElement.textContent = `$${tax.toFixed(2)}`;
        if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
        
        // Update payment total in checkout modal
        const paymentTotal = document.getElementById('payment-total');
        if (paymentTotal) paymentTotal.textContent = `$${total.toFixed(2)}`;
    }

    // Setup cart page event listeners
    setupCartPageEventListeners() {
        // Clear cart button
        const clearCartBtn = document.getElementById('clear-cart');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', () => this.clearCart());
        }
        
        // Shipping options
        document.querySelectorAll('input[name="shipping"]').forEach(input => {
            input.addEventListener('change', () => this.updateOrderSummary());
        });
        
        // Promo code
        const applyPromoBtn = document.getElementById('apply-promo');
        if (applyPromoBtn) {
            applyPromoBtn.addEventListener('click', () => this.applyPromoCode());
        }
        
        // Checkout button
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.initiateCheckout());
        }
    }

    // Apply promo code
    applyPromoCode() {
        const promoInput = document.getElementById('promo-code');
        const promoMessage = document.getElementById('promo-message');
        
        if (!promoInput || !promoMessage) return;
        
        const code = promoInput.value.trim().toUpperCase();
        
        if (!code) {
            this.showPromoMessage('Please enter a promo code', 'error');
            return;
        }
        
        if (this.promoCodes[code]) {
            this.appliedPromoCode = code;
            const promo = this.promoCodes[code];
            this.showPromoMessage(`Promo code applied: ${promo.description}`, 'success');
            this.updateOrderSummary();
            promoInput.value = '';
        } else {
            this.showPromoMessage('Invalid promo code', 'error');
        }
    }

    // Show promo code message
    showPromoMessage(message, type) {
        const promoMessage = document.getElementById('promo-message');
        if (promoMessage) {
            promoMessage.textContent = message;
            promoMessage.className = `promo-message ${type}`;
            
            setTimeout(() => {
                promoMessage.textContent = '';
                promoMessage.className = 'promo-message';
            }, 3000);
        }
    }

    // Initiate checkout process
    initiateCheckout() {
        if (this.cart.length === 0) {
            this.showNotification('Your cart is empty', 'error');
            return;
        }
        
        // Show checkout modal
        const checkoutModal = document.getElementById('checkout-modal');
        if (checkoutModal) {
            checkoutModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    // Initialize event listeners
    initializeEventListeners() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeCartPage();
                this.setupGlobalEventListeners();
            });
        } else {
            this.initializeCartPage();
            this.setupGlobalEventListeners();
        }
    }

    // Setup global event listeners (for all pages)
    setupGlobalEventListeners() {
        // Add to cart buttons (will be added by app.js)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart') || e.target.closest('.add-to-cart')) {
                const button = e.target.classList.contains('add-to-cart') ? e.target : e.target.closest('.add-to-cart');
                const productId = parseInt(button.dataset.productId);
                if (productId && !button.disabled) {
                    this.addToCart(productId);
                }
            }
        });
    }

    // Refresh cart page (re-render everything)
    refreshCartPage() {
        if (window.location.pathname.includes('cart.html')) {
            this.renderCartPage();
        }
    }

    // Generate product image (same as in app.js)
    generateProductImage(category, name) {
        const colors = {
            pottery: ['#8B4513', '#D2691E', '#CD853F'],
            jewelry: ['#FFD700', '#C0C0C0', '#FFA500'],
            'home-decor': ['#228B22', '#8B4513', '#D2691E'],
            textiles: ['#4B0082', '#FF69B4', '#32CD32']
        };
        
        const categoryColors = colors[category] || colors['pottery'];
        
        return `
            <svg width="100%" height="100%" viewBox="0 0 300 250" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="gradient-${category}-${Date.now()}" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:${categoryColors[0]};stop-opacity:0.8" />
                        <stop offset="50%" style="stop-color:${categoryColors[1]};stop-opacity:0.6" />
                        <stop offset="100%" style="stop-color:${categoryColors[2]};stop-opacity:0.8" />
                    </linearGradient>
                </defs>
                <rect width="300" height="250" fill="url(#gradient-${category}-${Date.now()})"/>
                ${this.getProductIcon(category)}
                <text x="150" y="230" text-anchor="middle" fill="white" font-size="12" font-weight="bold" opacity="0.8">
                    ${name.substring(0, 20)}${name.length > 20 ? '...' : ''}
                </text>
            </svg>
        `;
    }

    // Get product icon (same as in app.js)
    getProductIcon(category) {
        switch (category) {
            case 'pottery':
                return `
                    <circle cx="150" cy="120" r="40" fill="none" stroke="white" stroke-width="3" opacity="0.8"/>
                    <circle cx="150" cy="120" r="25" fill="none" stroke="white" stroke-width="2" opacity="0.6"/>
                    <path d="M130 120 Q140 100 160 100 Q170 120 150 140 Q130 120 130 120" fill="white" opacity="0.7"/>
                `;
            case 'jewelry':
                return `
                    <circle cx="150" cy="100" r="15" fill="white" opacity="0.8"/>
                    <circle cx="130" cy="130" r="10" fill="white" opacity="0.6"/>
                    <circle cx="170" cy="130" r="10" fill="white" opacity="0.6"/>
                    <path d="M145 115 Q150 125 155 115" stroke="white" stroke-width="2" fill="none" opacity="0.7"/>
                `;
            case 'home-decor':
                return `
                    <rect x="120" y="80" width="60" height="40" fill="none" stroke="white" stroke-width="3" opacity="0.8"/>
                    <rect x="130" y="90" width="40" height="20" fill="white" opacity="0.6"/>
                    <line x1="140" y1="140" x2="160" y2="140" stroke="white" stroke-width="3" opacity="0.7"/>
                `;
            case 'textiles':
                return `
                    <path d="M120 80 Q140 60 160 80 Q180 100 160 120 Q140 140 120 120 Q100 100 120 80" fill="white" opacity="0.8"/>
                    <path d="M130 90 Q140 85 150 90 Q160 95 150 100 Q140 105 130 100 Q125 95 130 90" fill="none" stroke="white" stroke-width="2" opacity="0.6"/>
                `;
            default:
                return `<circle cx="150" cy="120" r="30" fill="white" opacity="0.7"/>`;
        }
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Create notification element if it doesn't exist
        let notification = document.getElementById('cart-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'cart-notification';
            notification.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                z-index: 2000;
                background: var(--white);
                border-radius: var(--radius-md);
                box-shadow: var(--shadow-lg);
                padding: var(--spacing-md) var(--spacing-lg);
                max-width: 300px;
                transform: translateX(400px);
                transition: transform 0.3s ease;
                border-left: 4px solid var(--primary-brown);
            `;
            document.body.appendChild(notification);
        }
        
        // Set notification content and type
        const colors = {
            success: '#7B8471',
            error: '#CD5C5C',
            info: '#87CEEB',
            warning: '#D2B48C'
        };
        
        notification.style.borderLeftColor = colors[type] || colors.info;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: var(--spacing-sm);">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}" 
                   style="color: ${colors[type] || colors.info};"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Show notification
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Hide notification after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
        }, 3000);
    }
}

// Checkout functionality
class CheckoutManager {
    constructor(cartManager) {
        this.cartManager = cartManager;
        this.currentStep = 1;
        this.orderData = {};
        
        this.setupCheckoutEventListeners();
    }

    setupCheckoutEventListeners() {
        // Wait for DOM to be ready
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeCheckoutModal();
        });
    }

    initializeCheckoutModal() {
        // Setup step navigation
        this.setupStepNavigation();
        
        // Setup form validation
        this.setupFormValidation();
        
        // Setup payment methods
        this.setupPaymentMethods();
    }

    setupStepNavigation() {
        // Make functions available globally for inline handlers
        window.nextStep = (step) => this.nextStep(step);
        window.prevStep = (step) => this.prevStep(step);
        window.completePayment = () => this.completePayment();
    }

    nextStep(step) {
        if (step === 2) {
            // Validate shipping form
            if (!this.validateShippingForm()) {
                return;
            }
            this.collectShippingData();
        }
        
        this.showStep(step);
        this.updateStepIndicators(step);
    }

    prevStep(step) {
        this.showStep(step);
        this.updateStepIndicators(step);
    }

    showStep(step) {
        // Hide all steps
        document.querySelectorAll('.checkout-step').forEach(stepEl => {
            stepEl.style.display = 'none';
        });
        
        // Show target step
        const targetStep = document.getElementById(`step-${step}`);
        if (targetStep) {
            targetStep.style.display = 'block';
        }
        
        this.currentStep = step;
    }

    updateStepIndicators(activeStep) {
        document.querySelectorAll('.step').forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.remove('active', 'completed');
            
            if (stepNumber === activeStep) {
                step.classList.add('active');
            } else if (stepNumber < activeStep) {
                step.classList.add('completed');
            }
        });
    }

    validateShippingForm() {
        const requiredFields = ['first-name', 'last-name', 'address', 'city', 'state', 'zip', 'phone', 'email'];
        let isValid = true;
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && !field.value.trim()) {
                field.style.borderColor = 'var(--error)';
                isValid = false;
            } else if (field) {
                field.style.borderColor = 'var(--gray)';
            }
        });
        
        // Email validation
        const emailField = document.getElementById('email');
        if (emailField && emailField.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailField.value)) {
                emailField.style.borderColor = 'var(--error)';
                isValid = false;
            }
        }
        
        if (!isValid) {
            this.cartManager.showNotification('Please fill in all required fields', 'error');
        }
        
        return isValid;
    }

    collectShippingData() {
        this.orderData.shipping = {
            firstName: document.getElementById('first-name').value,
            lastName: document.getElementById('last-name').value,
            address: document.getElementById('address').value,
            address2: document.getElementById('address2').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            zip: document.getElementById('zip').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value
        };
    }

    setupFormValidation() {
        // Real-time validation for required fields
        const requiredFields = document.querySelectorAll('#shipping-form input[required]');
        requiredFields.forEach(field => {
            field.addEventListener('blur', () => {
                if (!field.value.trim()) {
                    field.style.borderColor = 'var(--error)';
                } else {
                    field.style.borderColor = 'var(--gray)';
                }
            });
        });
    }

    setupPaymentMethods() {
        // Payment method selection
        document.querySelectorAll('input[name="payment"]').forEach(input => {
            input.addEventListener('change', () => {
                this.showPaymentDetails(input.value);
            });
        });
    }

    showPaymentDetails(method) {
        // Hide all payment details
        document.querySelectorAll('.payment-details').forEach(details => {
            details.style.display = 'none';
        });
        
        // Show selected payment method details
        const targetDetails = document.getElementById(`${method}-payment`);
        if (targetDetails) {
            targetDetails.style.display = 'block';
        }
    }

    completePayment() {
        // Collect order data
        this.orderData.cart = this.cartManager.cart;
        this.orderData.totals = {
            subtotal: this.cartManager.getCartSubtotal(),
            shipping: this.cartManager.getShippingCost(),
            tax: this.cartManager.getTax(),
            discount: this.cartManager.getDiscountAmount(),
            total: this.cartManager.getCartTotal()
        };
        this.orderData.paymentMethod = document.querySelector('input[name="payment"]:checked').value;
        this.orderData.orderDate = new Date().toISOString();
        this.orderData.orderNumber = this.generateOrderNumber();
        
        // Simulate payment processing
        this.processPayment();
    }

    processPayment() {
        // Show processing state
        const paymentBtn = document.querySelector('[onclick="completePayment()"]');
        if (paymentBtn) {
            paymentBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            paymentBtn.disabled = true;
        }
        
        // Simulate payment delay
        setTimeout(() => {
            this.finalizeOrder();
        }, 2000);
    }

    finalizeOrder() {
        // Save order to localStorage
        this.saveOrderToHistory();
        
        // Clear cart
        this.cartManager.cart = [];
        this.cartManager.appliedPromoCode = null;
        this.cartManager.saveCartToStorage();
        this.cartManager.updateCartCount();
        
        // Show success step
        this.showOrderConfirmation();
        this.showStep(3);
        this.updateStepIndicators(3);
    }

    showOrderConfirmation() {
        // Update order confirmation details
        const orderNumber = document.getElementById('order-number');
        const deliveryDate = document.getElementById('delivery-date');
        
        if (orderNumber) {
            orderNumber.textContent = this.orderData.orderNumber;
        }
        
        if (deliveryDate) {
            const delivery = new Date();
            delivery.setDate(delivery.getDate() + 7); // 7 days from now
            deliveryDate.textContent = delivery.toLocaleDateString();
        }
    }

    generateOrderNumber() {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substring(2, 5).toUpperCase();
        return `AC${timestamp}${random}`;
    }

    saveOrderToHistory() {
        try {
            const orders = JSON.parse(localStorage.getItem('artisan_orders') || '[]');
            orders.push(this.orderData);
            localStorage.setItem('artisan_orders', JSON.stringify(orders));
        } catch (error) {
            console.error('Error saving order:', error);
        }
    }
}

// Initialize cart and checkout managers when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const cartManager = new CartManager();
    const checkoutManager = new CheckoutManager(cartManager);
});

// Initialize immediately if DOM is already loaded
if (document.readyState !== 'loading') {
    const cartManager = new CartManager();
    const checkoutManager = new CheckoutManager(cartManager);
}
