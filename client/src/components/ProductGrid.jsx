import React, { useState } from 'react';
import ProductCard from './ProductCard';
import { SlidersHorizontal, PackageX, Sparkles } from 'lucide-react';

export default function ProductGrid({ products, selectedCategory, categoryName, loading, sortOption, setSortOption }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse">
            <div className="w-full h-40 bg-gray-200 rounded-xl mb-4" />
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
            <div className="flex justify-between items-center pt-2">
              <div className="h-5 bg-gray-200 rounded w-16" />
              <div className="h-8 bg-gray-200 rounded-xl w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-lg mx-auto my-8">
        <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <PackageX className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">No items found</h3>
        <p className="text-sm text-gray-500 mb-6">
          We couldn't find any products matching your selection. Try a different category or search term.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-12">
      {/* Category Title & Sort Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <span>{categoryName || 'All Essentials'}</span>
            <span className="text-xs font-bold text-[#0c831f] bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
              {products.length} products
            </span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Superfast 10-minute dispatch from your nearest dark store
          </p>
        </div>

        {/* Sort Filter Dropdown */}
        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="w-4 h-4 text-gray-400" />
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-700 hover:border-gray-300 focus:outline-none focus:border-[#0c831f] cursor-pointer"
          >
            <option value="featured">Featured / Best Sellers</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="discount">Biggest Discount</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

