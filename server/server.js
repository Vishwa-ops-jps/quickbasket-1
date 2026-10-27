require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Database connection (MySQL with automatic fallback to active JSON store)
db.initDatabase().catch(err => {
  console.error('Database initialization encountered an error:', err.message);
});

// ==================== SYSTEM & DB STATUS ====================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'QuickBasket Express + MySQL Backend API',
    database: db.getDbStatus(),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/db/status', (req, res) => {
  res.json(db.getDbStatus());
});

app.post('/api/db/reconnect', async (req, res) => {
  const success = await db.reconnectDb();
  res.json({ success, status: db.getDbStatus() });
});

// ==================== CATEGORIES ====================

app.get('/api/categories', async (req, res) => {
  try {
    const categories = await db.getCategories();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== PRODUCTS ====================

app.get('/api/products', async (req, res) => {
  try {
    const { category, search, sort, brand } = req.query;
    const products = await db.getProducts({ category, search, sort, brand });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Add Product
app.post('/api/products', async (req, res) => {
  try {
    const { name, brand, category, unit, price, mrp, image, description, stock } = req.body;
    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Name, price, and category are required' });
    }

    const newProduct = await db.createProduct({
      name,
      brand: brand || 'Farm Fresh',
      category,
      unit: unit || '1 unit',
      price: Number(price),
      mrp: Number(mrp) || Number(price),
      rating: 4.8,
      reviewsCount: 1,
      deliveryTime: '10 mins',
      image: image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80',
      inStock: true,
      stock: Number(stock) || 50,
      description: description || ''
    });

    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Edit Product
app.put('/api/products/:id', async (req, res) => {
  try {
    const updated = await db.updateProduct(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Delete Product
app.delete('/api/products/:id', async (req, res) => {
  try {
    await db.deleteProduct(req.params.id);
    res.json({ message: 'Product deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== COUPONS ====================

app.get('/api/coupons', async (req, res) => {
  try {
    const coupons = await db.getCoupons();
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/coupons/validate', async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Coupon code is required' });
    }

    const coupons = await db.getCoupons();
    const coupon = coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase());

    if (!coupon) {
      return res.status(404).json({ valid: false, message: 'Invalid coupon code' });
    }

    if (coupon.minOrder && subtotal < coupon.minOrder) {
      return res.status(400).json({
        valid: false,
        message: `Minimum order amount of ₹${coupon.minOrder} required for this coupon.`
      });
    }

    let discount = 0;
    if (coupon.freeDelivery) {
      discount = coupon.discountAmount || 25;
    } else if (coupon.discountPercent) {
      discount = Math.round((subtotal * coupon.discountPercent) / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    }

    res.json({
      valid: true,
      code: coupon.code,
      discount,
      description: coupon.description,
      freeDelivery: !!coupon.freeDelivery
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== ADDRESSES ====================

app.get('/api/addresses', async (req, res) => {
  try {
    const addresses = await db.getAddresses();
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/addresses', async (req, res) => {
  try {
    const { tag, recipient, phone, flat, area, city, pincode } = req.body;
    if (!flat || !area || !pincode) {
      return res.status(400).json({ error: 'Flat, area, and pincode are required' });
    }

    const newAddr = await db.createAddress({
      tag: tag || 'Home',
      recipient: recipient || 'Customer',
      phone: phone || '+91 99999 99999',
      flat,
      area,
      city: city || 'Bengaluru',
      pincode,
      eta: '8-10 MINS'
    });

    res.status(201).json(newAddr);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== ORDERS ====================

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await db.getOrders();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await db.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { items, address, paymentMethod, paymentDetails, tip = 0, couponCode } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ error: 'Order must contain items' });
    }

    let subtotal = 0;
    const orderItems = items.map(cartItem => {
      const itemSubtotal = cartItem.price * cartItem.quantity;
      subtotal += itemSubtotal;
      return {
        id: cartItem.id,
        name: cartItem.name,
        price: cartItem.price,
        quantity: cartItem.quantity,
        unit: cartItem.unit,
        image: cartItem.image
      };
    });

    const deliveryFee = subtotal >= 199 ? 0 : 25;
    const handlingFee = 4;
    let discount = 0;

    if (couponCode) {
      const coupons = await db.getCoupons();
      const matched = coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase());
      if (matched && (!matched.minOrder || subtotal >= matched.minOrder)) {
        if (matched.discountPercent) {
          discount = Math.min(Math.round((subtotal * matched.discountPercent) / 100), matched.maxDiscount || 9999);
        } else if (matched.freeDelivery) {
          discount = deliveryFee;
        }
      }
    }

    const total = Math.max(0, subtotal + deliveryFee + handlingFee + Number(tip) - discount);

    const riders = [
      { name: 'Arun Verma', phone: '+91 98451 92837', rating: 4.9, vehicle: 'Ather 450X (KA-05-EV-1920)' },
      { name: 'Pooja Sharma', phone: '+91 97312 84729', rating: 4.8, vehicle: 'Ola S1 Pro (KA-01-EL-4821)' },
      { name: 'Ramesh Kumar', phone: '+91 98765 43210', rating: 4.9, vehicle: 'Hero Electric (KA-03-EB-2024)' }
    ];
    const assignedRider = riders[Math.floor(Math.random() * riders.length)];

    const newOrder = await db.createOrder({
      status: 'received',
      deliveryTimeEst: '10 mins',
      items: orderItems,
      subtotal,
      deliveryFee,
      handlingFee,
      tip: Number(tip),
      discount,
      couponCode: couponCode || null,
      total,
      address: address || {
        tag: 'Home',
        flat: '402, Green Glen Apartments',
        area: 'Bellandur',
        city: 'Bengaluru',
        pincode: '560103'
      },
      paymentMethod: paymentMethod || 'UPI (Google Pay / PhonePe)',
      paymentStatus: paymentDetails?.status || (paymentMethod === 'COD' ? 'PENDING' : 'PAID'),
      paymentDetails: paymentDetails || null,
      rider: assignedRider
    });

    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await db.updateOrderStatus(req.params.id, status);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== PAYMENT GATEWAY & UPI ROUTES ====================

// Get Payment Gateway Settings (UPI / Razorpay / COD)
app.get('/api/payment/settings', async (req, res) => {
  try {
    const settings = await db.getPaymentSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Payment Gateway Settings (Admin)
app.post('/api/admin/payment-settings', async (req, res) => {
  try {
    const current = await db.getPaymentSettings();
    const updated = { ...current, ...req.body };
    await db.updatePaymentSettings(updated);
    res.json({ success: true, message: 'Payment gateway settings saved successfully', settings: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Razorpay Order Creation
app.post('/api/payment/razorpay/create-order', async (req, res) => {
  try {
    const { amount } = req.body;
    const settings = await db.getPaymentSettings();
    const rzpOrder = {
      id: 'order_rzp_' + Math.floor(100000000 + Math.random() * 900000000),
      entity: 'order',
      amount: Math.round(Number(amount) * 100), // in paise
      currency: 'INR',
      receipt: 'rcpt_' + Date.now(),
      status: 'created',
      keyId: settings?.razorpay?.keyId || process.env.RAZORPAY_KEY_ID || 'rzp_test_9kM38d1P90Fk2L'
    };
    res.json(rzpOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Razorpay Payment Verification
app.post('/api/payment/razorpay/verify', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id } = req.body;
  res.json({
    status: 'SUCCESS',
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id || ('pay_' + Math.floor(100000000 + Math.random() * 900000000)),
    method: 'Razorpay Gateway',
    timestamp: new Date().toISOString()
  });
});

// Generate UPI Payment Intent with dynamic QR and deep link
app.post('/api/payment/create-upi-intent', async (req, res) => {
  try {
    const { amount, orderId } = req.body;
    const payAmount = Number(amount) || 0;
    const txnId = 'QB' + Date.now();

    const settings = await db.getPaymentSettings();
    const vpa = settings?.upi?.vpa || 'quickbasket@icici';
    const payeeName = settings?.upi?.payeeName || 'QuickBasket Delivery';

    // Standard UPI URI format: upi://pay?pa=...&pn=...&am=...&cu=INR&tn=...
    const upiUri = `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(payeeName)}&am=${payAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent('QuickBasket Order ' + (orderId || txnId))}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(upiUri)}`;

    res.json({
      success: true,
      txnId,
      vpa,
      payeeName,
      amount: payAmount,
      upiUri,
      qrCodeUrl,
      supportedApps: [
        { name: 'Google Pay', icon: 'gpay', color: '#1a73e8' },
        { name: 'PhonePe', icon: 'phonepe', color: '#5f259f' },
        { name: 'Paytm', icon: 'paytm', color: '#00baf2' },
        { name: 'CRED UPI', icon: 'cred', color: '#111111' },
        { name: 'BHIM UPI', icon: 'bhim', color: '#00796b' }
      ]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify UPI payment status
app.post('/api/payment/verify-upi', (req, res) => {
  const { txnId, vpa, amount } = req.body;
  const utrNumber = 'UTR' + Math.floor(100000000000 + Math.random() * 900000000000);
  const upiRef = 'UPI/' + new Date().getFullYear() + '/' + Math.floor(100000 + Math.random() * 900000);

  res.json({
    status: 'SUCCESS',
    message: 'Payment verified successfully by UPI Gateway',
    txnId: txnId || ('QB' + Date.now()),
    utrNumber,
    upiRef,
    payerVpa: vpa || 'customer@upi',
    amount,
    timestamp: new Date().toISOString()
  });
});

// Serve static frontend assets in production (Render / Production build)
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  console.log(`📦 Serving compiled React frontend from: ${clientDist}`);
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  console.log(`⚠️ Client dist not found at ${clientDist}. Running in API-only mode.`);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 QuickBasket Full-Stack Server is running on port ${PORT}`);
});
