import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle2, ChevronRight, Bike, RotateCcw } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function OrdersView({ onTrackOrder }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, setIsCartOpen } = useCart();

  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load orders', err);
        setLoading(false);
      });
  }, []);

  const handleReorder = (order) => {
    order.items.forEach(item => {
      addToCart(item);
    });
    setIsCartOpen(true);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse h-36" />
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl p-8 text-center border border-gray-100 shadow-sm">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
          <Package className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">No Orders Yet</h3>
        <p className="text-sm text-gray-500 mb-4">
          Order your daily groceries and essentials in under 10 minutes!
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Your Orders</h2>
          <p className="text-xs text-gray-500">Track current deliveries & review past orders</p>
        </div>
        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {orders.length} Total Orders
        </span>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const isDelivered = order.status === 'delivered';
          const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          return (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isDelivered ? 'bg-green-100 text-[#0c831f]' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {isDelivered ? <CheckCircle2 className="w-5 h-5" /> : <Bike className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-gray-900">{order.id}</span>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isDelivered 
                          ? 'bg-green-100 text-[#0c831f]' 
                          : 'bg-amber-100 text-amber-800 animate-pulse'
                      }`}>
                        {order.status || 'In Transit'}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-400 font-medium">{dateStr}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <span className="text-base font-black text-gray-900 block">₹{order.total}</span>
                    <span className="text-[10px] font-bold text-[#0c831f] bg-green-50 px-1.5 py-0.5 rounded border border-green-200">
                      {order.paymentDetails?.upiRef ? '⚡ UPI Paid' : (order.paymentMethod || 'Paid')}
                    </span>
                  </div>
                  <button
                    onClick={() => onTrackOrder(order)}
                    className="flex items-center gap-1 bg-[#0c831f] hover:bg-[#086317] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all"
                  >
                    <span>Track Live</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="py-3 flex flex-wrap gap-2 items-center">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-2 bg-gray-50 border border-gray-100 rounded-xl px-2.5 py-1 text-xs">
                    <img src={item.image} alt={item.name} className="w-6 h-6 object-cover rounded" />
                    <span className="font-semibold text-gray-800 truncate max-w-[140px]">{item.name}</span>
                    <span className="text-gray-400 font-bold">x{item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <div className="truncate max-w-[260px]">
                  Delivered to: <span className="font-semibold text-gray-700">{order.address?.flat}, {order.address?.area}</span>
                </div>
                <button
                  onClick={() => handleReorder(order)}
                  className="flex items-center gap-1 text-[#0c831f] font-bold hover:underline"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reorder All</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}

