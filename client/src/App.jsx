import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import BannerCarousel from './components/BannerCarousel';
import CategoryNav from './components/CategoryNav';
import ProductGrid from './components/ProductGrid';
import CartDrawer from './components/CartDrawer';
import OrderTrackingModal from './components/OrderTrackingModal';
import AddressModal from './components/AddressModal';
import OrdersView from './components/OrdersView';
import AdminPanel from './components/AdminPanel';
import { CartProvider, useCart } from './context/CartContext';
import { LocationProvider } from './context/LocationContext';
import { Zap, Clock, ShieldCheck, HeartHandshake, ShoppingBag, ArrowRight } from 'lucide-react';

function ShopContent() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('featured');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('shop'); // 'shop', 'orders', 'admin'
  const [trackedOrder, setTrackedOrder] = useState(null);

  const { totalItems, subtotal, setIsCartOpen } = useCart();

  // Load Categories & Initial Products
  const loadData = () => {
    setLoading(true);

    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.log('Offline categories fallback'));

    let url = '/api/products?';
    if (selectedCategory && selectedCategory !== 'all') {
      url += `category=${selectedCategory}&`;
    }
    if (searchTerm) {
      url += `search=${encodeURIComponent(searchTerm)}&`;
    }
    if (sortOption !== 'featured') {
      url += `sort=${sortOption}&`;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch products', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, sortOption]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      loadData();
    }, 250);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const currentCategoryObj = categories.find(c => c.id === selectedCategory);
  const categoryTitle = selectedCategory === 'all' 
    ? (searchTerm ? `Search results for "${searchTerm}"` : 'All Groceries & Essentials')
    : currentCategoryObj?.name;

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f6fb]">
      
      {/* Sticky Quick-Commerce Navbar */}
      <Navbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        
        {activeTab === 'shop' && (
          <>
            {/* Promo Hero Carousel */}
            {!searchTerm && (
              <BannerCarousel
                onSelectCategory={(catId) => {
                  setSelectedCategory(catId);
                }}
              />
            )}

            {/* Quick Delivery Feature Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="bg-white p-3 rounded-2xl border border-gray-100 flex items-center space-x-3 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                  <Zap className="w-5 h-5 fill-amber-500 text-amber-500" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">10-Min Delivery</h4>
                  <p className="text-[11px] text-gray-500">Dark store network</p>
                </div>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-gray-100 flex items-center space-x-3 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-[#0c831f]">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">6 AM to 2 AM</h4>
                  <p className="text-[11px] text-gray-500">Order anytime</p>
                </div>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-gray-100 flex items-center space-x-3 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">100% Quality</h4>
                  <p className="text-[11px] text-gray-500">Fresh from farm</p>
                </div>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-gray-100 flex items-center space-x-3 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">Free Returns</h4>
                  <p className="text-[11px] text-gray-500">Instant refund</p>
                </div>
              </div>
            </div>

            {/* Horizontal Categories */}
            <CategoryNav
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={(id) => setSelectedCategory(id)}
            />

            {/* Product Grid */}
            <ProductGrid
              products={products}
              selectedCategory={selectedCategory}
              categoryName={categoryTitle}
              loading={loading}
              sortOption={sortOption}
              setSortOption={setSortOption}
            />
          </>
        )}

        {/* Orders View */}
        {activeTab === 'orders' && (
          <OrdersView onTrackOrder={(order) => setTrackedOrder(order)} />
        )}

        {/* Admin Inventory & Dark Store Panel */}
        {activeTab === 'admin' && (
          <AdminPanel onProductUpdated={loadData} />
        )}

      </main>

      {/* Floating Bottom Cart Bar for Quick Checkout */}
      {totalItems > 0 && activeTab === 'shop' && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-11/12 max-w-md">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-[#0c831f] hover:bg-[#086317] text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between transform active:scale-98 transition-all ring-4 ring-white"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-green-100 block uppercase tracking-wider">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'} in Cart
                </span>
                <span className="text-base font-black">₹{subtotal}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white text-[#0c831f] font-black text-xs px-4 py-2 rounded-xl uppercase tracking-wider shadow-sm">
              <span>View Cart</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer onOrderPlaced={(newOrder) => setTrackedOrder(newOrder)} />

      {/* Live Order Tracking Modal */}
      {trackedOrder && (
        <OrderTrackingModal
          order={trackedOrder}
          onClose={() => setTrackedOrder(null)}
        />
      )}

      {/* Delivery Location Selector Modal */}
      <AddressModal />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center mb-2 justify-center sm:justify-start">
                <span className="text-2xl font-black text-[#f7cb44]">quick</span>
                <span className="text-2xl font-black text-[#0c831f]">basket</span>
                <span className="text-xs font-bold text-gray-400 ml-2 bg-gray-100 px-2 py-0.5 rounded">10-Min Delivery</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Superfast quick-commerce delivery engine. Built with modern React and high-performance Express.js REST APIs.
              </p>
            </div>

            <div>
              <h5 className="text-xs font-black uppercase text-gray-900 tracking-wider mb-3">Categories</h5>
              <ul className="text-xs space-y-2 text-gray-500 font-medium">
                <li>Vegetables & Fresh Fruits</li>
                <li>Dairy, Bread & Eggs</li>
                <li>Munchies & Namkeen</li>
                <li>Cold Drinks & Fresh Juices</li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-black uppercase text-gray-900 tracking-wider mb-3">Guarantees</h5>
              <ul className="text-xs space-y-2 text-gray-500 font-medium">
                <li>⚡ 10-Minute Dark Store Dispatch</li>
                <li>🌿 Farm-Fresh Quality Check</li>
                <li>🏷️ Best Everyday MRP Discounts</li>
                <li>💳 UPI, Cards & Cash on Delivery</li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-black uppercase text-gray-900 tracking-wider mb-3">Quick Navigation</h5>
              <div className="flex flex-col space-y-2 text-xs font-bold">
                <button onClick={() => setActiveTab('shop')} className="text-left text-gray-600 hover:text-[#0c831f]">
                  🏪 Browse Catalog
                </button>
                <button onClick={() => setActiveTab('orders')} className="text-left text-gray-600 hover:text-[#0c831f]">
                  📦 Order History & Live Track
                </button>
                <button onClick={() => setActiveTab('admin')} className="text-left text-gray-600 hover:text-[#0c831f]">
                  ⚙️ Dark Store Inventory & Admin
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400">
            <p>© 2026 QuickBasket • 10-Minute Grocery Delivery</p>
            <p className="mt-2 sm:mt-0 font-medium text-gray-500">Delivering happiness in 10 minutes</p>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <LocationProvider>
      <CartProvider>
        <ShopContent />
      </CartProvider>
    </LocationProvider>
  );
}
