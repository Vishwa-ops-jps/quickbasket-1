import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Clock, MapPin, Phone, Bike, Package, 
  ChevronRight, X, ShieldAlert, Sparkles 
} from 'lucide-react';

export default function OrderTrackingModal({ order, onClose }) {
  if (!order) return null;

  // Step states: 0: placed, 1: packing, 2: on_the_way, 3: delivered
  const [step, setStep] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(540); // 9 minutes

  useEffect(() => {
    // Progress order status over time for live demonstration
    const t1 = setTimeout(() => setStep(1), 3000);
    const t2 = setTimeout(() => setStep(2), 7000);
    const t3 = setTimeout(() => setStep(3), 16000);

    const interval = setInterval(() => {
      setSecondsRemaining(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearInterval(interval);
    };
  }, []);

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const stepsInfo = [
    { label: 'Order Received', desc: 'Dark Store assigned', icon: Package },
    { label: 'Packing Items', desc: 'Carefully sorted & bagged', icon: CheckCircle2 },
    { label: 'Out for Delivery', desc: `${order.rider?.name || 'Rider'} is on the way`, icon: Bike },
    { label: 'Delivered', desc: 'Handed over at your doorstep', icon: Sparkles }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header with Blinkit Yellow Gradient */}
        <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 p-6 text-gray-900 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/10 hover:bg-black/20 text-gray-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 bg-black/10 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2">
            <Clock className="w-3.5 h-3.5" />
            <span>Superfast Delivery Active</span>
          </div>

          <h2 className="text-2xl font-black tracking-tight">
            {step === 3 ? 'Order Delivered!' : `Arriving in ${formatTimer(secondsRemaining)} mins`}
          </h2>
          <p className="text-xs font-bold text-gray-800">
            Order ID: {order.id} • {order.items?.length || 0} items
          </p>
        </div>

        {/* Live Step Tracker */}
        <div className="p-6">
          <div className="relative mb-6">
            <div className="absolute left-6 top-3 bottom-3 w-0.5 bg-gray-200 -z-0" />
            <div 
              className="absolute left-6 top-3 w-0.5 bg-[#0c831f] transition-all duration-700 -z-0"
              style={{ height: `${(step / 3) * 100}%` }}
            />

            <div className="space-y-6 relative z-10">
              {stepsInfo.map((s, idx) => {
                const Icon = s.icon;
                const isPassed = step >= idx;
                const isCurrent = step === idx;

                return (
                  <div key={idx} className="flex items-start space-x-4">
                    <div 
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                        isPassed 
                          ? 'bg-[#0c831f] text-white shadow-md shadow-green-900/20' 
                          : 'bg-gray-100 text-gray-400'
                      } ${isCurrent ? 'ring-4 ring-green-100 scale-105' : ''}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-black ${isPassed ? 'text-gray-900' : 'text-gray-400'}`}>
                          {s.label}
                        </h4>
                        {isCurrent && (
                          <span className="text-[10px] font-black uppercase text-[#0c831f] bg-green-50 px-2 py-0.5 rounded-full border border-green-200 animate-pulse">
                            In Progress
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Partner Details Card */}
          <div className="bg-[#f4f6fb] p-4 rounded-2xl border border-gray-100 flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-base">
                🛵
              </div>
              <div>
                <h5 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                  {order.rider?.name || 'Arun Verma'}
                </h5>
                <p className="text-[11px] text-gray-500 font-medium">
                  {order.rider?.vehicle || 'Electric Scooter'} • ⭐ {order.rider?.rating || 4.9}
                </p>
              </div>
            </div>

            <a
              href={`tel:${order.rider?.phone || '9876543210'}`}
              className="p-2.5 bg-white hover:bg-gray-50 text-[#0c831f] rounded-xl border border-gray-200 shadow-sm flex items-center gap-1 text-xs font-bold transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>Call</span>
            </a>
          </div>

          {/* Delivery Address Summary */}
          <div className="bg-white p-3.5 rounded-2xl border border-gray-100 mb-6 flex items-start space-x-3">
            <MapPin className="w-4 h-4 text-[#0c831f] mt-0.5 flex-shrink-0" />
            <div className="text-xs text-gray-600">
              <span className="font-black text-gray-900 block">
                Delivering to {order.address?.tag || 'Home'}
              </span>
              <span>{order.address?.flat}, {order.address?.area}, {order.address?.city}</span>
            </div>
          </div>

          {/* Action Close */}
          <button
            onClick={onClose}
            className="w-full bg-gray-900 hover:bg-black text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all"
          >
            Back to Shopping
          </button>
        </div>

      </div>
    </div>
  );
}

