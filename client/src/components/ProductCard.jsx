import React from 'react';
import { Clock, Plus, Minus, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart, removeFromCart, getItemQuantity } = useCart();
  const quantity = getItemQuantity(product.id);

  const discountPercent = product.mrp && product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 hover:shadow-xl hover:border-green-100 transition-all duration-200 flex flex-col justify-between relative">
      
      {/* Badges: Discount & Delivery Time */}
      <div className="relative">
        <div className="flex items-center justify-between absolute top-0 left-0 right-0 z-10">
          {discountPercent > 0 ? (
            <span className="bg-[#f7cb44] text-gray-900 font-extrabold text-[10px] sm:text-xs px-2 py-0.5 rounded-md shadow-sm uppercase tracking-wide">
              {discountPercent}% OFF
            </span>
          ) : <span />}

          <div className="flex items-center space-x-1 bg-gray-900/80 backdrop-blur-sm text-white px-2 py-0.5 rounded-md text-[10px] font-bold">
            <Clock className="w-3 h-3 text-[#f7cb44]" />
            <span>{product.deliveryTime || '10 mins'}</span>
          </div>
        </div>

        {/* Product Image */}
        <div className="w-full h-36 sm:h-44 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center mt-4 mb-3">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      </div>

      {/* Product Details */}
      <div className="flex-1 flex flex-col">
        {/* Brand & Rating */}
        <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium mb-1">
          <span className="truncate max-w-[120px] font-bold text-gray-400 uppercase tracking-wider">
            {product.brand || 'Blinkit'}
          </span>
          {product.rating && (
            <div className="flex items-center text-amber-500 font-extrabold gap-0.5">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-2 leading-snug mb-1 group-hover:text-[#0c831f] transition-colors">
          {product.name}
        </h3>

        {/* Unit / Weight */}
        <span className="text-xs text-gray-500 font-medium mb-3">
          {product.unit}
        </span>
      </div>

      {/* Price & Add Action */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-auto">
        <div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-sm sm:text-base font-black text-gray-900">
              ₹{product.price}
            </span>
            {product.mrp && product.mrp > product.price && (
              <span className="text-xs text-gray-400 line-through">
                ₹{product.mrp}
              </span>
            )}
          </div>
        </div>

        {/* Add Button or Quantity Selector */}
        {quantity === 0 ? (
          <button
            onClick={() => addToCart(product)}
            className="border-2 border-[#0c831f] bg-green-50/70 hover:bg-[#0c831f] text-[#0c831f] hover:text-white font-black text-xs px-4 py-1.5 rounded-xl uppercase tracking-wider transition-all duration-150 transform active:scale-90 shadow-sm"
          >
            ADD
          </button>
        ) : (
          <div className="flex items-center bg-[#0c831f] text-white rounded-xl overflow-hidden shadow-md">
            <button
              onClick={() => removeFromCart(product.id)}
              className="p-1.5 hover:bg-[#086317] transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5 stroke-[3]" />
            </button>
            <span className="px-2.5 font-black text-xs">
              {quantity}
            </span>
            <button
              onClick={() => addToCart(product)}
              className="p-1.5 hover:bg-[#086317] transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>
        )}
      </div>

    </div>
  );
}

