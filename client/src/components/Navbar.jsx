import React from 'react';
import { ShoppingCart, MapPin, Search, ChevronDown, Zap, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLocation } from '../context/LocationContext';

export default function Navbar({ searchTerm, setSearchTerm, activeTab, setActiveTab }) {
  const { totalItems, subtotal, setIsCartOpen } = useCart();
  const { currentAddress, setIsLocationModalOpen } = useLocation();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo & Delivery Time */}
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => setActiveTab('shop')}
              className="text-left focus:outline-none flex flex-col group"
            >
              <div className="flex items-center">
                <span className="text-3xl font-black tracking-tight text-[#f7cb44]">quick</span>
                <span className="text-3xl font-black tracking-tight text-[#0c831f]">basket</span>
                <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-green-100 text-[#0c831f] rounded">
                  10 Min
                </span>
              </div>
              <span className="text-[11px] font-semibold text-gray-400 tracking-wide">
                Daily Groceries & Essentials
              </span>
            </button>

            {/* Location & ETA */}
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="hidden md:flex items-center text-left py-1.5 px-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all max-w-[220px]"
            >
              <div className="mr-2 text-[#0c831f] flex flex-col items-center">
                <Zap className="w-5 h-5 fill-[#0c831f] text-[#0c831f] animate-pulse" />
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-black uppercase text-gray-900 tracking-wider">
                    Delivery in 8 MINS
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                </div>
                <div className="text-[11px] text-gray-500 truncate font-medium">
                  {currentAddress?.flat}, {currentAddress?.area}
                </div>
              </div>
            </button>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-xl mx-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder='Search "milk", "lays", "paneer", "atta", "coca cola"...'
                className="w-full pl-11 pr-4 py-2.5 bg-[#f4f6fb] border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#0c831f] focus:ring-2 focus:ring-green-100 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-semibold text-gray-400 hover:text-gray-600"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons: Admin Toggle, Orders, Cart */}
          <div className="flex items-center space-x-3">
            {/* View Mode Switcher: Shop / Orders / Admin */}
            <div className="hidden sm:flex items-center bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('shop')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'shop'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Store
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'orders'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                My Orders
              </button>
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'admin'
                    ? 'bg-[#0c831f] text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin
              </button>
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center bg-[#0c831f] hover:bg-[#086616] text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all transform active:scale-95 space-x-3"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-white" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#f7cb44] text-gray-900 font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </div>
              <div className="flex flex-col text-left leading-tight">
                {totalItems > 0 ? (
                  <>
                    <span className="text-[11px] font-semibold text-green-100 uppercase tracking-wider">
                      {totalItems} {totalItems === 1 ? 'item' : 'items'}
                    </span>
                    <span className="text-sm font-extrabold">₹{subtotal}</span>
                  </>
                ) : (
                  <span className="font-bold text-sm">My Cart</span>
                )}
              </div>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}

