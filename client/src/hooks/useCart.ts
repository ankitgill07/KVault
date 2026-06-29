import { useState, useEffect, useCallback } from 'react';
import { cartService, type CartUI } from '../services/cartService';

export const useCart = () => {
  const [cart, setCart] = useState<CartUI>(() => {
    const saved = localStorage.getItem('kvault_cart');
    return saved ? JSON.parse(saved) : { cartId: '', items: [], totalItems: 0, subtotal: 0 };
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('kvault_cart', JSON.stringify(cart));
  }, [cart]);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const data = await cartService.getCart();
      setCart(data);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = useCallback(async (courseId: string, priceAtAdd = 0) => {
    try {
      const updatedCart = await cartService.addToCart(courseId, priceAtAdd);
      setCart(updatedCart);
      return true;
    } catch (err) {
      console.error('Failed to add to cart:', err);
      return false;
    }
  }, []);

  const removeFromCart = useCallback(async (courseId: string) => {
    try {
      const updatedCart = await cartService.removeFromCart(courseId);
      setCart(updatedCart);
    } catch (err) {
      console.error('Failed to remove from cart:', err);
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      await cartService.clearCart();
      setCart({ cartId: '', items: [], totalItems: 0, subtotal: 0 });
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  }, []);

  const isInCart = useCallback((courseId: string) => {
    return cart.items.some(item => item.courseId === courseId);
  }, [cart]);

  return {
    cart,
    loading,
    fetchCart,
    addToCart,
    removeFromCart,
    clearCart,
    isInCart,
    cartCount: cart.totalItems,
  };
};