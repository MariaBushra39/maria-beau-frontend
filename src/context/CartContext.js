import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCartItems(parsed);
        }
      } catch (e) {}
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // ✅ SIMPLEST ADD TO CART — Guaranteed to work
  const addToCart = (product, quantity = 1, size = null, color = null) => {
    if (!product || !product.id) return;

    // Create new item
    const newItem = {
      id: product.id,
      name: product.name,
      price: product.discount_price || product.price,
      images: product.images || [],
      quantity: quantity,
      size: size || null,
      color: color || null,
      stock: product.stock || 0
    };

    // ✅ Use functional update with spread operator
    setCartItems(prev => {
      // Check if exists
      const exists = prev.findIndex(
        item => item.id === product.id && item.size === size && item.color === color
      );

      if (exists !== -1) {
        // Update existing
        const updated = [...prev];
        updated[exists] = {
          ...updated[exists],
          quantity: updated[exists].quantity + quantity
        };
        toast.success(`Updated ${product.name} quantity`);
        return updated;
      } else {
        // Add new
        toast.success(`Added ${product.name} to cart`);
        return [...prev, newItem];
      }
    });
  };

  const removeFromCart = (id, size = null, color = null) => {
    setCartItems(prev => {
      const filtered = prev.filter(
        item => !(item.id === id && item.size === size && item.color === color)
      );
      toast.info('Item removed');
      return filtered;
    });
  };

  const updateQuantity = (id, quantity, size = null, color = null) => {
    if (quantity < 1) {
      removeFromCart(id, size, color);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === id && item.size === size && item.color === color
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    toast.info('Cart cleared');
  };

  const getTotalItems = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);