import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { cartService, type CartUI, type CartItemUI } from '../services/cartService';
import { fetchWishlist } from './wishlistSlice';

export interface CartState {
  cart: CartUI | null;
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  cart: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchCart = createAsyncThunk('cart/fetchCart', async () => {
  const data = await cartService.getCart();
  return data;
});

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (courseId: string, { dispatch, rejectWithValue }) => {
    try {
      const data = await cartService.addToCart(courseId);
      // Re-sync wishlist since backend may have removed from it
      dispatch(fetchWishlist());
      return data;
    } catch (error) {
      return rejectWithValue('Failed to add to cart');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (courseId: string, { rejectWithValue }) => {
    try {
      const data = await cartService.removeFromCart(courseId);
      return data;
    } catch (error) {
      return rejectWithValue('Failed to remove from cart');
    }
  }
);

export const clearCart = createAsyncThunk('cart/clearCart', async () => {
  await cartService.clearCart();
  return { cartId: '', items: [], totalItems: 0, subtotal: 0 };
});

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add to cart
      .addCase(addToCart.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      // Remove from cart
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      // Clear cart
      .addCase(clearCart.fulfilled, (state, action) => {
        state.cart = action.payload;
      });
  },
});

export const { clearError } = cartSlice.actions;

// Selectors - using flexible typing to avoid circular dependencies
export const selectCart = (state: any) => state.cart.cart;
export const selectCartLoading = (state: any) => state.cart.loading;
export const selectCartError = (state: any) => state.cart.error;
export const selectCartItems = (state: any) => state.cart.cart?.items || [];
export const selectCartCount = (state: any) => state.cart.cart?.totalItems || 0;
export const selectIsInCart = (courseId: string) => (state: any) => {
  return state.cart.cart?.items?.some((item: any) => item.courseId === courseId) || false;
};

export default cartSlice.reducer;