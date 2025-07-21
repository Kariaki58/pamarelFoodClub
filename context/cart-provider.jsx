"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useSession } from 'next-auth/react';

const CartContext = createContext(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { data: session, status } = useSession();

  // Initialize cart
  useEffect(() => {
    const loadCart = async () => {
      try {
        setIsLoading(true);
        if (status === 'authenticated') {
          const response = await fetch('/api/cart');
          if (response.ok) {
            const data = await response.json();
            setCartItems(Array.isArray(data) ? data : []);
          }
        } else {
          const localCart = localStorage.getItem('cartItems');
          setCartItems(localCart ? JSON.parse(localCart) : []);
        }
      } catch (error) {
        console.error("Cart load error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();
  }, [status]);

  // Sync local cart to backend when auth status changes to authenticated
  useEffect(() => {
    const syncCartToBackend = async () => {
      if (status === 'authenticated' && cartItems.length > 0) {
        try {
          const itemsToSync = cartItems.map(item => ({
            id: item.id,
            quantity: item.quantity
          }));

          const response = await fetch('/api/cart/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: itemsToSync }),
          });

          if (response.ok) {
            const { items } = await response.json();
            setCartItems(items || []);
          }
        } catch (error) {
          console.error("Cart sync error:", error);
        }
      }
    };

    syncCartToBackend();
  }, [status]);

  // Save to localStorage for unauthenticated users
  useEffect(() => {
    if (status !== 'authenticated') {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }
  }, [cartItems, status]);

  const addToCart = async (product, quantity = 1) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    let newItems;

    if (existingItem) {
      // Update quantity of existing item
      newItems = cartItems.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + quantity } 
          : item
      );
    } else {
      // Add new item
      console.log("########################")
      console.log(product)
      console.log("########################")

      newItems = [...cartItems, { 
        id: product.id, 
        name: product.name, 
        price: product.price, 
        imageUrl: product.images[0].url, 
        quantity: quantity 
      }];
    }

    setCartItems(newItems);

    // Update backend if authenticated
    if (status === 'authenticated') {
      try {
        if (existingItem) {
          await fetch('/api/cart', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              productId: product.id, 
              quantity: existingItem.quantity + quantity 
            }),
          });
        } else {
          await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              productId: product.id, 
              quantity: quantity 
            }),
          });
        }
      } catch (error) {
        console.error("Backend update failed:", error);
      }
    }

    toast({
      title: existingItem ? "Cart updated" : "Added to cart",
      description: `${product.name} quantity ${existingItem ? 'updated' : 'added'} to your cart.`,
    });
  };

  const removeFromCart = async (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
    
    if (status === 'authenticated') {
      try {
        await fetch(`/api/cart?productId=${productId}`, { 
          method: 'DELETE' 
        });
      } catch (error) {
        console.error("Backend removal failed:", error);
      }
    }

    toast({
      title: "Item removed",
      description: "Item has been removed from your cart.",
      variant: "destructive"
    });
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prev => 
      prev.map(item => 
        item.id === productId ? { ...item, quantity } : item
      )
    );
    
    if (status === 'authenticated') {
      try {
        await fetch('/api/cart', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, quantity }),
        });
      } catch (error) {
        console.error("Backend update failed:", error);
      }
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    
    if (status === 'authenticated') {
      try {
        await fetch('/api/cart', { method: 'DELETE' });
      } catch (error) {
        console.error("Backend clear failed:", error);
      }
    }
  };

  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
  const uniqueItemsCount = cartItems.length;

  return (
    <CartContext.Provider value={{ 
      cartItems,
      isLoading,
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      cartCount, 
      totalPrice,
      uniqueItemsCount
    }}>
      {children}
    </CartContext.Provider>
  );
};