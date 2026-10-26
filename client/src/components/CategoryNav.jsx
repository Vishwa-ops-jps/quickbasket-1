import React from 'react';
import { Layers } from 'lucide-react';

export default function CategoryNav({ categories, selectedCategory, onSelectCategory }) {
  return (
    <div className="bg-white py-4 px-2 border-b border-gray-100 shadow-sm rounded-2xl mb-6">
      <div className="flex items-center space-x-3 overflow-x-auto no-scrollbar px-2">
        {/* All items pill */}
        <button
          onClick={() => onSelectCategory('all')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex-shrink-0 ${
            selectedCategory === 'all'
              ? 'bg-[#0c831f] text-white shadow-md shadow-green-900/10 scale-105'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>All Categories</span>
        </button>

        {/* Categories from backend */}
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex-shrink-0 border ${
                isSelected
                  ? 'bg-green-50 border-[#0c831f] text-[#0c831f] shadow-sm scale-105'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="text-base">{cat.icon || '🛍️'}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

