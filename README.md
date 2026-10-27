# ⚡ QuickBasket (React + Express.js + MySQL)

A full-stack 10-minute grocery delivery web application inspired by **Blinkit** and **BigBasket**. Built with **React (Vite)**, **Tailwind CSS**, **Express.js**, and **MySQL**.

---

## 🚀 Key Features

### 🛒 Customer Storefront (Blinkit & BigBasket Experience)
- **10-Minute Delivery Promise**: Dynamic ETA badges (`Delivery in 8 MINS`) with interactive address switcher.
- **Visual Category Browsing**: Horizontal category pills with vibrant icons (Vegetables & Fruits, Dairy, Munchies, Drinks, Instant Food, Atta & Dal, etc.).
- **Smart Instant Search & Sorting**: Real-time debounced search by name, brand, or category. Sort by *Featured*, *Price: Low to High*, *Price: High to Low*, *Rating*, and *Discount*.
- **Interactive Product Cards**: Unit tags (e.g. `500 ml`, `1 kg`), MRP strikethrough, discount badges (`20% OFF`), and Blinkit-style `+ / -` counter buttons.
- **Promotional Hero Carousel**: Eye-catching banners for instant delivery offers and seasonal discounts.

### 🛍️ Cart & Checkout Drawer
- **Free Delivery Goal Meter**: Real-time progress bar (`Add ₹XX more for FREE Delivery`).
- **Interactive Coupon Engine**: One-click coupons (`WELCOME50` for 20% off up to ₹50, `FREESHIP` for zero delivery fee).
- **Tip Delivery Partner**: Selectable tips (₹10, ₹20, ₹30, ₹50) with 100% rider transfer.
- **Bill Summary & Savings**: Transparent breakdown of item total, delivery fee, handling fee, discount, and total savings.
- **Instant Address Selector**: Switch between Home, Office, or add new delivery locations.

### 💳 Online UPI & Razorpay Payment Gateways
- **Dynamic Scannable UPI QR Code**: Auto-generates a real UPI QR code (`upi://pay?pa=quickbasket@icici&...`) compatible with Google Pay, PhonePe, Paytm, CRED, and BHIM.
- **Pay via UPI ID (VPA)**: Enter any handle with instant extension chips (`@okhdfcbank`, `@okaxis`, `@ybl`, `@paytm`, `@ibl`).
- **Razorpay Checkout Modal**: Complete integration supporting Credit/Debit Cards, Netbanking, Wallets, and UPI with test & live production modes.
- **Automated Payment Verification**: Verifies simulated and live gateway approval, records transaction ID, UTR number, and timestamps.
- **Cash on Delivery (COD)**: Optional cash payment with configurable order limit.

### 🛵 Live Order Tracking
- **Animated 4-Stage Delivery Pipeline**:
  1. *Order Received* (Dark store assigned)
  2. *Packing Items* (Bagged & sealed)
  3. *Out for Delivery* (Rider dispatched on electric scooter)
  4. *Delivered* (Handed over at doorstep)
- **Rider Details Card**: Rider name, scooter model (Ather 450X / Ola S1), customer rating, and simulated call button.
- **Live Countdown Timer**: Counts down to estimated delivery arrival.

### 📦 Order History & Reorder
- View past and ongoing orders with date, status badge, items preview, and total amount.
- **One-Click Reorder**: Automatically re-adds all items from a past order back into your active cart.

### ⚙️ Store Admin Console
- **Inventory Management**: View real-time product stock, category tags, and prices.
- **In-Place Price & Stock Editor**: Instantly modify product prices and unit counts.
- **Add New Grocery Products**: Upload title, category, brand, unit, price, MRP, stock, description, and image URL.
- **Order Dispatch Management**: Update incoming customer orders (`received` ➔ `packing` ➔ `out_for_delivery` ➔ `delivered`).
- **Payment Gateways & UPI Management**:
  - Configure **Merchant UPI VPA** (e.g. `quickbasket@icici`, `merchant@okhdfcbank`) and Payee display name with live customer QR preview.
  - Configure **Razorpay Gateway** (Key ID, Key Secret, Webhook Secret, Test Mode vs Live Production Mode).
  - Enable/Disable Cash on Delivery (COD) and configure maximum order limits.
  - View real-time **Customer Payment Reconciliation & Transaction Log**.
- **Database Connection Monitor**:
  - Live status indicator (MySQL 8.0 Connected vs Active Fallback Store).
  - One-click "Test / Reconnect Database" button.
  - View tables schema: `products`, `categories`, `orders`, `addresses`, `coupons`, `payment_settings`.

---

## 🗄️ MySQL Database Setup

QuickBasket includes full relational MySQL 8.0+ support with connection pooling, automated table creation, and seed data.

### 1. Configure MySQL Credentials (`server/.env`)
Edit or create `server/.env`:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=quickbasket_db

RAZORPAY_KEY_ID=rzp_test_9kM38d1P90Fk2L
RAZORPAY_KEY_SECRET=sk_test_QuickBasketLiveSecret2026
```

### 2. Auto-Migrate and Seed Database
Run the initializer script:
```bash
cd server
npm run db:init
```
This will:
1. Connect to your MySQL server.
2. Create database `quickbasket_db` if not exists.
3. Create all tables (`products`, `categories`, `orders`, `addresses`, `coupons`, `payment_settings`).
4. Seed 27+ grocery products, categories, coupons, and payment settings automatically!

*Note: You can also import `server/schema.sql` directly into MySQL Workbench or phpMyAdmin.*

### 3. Dual-Mode Resilience
If your MySQL server is ever stopped, QuickBasket seamlessly switches to its active JSON data engine so the store stays 100% operational with zero customer downtime! You can reconnect to MySQL anytime from the Admin Panel.

---

## 🏃 Running QuickBasket Locally

### Option A: Run Full-Stack Express Server (Single Port)
```bash
# In the quickbasket root directory:
npm start
```
Open **[http://localhost:5000](http://localhost:5000)** in your browser to view the app!

### Option B: Run Frontend & Backend in Development Mode
1. **Start Express Backend**:
   ```bash
   cd server
   npm run dev
   ```
   Backend runs on **http://localhost:5000**

2. **Start React Vite Frontend**:
   ```bash
   cd client
   npm run dev
   ```
   Frontend runs on **http://localhost:5173** (proxied to port 5000)

---

## 📁 Directory Structure

```
quickbasket/
├── server/
│   ├── db.js                   # MySQL connection pool, migrations, queries, and fallback store
│   ├── server.js               # Express REST API, UPI intent generator, Razorpay routes
│   ├── init-db.js              # One-command MySQL database initializer
│   ├── schema.sql              # MySQL DDL schema definitions
│   ├── .env                    # Database & gateway credentials
│   ├── data/                   # Fallback data store & seeds
│   └── package.json            # Backend dependencies (express, mysql2, cors, dotenv, razorpay)
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx              # Location selector, search bar, cart & admin buttons
│   │   │   ├── BannerCarousel.jsx      # Grocery promotional banners
│   │   │   ├── CategoryNav.jsx         # Quick-commerce category filter pills
│   │   │   ├── ProductCard.jsx         # Blinkit-style product item with +/- counter
│   │   │   ├── ProductGrid.jsx         # Responsive responsive catalog grid
│   │   │   ├── CartDrawer.jsx          # Slide-over cart, free delivery progress, coupons, tip
│   │   │   ├── UPIPaymentModal.jsx     # Dynamic QR code, UPI ID, bank simulator
│   │   │   ├── RazorpayModal.jsx       # Razorpay checkout cards & netbanking
│   │   │   ├── OrderTrackingModal.jsx  # Live 4-stage rider tracking
│   │   │   ├── OrdersView.jsx          # Order history & 1-click reorder
│   │   │   └── AdminPanel.jsx          # Inventory, Add Product, UPI/Razorpay, MySQL Manager
│   │   ├── context/
│   │   │   ├── CartContext.jsx         # Global shopping cart state
│   │   │   └── LocationContext.jsx     # User address state
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
│
└── package.json                # Root startup scripts
```

---

## 🔑 Admin Console Access
Click the **"Store Admin"** button at the top right of the navigation bar to access:
- **Inventory & Stock Manager**: Add new products, update prices and stock levels.
- **Live Orders Manager**: Track order lifecycle (`received` ➔ `packing` ➔ `out_for_delivery` ➔ `delivered`).
- **Payment Gateway Settings**: Manage UPI VPAs, QR code generation, and Razorpay test/live credentials.
- **MySQL Database Status**: Check live database health, table row counts, and trigger migrations.
