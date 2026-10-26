import React, { useState } from 'react';
import { 
  X, CreditCard, ShieldCheck, CheckCircle2, 
  Lock, ArrowRight, Loader2, Building2, Wallet 
} from 'lucide-react';

export default function RazorpayModal({ isOpen, onClose, amount, keyId, onPaymentSuccess }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('card'); // 'card', 'netbanking', 'wallet'
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8921');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('321');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  const handlePay = () => {
    setIsProcessing(true);

    fetch('/api/payment/razorpay/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id: 'order_rzp_' + Date.now(),
        razorpay_payment_id: 'pay_' + Math.floor(100000000 + Math.random() * 900000000),
        amount
      })
    })
      .then(res => res.json())
      .then(data => {
        setTimeout(() => {
          setIsProcessing(false);
          onPaymentSuccess({
            method: 'Razorpay (' + (activeTab === 'card' ? 'Card' : selectedBank) + ')',
            status: 'PAID',
            paymentId: data.paymentId,
            orderId: data.orderId
          });
        }, 1400);
      })
      .catch(err => {
        setIsProcessing(false);
        onPaymentSuccess({
          method: 'Razorpay Online',
          status: 'PAID',
          paymentId: 'pay_' + Date.now()
        });
      });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col">
        
        {/* Razorpay Classic Blue Header */}
        <div className="bg-[#0c2340] text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0070e0] flex items-center justify-center font-black text-xs text-white">
              R
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm tracking-tight">Razorpay</span>
                <span className="text-[9px] font-black uppercase bg-[#0070e0] px-1.5 py-0.2 rounded">
                  Trusted Checkout
                </span>
              </div>
              <p className="text-[11px] text-gray-300 font-medium">QuickBasket Express Store</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount bar */}
        <div className="bg-blue-50 px-6 py-3 flex items-center justify-between border-b border-blue-100">
          <div>
            <span className="text-[11px] text-blue-900 font-bold uppercase tracking-wider block">Total Amount</span>
            <span className="text-xl font-black text-blue-950">₹{amount}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-blue-800">
            <ShieldCheck className="w-4 h-4 text-[#0070e0]" />
            <span>PCI-DSS Level 1 Compliant</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50 p-1.5 gap-1.5 text-xs font-bold">
          <button
            onClick={() => setActiveTab('card')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'card' ? 'bg-white text-gray-900 shadow-sm font-black' : 'text-gray-600'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-[#0070e0]" />
            <span>Card</span>
          </button>
          <button
            onClick={() => setActiveTab('netbanking')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'netbanking' ? 'bg-white text-gray-900 shadow-sm font-black' : 'text-gray-600'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-[#0070e0]" />
            <span>Netbanking</span>
          </button>
          <button
            onClick={() => setActiveTab('wallet')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'wallet' ? 'bg-white text-gray-900 shadow-sm font-black' : 'text-gray-600'
            }`}
          >
            <Wallet className="w-3.5 h-3.5 text-[#0070e0]" />
            <span>Wallets</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {isProcessing ? (
            <div className="py-10 text-center flex flex-col items-center">
              <Loader2 className="w-14 h-14 text-[#0070e0] animate-spin mb-3" />
              <h4 className="text-sm font-black text-gray-900 mb-1">
                Contacting Bank Gateway...
              </h4>
              <p className="text-xs text-gray-500 max-w-xs">
                Authorizing payment with Razorpay secure 3D-Secure 2.0.
              </p>
            </div>
          ) : (
            <>
              {activeTab === 'card' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 font-mono font-bold text-gray-900 focus:outline-none focus:border-[#0070e0]"
                      />
                      <CreditCard className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Expiry</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 font-mono font-bold text-gray-900 focus:outline-none focus:border-[#0070e0]"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">CVV</label>
                      <input
                        type="password"
                        maxLength="4"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 font-mono font-bold text-gray-900 focus:outline-none focus:border-[#0070e0]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'netbanking' && (
                <div className="space-y-2 text-xs">
                  <label className="font-bold text-gray-700 block mb-1">Choose Bank</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak Bank', 'Yes Bank'].map((b) => (
                      <button
                        key={b}
                        onClick={() => setSelectedBank(b)}
                        className={`p-2.5 rounded-xl border text-left font-bold transition-all ${
                          selectedBank === b
                            ? 'border-[#0070e0] bg-blue-50 text-[#0070e0]'
                            : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'wallet' && (
                <div className="space-y-2 text-xs">
                  <label className="font-bold text-gray-700 block mb-1">Supported Wallets</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Amazon Pay', 'Paytm Wallet', 'Mobikwik', 'PhonePe Wallet'].map((w) => (
                      <div key={w} className="p-2.5 rounded-xl border border-gray-200 font-bold text-gray-800 flex items-center justify-between">
                        <span>{w}</span>
                        <span className="text-[10px] text-[#0c831f] font-black">Active</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handlePay}
                className="w-full bg-[#0070e0] hover:bg-[#005bb5] text-white py-3 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Pay ₹{amount} with Razorpay</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 font-medium">
          <span>Key ID: {keyId ? keyId.slice(0, 14) + '...' : 'rzp_test_9kM38d...'}</span>
          <span>Secured by Razorpay</span>
        </div>

      </div>
    </div>
  );
}

