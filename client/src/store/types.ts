import type { CartState } from './cartSlice';
import type { WishlistState } from './wishlistSlice';

export interface RootState {
  cart: CartState;
  wishlist: WishlistState;
}

export type AppDispatch = import('./index').AppDispatch;