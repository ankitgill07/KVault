import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { wishlistService, type WishlistUI, type WishlistItemUI } from '../services/wishlistService';
import { fetchCart } from './cartSlice';

export interface WishlistState {
  wishlist: WishlistUI | null;
  loading: boolean;
  error: string | null;
}

const initialState: WishlistState = {
  wishlist: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchWishlist = createAsyncThunk('wishlist/fetchWishlist', async () => {
  const data = await wishlistService.getWishlist();
  return data;
});

export const addToWishlist = createAsyncThunk(
  'wishlist/addToWishlist',
  async (courseId: string, { dispatch, rejectWithValue }) => {
    try {
      const data = await wishlistService.addToWishlist(courseId);
      // Re-sync cart since backend may have removed from it
      dispatch(fetchCart());
      return data;
    } catch (error) {
      return rejectWithValue('Failed to add to wishlist');
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (courseId: string, { rejectWithValue }) => {
    try {
      const data = await wishlistService.removeFromWishlist(courseId);
      return data;
    } catch (error) {
      return rejectWithValue('Failed to remove from wishlist');
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.wishlist = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add to wishlist
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.wishlist = action.payload;
      })
      // Remove from wishlist
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.wishlist = action.payload;
      });
  },
});

export const { clearError } = wishlistSlice.actions;

// Selectors - using flexible typing to avoid circular dependencies
export const selectWishlist = (state: any) => state.wishlist.wishlist;
export const selectWishlistLoading = (state: any) => state.wishlist.loading;
export const selectWishlistError = (state: any) => state.wishlist.error;
export const selectWishlistItems = (state: any) => state.wishlist.wishlist?.items || [];
export const selectWishlistCount = (state: any) => state.wishlist.wishlist?.totalItems || 0;
export const selectIsInWishlist = (courseId: string) => (state: any) => {
  return state.wishlist.wishlist?.items?.some((item: any) => item.courseId === courseId) || false;
};

export default wishlistSlice.reducer;