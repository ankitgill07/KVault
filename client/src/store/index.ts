import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import cartReducer from './cartSlice';
import wishlistReducer from './wishlistSlice';
import enrollmentReducer from './enrollmentSlice';
import progressReducer from './progressSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    wishlist: wishlistReducer,
    enrollment: enrollmentReducer,
    progress: progressReducer,
  },
  devTools: import.meta.env.DEV,
});

// Type definitions
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T,>(selector: (state: RootState) => T) => useSelector(selector);