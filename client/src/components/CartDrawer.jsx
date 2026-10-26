import React, { useState } from 'react';
import { 
  X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, 
  Tag, ShieldCheck, Bike, CheckCircle2, ChevronRight, AlertCircle,
  Smartphone, CreditCard, Banknote, QrCode
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLocation } from '../context/LocationContext';
import UPIPaymentModal from './UPIPaymentModal';
import RazorpayModal from './RazorpayModal';

export default function CartDrawer({ onOrderPlaced }) {
  const { 
    cart, isCartOpen, setIsCartOpen, addToCart, removeFromCart, deleteItem,
    subtotal, totalSavings, deliveryFee, handlingFee, tip, setTip,
    appliedCoupon, setAppliedCoupon, couponDiscount, grandTotal, clearCart
  } = useCart();

  const { currentAddress, setIsLocationModalOpen } = useLocation();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI', 'Razorpay', 'COD'
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);
  const [gatewaySettings, setGatewaySettings] = useState(null);

  // Load gateway settings configured by Admin
  React.useEffect(() => {
    fetch('/api/payment/settings')
      .then(res => res.json())
      .then(data => setGatewaySettings(data))
      .catch(err => console.log('Using default gateway settings'));
  }, []);

  if (!isCartOpen) return null;

  const freeDeliveryThreshold = 199;
  const amountToFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const freeDeliveryProgress = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  const applyCouponCode = async (codeToTry) => {
    const code = (codeToTry || couponInput).trim();
    if (!code) return;

    setCouponError('');
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal })
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedCoupon(data);
        setCouponInput('');
      } else {
        setCouponError(data.message || 'Invalid coupon');
      }
    } catch (err) {
      // Fallback offline validation
      if (code.toUpperCase() === 'WELCOME50') {
        setAppliedCoupon({ code: 'WELCOME50', discountPercent: 20, maxDiscount: 50, description: '20% OFF up to ₹50' });
      } else if (code.toUpperCase() === 'FREESHIP') {
        setAppliedCoupon({ code: 'FREESHIP', freeDelivery: true, description: 'Free Delivery' });
      } else {
        setCouponError('Invalid coupon code');
      }
    }
  };

  const handleCheckoutClick = () => {
    if (cart.length === 0) return;
    if (paymentMethod === 'UPI') {
      setIsUpiModalOpen(true);
    } else if (paymentMethod === 'Razorpay') {
      setIsRazorpayModalOpen(true);
    } else {
      executeOrderPlacement({
        method: 'Cash on Delivery (COD)',
        status: 'PENDING'
      });
    }
  };

  const executeOrderPlacement = async (paymentDetails = null) => {
    setIsCheckingOut(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          address: currentAddress,
          paymentMethod: paymentMethod === 'UPI' ? 'UPI Online' : (paymentMethod === 'Razorpay' ? 'Razorpay Online' : 'Cash on Delivery'),
          paymentDetails,
          tip,
          couponCode: appliedCoupon?.code
        })
      });

      const newOrder = await res.json();
      clearCart();
      setIsUpiModalOpen(false);
      setIsRazorpayModalOpen(false);
      setIsCartOpen(false);
      setIsCheckingOut(false);
      if (onOrderPlaced) {
        onOrderPlaced(newOrder);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      // Fallback order for offline mode
      const dummyOrder = {
        id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
        createdAt: new Date().toISOString(),
        status: 'received',
        deliveryTimeEst: '10 mins',
        items: [...cart],
        subtotal,
        deliveryFee,
        handlingFee,
        tip,
        discount: couponDiscount,
        total: grandTotal,
        address: currentAddress,
        paymentMethod: paymentMethod === 'UPI' ? 'UPI (Google Pay / PhonePe)' : (paymentMethod === 'Razorpay' ? 'Razorpay Gateway' : 'Cash on Delivery'),
        paymentDetails,
        paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
        rider: {
          name: 'Arun Verma',
          phone: '+91 98451 92837',
          rating: 4.9,
          vehicle: 'Ather 450X (KA-05-EV-1920)'
        }
      };
      clearCart();
      setIsUpiModalOpen(false);
      setIsRazorpayModalOpen(false);
      setIsCartOpen(false);
      setIsCheckingOut(false);
      if (onOrderPlaced) {
        onOrderPlaced(dummyOrder);
      }
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <div 
          onClick={() => setIsCartOpen(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-md bg-[#f4f6fb] shadow-2xl flex flex-col h-full">
            
            {/* Header */}
            <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-[#0c831f]" />
                <h2 className="text-base font-extrabold text-gray-900">
                  My Cart ({cart.reduce((a, b) => a + b.quantity, 0)} items)
                </h2>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Contents */}
            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                  <ShoppingBag className="w-12 h-12 text-gray-300" />
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-1">Your cart is empty</h3>
                <p className="text-sm text-gray-500 max-w-xs mb-6">
                  Your favorite grocery essentials are just 10 minutes away!
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="bg-[#0c831f] hover:bg-[#086317] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                
                {/* Delivery ETA & Address Preview */}
                <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-[#0c831f]">
                      <Bike className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-gray-900 uppercase tracking-wider">
                        Delivery in 8-10 mins
                      </div>
                      <div className="text-[11px] text-gray-500 truncate max-w-[200px]">
                        {currentAddress?.flat}, {currentAddress?.area}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsLocationModalOpen(true)}
                    className="text-xs font-bold text-[#0c831f] hover:underline"
                  >
                    Change
                  </button>
                </div>

                {/* Free Delivery Goal Bar */}
                <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                    {amountToFreeDelivery > 0 ? (
                      <span className="text-gray-700">
                        Add <span className="text-[#0c831f]">₹{amountToFreeDelivery}</span> more for <span className="text-[#0c831f]">FREE Delivery</span>
                      </span>
                    ) : (
                      <span className="text-[#0c831f] flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> You unlocked FREE Delivery!
                      </span>
                    )}
                    <span className="text-gray-400">{freeDeliveryProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-[#0c831f] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${freeDeliveryProgress}%` }}
                    />
                  </div>
                </div>

                {/* Items List */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50 p-2">
                  {cart.map((item) => (
                    <div key={item.id} className="p-2.5 flex items-center justify-between gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 object-cover rounded-xl bg-gray-50 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-gray-900 truncate">{item.name}</h4>
                        <p className="text-[11px] text-gray-400">{item.unit}</p>
                        <div className="flex items-center space-x-1.5 mt-0.5">
                          <span className="text-xs font-black text-gray-900">₹{item.price}</span>
                          {item.mrp && item.mrp > item.price && (
                            <span className="text-[10px] text-gray-400 line-through">₹{item.mrp}</span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center bg-[#0c831f] text-white rounded-lg shadow-sm">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 hover:bg-[#086317] transition-colors"
                        >
                          <Minus className="w-3 h-3 stroke-[3]" />
                        </button>
                        <span className="px-2 font-black text-xs">{item.quantity}</span>
                        <button
                          onClick={() => addToCart(item)}
                          className="p-1 hover:bg-[#086317] transition-colors"
                        >
                          <Plus className="w-3 h-3 stroke-[3]" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupons Section */}
                <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-black text-gray-900 uppercase tracking-wider">
                      <Tag className="w-4 h-4 text-[#0c831f]" />
                      <span>Apply Coupon</span>
                    </div>
                    {appliedCoupon && (
                      <button
                        onClick={() => setAppliedCoupon(null)}
                        className="text-[11px] font-bold text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {appliedCoupon ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-2.5 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-black text-[#0c831f] tracking-wider uppercase">
                          {appliedCoupon.code} APPLIED
                        </span>
                        <p className="text-[11px] text-green-800">{appliedCoupon.description}</p>
                      </div>
                      <span className="text-xs font-black text-[#0c831f]">
                        -₹{couponDiscount}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          placeholder="Enter coupon code"
                          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs uppercase font-bold focus:outline-none focus:border-[#0c831f]"
                        />
                        <button
                          onClick={() => applyCouponCode(couponInput)}
                          className="bg-gray-900 text-white px-4 py-1.5 rounded-xl text-xs font-black hover:bg-black transition-all"
                        >
                          Apply
                        </button>
                      </div>

                      {/* Quick Coupon Suggestions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => applyCouponCode('WELCOME50')}
                          className="text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200 rounded-lg px-2 py-1 hover:bg-amber-100"
                        >
                          ⚡ WELCOME50 (₹50 OFF)
                        </button>
                        <button
                          onClick={() => applyCouponCode('FREESHIP')}
                          className="text-[10px] font-bold bg-green-50 text-green-900 border border-green-200 rounded-lg px-2 py-1 hover:bg-green-100"
                        >
                          🚚 FREESHIP
                        </button>
                      </div>

                      {couponError && (
                        <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {couponError}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Delivery Partner Tip */}
                <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-gray-900 uppercase tracking-wider">
                      Tip Delivery Partner
                    </span>
                    <span className="text-[11px] text-gray-400">100% goes to rider</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {[0, 10, 20, 30, 50].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setTip(amount)}
                        className={`py-1.5 rounded-xl text-xs font-black border transition-all ${
                          tip === amount
                            ? 'bg-[#0c831f] text-white border-[#0c831f] shadow-sm'
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {amount === 0 ? 'None' : `₹${amount}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bill Details */}
                <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm space-y-2 text-xs">
                  <h4 className="font-black text-gray-900 uppercase tracking-wider mb-2">Bill Summary</h4>
                  
                  <div className="flex justify-between text-gray-600 font-medium">
                    <span>Item Total</span>
                    <span className="font-bold text-gray-900">₹{subtotal}</span>
                  </div>

                  <div className="flex justify-between text-gray-600 font-medium">
                    <span>Delivery Fee</span>
                    {deliveryFee === 0 ? (
                      <span className="font-bold text-[#0c831f]">FREE</span>
                    ) : (
                      <span className="font-bold text-gray-900">₹{deliveryFee}</span>
                    )}
                  </div>

                  <div className="flex justify-between text-gray-600 font-medium">
                    <span>Handling / Platform Fee</span>
                    <span className="font-bold text-gray-900">₹{handlingFee}</span>
                  </div>

                  {tip > 0 && (
                    <div className="flex justify-between text-gray-600 font-medium">
                      <span>Delivery Partner Tip</span>
                      <span className="font-bold text-gray-900">₹{tip}</span>
                    </div>
                  )}

                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-[#0c831f] font-bold">
                      <span>Coupon Discount</span>
                      <span>-₹{couponDiscount}</span>
                    </div>
                  )}

                  <div className="border-t border-gray-100 pt-2 flex justify-between items-center text-sm font-black text-gray-900">
                    <span>To Pay</span>
                    <span className="text-base text-gray-900 font-black">₹{grandTotal}</span>
                  </div>

                  {totalSavings > 0 && (
                    <div className="bg-green-50 text-[#0c831f] font-extrabold text-[11px] p-2 rounded-xl text-center">
                      🎉 You saved ₹{totalSavings + couponDiscount} on this order!
                    </div>
                  )}
                </div>

                {/* Payment Option Selector */}
                <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase text-gray-900 tracking-wider">
                      Payment Method
                    </span>
                    <span className="text-[10px] font-black text-[#0c831f] uppercase tracking-wider">
                      Instant & Safe
                    </span>
                  </div>

                  <div className="space-y-2">
                    {/* UPI Option */}
                    <div
                      onClick={() => setPaymentMethod('UPI')}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        paymentMethod === 'UPI'
                          ? 'border-[#0c831f] bg-green-50/70 ring-2 ring-green-100'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-[#0c831f] text-white flex items-center justify-center font-black text-xs shadow-xs">
                          UPI
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-gray-900">UPI Online</span>
                            <span className="bg-green-100 text-[#0c831f] text-[9px] font-black uppercase px-1.5 py-0.2 rounded">
                              Instant • QR / GPay / PhonePe
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 font-medium">
                            Scan QR or pay via any UPI App
                          </p>
                        </div>
                      </div>

                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'UPI' ? 'border-[#0c831f] bg-[#0c831f]' : 'border-gray-300'
                      }`}>
                        {paymentMethod === 'UPI' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>

                    {/* Razorpay Option */}
                    <div
                      onClick={() => setPaymentMethod('Razorpay')}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        paymentMethod === 'Razorpay'
                          ? 'border-[#0070e0] bg-blue-50/70 ring-2 ring-blue-100'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-[#0070e0] text-white flex items-center justify-center font-black text-xs shadow-xs">
                          R
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-gray-900">Razorpay Gateway</span>
                            <span className="bg-blue-100 text-[#0070e0] text-[9px] font-black uppercase px-1.5 py-0.2 rounded">
                              Cards & Netbanking
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 font-medium">
                            Debit / Credit Cards, Netbanking & Wallets
                          </p>
                        </div>
                      </div>

                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'Razorpay' ? 'border-[#0070e0] bg-[#0070e0]' : 'border-gray-300'
                      }`}>
                        {paymentMethod === 'Razorpay' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>

                    {/* Cash on Delivery (COD) Option */}
                    <div
                      onClick={() => setPaymentMethod('COD')}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        paymentMethod === 'COD'
                          ? 'border-[#0c831f] bg-green-50/70 ring-2 ring-green-100'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-xs">
                          <Banknote className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs font-black text-gray-900 block">Cash on Delivery</span>
                          <p className="text-[11px] text-gray-500 font-medium">Pay cash or UPI to rider at doorstep</p>
                        </div>
                      </div>

                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'COD' ? 'border-[#0c831f] bg-[#0c831f]' : 'border-gray-300'
                      }`}>
                        {paymentMethod === 'COD' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            )}

            {/* Footer Checkout Bar */}
            {cart.length > 0 && (
              <div className="p-4 bg-white border-t border-gray-200">
                <button
                  disabled={isCheckingOut}
                  onClick={handleCheckoutClick}
                  className="w-full bg-[#0c831f] hover:bg-[#086317] disabled:bg-gray-400 text-white py-3.5 px-5 rounded-2xl font-black text-sm flex items-center justify-between shadow-lg shadow-green-900/20 transition-all transform active:scale-[0.98]"
                >
                  <div className="flex flex-col text-left">
                    <span className="text-[11px] text-green-100 uppercase tracking-wider font-bold">
                      {cart.reduce((a, b) => a + b.quantity, 0)} Items • Total
                    </span>
                    <span className="text-base font-black">₹{grandTotal}</span>
                  </div>

                  <div className="flex items-center gap-1.5 font-black uppercase tracking-wider text-xs bg-white/20 px-3 py-1.5 rounded-xl">
                    <span>
                      {paymentMethod === 'UPI' ? 'Pay Online via UPI' : 'Place Order'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Online UPI Payment Modal */}
      <UPIPaymentModal
        isOpen={isUpiModalOpen}
        onClose={() => setIsUpiModalOpen(false)}
        amount={grandTotal}
        onPaymentSuccess={(paymentDetails) => {
          executeOrderPlacement(paymentDetails);
        }}
      />

      {/* Online Razorpay Modal */}
      <RazorpayModal
        isOpen={isRazorpayModalOpen}
        onClose={() => setIsRazorpayModalOpen(false)}
        amount={grandTotal}
        keyId={gatewaySettings?.razorpay?.keyId}
        onPaymentSuccess={(paymentDetails) => {
          executeOrderPlacement(paymentDetails);
        }}
      />
    </>
  );
}
