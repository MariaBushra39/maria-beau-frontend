// src/context/CartContext.js (Updated with missing functions)

import React, { createContext, useState, useContext } from 'react';
import API_URL from '../api';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

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

  // ✅ UPDATE QUANTITY
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

  // ✅ CLEAR CART
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
      updateQuantity,   // ✅ Expose
      clearCart,        // ✅ Expose
      getTotalItems, 
      getTotalPrice, 
      createOrder 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}