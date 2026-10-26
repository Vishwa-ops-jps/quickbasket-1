# ⚡ QuickBasket (React + Express.js)

A full-stack 10-minute grocery delivery web application inspired by **Blinkit** and **BigBasket**. Built with **React (Vite)**, **Tailwind CSS**, and **Express.js**.

---

## 🚀 Key Features

### 🛒 Customer Storefront (Blinkit Experience)
- **10-Minute Delivery Promise**: Dynamic ETA badges (`Delivery in 8 MINS`) with address switcher modal.
- **Visual Category Browsing**: Horizontal category filter pills with vibrant icons (Vegetables & Fruits, Dairy, Munchies, Drinks, Instant Food, Atta & Dal, etc.).
- **Smart Instant Search & Sorting**: Real-time debounced search by name, brand, or category. Sort by *Featured*, *Price: Low to High*, *Price: High to Low*, *Rating*, and *Discount*.
- **Interactive Product Cards**: Unit tags (e.g. `500 ml`, `1 kg`), MRP strikethrough, discount badges (`20% OFF`), and Blinkit-style `+ / -` counter buttons.
- **Promotional Hero Carousel**: Eye-catching banners for instant delivery offers and seasonal discounts.

### 🛍️ Cart & Checkout Drawer
- **Free Delivery Goal Meter**: Real-time progress bar (`Add ₹XX more for FREE Delivery`).
- **Interactive Coupon Engine**: One-click coupons (`WELCOME50` for 20% off up to ₹50, `FREESHIP` for zero delivery fee).
- **Tip Delivery Partner**: Selectable tips (₹10, ₹20, ₹30, ₹50) with 100% rider transfer.
- **Bill Summary & Savings**: Transparent breakdown of item total, delivery fee, handling fee, discount, and total savings.
- **Instant Address Selector**: Switch between Home, Office, or add new delivery locations.

### 💳 Online UPI Payment Gateway
- **Dynamic Scannable QR Code**: Auto-generates a real UPI QR code (`upi://pay?pa=quickbasket@icici&...`) compatible with Google Pay, PhonePe, Paytm, CRED, and BHIM.
- **Pay via UPI ID (VPA)**: Enter any handle with instant extension chips (`@okhdfcbank`, `@okaxis`, `@ybl`, `@paytm`, `@ibl`).
- **5-Minute Security Timer**: NPCI standard timeout countdown.
- **Automated Payment Verification**: Verifies simulated banking network approval, records transaction ID, UTR number, and timestamps.

### 🛵 Live Simulated Order Tracking
- **Animated 4-Stage Delivery Pipeline**:
  1. *Order Received* (Dark store assigned)
  2. *Packing Items* (Bagged & sealed)
  3. *Out for Delivery* (Rider dispatched on electric scooter)
  4. *Delivered* (Handed over at doorstep)
- **Rider Details Card**: Rider name, scooter model (Ather 450X / Ola S1), customer rating, and simulated direct call button.
- **Live Countdown Timer**: Counts down to estimated delivery arrival.

### 📦 Order History & Reorder
- View past and ongoing orders with date, status badge, items preview, and total amount.
- **One-Click Reorder**: Automatically re-adds all items from a past order back into your active cart.

### ⚙️ Dark Store Admin Console
- **Inventory Management**: View real-time product stock, category tags, and prices.
- **In-Place Price & Stock Editor**: Instantly modify product prices and unit counts.
- **Add New Grocery Products**: Upload title, category, brand, unit, price, MRP, stock, and image URL.
- **Order Dispatch Management**: Update incoming customer orders (`received` ➔ `packing` ➔ `out_for_delivery` ➔ `delivered`).
- **Payment Gateways & UPI Management**:
  - Configure **Merchant UPI VPA** (e.g. `quickbasket@icici`, `merchant@okhdfcbank`) and Payee display name with live customer QR preview.
  - Configure **Razorpay Gateway** (Key ID, Key Secret, Webhook Secret, Test Mode vs Live Production Mode).
  - Enable/Disable Cash on Delivery (COD) and configure maximum order limits.
  - View real-time **Customer Payment Reconciliation & Transaction Log**.

---

## 📁 Project Architecture

```
quickbasket/
├── package.json               # Root scripts
├── server/                    # Backend (Express.js REST API)
│   ├── package.json
│   ├── server.js              # Express app, endpoints, router
│   └── data/
│       ├── products.json      # Realistic Indian grocery catalog (26+ items)
│       ├── categories.json    # Grocery categories
│       ├── coupons.json       # Discount promo codes
│       ├── orders.json        # Live & past customer orders
│       ├── addresses.json     # Saved delivery locations
│       └── payment-settings.json # Dynamic UPI & Razorpay settings
└── client/                    # Frontend (React 18 + Vite + Tailwind CSS)
    ├── package.json
    ├── vite.config.js         # API proxy configured to http://localhost:5000
    ├── tailwind.config.js     # QuickBasket yellow (#f7cb44) & green (#0c831f) branding
    ├── src/
    │   ├── App.jsx            # Main app shell & tabs
    │   ├── context/
    │   │   ├── CartContext.jsx      # Shopping cart, discounts, tips
    │   │   └── LocationContext.jsx  # Delivery addresses & ETA
    │   └── components/
    │       ├── Navbar.jsx             # Search bar, location ETA, cart button
    │       ├── BannerCarousel.jsx     # Hero promotional slider
    │       ├── CategoryNav.jsx        # Horizontal category selector
    │       ├── ProductCard.jsx        # Card with + / - quantity counter
    │       ├── ProductGrid.jsx        # Product display & sorting
    │       ├── CartDrawer.jsx         # Slide-over checkout drawer
    │       ├── UPIPaymentModal.jsx    # Dynamic QR & UPI VPA gateway
    │       ├── RazorpayModal.jsx      # Razorpay Card & Netbanking gateway
    │       ├── OrderTrackingModal.jsx # Live 10-minute order tracker
    │       ├── AddressModal.jsx       # Address switcher & creator
    │       ├── OrdersView.jsx         # Past orders & reorder
    │       └── AdminPanel.jsx         # Inventory, orders & payment gateway controls
```

---

## 🛠️ How to Run

### Step 1: Start the Express Backend Server
Open a terminal in `quickbasket/server`:
```bash
cd server
npm start
```
*The server will run on `http://localhost:5000`.*

### Step 2: Start the React Frontend App
Open a second terminal in `quickbasket/client`:
```bash
cd client
npm run dev
```
*The React app will run on `http://localhost:3000`.*

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/categories` | Retrieve all grocery categories |
| `GET` | `/api/products` | Retrieve products (supports `?category=`, `?search=`, `?sort=`) |
| `GET` | `/api/products/:id` | Get details of a single product |
| `POST` | `/api/products` | Add a new product to inventory (Admin) |
| `PUT` | `/api/products/:id` | Update price and stock (Admin) |
| `DELETE` | `/api/products/:id` | Delete a product (Admin) |
| `GET` | `/api/coupons` | List all available coupons |
| `POST` | `/api/coupons/validate` | Validate coupon and compute discount |
| `POST` | `/api/payment/create-upi-intent` | Generate dynamic UPI QR & payment URI |
| `POST` | `/api/payment/verify-upi` | Verify UPI transaction & get UTR number |
| `GET` | `/api/payment/settings` | Get active payment gateway configurations |
| `POST` | `/api/admin/payment-settings` | Update UPI VPA, Razorpay keys, and gateway settings |
| `POST` | `/api/payment/razorpay/create-order` | Create Razorpay order intent |
| `POST` | `/api/payment/razorpay/verify` | Verify Razorpay payment signature |
| `GET` | `/api/addresses` | Fetch saved delivery addresses |
| `POST` | `/api/addresses` | Add a new delivery address |
| `GET` | `/api/orders` | Fetch customer orders |
| `POST` | `/api/orders` | Place new order & auto-assign electric rider |
| `PATCH` | `/api/orders/:id/status`| Update order status in dark store (Admin) |

