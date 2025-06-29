# Artisan Crafts E-commerce Platform

## Overview

This is a frontend-only e-commerce platform for handmade crafts and artisan products. The application is built as a static website using HTML, CSS, and vanilla JavaScript, with local storage serving as the primary data persistence mechanism. The platform features a customer-facing storefront and an admin panel for product management.

## System Architecture

### Frontend Architecture
- **Technology Stack**: Pure HTML5, CSS3, and vanilla JavaScript
- **Styling**: Custom CSS with CSS variables for consistent theming, using earth-tone color palette
- **Typography**: Google Fonts (Playfair Display for headings, Crimson Text for body)
- **Icons**: Font Awesome 6.0.0 for UI icons
- **Layout**: Responsive design with mobile-first approach

### Data Storage
- **Primary Storage**: Browser localStorage for all data persistence
- **Product Data**: JavaScript objects stored in app.js with sample data
- **Cart Management**: Persistent cart state using localStorage
- **Admin Authentication**: Simple token-based auth stored in localStorage (24-hour expiry)

### Authentication System
- **Admin Panel**: Basic username/password authentication
- **Session Management**: localStorage-based with time-based expiration
- **Security**: Frontend-only validation (not production-ready)

## Key Components

### Customer-Facing Pages
1. **Home Page (index.html)**: Hero section, featured products, categories
2. **Shop Page (shop.html)**: Product listing with filtering and sorting
3. **Product Details (product.html)**: Individual product view with detailed information
4. **Shopping Cart (cart.html)**: Cart management and checkout process
5. **About Page (about.html)**: Company story and artisan information
6. **Contact Page (contact.html)**: Contact form and business information

### Admin Panel (/admin/)
1. **Login System (login.html)**: Admin authentication
2. **Dashboard (dashboard.html)**: Overview and statistics
3. **Product Management (product-list.html)**: View and manage existing products
4. **Add Products (add-product.html)**: Form for adding new products

### JavaScript Modules
1. **app.js**: Main application logic, product data, and page initialization
2. **cart.js**: Shopping cart functionality with localStorage persistence
3. **admin.js**: Admin panel management and authentication

## Data Flow

### Product Management Flow
1. Admin logs in through login.html
2. Products are managed through admin panel forms
3. Product data is stored in localStorage
4. Customer pages read from the same localStorage data

### Shopping Cart Flow
1. Customer adds products to cart from shop or product pages
2. Cart data is immediately persisted to localStorage
3. Cart state is synchronized across all pages
4. Checkout process calculates totals including tax and shipping

### Authentication Flow
1. Admin enters credentials on login page
2. Simple validation against hardcoded credentials
3. Success creates session token in localStorage with timestamp
4. Protected admin pages check for valid session on load

## External Dependencies

### CDN Resources
- **Font Awesome 6.0.0**: Icon library for UI elements
- **Google Fonts**: Typography (Playfair Display, Crimson Text)

### No Backend Dependencies
- No server-side frameworks or databases
- No external APIs or payment processors
- All functionality runs entirely in the browser

## Deployment Strategy

### Static Hosting
- Platform can be deployed to any static hosting service
- No server configuration required
- Files can be served directly from file system

### Browser Requirements
- Modern browsers with localStorage support
- JavaScript enabled for full functionality
- Responsive design works on mobile and desktop

### Scalability Limitations
- localStorage has size limitations (typically 5-10MB)
- No real-time synchronization between users
- Admin changes only visible after page refresh
- Not suitable for high-volume production use

## Changelog
- June 29, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.