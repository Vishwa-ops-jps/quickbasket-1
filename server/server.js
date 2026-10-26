const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, 'data');

// Helper to read JSON
const readData = (filename) => {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${filename}:`, err);
    return [];
  }
};

// Helper to write JSON
const writeData = (filename, data) => {
  try {
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filename}:`, err);
    return false;
  }
};

// ==================== ROUTES ====================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Blinkit-BigBasket Backend API', timestamp: new Date() });
});

// Categories
app.get('/api/categories', (req, res) => {
  const categories = readData('categories.json');
  res.json(categories);
});

// Products with search, filtering, and sorting
app.get('/api/products', (req, res) => {
  let products = readData('products.json');
  const { category, search, sort, brand } = req.query;

  if (category && category !== 'all') {
    products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (brand) {
    products = products.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
  }

  if (search) {
    const query = search.toLowerCase().trim();
    products = products.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.brand.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      (p.description && p.description.toLowerCase().includes(query))
    );
  }

  if (sort === 'price-low') {
    products.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-high') {
    products.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    products.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'discount') {
    products.sort((a, b) => {
      const discA = ((a.mrp - a.price) / a.mrp) || 0;
      const discB = ((b.mrp - b.price) / b.mrp) || 0;
      return discB - discA;
    });
  }

  res.json(products);
});

// Single product
app.get('/api/products/:id', (req, res) => {
  const products = readData('products.json');
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

// Admin Add Product
app.post('/api/products', (req, res) => {
  const { name, brand, category, unit, price, mrp, image, description, stock } = req.body;
  if (!name || !price || !category) {
    return res.status(400).json({ error: 'Name, price, and category are required' });
  }

  const products = readData('products.json');
  const newProduct = {
    id: 'p' + Date.now(),
    name,
    brand: brand || 'General',
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
  };

  products.unshift(newProduct);
  writeData('products.json', products);
  res.status(201).json(newProduct);
});

// Admin Edit Product
app.put('/api/products/:id', (req, res) => {
  const products = readData('products.json');
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  products[index] = { ...products[index], ...req.body };
  writeData('products.json', products);
  res.json(products[index]);
});

// Admin Delete Product
app.delete('/api/products/:id', (req, res) => {
  let products = readData('products.json');
  const filtered = products.filter(p => p.id !== req.params.id);
  if (filtered.length === products.length) {
    return res.status(404).json({ error: 'Product not found' });
  }
  writeData('products.json', filtered);
  res.json({ message: 'Product deleted successfully', id: req.params.id });
});

// Coupons
app.get('/api/coupons', (req, res) => {
  const coupons = readData('coupons.json');
  res.json(coupons);
});

// Validate Coupon
app.post('/api/coupons/validate', (req, res) => {
  const { code, subtotal } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Coupon code is required' });
  }

  const coupons = readData('coupons.json');
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
});

// Delivery Addresses
app.get('/api/addresses', (req, res) => {
  const addresses = readData('addresses.json');
  res.json(addresses);
});

app.post('/api/addresses', (req, res) => {
  const { tag, recipient, phone, flat, area, city, pincode } = req.body;
  if (!flat || !area || !pincode) {
    return res.status(400).json({ error: 'Flat, area, and pincode are required' });
  }

  const addresses = readData('addresses.json');
  const newAddr = {
    id: 'addr-' + Date.now(),
    tag: tag || 'Home',
    recipient: recipient || 'Customer',
    phone: phone || '+91 99999 99999',
    flat,
    area,
    city: city || 'Bengaluru',
    pincode,
    eta: '8-10 MINS'
  };

  addresses.push(newAddr);
  writeData('addresses.json', addresses);
  res.status(201).json(newAddr);
});

// Orders
app.get('/api/orders', (req, res) => {
  const orders = readData('orders.json');
  res.json(orders);
});

app.get('/api/orders/:id', (req, res) => {
  const orders = readData('orders.json');
  const order = orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
});

// ==================== PAYMENT SETTINGS & GATEWAY ROUTES ====================

// Get Payment Gateway Settings (Admin + Customer)
app.get('/api/payment/settings', (req, res) => {
  const settings = readData('payment-settings.json');
  res.json(settings);
});

// Update Payment Gateway Settings (Admin)
app.post('/api/admin/payment-settings', (req, res) => {
  const current = readData('payment-settings.json');
  const updated = {
    ...current,
    ...req.body
  };
  writeData('payment-settings.json', updated);
  res.json({ success: true, message: 'Payment gateway settings saved successfully', settings: updated });
});

// Razorpay Order Creation (Simulated & SDK ready)
app.post('/api/payment/razorpay/create-order', (req, res) => {
  const { amount } = req.body;
  const settings = readData('payment-settings.json');
  const rzpOrder = {
    id: 'order_rzp_' + Math.floor(100000000 + Math.random() * 900000000),
    entity: 'order',
    amount: Math.round(Number(amount) * 100), // in paise
    currency: 'INR',
    receipt: 'rcpt_' + Date.now(),
    status: 'created',
    keyId: settings?.razorpay?.keyId || 'rzp_test_9kM38d1P90Fk2L'
  };
  res.json(rzpOrder);
});

// Razorpay Payment Verification
app.post('/api/payment/razorpay/verify', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  res.json({
    status: 'SUCCESS',
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id || ('pay_' + Math.floor(100000000 + Math.random() * 900000000)),
    method: 'Razorpay Gateway',
    timestamp: new Date().toISOString()
  });
});

// ==================== UPI PAYMENT ROUTES ====================

// Generate UPI Payment Intent with dynamic QR and deep link
app.post('/api/payment/create-upi-intent', (req, res) => {
  const { amount, orderId } = req.body;
  const payAmount = Number(amount) || 0;
  const txnId = 'QB' + Date.now();
  
  // Read dynamically configured UPI from admin settings
  const settings = readData('payment-settings.json');
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
});

// Verify UPI payment status
app.post('/api/payment/verify-upi', (req, res) => {
  const { txnId, vpa, amount } = req.body;

  // Simulate banking network check
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

// Place new order
app.post('/api/orders', (req, res) => {
  const { items, address, paymentMethod, paymentDetails, tip = 0, couponCode } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({ error: 'Order must contain items' });
  }

  const products = readData('products.json');
  let subtotal = 0;

  // Validate items and calculate subtotal
  const orderItems = items.map(cartItem => {
    const prod = products.find(p => p.id === cartItem.id) || cartItem;
    const itemSubtotal = prod.price * cartItem.quantity;
    subtotal += itemSubtotal;
    // Decrement stock
    if (prod.stock) {
      prod.stock = Math.max(0, prod.stock - cartItem.quantity);
    }
    return {
      id: prod.id,
      name: prod.name,
      price: prod.price,
      quantity: cartItem.quantity,
      unit: prod.unit,
      image: prod.image
    };
  });

  writeData('products.json', products);

  // Delivery & fee logic
  const deliveryFee = subtotal >= 199 ? 0 : 25;
  const handlingFee = 4;
  let discount = 0;

  if (couponCode) {
    const coupons = readData('coupons.json');
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

  const newOrder = {
    id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
    createdAt: new Date().toISOString(),
    status: 'received', // received -> packed -> out_for_delivery -> delivered
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
  };

  const orders = readData('orders.json');
  orders.unshift(newOrder);
  writeData('orders.json', orders);

  res.status(201).json(newOrder);
});

// Update order status (Admin / simulation)
app.patch('/api/orders/:id/status', (req, res) => {
  const { status } = req.body;
  const orders = readData('orders.json');
  const order = orders.find(o => o.id === req.params.id);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  order.status = status;
  writeData('orders.json', orders);
  res.json(order);
});

app.listen(PORT, () => {
  console.log(`🚀 QuickBasket / Blinkit Express Server is running on port ${PORT}`);
});

