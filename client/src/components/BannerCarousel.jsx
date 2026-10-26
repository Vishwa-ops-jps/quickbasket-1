import React, { useState, useEffect } from 'react';
import { Zap, Sparkles, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

const banners = [
  {
    id: 1,
    title: "Instant Groceries in 8 to 10 Minutes",
    subtitle: "From fresh farm veggies to chilled sodas & late-night munchies.",
    tag: "SUPERFAST DELIVERY",
    bgGradient: "from-amber-400 via-yellow-400 to-amber-500",
    textColor: "text-gray-900",
    buttonText: "Order Essentials",
    categoryFilter: "dairy-eggs",
    badgeIcon: Zap,
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: 2,
    title: "Flat ₹50 OFF On Your First Order",
    subtitle: "Use coupon WELCOME50 at checkout. Zero delivery fee above ₹199.",
    tag: "LIMITED OFFER",
    bgGradient: "from-emerald-600 via-green-600 to-teal-700",
    textColor: "text-white",
    buttonText: "Claim Coupon",
    categoryFilter: "all",
    badgeIcon: Sparkles,
    image: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: 3,
    title: "Crisp & Fresh Farm Harvest",
    subtitle: "Tomatoes, crisp greens, juicy fruits sourced directly from local farmers.",
    tag: "100% ORGANIC & FRESH",
    bgGradient: "from-red-500 via-rose-500 to-orange-500",
    textColor: "text-white",
    buttonText: "Explore Produce",
    categoryFilter: "veg-fruits",
    badgeIcon: Clock,
    image: "https://images.unsplash.com/photo-1573246123716-6b1782bfc499?w=600&auto=format&fit=crop&q=80"
  }
];

export default function BannerCarousel({ onSelectCategory }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const banner = banners[current];
  const IconComponent = banner.badgeIcon;

  return (
    <div className="relative overflow-hidden rounded-3xl shadow-lg my-6 bg-gradient-to-r transition-all duration-700 ease-in-out border border-black/5">
      <div className={`p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r ${banner.bgGradient}`}>
        
        {/* Left Content */}
        <div className={`max-w-xl ${banner.textColor} z-10`}>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/15 backdrop-blur-sm text-xs font-black tracking-wider uppercase mb-3">
            <IconComponent className="w-3.5 h-3.5" />
            <span>{banner.tag}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight mb-2">
            {banner.title}
          </h1>

          <p className="text-sm sm:text-base opacity-90 font-medium mb-6">
            {banner.subtitle}
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectCategory(banner.categoryFilter)}
              className="inline-flex items-center gap-2 bg-gray-900 text-white hover:bg-black px-6 py-3 rounded-xl font-extrabold text-sm shadow-md hover:shadow-xl transition-all transform active:scale-95"
            >
              <span>{banner.buttonText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 px-3 py-2 bg-white/20 backdrop-blur-sm rounded-xl text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Safe & Contactless Delivery</span>
            </div>
          </div>
        </div>

        {/* Right Image Feature */}
        <div className="relative w-full md:w-auto flex justify-center">
          <div className="relative w-52 h-44 sm:w-64 sm:h-52 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/30 transform hover:scale-105 transition-all">
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute bottom-2 left-3 text-white text-xs font-black drop-shadow">
              ⚡ Guaranteed in 10 mins
            </div>
          </div>
        </div>

      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center space-x-2 z-20">
        {banners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`h-2 rounded-full transition-all ${
              current === idx ? 'w-8 bg-gray-900' : 'w-2 bg-black/20 hover:bg-black/40'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

