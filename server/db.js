require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');

// Read JSON fallback helper
const readData = (filename) => {
  try {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) return [];
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    console.error(`[Data Error] Failed reading ${filename}:`, err.message);
    return [];
  }
};

// Write JSON fallback helper
const writeData = (filename, data) => {
  try {
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`[Data Error] Failed writing ${filename}:`, err.message);
    return false;
  }
};

let pool = null;
let dbStatus = {
  connected: false,
  mode: 'initializing',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME || 'quickbasket_db',
  user: process.env.DB_USER || 'root',
  lastError: null,
  counts: { products: 0, categories: 0, orders: 0 }
};

// Initialize MySQL with automatic table setup and seeding
async function initDatabase() {
  const host = process.env.DB_HOST || 'localhost';
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'quickbasket_db';

  try {
    console.log(`🔌 Attempting MySQL connection at ${host}:${port} as ${user}...`);

    // 1. First connect without database selected to create database if not present
    const rootConnection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      connectTimeout: 4000
    });

    await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await rootConnection.end();

    // 2. Create connection pool
    pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Test pool connection
    const testConn = await pool.getConnection();
    testConn.release();

    // 3. Create tables if not exist
    await createTables();

    // 4. Seed initial data from JSON into MySQL if tables are empty
    await seedTablesIfEmpty();

    // 5. Update counts
    await refreshCounts();

    dbStatus.connected = true;
    dbStatus.mode = 'mysql';
    dbStatus.lastError = null;
    console.log(`✅ [QuickBasket] Successfully connected to MySQL database: ${database} at ${host}:${port}`);
    return true;
  } catch (error) {
    dbStatus.connected = false;
    dbStatus.mode = 'json_fallback';
    dbStatus.lastError = error.message;
    console.warn(`⚠️ [QuickBasket] MySQL not reachable (${error.message}).`);
    console.warn(`⚡ Seamlessly activated local JSON data engine so QuickBasket runs without interruption.`);
    console.warn(`💡 Tip: Ensure MySQL Server is running on port ${port} or adjust DB_* in server/.env`);
    return false;
  }
}

async function createTables() {
  if (!pool) return;

  const queries = [
    `CREATE TABLE IF NOT EXISTS categories (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      icon VARCHAR(64) DEFAULT '🛒',
      image TEXT,
      itemCount INT DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      brand VARCHAR(128) DEFAULT 'Farm Fresh',
      category VARCHAR(64) NOT NULL,
      unit VARCHAR(64) DEFAULT '1 unit',
      price DECIMAL(10,2) NOT NULL,
      mrp DECIMAL(10,2) NOT NULL,
      rating DECIMAL(3,2) DEFAULT 4.50,
      reviewsCount INT DEFAULT 1,
      deliveryTime VARCHAR(64) DEFAULT '10 mins',
      image TEXT,
      inStock BOOLEAN DEFAULT TRUE,
      stock INT DEFAULT 50,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_category (category),
      INDEX idx_price (price)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS addresses (
      id VARCHAR(64) PRIMARY KEY,
      tag VARCHAR(64) DEFAULT 'Home',
      recipient VARCHAR(128) DEFAULT 'Customer',
      phone VARCHAR(32) DEFAULT '+91 99999 99999',
      flat TEXT NOT NULL,
      area TEXT NOT NULL,
      city VARCHAR(128) DEFAULT 'Bengaluru',
      pincode VARCHAR(16) NOT NULL,
      eta VARCHAR(64) DEFAULT '8-10 MINS',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS coupons (
      id VARCHAR(64) PRIMARY KEY,
      code VARCHAR(64) NOT NULL UNIQUE,
      description TEXT,
      discountPercent INT DEFAULT 0,
      maxDiscount DECIMAL(10,2) DEFAULT 0,
      minOrder DECIMAL(10,2) DEFAULT 0,
      freeDelivery BOOLEAN DEFAULT FALSE,
      discountAmount DECIMAL(10,2) DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(64) PRIMARY KEY,
      createdAt VARCHAR(64) NOT NULL,
      status VARCHAR(64) DEFAULT 'received',
      deliveryTimeEst VARCHAR(64) DEFAULT '10 mins',
      subtotal DECIMAL(10,2) NOT NULL,
      deliveryFee DECIMAL(10,2) DEFAULT 0,
      handlingFee DECIMAL(10,2) DEFAULT 4.00,
      tip DECIMAL(10,2) DEFAULT 0,
      discount DECIMAL(10,2) DEFAULT 0,
      couponCode VARCHAR(64) DEFAULT NULL,
      total DECIMAL(10,2) NOT NULL,
      address JSON,
      paymentMethod VARCHAR(128) NOT NULL,
      paymentStatus VARCHAR(64) DEFAULT 'PAID',
      paymentDetails JSON,
      rider JSON,
      items JSON,
      INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS payment_settings (
      id VARCHAR(64) PRIMARY KEY,
      settings_json JSON NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
  ];

  for (const q of queries) {
    await pool.query(q);
  }
}

async function seedTablesIfEmpty() {
  if (!pool) return;

  // 1. Categories
  const [catRows] = await pool.query('SELECT COUNT(*) as count FROM categories');
  if (catRows[0].count === 0) {
    const jsonCategories = readData('categories.json');
    for (const c of jsonCategories) {
      await pool.query(
        'INSERT IGNORE INTO categories (id, name, icon, image, itemCount) VALUES (?, ?, ?, ?, ?)',
        [c.id, c.name, c.icon || '🛒', c.image || '', c.itemCount || 0]
      );
    }
  }

  // 2. Products
  const [prodRows] = await pool.query('SELECT COUNT(*) as count FROM products');
  if (prodRows[0].count === 0) {
    const jsonProducts = readData('products.json');
    for (const p of jsonProducts) {
      await pool.query(
        `INSERT IGNORE INTO products 
        (id, name, brand, category, unit, price, mrp, rating, reviewsCount, deliveryTime, image, inStock, stock, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          p.id, p.name, p.brand || 'Farm Fresh', p.category, p.unit || '1 unit',
          Number(p.price) || 0, Number(p.mrp) || Number(p.price) || 0,
          Number(p.rating) || 4.5, Number(p.reviewsCount) || 1,
          p.deliveryTime || '10 mins', p.image || '',
          p.inStock !== false, Number(p.stock) || 50, p.description || ''
        ]
      );
    }
  }

  // 3. Addresses
  const [addrRows] = await pool.query('SELECT COUNT(*) as count FROM addresses');
  if (addrRows[0].count === 0) {
    const jsonAddresses = readData('addresses.json');
    for (const a of jsonAddresses) {
      await pool.query(
        `INSERT IGNORE INTO addresses (id, tag, recipient, phone, flat, area, city, pincode, eta)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [a.id, a.tag, a.recipient, a.phone, a.flat, a.area, a.city, a.pincode, a.eta]
      );
    }
  }

  // 4. Coupons
  const [couponRows] = await pool.query('SELECT COUNT(*) as count FROM coupons');
  if (couponRows[0].count === 0) {
    const jsonCoupons = readData('coupons.json');
    for (const c of jsonCoupons) {
      await pool.query(
        `INSERT IGNORE INTO coupons (id, code, description, discountPercent, maxDiscount, minOrder, freeDelivery, discountAmount)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          c.id || c.code, c.code, c.description,
          c.discountPercent || 0, c.maxDiscount || 0, c.minOrder || 0,
          !!c.freeDelivery, c.discountAmount || 0
        ]
      );
    }
  }

  // 5. Payment Settings
  const [payRows] = await pool.query('SELECT COUNT(*) as count FROM payment_settings WHERE id = "default"');
  if (payRows[0].count === 0) {
    const jsonSettings = readData('payment-settings.json');
    await pool.query(
      'INSERT INTO payment_settings (id, settings_json) VALUES ("default", ?)',
      [JSON.stringify(jsonSettings)]
    );
  }

  // 6. Orders
  const [ordRows] = await pool.query('SELECT COUNT(*) as count FROM orders');
  if (ordRows[0].count === 0) {
    const jsonOrders = readData('orders.json');
    for (const o of jsonOrders) {
      await pool.query(
        `INSERT IGNORE INTO orders 
        (id, createdAt, status, deliveryTimeEst, subtotal, deliveryFee, handlingFee, tip, discount, couponCode, total, address, paymentMethod, paymentStatus, paymentDetails, rider, items)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          o.id, o.createdAt, o.status, o.deliveryTimeEst,
          o.subtotal, o.deliveryFee, o.handlingFee, o.tip, o.discount, o.couponCode, o.total,
          JSON.stringify(o.address || {}), o.paymentMethod, o.paymentStatus,
          JSON.stringify(o.paymentDetails || {}), JSON.stringify(o.rider || {}), JSON.stringify(o.items || [])
        ]
      );
    }
  }
}

async function refreshCounts() {
  if (pool && dbStatus.connected) {
    try {
      const [[p]] = await pool.query('SELECT COUNT(*) as count FROM products');
      const [[c]] = await pool.query('SELECT COUNT(*) as count FROM categories');
      const [[o]] = await pool.query('SELECT COUNT(*) as count FROM orders');
      dbStatus.counts = { products: p.count, categories: c.count, orders: o.count };
    } catch (e) {
      // fallback
    }
  } else {
    const prods = readData('products.json');
    const cats = readData('categories.json');
    const ords = readData('orders.json');
    dbStatus.counts = { products: prods.length, categories: cats.length, orders: ords.length };
  }
}

// ==================== REPOSITORY METHODS ====================

// 1. Products
async function getProducts({ category, brand, search, sort }) {
  if (pool && dbStatus.connected) {
    try {
      let query = 'SELECT * FROM products WHERE 1=1';
      const params = [];

      if (category && category !== 'all') {
        query += ' AND LOWER(category) = LOWER(?)';
        params.push(category);
      }

      if (brand) {
        query += ' AND LOWER(brand) = LOWER(?)';
        params.push(brand);
      }

      if (search) {
        const term = `%${search.toLowerCase().trim()}%`;
        query += ' AND (LOWER(name) LIKE ? OR LOWER(brand) LIKE ? OR LOWER(category) LIKE ? OR LOWER(description) LIKE ?)';
        params.push(term, term, term, term);
      }

      if (sort === 'price-low') {
        query += ' ORDER BY price ASC';
      } else if (sort === 'price-high') {
        query += ' ORDER BY price DESC';
      } else if (sort === 'rating') {
        query += ' ORDER BY rating DESC';
      } else if (sort === 'discount') {
        query += ' ORDER BY ((mrp - price)/mrp) DESC';
      } else {
        query += ' ORDER BY created_at DESC';
      }

      const [rows] = await pool.query(query, params);
      return rows.map(r => ({
        ...r,
        price: Number(r.price),
        mrp: Number(r.mrp),
        rating: Number(r.rating),
        inStock: Boolean(r.inStock)
      }));
    } catch (err) {
      console.error('MySQL getProducts error, using fallback:', err.message);
    }
  }

  // Fallback
  let products = readData('products.json');
  if (category && category !== 'all') {
    products = products.filter(p => p.category?.toLowerCase() === category.toLowerCase());
  }
  if (brand) {
    products = products.filter(p => p.brand?.toLowerCase() === brand.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase().trim();
    products = products.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
  }
  if (sort === 'price-low') products.sort((a, b) => a.price - b.price);
  else if (sort === 'price-high') products.sort((a, b) => b.price - a.price);
  else if (sort === 'rating') products.sort((a, b) => b.rating - a.rating);
  else if (sort === 'discount') products.sort((a, b) => ((b.mrp - b.price)/b.mrp) - ((a.mrp - a.price)/a.mrp));

  return products;
}

async function getProductById(id) {
  if (pool && dbStatus.connected) {
    try {
      const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
      if (rows.length > 0) {
        const r = rows[0];
        return {
          ...r,
          price: Number(r.price),
          mrp: Number(r.mrp),
          rating: Number(r.rating),
          inStock: Boolean(r.inStock)
        };
      }
      return null;
    } catch (err) {
      console.error('MySQL getProductById error, fallback:', err.message);
    }
  }

  const products = readData('products.json');
  return products.find(p => p.id === id) || null;
}

async function createProduct(prodData) {
  const newProduct = {
    id: prodData.id || 'p' + Date.now(),
    name: prodData.name,
    brand: prodData.brand || 'QuickBasket Fresh',
    category: prodData.category || 'veg-fruits',
    unit: prodData.unit || '1 unit',
    price: Number(prodData.price),
    mrp: Number(prodData.mrp) || Number(prodData.price),
    rating: Number(prodData.rating) || 4.8,
    reviewsCount: Number(prodData.reviewsCount) || 1,
    deliveryTime: prodData.deliveryTime || '10 mins',
    image: prodData.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80',
    inStock: prodData.inStock !== undefined ? Boolean(prodData.inStock) : true,
    stock: Number(prodData.stock) || 50,
    description: prodData.description || ''
  };

  if (pool && dbStatus.connected) {
    try {
      await pool.query(
        `INSERT INTO products 
        (id, name, brand, category, unit, price, mrp, rating, reviewsCount, deliveryTime, image, inStock, stock, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newProduct.id, newProduct.name, newProduct.brand, newProduct.category, newProduct.unit,
          newProduct.price, newProduct.mrp, newProduct.rating, newProduct.reviewsCount,
          newProduct.deliveryTime, newProduct.image, newProduct.inStock, newProduct.stock, newProduct.description
        ]
      );
      await refreshCounts();
    } catch (err) {
      console.error('MySQL createProduct error, writing fallback:', err.message);
    }
  }

  // Always keep fallback json in sync
  const products = readData('products.json');
  products.unshift(newProduct);
  writeData('products.json', products);

  return newProduct;
}

async function updateProduct(id, updates) {
  let updated = null;

  if (pool && dbStatus.connected) {
    try {
      const allowed = ['name', 'brand', 'category', 'unit', 'price', 'mrp', 'stock', 'inStock', 'image', 'description'];
      const setParts = [];
      const values = [];

      for (const key of allowed) {
        if (updates[key] !== undefined) {
          setParts.push(`\`${key}\` = ?`);
          values.push(updates[key]);
        }
      }

      if (setParts.length > 0) {
        values.push(id);
        await pool.query(`UPDATE products SET ${setParts.join(', ')} WHERE id = ?`, values);
        const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
        if (rows.length > 0) {
          updated = {
            ...rows[0],
            price: Number(rows[0].price),
            mrp: Number(rows[0].mrp),
            rating: Number(rows[0].rating),
            inStock: Boolean(rows[0].inStock)
          };
        }
      }
    } catch (err) {
      console.error('MySQL updateProduct error, fallback:', err.message);
    }
  }

  // Keep JSON store in sync
  const products = readData('products.json');
  const index = products.findIndex(p => p.id === id);
  if (index !== -1) {
    products[index] = { ...products[index], ...updates };
    writeData('products.json', products);
    if (!updated) updated = products[index];
  }

  return updated;
}

async function deleteProduct(id) {
  if (pool && dbStatus.connected) {
    try {
      await pool.query('DELETE FROM products WHERE id = ?', [id]);
      await refreshCounts();
    } catch (err) {
      console.error('MySQL deleteProduct error, fallback:', err.message);
    }
  }

  const products = readData('products.json');
  const filtered = products.filter(p => p.id !== id);
  writeData('products.json', filtered);
  return true;
}

// 2. Categories
async function getCategories() {
  if (pool && dbStatus.connected) {
    try {
      const [rows] = await pool.query('SELECT * FROM categories ORDER BY id ASC');
      if (rows.length > 0) return rows;
    } catch (err) {
      console.error('MySQL getCategories error, fallback:', err.message);
    }
  }
  return readData('categories.json');
}

// 3. Addresses
async function getAddresses() {
  if (pool && dbStatus.connected) {
    try {
      const [rows] = await pool.query('SELECT * FROM addresses ORDER BY created_at DESC');
      if (rows.length > 0) return rows;
    } catch (err) {
      console.error('MySQL getAddresses error, fallback:', err.message);
    }
  }
  return readData('addresses.json');
}

async function createAddress(addr) {
  const newAddr = {
    id: addr.id || 'addr-' + Date.now(),
    tag: addr.tag || 'Home',
    recipient: addr.recipient || 'Customer',
    phone: addr.phone || '+91 99999 99999',
    flat: addr.flat,
    area: addr.area,
    city: addr.city || 'Bengaluru',
    pincode: addr.pincode,
    eta: addr.eta || '8-10 MINS'
  };

  if (pool && dbStatus.connected) {
    try {
      await pool.query(
        `INSERT INTO addresses (id, tag, recipient, phone, flat, area, city, pincode, eta)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [newAddr.id, newAddr.tag, newAddr.recipient, newAddr.phone, newAddr.flat, newAddr.area, newAddr.city, newAddr.pincode, newAddr.eta]
      );
    } catch (err) {
      console.error('MySQL createAddress error:', err.message);
    }
  }

  const addresses = readData('addresses.json');
  addresses.push(newAddr);
  writeData('addresses.json', addresses);
  return newAddr;
}

// 4. Coupons
async function getCoupons() {
  if (pool && dbStatus.connected) {
    try {
      const [rows] = await pool.query('SELECT * FROM coupons');
      if (rows.length > 0) return rows;
    } catch (err) {
      console.error('MySQL getCoupons error:', err.message);
    }
  }
  return readData('coupons.json');
}

// 5. Orders
async function getOrders() {
  if (pool && dbStatus.connected) {
    try {
      const [rows] = await pool.query('SELECT * FROM orders ORDER BY createdAt DESC');
      return rows.map(r => ({
        ...r,
        subtotal: Number(r.subtotal),
        deliveryFee: Number(r.deliveryFee),
        handlingFee: Number(r.handlingFee),
        tip: Number(r.tip),
        discount: Number(r.discount),
        total: Number(r.total),
        address: typeof r.address === 'string' ? JSON.parse(r.address) : r.address,
        paymentDetails: typeof r.paymentDetails === 'string' ? JSON.parse(r.paymentDetails) : r.paymentDetails,
        rider: typeof r.rider === 'string' ? JSON.parse(r.rider) : r.rider,
        items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items
      }));
    } catch (err) {
      console.error('MySQL getOrders error:', err.message);
    }
  }
  return readData('orders.json');
}

async function getOrderById(id) {
  if (pool && dbStatus.connected) {
    try {
      const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
      if (rows.length > 0) {
        const r = rows[0];
        return {
          ...r,
          subtotal: Number(r.subtotal),
          deliveryFee: Number(r.deliveryFee),
          handlingFee: Number(r.handlingFee),
          tip: Number(r.tip),
          discount: Number(r.discount),
          total: Number(r.total),
          address: typeof r.address === 'string' ? JSON.parse(r.address) : r.address,
          paymentDetails: typeof r.paymentDetails === 'string' ? JSON.parse(r.paymentDetails) : r.paymentDetails,
          rider: typeof r.rider === 'string' ? JSON.parse(r.rider) : r.rider,
          items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items
        };
      }
    } catch (err) {
      console.error('MySQL getOrderById error:', err.message);
    }
  }
  const orders = readData('orders.json');
  return orders.find(o => o.id === id) || null;
}

async function createOrder(orderData) {
  const newOrder = {
    ...orderData,
    id: orderData.id || 'ORD-' + Math.floor(100000 + Math.random() * 900000),
    createdAt: orderData.createdAt || new Date().toISOString()
  };

  if (pool && dbStatus.connected) {
    try {
      await pool.query(
        `INSERT INTO orders 
        (id, createdAt, status, deliveryTimeEst, subtotal, deliveryFee, handlingFee, tip, discount, couponCode, total, address, paymentMethod, paymentStatus, paymentDetails, rider, items)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newOrder.id, newOrder.createdAt, newOrder.status, newOrder.deliveryTimeEst,
          newOrder.subtotal, newOrder.deliveryFee, newOrder.handlingFee, newOrder.tip,
          newOrder.discount, newOrder.couponCode || null, newOrder.total,
          JSON.stringify(newOrder.address || {}), newOrder.paymentMethod, newOrder.paymentStatus,
          JSON.stringify(newOrder.paymentDetails || {}), JSON.stringify(newOrder.rider || {}),
          JSON.stringify(newOrder.items || [])
        ]
      );
      await refreshCounts();
    } catch (err) {
      console.error('MySQL createOrder error:', err.message);
    }
  }

  // Update product stock in MySQL & JSON
  if (newOrder.items && newOrder.items.length) {
    for (const item of newOrder.items) {
      if (pool && dbStatus.connected) {
        try {
          await pool.query('UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ?', [item.quantity, item.id]);
        } catch (e) {}
      }
    }
  }

  const orders = readData('orders.json');
  orders.unshift(newOrder);
  writeData('orders.json', orders);

  return newOrder;
}

async function updateOrderStatus(id, status) {
  if (pool && dbStatus.connected) {
    try {
      await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    } catch (err) {
      console.error('MySQL updateOrderStatus error:', err.message);
    }
  }

  const orders = readData('orders.json');
  const order = orders.find(o => o.id === id);
  if (order) {
    order.status = status;
    writeData('orders.json', orders);
  }
  return order;
}

// 6. Payment Settings
async function getPaymentSettings() {
  if (pool && dbStatus.connected) {
    try {
      const [rows] = await pool.query('SELECT settings_json FROM payment_settings WHERE id = "default"');
      if (rows.length > 0) {
        const val = rows[0].settings_json;
        return typeof val === 'string' ? JSON.parse(val) : val;
      }
    } catch (err) {
      console.error('MySQL getPaymentSettings error:', err.message);
    }
  }
  return readData('payment-settings.json');
}

async function updatePaymentSettings(newSettings) {
  if (pool && dbStatus.connected) {
    try {
      await pool.query(
        `INSERT INTO payment_settings (id, settings_json) VALUES ("default", ?)
        ON DUPLICATE KEY UPDATE settings_json = ?`,
        [JSON.stringify(newSettings), JSON.stringify(newSettings)]
      );
    } catch (err) {
      console.error('MySQL updatePaymentSettings error:', err.message);
    }
  }

  writeData('payment-settings.json', newSettings);
  return newSettings;
}

function getDbStatus() {
  return { ...dbStatus };
}

async function reconnectDb() {
  return await initDatabase();
}

module.exports = {
  initDatabase,
  getDbStatus,
  reconnectDb,
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getAddresses,
  createAddress,
  getCoupons,
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  getPaymentSettings,
  updatePaymentSettings
};

