import { userApis } from '../api/userApi';
import { cartService } from './cartService';
import { wishlistService } from './wishlistService';

export interface ProfileResponse {
  success: boolean;
  data: {
    id: string;
    email: string;
    firstName: string;
    cart: string[];
    wishlist: string[];
    enrolledCourses: string[];
  };
}

export interface CartToggleResponse {
  success: boolean;
  data: {
    cart: string[];
  };
}

export interface WishlistToggleResponse {
  success: boolean;
  data: {
    wishlist: string[];
  };
}

export interface PurchaseResponse {
  success: boolean;
  data: {
    enrolledCourses: string[];
  };
}

export interface ProgressData {
  courseId: string;
  progressVal: number;
  lastAccessed: string;
  completedLessons: string[];
}

class UserService {
  async getProfile() {
    try {
      return await userApis.user.getProfile();
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async toggleCart(courseId: string) {
    try {
      // Use cartService which already handles the logic
      const cart = await cartService.getCart();
      
      if (cartService.isInCart(cart, courseId)) {
        return await cartService.removeFromCart(courseId);
      } else {
        return await cartService.addToCart(courseId);
      }
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async toggleWishlist(courseId: string) {
    try {
      // Use wishlistService for wishlist operations
      const wishlist = await wishlistService.getWishlist();
      
      if (wishlistService.isInWishlist(wishlist, courseId)) {
        return await userApis.wishlist.removeFromWishlist(courseId);
      } else {
        return await userApis.wishlist.addToWishlist(courseId);
      }
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async purchaseCart() {
    try {
      return await userApis.cart.checkout();
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async updateProgress(data: ProgressData) {
    try {
      // Note: This endpoint might need to be added to the API if it doesn't exist
      // For now, we'll use the enrollment API to update progress
      const { courseId, progressVal } = data;
      const response = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/enrollments/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          courseId,
          progress: progressVal,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update progress');
      }
      
      return await response.json();
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any) {
    if (error.response?.status === 422) {
      const errors = error.response?.data?.errors || [];
      const message = errors.join('\n') || error.response?.data?.message || 'Validation error';
      return new Error(message);
    }
    return error.response?.data?.message ? new Error(error.response.data.message) : error;
  }
}

export const userService = new UserService();
