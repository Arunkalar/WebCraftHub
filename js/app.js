// Main application JavaScript
// Global variables and state management
let currentProducts = [];
let filteredProducts = [];
let currentCategory = 'all';
let currentSort = 'name';
let currentPage = 1;
const productsPerPage = 12;

// Sample product data (in a real app, this would come from an API)
const sampleProducts = [
    {
        id: 1,
        name: "Handwoven Ceramic Bowl",
        price: 45.00,
        category: "pottery",
        description: "A beautiful handwoven ceramic bowl, perfect for serving salads or decorative purposes. Each piece is unique with natural variations in color and texture.",
        images: ["ceramic-bowl-1", "ceramic-bowl-2", "ceramic-bowl-3"],
        inStock: true,
        featured: true,
        materials: "High-quality ceramic clay, natural glazes",
        dimensions: "8\" diameter x 3\" height",
        care: "Hand wash with mild soap, avoid extreme temperatures"
    },
    {
        id: 2,
        name: "Silver Wire Earrings",
        price: 28.00,
        category: "jewelry",
        description: "Elegant silver wire earrings with natural stone accents. Lightweight and comfortable for everyday wear.",
        images: ["silver-earrings-1", "silver-earrings-2"],
        inStock: true,
        featured: true,
        materials: "Sterling silver wire, natural gemstones",
        dimensions: "2\" length x 0.5\" width",
        care: "Clean with silver polishing cloth, store in dry place"
    },
    {
        id: 3,
        name: "Woven Wall Hanging",
        price: 85.00,
        category: "home-decor",
        description: "Beautiful macramé wall hanging made with natural cotton rope. Adds a bohemian touch to any room.",
        images: ["wall-hanging-1", "wall-hanging-2", "wall-hanging-3"],
        inStock: true,
        featured: true,
        materials: "100% cotton rope, wooden dowel",
        dimensions: "24\" width x 36\" height",
        care: "Shake gently to remove dust, spot clean if needed"
    },
    {
        id: 4,
        name: "Hand-knitted Scarf",
        price: 52.00,
        category: "textiles",
        description: "Soft and warm hand-knitted scarf made from premium wool. Perfect for cold weather styling.",
        images: ["knitted-scarf-1", "knitted-scarf-2"],
        inStock: true,
        featured: false,
        materials: "100% merino wool",
        dimensions: "8\" width x 60\" length",
        care: "Hand wash in cold water, lay flat to dry"
    },
    {
        id: 5,
        name: "Wooden Serving Tray",
        price: 38.00,
        category: "home-decor",
        description: "Handcrafted wooden serving tray with rope handles. Perfect for breakfast in bed or entertaining guests.",
        images: ["wooden-tray-1", "wooden-tray-2"],
        inStock: true,
        featured: false,
        materials: "Reclaimed oak wood, natural hemp rope",
        dimensions: "16\" x 12\" x 2\"",
        care: "Hand wash and dry immediately, oil monthly"
    },
    {
        id: 6,
        name: "Beaded Bracelet Set",
        price: 35.00,
        category: "jewelry",
        description: "Set of three matching bracelets with natural stone beads and gold accents.",
        images: ["bracelet-set-1", "bracelet-set-2"],
        inStock: true,
        featured: false,
        materials: "Natural stone beads, gold-plated findings",
        dimensions: "7\" circumference (adjustable)",
        care: "Avoid water and chemicals, store separately"
    },
    {
        id: 7,
        name: "Glazed Coffee Mug",
        price: 22.00,
        category: "pottery",
        description: "Handthrown ceramic coffee mug with unique glaze patterns. Each mug is one-of-a-kind.",
        images: ["coffee-mug-1", "coffee-mug-2"],
        inStock: true,
        featured: false,
        materials: "Stoneware clay, food-safe glazes",
        dimensions: "4\" height, 12oz capacity",
        care: "Dishwasher and microwave safe"
    },
    {
        id: 8,
        name: "Embroidered Cushion Cover",
        price: 42.00,
        category: "textiles",
        description: "Hand-embroidered cushion cover with traditional floral patterns. Adds elegance to any sofa or chair.",
        images: ["cushion-cover-1", "cushion-cover-2"],
        inStock: false,
        featured: false,
        materials: "100% cotton fabric, cotton embroidery thread",
        dimensions: "18\" x 18\" (fits standard cushion)",
        care: "Machine wash gentle cycle, air dry"
    },
    {
        id: 9,
        name: "Crystal Pendant Necklace",
        price: 68.00,
        category: "jewelry",
        description: "Stunning crystal pendant necklace with sterling silver chain. Perfect for special occasions.",
        images: ["crystal-necklace-1", "crystal-necklace-2"],
        inStock: true,
        featured: true,
        materials: "Natural crystal, sterling silver chain",
        dimensions: "18\" chain, 1.5\" pendant",
        care: "Clean with soft cloth, avoid harsh chemicals"
    },
    {
        id: 10,
        name: "Ceramic Planters Set",
        price: 95.00,
        category: "pottery",
        description: "Set of three matching ceramic planters in different sizes. Perfect for indoor plants and herbs.",
        images: ["planters-set-1", "planters-set-2", "planters-set-3"],
        inStock: true,
        featured: false,
        materials: "Terracotta clay, drainage holes included",
        dimensions: "Small: 4\", Medium: 6\", Large: 8\" diameter",
        care: "Wipe clean with damp cloth"
    }
];

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize the application
function initializeApp() {
    currentProducts = [...sampleProducts];
    
    // Initialize cart count
    updateCartCount();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load page-specific content
    loadPageContent();
    
    // Check URL parameters for product/category
    handleURLParameters();
}

// Set up global event listeners
function setupEventListeners() {
    // Mobile navigation toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close mobile menu when clicking on links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
    
    // Newsletter form
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmit);
    }
    
    // Contact form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
    
    // Category cards click handlers
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', function() {
            const category = this.dataset.category;
            if (category) {
                window.location.href = `shop.html?category=${category}`;
            }
        });
    });
    
    // Modal functionality
    setupModalHandlers();
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Load page-specific content
function loadPageContent() {
    const currentPage = getCurrentPage();
    
    switch (currentPage) {
        case 'index':
            loadFeaturedProducts();
            break;
        case 'shop':
            setupShopPage();
            break;
        case 'product':
            loadProductDetails();
            break;
        default:
            break;
    }
}

// Get current page name
function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop().split('.')[0];
    return page === '' ? 'index' : page;
}

// Handle URL parameters
function handleURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const productId = urlParams.get('id');
    
    if (category && getCurrentPage() === 'shop') {
        setActiveCategory(category);
    }
    
    if (productId && getCurrentPage() === 'product') {
        loadProductById(parseInt(productId));
    }
}

// Featured Products (Home Page)
function loadFeaturedProducts() {
    const featuredContainer = document.getElementById('featured-products');
    if (!featuredContainer) return;
    
    const featuredProducts = currentProducts.filter(product => product.featured).slice(0, 6);
    
    if (featuredProducts.length === 0) {
        featuredContainer.innerHTML = '<p class="text-center">No featured products available.</p>';
        return;
    }
    
    featuredContainer.innerHTML = featuredProducts.map(product => createProductCard(product)).join('');
    
    // Add click handlers to product cards
    setupProductCardHandlers(featuredContainer);
}

// Create product card HTML
function createProductCard(product) {
    const isOutOfStock = !product.inStock;
    const badgeText = product.featured ? 'Featured' : (isOutOfStock ? 'Out of Stock' : '');
    
    return `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-image">
                ${badgeText ? `<div class="product-badge">${badgeText}</div>` : ''}
                ${generateProductImage(product.category, product.name)}
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${truncateText(product.description, 80)}</p>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <div class="product-actions">
                    <button class="btn btn-outline view-product" data-product-id="${product.id}">
                        View Details
                    </button>
                    <button class="btn btn-primary add-to-cart" data-product-id="${product.id}" ${isOutOfStock ? 'disabled' : ''}>
                        ${isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Generate SVG image for products
function generateProductImage(category, name) {
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
                <linearGradient id="gradient-${category}" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:${categoryColors[0]};stop-opacity:0.8" />
                    <stop offset="50%" style="stop-color:${categoryColors[1]};stop-opacity:0.6" />
                    <stop offset="100%" style="stop-color:${categoryColors[2]};stop-opacity:0.8" />
                </linearGradient>
            </defs>
            <rect width="300" height="250" fill="url(#gradient-${category})"/>
            ${getProductIcon(category)}
            <text x="150" y="230" text-anchor="middle" fill="white" font-size="12" font-weight="bold" opacity="0.8">
                ${name.substring(0, 20)}${name.length > 20 ? '...' : ''}
            </text>
        </svg>
    `;
}

// Get product icon based on category
function getProductIcon(category) {
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

// Setup Shop Page
function setupShopPage() {
    if (getCurrentPage() !== 'shop') return;
    
    // Set up filter event listeners
    setupShopFilters();
    
    // Load initial products
    filterProducts();
}

// Setup shop filters
function setupShopFilters() {
    // Search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    
    // Category filters
    document.querySelectorAll('input[name="category"]').forEach(input => {
        input.addEventListener('change', handleCategoryFilter);
    });
    
    // Price filters
    document.querySelectorAll('input[name="price"]').forEach(input => {
        input.addEventListener('change', handlePriceFilter);
    });
    
    // Sort dropdown
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSort);
    }
    
    // Mobile filter toggle
    const mobileFilterToggle = document.getElementById('mobile-filter-toggle');
    const filtersSidebar = document.querySelector('.filters-sidebar');
    
    if (mobileFilterToggle && filtersSidebar) {
        mobileFilterToggle.addEventListener('click', function() {
            filtersSidebar.classList.toggle('active');
        });
    }
}

// Handle search input
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    filterProducts(searchTerm);
}

// Handle category filter
function handleCategoryFilter(event) {
    currentCategory = event.target.value;
    filterProducts();
}

// Handle price filter
function handlePriceFilter() {
    filterProducts();
}

// Handle sorting
function handleSort(event) {
    currentSort = event.target.value;
    sortProducts();
    displayProducts();
}

// Filter products based on current filters
function filterProducts(searchTerm = '') {
    filteredProducts = currentProducts.filter(product => {
        // Search filter
        if (searchTerm && !product.name.toLowerCase().includes(searchTerm) && 
            !product.description.toLowerCase().includes(searchTerm)) {
            return false;
        }
        
        // Category filter
        if (currentCategory !== 'all' && product.category !== currentCategory) {
            return false;
        }
        
        // Price filter
        const priceFilter = document.querySelector('input[name="price"]:checked');
        if (priceFilter && priceFilter.value !== 'all') {
            const [min, max] = priceFilter.value.split('-').map(v => v.replace('+', ''));
            const price = product.price;
            
            if (max) {
                if (price < parseFloat(min) || price > parseFloat(max)) {
                    return false;
                }
            } else {
                if (price < parseFloat(min)) {
                    return false;
                }
            }
        }
        
        return true;
    });
    
    sortProducts();
    currentPage = 1;
    displayProducts();
    updateResultsCount();
}

// Sort products
function sortProducts() {
    filteredProducts.sort((a, b) => {
        switch (currentSort) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            case 'newest':
                return b.id - a.id; // Assuming higher ID means newer
            default:
                return 0;
        }
    });
}

// Display products with pagination
function displayProducts() {
    const productsGrid = document.getElementById('products-grid');
    const noResults = document.getElementById('no-results');
    
    if (!productsGrid) return;
    
    if (filteredProducts.length === 0) {
        productsGrid.style.display = 'none';
        if (noResults) noResults.style.display = 'block';
        return;
    }
    
    productsGrid.style.display = 'grid';
    if (noResults) noResults.style.display = 'none';
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    // Display products
    productsGrid.innerHTML = paginatedProducts.map(product => createProductCard(product)).join('');
    
    // Setup product card handlers
    setupProductCardHandlers(productsGrid);
    
    // Update pagination
    updatePagination();
}

// Update pagination
function updatePagination() {
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) return;
    
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <button ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            paginationHTML += `
                <button class="${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">
                    ${i}
                </button>
            `;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            paginationHTML += '<span>...</span>';
        }
    }
    
    // Next button
    paginationHTML += `
        <button ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    paginationContainer.innerHTML = paginationHTML;
}

// Change page
function changePage(page) {
    currentPage = page;
    displayProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Update results count
function updateResultsCount() {
    const resultsCount = document.getElementById('results-count');
    if (!resultsCount) return;
    
    const total = filteredProducts.length;
    const startIndex = (currentPage - 1) * productsPerPage + 1;
    const endIndex = Math.min(startIndex + productsPerPage - 1, total);
    
    if (total === 0) {
        resultsCount.textContent = 'No products found';
    } else if (total <= productsPerPage) {
        resultsCount.textContent = `Showing all ${total} products`;
    } else {
        resultsCount.textContent = `Showing ${startIndex}-${endIndex} of ${total} products`;
    }
}

// Set active category (for URL parameters)
function setActiveCategory(category) {
    const categoryInput = document.querySelector(`input[name="category"][value="${category}"]`);
    if (categoryInput) {
        categoryInput.checked = true;
        currentCategory = category;
        filterProducts();
    }
}

// Setup product card handlers
function setupProductCardHandlers(container) {
    // View product buttons
    container.querySelectorAll('.view-product').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const productId = parseInt(this.dataset.productId);
            window.location.href = `product.html?id=${productId}`;
        });
    });
    
    // Add to cart buttons
    container.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            if (!this.disabled) {
                const productId = parseInt(this.dataset.productId);
                addToCart(productId);
            }
        });
    });
    
    // Product card click (go to product page)
    container.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', function(e) {
            // Don't navigate if clicking on buttons
            if (e.target.closest('button')) return;
            
            const productId = parseInt(this.dataset.productId);
            window.location.href = `product.html?id=${productId}`;
        });
    });
}

// Load product details (Product Page)
function loadProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    
    if (!productId) {
        showProductNotFound();
        return;
    }
    
    loadProductById(productId);
}

// Load product by ID
function loadProductById(productId) {
    const product = currentProducts.find(p => p.id === productId);
    
    if (!product) {
        showProductNotFound();
        return;
    }
    
    displayProductDetails(product);
    loadRelatedProducts(product);
    updateBreadcrumb(product);
}

// Display product details
function displayProductDetails(product) {
    const productContent = document.getElementById('product-content');
    if (!productContent) return;
    
    const productHTML = `
        <div class="product-gallery">
            <div class="main-image" id="main-image">
                ${generateProductImage(product.category, product.name)}
            </div>
            <div class="thumbnail-images">
                ${product.images.map((img, index) => `
                    <div class="thumbnail ${index === 0 ? 'active' : ''}" data-image="${index}">
                        ${generateProductImage(product.category, product.name)}
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="product-info">
            <h1>${product.name}</h1>
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <div class="product-description">
                <p>${product.description}</p>
            </div>
            
            <div class="product-options">
                <div class="option-group">
                    <label for="quantity">Quantity:</label>
                    <div class="quantity-controls">
                        <button type="button" class="quantity-btn" onclick="changeQuantity(-1)">-</button>
                        <input type="number" id="quantity" class="quantity-input" value="1" min="1" max="10">
                        <button type="button" class="quantity-btn" onclick="changeQuantity(1)">+</button>
                    </div>
                </div>
            </div>
            
            <div class="product-actions">
                <button class="btn btn-primary add-to-cart-detail" data-product-id="${product.id}" ${!product.inStock ? 'disabled' : ''}>
                    ${!product.inStock ? 'Out of Stock' : 'Add to Cart'}
                </button>
                <button class="btn btn-secondary">
                    <i class="fas fa-heart"></i> Add to Wishlist
                </button>
            </div>
            
            <div class="product-meta">
                <div class="meta-item">
                    <span class="meta-label">Materials:</span>
                    <span class="meta-value">${product.materials}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Dimensions:</span>
                    <span class="meta-value">${product.dimensions}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Care Instructions:</span>
                    <span class="meta-value">${product.care}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Availability:</span>
                    <span class="meta-value ${product.inStock ? 'in-stock' : 'out-of-stock'}">
                        ${product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                </div>
            </div>
        </div>
    `;
    
    productContent.innerHTML = productHTML;
    
    // Setup product detail handlers
    setupProductDetailHandlers(product);
}

// Setup product detail page handlers
function setupProductDetailHandlers(product) {
    // Add to cart button
    const addToCartBtn = document.querySelector('.add-to-cart-detail');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            if (!this.disabled) {
                const quantity = parseInt(document.getElementById('quantity').value);
                addToCart(product.id, quantity);
                showModal('cart-modal');
            }
        });
    }
    
    // Thumbnail image handlers
    document.querySelectorAll('.thumbnail').forEach(thumb => {
        thumb.addEventListener('click', function() {
            document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            // In a real app, you would change the main image here
        });
    });
    
    // Main image click (open image modal)
    const mainImage = document.getElementById('main-image');
    if (mainImage) {
        mainImage.addEventListener('click', function() {
            showImageModal(product.images, 0);
        });
    }
}

// Change quantity
function changeQuantity(change) {
    const quantityInput = document.getElementById('quantity');
    if (!quantityInput) return;
    
    const currentValue = parseInt(quantityInput.value);
    const newValue = currentValue + change;
    
    if (newValue >= 1 && newValue <= 10) {
        quantityInput.value = newValue;
    }
}

// Load related products
function loadRelatedProducts(currentProduct) {
    const relatedContainer = document.getElementById('related-products');
    if (!relatedContainer) return;
    
    const relatedProducts = currentProducts
        .filter(p => p.id !== currentProduct.id && p.category === currentProduct.category)
        .slice(0, 4);
    
    if (relatedProducts.length === 0) {
        relatedContainer.innerHTML = '<p class="text-center">No related products found.</p>';
        return;
    }
    
    relatedContainer.innerHTML = relatedProducts.map(product => createProductCard(product)).join('');
    setupProductCardHandlers(relatedContainer);
}

// Update breadcrumb
function updateBreadcrumb(product) {
    const breadcrumbProduct = document.getElementById('breadcrumb-product');
    if (breadcrumbProduct) {
        breadcrumbProduct.textContent = product.name;
    }
}

// Show product not found
function showProductNotFound() {
    const productContent = document.getElementById('product-content');
    if (productContent) {
        productContent.innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--warning); margin-bottom: 1rem;"></i>
                <h2>Product Not Found</h2>
                <p>The product you're looking for doesn't exist or has been removed.</p>
                <a href="shop.html" class="btn btn-primary">Browse All Products</a>
            </div>
        `;
    }
}

// Newsletter form handler
function handleNewsletterSubmit(event) {
    event.preventDefault();
    
    const email = event.target.querySelector('input[type="email"]').value;
    const messageContainer = document.getElementById('newsletter-message');
    
    // Simulate form submission
    messageContainer.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
    messageContainer.className = 'newsletter-message';
    
    setTimeout(() => {
        messageContainer.innerHTML = '<i class="fas fa-check"></i> Thank you for subscribing!';
        messageContainer.className = 'newsletter-message success';
        event.target.reset();
        
        setTimeout(() => {
            messageContainer.innerHTML = '';
            messageContainer.className = 'newsletter-message';
        }, 3000);
    }, 1000);
}

// Contact form handler
function handleContactSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const messageContainer = document.getElementById('form-message');
    const submitButton = event.target.querySelector('button[type="submit"]');
    const btnText = submitButton.querySelector('.btn-text');
    const btnLoading = submitButton.querySelector('.btn-loading');
    
    // Show loading state
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline-flex';
    submitButton.disabled = true;
    
    // Simulate form submission
    setTimeout(() => {
        messageContainer.innerHTML = '<i class="fas fa-check"></i> Thank you for your message! We\'ll get back to you soon.';
        messageContainer.className = 'form-message success';
        event.target.reset();
        
        // Reset button state
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
        submitButton.disabled = false;
        
        setTimeout(() => {
            messageContainer.innerHTML = '';
            messageContainer.className = 'form-message';
        }, 5000);
    }, 2000);
}

// Modal functionality
function setupModalHandlers() {
    // Modal close handlers
    document.querySelectorAll('.modal-close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });
    
    // Click outside modal to close
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });
}

// Show modal
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Show image modal
function showImageModal(images, currentIndex) {
    const modal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');
    
    if (modal && modalImage) {
        // In a real app, you would load the actual image
        modalImage.src = 'data:image/svg+xml;base64,' + btoa(generateProductImage('pottery', 'Product Image'));
        showModal('image-modal');
    }
}

// Utility functions
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Global functions for inline event handlers
window.changePage = changePage;
window.changeQuantity = changeQuantity;
window.closeModal = closeModal;
window.showModal = showModal;

// Add to cart functionality (will be handled by cart.js)
function addToCart(productId, quantity = 1) {
    // This function will be implemented in cart.js
    if (typeof window.cartManager !== 'undefined') {
        window.cartManager.addToCart(productId, quantity);
    }
}

// Update cart count (will be handled by cart.js)
function updateCartCount() {
    // This function will be implemented in cart.js
    if (typeof window.cartManager !== 'undefined') {
        window.cartManager.updateCartCount();
    }
}
