// Admin Panel Management System
// Frontend-only admin functionality with localStorage persistence

class AdminManager {
    constructor() {
        this.isLoggedIn = this.checkLoginStatus();
        this.products = this.loadProducts();
        this.orders = this.loadOrders();
        this.currentEditingProduct = null;
        
        this.initializeAdmin();
    }

    // Check if admin is logged in
    checkLoginStatus() {
        const loginStatus = localStorage.getItem('admin_logged_in');
        const loginTime = localStorage.getItem('admin_login_time');
        
        if (loginStatus === 'true' && loginTime) {
            // Check if login is still valid (24 hours)
            const now = new Date().getTime();
            const loginTimeStamp = parseInt(loginTime);
            const twentyFourHours = 24 * 60 * 60 * 1000;
            
            if (now - loginTimeStamp < twentyFourHours) {
                return true;
            } else {
                // Login expired
                this.logout();
                return false;
            }
        }
        
        return false;
    }

    // Initialize admin functionality
    initializeAdmin() {
        const currentPage = this.getCurrentAdminPage();
        
        switch (currentPage) {
            case 'login':
                this.initializeLoginPage();
                break;
            case 'dashboard':
                if (this.isLoggedIn) {
                    this.initializeDashboard();
                } else {
                    this.redirectToLogin();
                }
                break;
            case 'add-product':
                if (this.isLoggedIn) {
                    this.initializeAddProductPage();
                } else {
                    this.redirectToLogin();
                }
                break;
            case 'product-list':
                if (this.isLoggedIn) {
                    this.initializeProductListPage();
                } else {
                    this.redirectToLogin();
                }
                break;
        }
    }

    // Get current admin page
    getCurrentAdminPage() {
        const path = window.location.pathname;
        if (path.includes('login.html')) return 'login';
        if (path.includes('dashboard.html')) return 'dashboard';
        if (path.includes('add-product.html')) return 'add-product';
        if (path.includes('product-list.html')) return 'product-list';
        return null;
    }

    // Load products from localStorage
    loadProducts() {
        try {
            const products = localStorage.getItem('artisan_products');
            if (products) {
                return JSON.parse(products);
            } else {
                // Initialize with sample products from app.js if available
                if (typeof window.sampleProducts !== 'undefined') {
                    this.saveProducts(window.sampleProducts);
                    return window.sampleProducts;
                }
                return [];
            }
        } catch (error) {
            console.error('Error loading products:', error);
            return [];
        }
    }

    // Save products to localStorage
    saveProducts(products) {
        try {
            localStorage.setItem('artisan_products', JSON.stringify(products));
            this.products = products;
            
            // Update global products if available
            if (typeof window.currentProducts !== 'undefined') {
                window.currentProducts = [...products];
            }
        } catch (error) {
            console.error('Error saving products:', error);
        }
    }

    // Load orders from localStorage
    loadOrders() {
        try {
            const orders = localStorage.getItem('artisan_orders');
            return orders ? JSON.parse(orders) : [];
        } catch (error) {
            console.error('Error loading orders:', error);
            return [];
        }
    }

    // Initialize login page
    initializeLoginPage() {
        if (this.isLoggedIn) {
            window.location.href = 'dashboard.html';
            return;
        }

        const loginForm = document.getElementById('admin-login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
    }

    // Handle admin login
    handleLogin(event) {
        event.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('login-error');
        
        // Simple authentication (in a real app, this would be server-side)
        if (username === 'admin' && password === 'artisan123') {
            localStorage.setItem('admin_logged_in', 'true');
            localStorage.setItem('admin_login_time', new Date().getTime().toString());
            window.location.href = 'dashboard.html';
        } else {
            if (errorMessage) {
                errorMessage.textContent = 'Invalid username or password';
                errorMessage.style.display = 'block';
            }
        }
    }

    // Logout admin
    logout() {
        localStorage.removeItem('admin_logged_in');
        localStorage.removeItem('admin_login_time');
        window.location.href = 'login.html';
    }

    // Redirect to login if not authenticated
    redirectToLogin() {
        window.location.href = 'login.html';
    }

    // Initialize dashboard
    initializeDashboard() {
        this.renderDashboardStats();
        this.renderRecentOrders();
        this.setupDashboardEventListeners();
    }

    // Render dashboard statistics
    renderDashboardStats() {
        const totalProducts = this.products.length;
        const totalOrders = this.orders.length;
        const totalRevenue = this.orders.reduce((sum, order) => sum + (order.totals?.total || 0), 0);
        const inStockProducts = this.products.filter(p => p.inStock).length;

        // Update stat displays
        this.updateStatCard('total-products', totalProducts);
        this.updateStatCard('total-orders', totalOrders);
        this.updateStatCard('total-revenue', `$${totalRevenue.toFixed(2)}`);
        this.updateStatCard('in-stock-products', inStockProducts);
    }

    // Update individual stat card
    updateStatCard(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    // Render recent orders
    renderRecentOrders() {
        const recentOrdersContainer = document.getElementById('recent-orders');
        if (!recentOrdersContainer) return;

        const recentOrders = this.orders
            .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
            .slice(0, 5);

        if (recentOrders.length === 0) {
            recentOrdersContainer.innerHTML = '<p>No recent orders</p>';
            return;
        }

        const ordersHTML = recentOrders.map(order => `
            <tr>
                <td>${order.orderNumber}</td>
                <td>${order.shipping?.firstName} ${order.shipping?.lastName}</td>
                <td>$${order.totals?.total?.toFixed(2) || '0.00'}</td>
                <td>${new Date(order.orderDate).toLocaleDateString()}</td>
                <td><span class="status-badge pending">Pending</span></td>
            </tr>
        `).join('');

        recentOrdersContainer.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Order #</th>
                        <th>Customer</th>
                        <th>Total</th>
                        <th>Date</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${ordersHTML}
                </tbody>
            </table>
        `;
    }

    // Setup dashboard event listeners
    setupDashboardEventListeners() {
        // Logout button
        const logoutBtn = document.getElementById('admin-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }

    // Initialize add product page
    initializeAddProductPage() {
        const addProductForm = document.getElementById('add-product-form');
        if (addProductForm) {
            addProductForm.addEventListener('submit', (e) => this.handleAddProduct(e));
        }

        // Setup image preview
        const imageInput = document.getElementById('product-image');
        if (imageInput) {
            imageInput.addEventListener('change', (e) => this.previewImage(e));
        }
    }

    // Handle add product form submission
    handleAddProduct(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const productData = {
            id: this.generateProductId(),
            name: formData.get('name'),
            price: parseFloat(formData.get('price')),
            category: formData.get('category'),
            description: formData.get('description'),
            materials: formData.get('materials'),
            dimensions: formData.get('dimensions'),
            care: formData.get('care'),
            inStock: formData.get('inStock') === 'on',
            featured: formData.get('featured') === 'on',
            images: ['product-image-1'], // In a real app, handle actual image uploads
            createdAt: new Date().toISOString()
        };

        // Add product to products array
        this.products.push(productData);
        this.saveProducts(this.products);

        // Show success message
        this.showNotification('Product added successfully!', 'success');
        
        // Reset form
        event.target.reset();
        this.clearImagePreview();
    }

    // Generate unique product ID
    generateProductId() {
        const maxId = this.products.reduce((max, product) => Math.max(max, product.id), 0);
        return maxId + 1;
    }

    // Preview uploaded image
    previewImage(event) {
        const file = event.target.files[0];
        const preview = document.getElementById('image-preview');
        
        if (file && preview) {
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 200px; max-height: 200px; border-radius: var(--radius-md);">`;
            };
            reader.readAsDataURL(file);
        }
    }

    // Clear image preview
    clearImagePreview() {
        const preview = document.getElementById('image-preview');
        if (preview) {
            preview.innerHTML = '';
        }
    }

    // Initialize product list page
    initializeProductListPage() {
        this.renderProductList();
        this.setupProductListEventListeners();
    }

    // Render product list
    renderProductList() {
        const productListContainer = document.getElementById('product-list');
        if (!productListContainer) return;

        if (this.products.length === 0) {
            productListContainer.innerHTML = '<p>No products found. <a href="add-product.html">Add your first product</a></p>';
            return;
        }

        const productsHTML = this.products.map(product => `
            <tr data-product-id="${product.id}">
                <td>
                    <div class="product-info">
                        <div class="product-image-small">
                            ${this.generateProductImage(product.category, product.name)}
                        </div>
                        <div>
                            <strong>${product.name}</strong>
                            <br>
                            <small>${product.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</small>
                        </div>
                    </div>
                </td>
                <td>$${product.price.toFixed(2)}</td>
                <td>
                    <span class="status-badge ${product.inStock ? 'in-stock' : 'out-of-stock'}">
                        ${product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${product.featured ? 'featured' : 'regular'}">
                        ${product.featured ? 'Featured' : 'Regular'}
                    </span>
                </td>
                <td>${new Date(product.createdAt || Date.now()).toLocaleDateString()}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-edit" onclick="adminManager.editProduct(${product.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-delete" onclick="adminManager.deleteProduct(${product.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        productListContainer.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Stock Status</th>
                        <th>Featured</th>
                        <th>Date Added</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${productsHTML}
                </tbody>
            </table>
        `;
    }

    // Setup product list event listeners
    setupProductListEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('product-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterProducts(e.target.value));
        }

        // Category filter
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => this.filterProductsByCategory(e.target.value));
        }
    }

    // Filter products by search term
    filterProducts(searchTerm) {
        const filteredProducts = this.products.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.renderFilteredProducts(filteredProducts);
    }

    // Filter products by category
    filterProductsByCategory(category) {
        const filteredProducts = category === 'all' 
            ? this.products 
            : this.products.filter(product => product.category === category);
        this.renderFilteredProducts(filteredProducts);
    }

    // Render filtered products
    renderFilteredProducts(products) {
        const productListContainer = document.getElementById('product-list');
        if (!productListContainer) return;

        if (products.length === 0) {
            productListContainer.innerHTML = '<p>No products match your criteria.</p>';
            return;
        }

        // Use same rendering logic as renderProductList, but with filtered products
        const tempProducts = this.products;
        this.products = products;
        this.renderProductList();
        this.products = tempProducts;
    }

    // Edit product
    editProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        // Store the product being edited
        this.currentEditingProduct = product;
        
        // Redirect to add-product page with edit mode
        localStorage.setItem('editing_product', JSON.stringify(product));
        window.location.href = `add-product.html?edit=${productId}`;
    }

    // Delete product
    deleteProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
            this.products = this.products.filter(p => p.id !== productId);
            this.saveProducts(this.products);
            this.renderProductList();
            this.showNotification('Product deleted successfully', 'success');
        }
    }

    // Generate product image (same as cart.js)
    generateProductImage(category, name) {
        const colors = {
            pottery: ['#8B4513', '#D2691E', '#CD853F'],
            jewelry: ['#FFD700', '#C0C0C0', '#FFA500'],
            'home-decor': ['#228B22', '#8B4513', '#D2691E'],
            textiles: ['#4B0082', '#FF69B4', '#32CD32']
        };
        
        const categoryColors = colors[category] || colors['pottery'];
        
        return `
            <svg width="50" height="40" viewBox="0 0 300 250" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="admin-gradient-${category}-${Date.now()}" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:${categoryColors[0]};stop-opacity:0.8" />
                        <stop offset="50%" style="stop-color:${categoryColors[1]};stop-opacity:0.6" />
                        <stop offset="100%" style="stop-color:${categoryColors[2]};stop-opacity:0.8" />
                    </linearGradient>
                </defs>
                <rect width="300" height="250" fill="url(#admin-gradient-${category}-${Date.now()})"/>
                ${this.getProductIcon(category)}
            </svg>
        `;
    }

    // Get product icon (same as cart.js)
    getProductIcon(category) {
        switch (category) {
            case 'pottery':
                return `<circle cx="150" cy="120" r="40" fill="none" stroke="white" stroke-width="3" opacity="0.8"/>`;
            case 'jewelry':
                return `<circle cx="150" cy="100" r="15" fill="white" opacity="0.8"/>`;
            case 'home-decor':
                return `<rect x="120" y="80" width="60" height="40" fill="none" stroke="white" stroke-width="3" opacity="0.8"/>`;
            case 'textiles':
                return `<path d="M120 80 Q140 60 160 80 Q180 100 160 120 Q140 140 120 120 Q100 100 120 80" fill="white" opacity="0.8"/>`;
            default:
                return `<circle cx="150" cy="120" r="30" fill="white" opacity="0.7"/>`;
        }
    }

    // Show admin notification
    showNotification(message, type = 'info') {
        let notification = document.getElementById('admin-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'admin-notification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
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
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
        }, 3000);
    }
}

// Initialize admin manager
let adminManager;

document.addEventListener('DOMContentLoaded', () => {
    adminManager = new AdminManager();
});

// Initialize immediately if DOM is already loaded
if (document.readyState !== 'loading') {
    adminManager = new AdminManager();
}

// Make admin manager available globally
window.adminManager = adminManager;
