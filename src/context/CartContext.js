import React, { createContext, useState, useContext, useEffect } from 'react';
import API_URL from '../api';

const CartContext = createContext();

export function CartProvider({ children }) {
  // 🔥 Load cart from localStorage on initial render
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
      return [];
    }
  });

  // 🔥 Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [cartItems]);

  const addToCart = (product, quantity, size, color) => {
    const existingItem = cartItems.find(
      (item) => item.id === product.id && item.size === size && item.color === color
    );
    if (existingItem) {
      setCartItems(
        cartItems.map((item) =>
          item.id === product.id && item.size === size && item.color === color
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setCartItems([...cartItems, { ...product, quantity, size, color }]);
    }
  };

  const removeFromCart = (id, size, color) => {
    setCartItems(cartItems.filter((item) => 
      !(item.id === id && item.size === size && item.color === color)
    ));
  };

  const updateQuantity = (id, newQuantity, size, color) => {
    if (newQuantity <= 0) {
      removeFromCart(id, size, color);
      return;
    }
    setCartItems(
      cartItems.map((item) =>
        item.id === id && item.size === size && item.color === color
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const price = item.discount_price || item.price;
      return total + price * item.quantity;
    }, 0);
  };

  const createOrder = async (orderData) => {
    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      const data = await res.json();
      if (data.success) {
        setCartItems([]);
        return data;
      }
    } catch (error) {
      console.error('Order Error:', error);
    }
  };

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      updateQuantity,
      clearCart,
      getTotalItems, 
      getTotalPrice, 
      createOrder 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}