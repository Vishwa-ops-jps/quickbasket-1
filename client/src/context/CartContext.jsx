import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('blinkit_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [tip, setTip] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  useEffect(() => {
    localStorage.setItem('blinkit_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === productId);
      if (!existing) return prev;
      if (existing.quantity === 1) {
        return prev.filter(item => item.id !== productId);
      }
      return prev.map(item =>
        item.id === productId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
    });
  };

  const deleteItem = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    setTip(0);
  };

  const getItemQuantity = (productId) => {
    const item = cart.find(i => i.id === productId);
    return item ? item.quantity : 0;
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const totalSavings = cart.reduce((acc, item) => {
    const diff = (item.mrp || item.price) - item.price;
    return acc + (diff > 0 ? diff * item.quantity : 0);
  }, 0);

  const deliveryFee = subtotal >= 199 || (appliedCoupon && appliedCoupon.freeDelivery) ? 0 : (subtotal > 0 ? 25 : 0);
  const handlingFee = subtotal > 0 ? 4 : 0;

  // Coupon discount computation
  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountPercent) {
      couponDiscount = Math.round((subtotal * appliedCoupon.discountPercent) / 100);
      if (appliedCoupon.maxDiscount && couponDiscount > appliedCoupon.maxDiscount) {
        couponDiscount = appliedCoupon.maxDiscount;
      }
    } else if (appliedCoupon.freeDelivery) {
      couponDiscount = subtotal < 199 ? 25 : 0;
    }
  }

  const grandTotal = Math.max(0, subtotal + deliveryFee + handlingFee + tip - (appliedCoupon && !appliedCoupon.freeDelivery ? couponDiscount : 0));

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        deleteItem,
        clearCart,
        getItemQuantity,
        totalItems,
        subtotal,
        totalSavings,
        deliveryFee,
        handlingFee,
        tip,
        setTip,
        appliedCoupon,
        setAppliedCoupon,
        couponDiscount,
        grandTotal,
        isCartOpen,
        setIsCartOpen
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

