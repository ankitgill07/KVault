import { axiosInstance } from "./axoisInstance";
import { cartApi } from "./cartApi";

// ─── User API ─────────────────────────────────────────────────────────────────

export const userApi = {
  // Get user profile
  getProfile: async () => {
    const response = await axiosInstance.get("/user/profile");
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: {
    name?: string;
    profileName?: string;
    bio?: string;
    twitterUrl?: string;
    linkedinUrl?: string;
    websiteUrl?: string;
  }) => {
    const response = await axiosInstance.put("/user/profile", data);
    return response.data;
  },

  // Upload profile image
  uploadProfileImage: async (image: File) => {
    const formData = new FormData();
    formData.append('image', image);
    const response = await axiosInstance.post("/user/profile/upload-image", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get user achievements
  getAchievements: async () => {
    const response = await axiosInstance.get("/user/achievements");
    return response.data;
  },

  // Change password
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const response = await axiosInstance.put("/user/change-password", data);
    return response.data;
  },
};

// ─── Wishlist API ──────────────────────────────────────────────────────────────

export const wishlistApi = {
  // Get user's wishlist
  getWishlist: async () => {
    const response = await axiosInstance.get("/wishlist");
    return response.data;
  },

  // Add item to wishlist
  addToWishlist: async (courseId: string) => {
    const response = await axiosInstance.post("/wishlist/items", { courseId });
    return response.data;
  },

  // Remove item from wishlist
  removeFromWishlist: async (courseId: string) => {
    const response = await axiosInstance.delete(`/wishlist/items/${courseId}`);
    return response.data;
  },

  // Clear wishlist
  clearWishlist: async () => {
    const response = await axiosInstance.delete("/wishlist");
    return response.data;
  },
};

// ─── Export all APIs ───────────────────────────────────────────────────────────

export const userApis = {
  user: userApi,
  cart: cartApi,
  wishlist: wishlistApi,
};
