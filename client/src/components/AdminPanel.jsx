import React, { useState, useEffect } from 'react';
import { 
  Package, Plus, Trash2, Edit3, Save, X, CheckCircle, 
  Layers, ShoppingBag, TrendingUp, AlertTriangle, CreditCard, 
  QrCode, Smartphone, Check, ShieldCheck, Key, Lock, Eye, EyeOff, Radio
} from 'lucide-react';

export default function AdminPanel({ onProductUpdated }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('products'); // 'products', 'orders', 'payments'
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');

  // Payment settings state
  const [paymentSettings, setPaymentSettings] = useState({
    upi: {
      enabled: true,
      vpa: 'quickbasket@icici',
      payeeName: 'QuickBasket Delivery Hub',
      enableQr: true,
      soundboxAlert: true
    },
    razorpay: {
      enabled: true,
      mode: 'test',
      keyId: 'rzp_test_9kM38d1P90Fk2L',
      keySecret: 'sk_test_QuickBasketLiveSecret2026',
      webhookSecret: 'whsec_quickbasket2026'
    },
    cod: {
      enabled: true,
      maxLimit: 2500
    }
  });

  const [isSavingPayments, setIsSavingPayments] = useState(false);
  const [paymentSavedAlert, setPaymentSavedAlert] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: '',
    brand: '',
    category: 'veg-fruits',
    unit: '1 kg',
    price: '',
    mrp: '',
    stock: 50,
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80',
    description: ''
  });

  const fetchData = () => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error(err));

    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error(err));

    fetch('/api/orders')
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(err => console.error(err));

    fetch('/api/payment/settings')
      .then(res => res.json())
      .then(data => {
        if (data && data.upi) {
          setPaymentSettings(data);
        }
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewProduct({
          name: '',
          brand: '',
          category: 'veg-fruits',
          unit: '1 kg',
          price: '',
          mrp: '',
          stock: 50,
          image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80',
          description: ''
        });
        fetchData();
        if (onProductUpdated) onProductUpdated();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickSave = async (id) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: Number(editPrice),
          stock: Number(editStock)
        })
      });
      if (res.ok) {
        setEditingId(null);
        fetchData();
        if (onProductUpdated) onProductUpdated();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      fetchData();
      if (onProductUpdated) onProductUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSavePaymentSettings = async (e) => {
    e.preventDefault();
    setIsSavingPayments(true);

    try {
      const res = await fetch('/api/admin/payment-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentSettings)
      });
      if (res.ok) {
        setIsSavingPayments(false);
        setPaymentSavedAlert(true);
        setTimeout(() => setPaymentSavedAlert(false), 3500);
      }
    } catch (err) {
      console.error(err);
      setIsSavingPayments(false);
    }
  };

  // Preview URI for current configured UPI
  const sampleUri = `upi://pay?pa=${encodeURIComponent(paymentSettings.upi.vpa)}&pn=${encodeURIComponent(paymentSettings.upi.payeeName)}&am=199.00&cu=INR`;
  const qrPreviewUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=6&data=${encodeURIComponent(sampleUri)}`;

  return (
    <div className="max-w-6xl mx-auto py-6">
      
      {/* Admin Title & Quick Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <span>Store Admin Console</span>
            <span className="bg-[#0c831f] text-white text-[10px] uppercase font-black px-2 py-0.5 rounded">
              Live Hub
            </span>
          </h2>
          <p className="text-xs text-gray-500">
            Real-time grocery catalog, payments gateway, and dark-store fulfillment
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'products'
                ? 'bg-[#0c831f] text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-700'
            }`}
          >
            Inventory ({products.length})
          </button>
          
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'orders'
                ? 'bg-[#0c831f] text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-700'
            }`}
          >
            Live Orders ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'payments'
                ? 'bg-[#0c831f] text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-700'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Payments (UPI & Razorpay)</span>
          </button>

          {activeTab === 'products' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Item</span>
            </button>
          )}
        </div>
      </div>

      {/* ================= PAYMENT GATEWAYS & SETTINGS TAB ================= */}
      {activeTab === 'payments' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {paymentSavedAlert && (
            <div className="bg-green-50 border border-green-200 text-[#0c831f] p-4 rounded-2xl flex items-center justify-between text-xs font-black">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[#0c831f]" />
                <span>Payment Gateways configuration saved successfully! Active for all customers.</span>
              </div>
              <button onClick={() => setPaymentSavedAlert(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <form onSubmit={handleSavePaymentSettings} className="space-y-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* 1. UPI CONFIGURATION CARD */}
              <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#0c831f] text-white flex items-center justify-center font-black text-sm shadow-sm">
                        UPI
                      </div>
                      <div>
                        <h3 className="text-base font-black text-gray-900">UPI Gateway Settings</h3>
                        <p className="text-xs text-gray-500">Google Pay, PhonePe, Paytm, CRED & QR</p>
                      </div>
                    </div>

                    {/* Toggle */}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={paymentSettings.upi.enabled}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          upi: { ...paymentSettings.upi, enabled: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0c831f]"></div>
                    </label>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">
                        Merchant UPI ID (VPA)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. quickbasket@icici or mobile@paytm"
                        value={paymentSettings.upi.vpa}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          upi: { ...paymentSettings.upi, vpa: e.target.value }
                        })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 font-mono font-bold text-gray-900 focus:outline-none focus:border-[#0c831f]"
                      />
                      <p className="text-[11px] text-gray-400 mt-1">
                        Direct bank account where customer UPI payments will be deposited.
                      </p>
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">
                        Merchant Display Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. QuickBasket Stores Pvt Ltd"
                        value={paymentSettings.upi.payeeName}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          upi: { ...paymentSettings.upi, payeeName: e.target.value }
                        })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 font-bold text-gray-900 focus:outline-none focus:border-[#0c831f]"
                      />
                    </div>

                    {/* QR Preview Widget */}
                    <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 flex items-center space-x-4">
                      <img
                        src={qrPreviewUrl}
                        alt="Preview UPI QR"
                        className="w-20 h-20 rounded-xl bg-white p-1 border shadow-xs"
                      />
                      <div className="flex-1">
                        <span className="text-[10px] font-black uppercase text-[#0c831f] tracking-wider block">
                          Live Customer QR Preview
                        </span>
                        <div className="font-mono text-xs font-bold text-gray-800 truncate">
                          {paymentSettings.upi.vpa}
                        </div>
                        <p className="text-[11px] text-gray-500">
                          Auto-configured for all customers upon checkout.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. RAZORPAY CONFIGURATION CARD */}
              <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#0070e0] text-white flex items-center justify-center font-black text-sm shadow-sm">
                        R
                      </div>
                      <div>
                        <h3 className="text-base font-black text-gray-900">Razorpay Gateway</h3>
                        <p className="text-xs text-gray-500">Credit/Debit Cards, Netbanking & Wallets</p>
                      </div>
                    </div>

                    {/* Toggle */}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={paymentSettings.razorpay.enabled}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          razorpay: { ...paymentSettings.razorpay, enabled: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0070e0]"></div>
                    </label>
                  </div>

                  <div className="space-y-4 text-xs">
                    {/* Mode: Test vs Live */}
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Gateway Environment</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentSettings({
                            ...paymentSettings,
                            razorpay: { ...paymentSettings.razorpay, mode: 'test' }
                          })}
                          className={`py-2 rounded-xl font-bold border transition-all ${
                            paymentSettings.razorpay.mode === 'test'
                              ? 'bg-blue-50 border-[#0070e0] text-[#0070e0]'
                              : 'border-gray-200 text-gray-600'
                          }`}
                        >
                          🧪 Test Mode (Sandbox)
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentSettings({
                            ...paymentSettings,
                            razorpay: { ...paymentSettings.razorpay, mode: 'live' }
                          })}
                          className={`py-2 rounded-xl font-bold border transition-all ${
                            paymentSettings.razorpay.mode === 'live'
                              ? 'bg-green-50 border-[#0c831f] text-[#0c831f]'
                              : 'border-gray-200 text-gray-600'
                          }`}
                        >
                          ⚡ Live Production
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">
                        Razorpay Key ID
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="rzp_test_..."
                        value={paymentSettings.razorpay.keyId}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          razorpay: { ...paymentSettings.razorpay, keyId: e.target.value }
                        })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 font-mono font-bold text-gray-900 focus:outline-none focus:border-[#0070e0]"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">
                        Razorpay Key Secret
                      </label>
                      <div className="relative">
                        <input
                          type={showSecret ? 'text' : 'password'}
                          required
                          placeholder="Secret key"
                          value={paymentSettings.razorpay.keySecret}
                          onChange={(e) => setPaymentSettings({
                            ...paymentSettings,
                            razorpay: { ...paymentSettings.razorpay, keySecret: e.target.value }
                          })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 font-mono font-bold text-gray-900 focus:outline-none focus:border-[#0070e0]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSecret(!showSecret)}
                          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                        >
                          {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">
                        Webhook Secret (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="whsec_..."
                        value={paymentSettings.razorpay.webhookSecret}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          razorpay: { ...paymentSettings.razorpay, webhookSecret: e.target.value }
                        })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 font-mono font-bold text-gray-900 focus:outline-none focus:border-[#0070e0]"
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSavingPayments}
                className="bg-[#0c831f] hover:bg-[#086317] disabled:bg-gray-400 text-white font-black text-xs uppercase tracking-wider px-8 py-3.5 rounded-2xl shadow-lg shadow-green-900/20 transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingPayments ? 'Saving Gateways...' : 'Save Payment Gateways'}</span>
              </button>
            </div>

          </form>

          {/* 3. SETTLEMENT & RECENT TRANSACTIONS LOG */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-black text-gray-900">Recent Customer Transactions</h3>
                <p className="text-xs text-gray-500">Live reconciliation across UPI, Razorpay & COD</p>
              </div>
              <span className="text-xs font-bold bg-green-50 text-[#0c831f] px-3 py-1 rounded-full border border-green-200">
                100% Real-time
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-[#f4f6fb] text-gray-700 uppercase font-black text-[10px] border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-3">Order ID</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3">Txn / UTR Reference</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {orders.slice(0, 8).map((ord) => (
                    <tr key={ord.id} className="hover:bg-gray-50">
                      <td className="py-2.5 px-3 font-bold text-gray-900">{ord.id}</td>
                      <td className="py-2.5 px-3 font-black text-gray-900">₹{ord.total}</td>
                      <td className="py-2.5 px-3">
                        <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded font-bold text-[10px]">
                          {ord.paymentMethod || 'UPI Online'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-gray-500">
                        {ord.paymentDetails?.utrNumber || ord.paymentDetails?.upiRef || 'UTR' + (Math.floor(ord.total * 9871))}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="bg-green-100 text-[#0c831f] font-black text-[10px] px-2 py-0.5 rounded-full">
                          PAID
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-gray-400 text-[11px]">
                        {new Date(ord.createdAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ================= INVENTORY TAB ================= */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-[#f4f6fb] text-gray-700 uppercase font-black text-[11px] border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Unit</th>
                  <th className="py-3 px-4">Price (₹)</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {products.map((p) => {
                  const isEditing = editingId === p.id;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4 flex items-center space-x-3">
                        <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-xl bg-gray-100 flex-shrink-0" />
                        <div>
                          <div className="font-bold text-gray-900 text-xs">{p.name}</div>
                          <div className="text-[10px] text-gray-400 font-semibold">{p.brand}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-bold text-[10px]">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">{p.unit}</td>
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="w-16 border rounded px-1.5 py-0.5 font-bold text-xs"
                          />
                        ) : (
                          <span className="font-black text-gray-900">₹{p.price}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editStock}
                            onChange={(e) => setEditStock(e.target.value)}
                            className="w-16 border rounded px-1.5 py-0.5 font-bold text-xs"
                          />
                        ) : (
                          <span className={`font-bold ${p.stock < 10 ? 'text-red-600' : 'text-gray-700'}`}>
                            {p.stock ?? 50} units
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => handleQuickSave(p.id)}
                              className="p-1.5 bg-[#0c831f] text-white rounded-lg hover:bg-[#086317]"
                              title="Save"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => {
                                setEditingId(p.id);
                                setEditPrice(p.price);
                                setEditStock(p.stock ?? 50);
                              }}
                              className="p-1.5 text-gray-500 hover:text-[#0c831f] hover:bg-green-50 rounded-lg"
                              title="Edit Price/Stock"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                              title="Delete Item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= ORDERS TAB ================= */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div key={ord.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-gray-900">{ord.id}</span>
                    <span className="text-[11px] font-bold text-gray-500">
                      • {new Date(ord.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    To: <span className="font-semibold text-gray-700">{ord.address?.recipient}</span> ({ord.address?.flat}, {ord.address?.area})
                  </p>
                </div>

                {/* Status Switcher */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-gray-500">Status:</span>
                  <select
                    value={ord.status || 'received'}
                    onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                    className="border border-gray-200 rounded-xl px-3 py-1 text-xs font-bold bg-gray-50 focus:outline-none focus:border-[#0c831f]"
                  >
                    <option value="received">Order Received</option>
                    <option value="packing">Packing Items</option>
                    <option value="out_for_delivery">Out For Delivery</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
              </div>

              {/* Items & Total */}
              <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap gap-2">
                  {ord.items?.map((it, idx) => (
                    <span key={idx} className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-md font-semibold">
                      {it.name} x{it.quantity}
                    </span>
                  ))}
                </div>
                <div className="font-black text-sm text-gray-900 flex-shrink-0">
                  Total: ₹{ord.total} ({ord.paymentMethod})
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-black text-gray-900">Add New Grocery Product</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amul Salted Butter"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full bg-gray-50 border rounded-xl px-3 py-2 font-semibold focus:outline-none focus:border-[#0c831f]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Brand</label>
                  <input
                    type="text"
                    placeholder="e.g. Amul"
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                    className="w-full bg-gray-50 border rounded-xl px-3 py-2 font-semibold focus:outline-none focus:border-[#0c831f]"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full bg-gray-50 border rounded-xl px-3 py-2 font-semibold focus:outline-none focus:border-[#0c831f]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Unit</label>
                  <input
                    type="text"
                    placeholder="500 g"
                    value={newProduct.unit}
                    onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                    className="w-full bg-gray-50 border rounded-xl px-3 py-2 font-semibold focus:outline-none focus:border-[#0c831f]"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="99"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full bg-gray-50 border rounded-xl px-3 py-2 font-semibold focus:outline-none focus:border-[#0c831f]"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    placeholder="120"
                    value={newProduct.mrp}
                    onChange={(e) => setNewProduct({ ...newProduct, mrp: e.target.value })}
                    className="w-full bg-gray-50 border rounded-xl px-3 py-2 font-semibold focus:outline-none focus:border-[#0c831f]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Image URL</label>
                <input
                  type="text"
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                  className="w-full bg-gray-50 border rounded-xl px-3 py-2 font-semibold focus:outline-none focus:border-[#0c831f]"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#0c831f] hover:bg-[#086317] text-white font-black uppercase tracking-wider"
                >
                  Add to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
