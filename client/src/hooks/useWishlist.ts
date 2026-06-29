import { useState, useEffect, useCallback } from 'react';
import { wishlistService, type WishlistUI } from '../services/wishlistService';

export const useWishlist = () => {
  const [wishlist, setWishlist] = useState<WishlistUI>(() => {
    const saved = localStorage.getItem('kvault_wishlist');
    return saved ? JSON.parse(saved) : { wishlistId: '', items: [], totalItems: 0 };
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('kvault_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    try {
      const data = await wishlistService.getWishlist();
      setWishlist(data);
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addToWishlist = useCallback(async (courseId: string) => {
    try {
      const updatedWishlist = await wishlistService.addToWishlist(courseId);
      setWishlist(updatedWishlist);
      return true;
    } catch (err) {
      console.error('Failed to add to wishlist:', err);
      return false;
    }
  }, []);

  const removeFromWishlist = useCallback(async (courseId: string) => {
    try {
      const updatedWishlist = await wishlistService.removeFromWishlist(courseId);
      setWishlist(updatedWishlist);
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
    }
  }, []);

  const isInWishlist = useCallback((courseId: string) => {
    return wishlist.items.some(item => item.courseId === courseId);
  }, [wishlist]);

  return {
    wishlist,
    loading,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    wishlistCount: wishlist.totalItems,
  };
};