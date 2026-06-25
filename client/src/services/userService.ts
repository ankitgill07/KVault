import { api } from '../utils/api';

export interface ProfileResponse {
  success: boolean;
  data: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
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
      const response = await api.get<ProfileResponse>('/api/user/profile');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async toggleCart(courseId: string) {
    try {
      const response = await api.post<CartToggleResponse>('/api/user/cart/toggle', { courseId });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async toggleWishlist(courseId: string) {
    try {
      const response = await api.post<WishlistToggleResponse>('/api/user/wishlist/toggle', { courseId });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async purchaseCart() {
    try {
      const response = await api.post<PurchaseResponse>('/api/user/purchase', {});
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async updateProgress(data: ProgressData) {
    try {
      const response = await api.post('/api/user/progress', data);
      return response.data;
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
