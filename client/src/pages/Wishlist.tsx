// src/pages/Wishlist.tsx
//
// Wishlist page — uses Redux to manage wishlist state and renders it.

import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Trash2, ShoppingBag, Eye } from "lucide-react";

import { useAppDispatch, useAppSelector } from "../store";
import {
  fetchWishlist,
  removeFromWishlist as removeFromWishlistAction,
} from "../store/wishlistSlice";
import {
  addToCart as addToCartAction,
  removeFromCart as removeFromCartAction,
} from "../store/cartSlice";
import {
  selectWishlistItems,
  selectWishlistLoading,
} from "../store/wishlistSlice";
import { selectIsInCart } from "../store/cartSlice";

export const Wishlist = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const wishlistItems = useAppSelector(selectWishlistItems);
  const loading = useAppSelector(selectWishlistLoading);

  // ─── Fetch wishlist data on mount ────────────────────────────────────────────

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  // ─── Remove from wishlist ────────────────────────────────────────────────────

  const handleRemove = async (courseId: string) => {
    await dispatch(removeFromWishlistAction(courseId));
  };

  // ─── Add to cart ─────────────────────────────────────────────────────────────
  const rootState = useAppSelector((state) => state);

  const handleAddToCart = async (courseId: string) => {
    await dispatch(addToCartAction(courseId));
    await dispatch(removeFromWishlistAction(courseId));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-20"
          >
            <div className="w-8 h-8 border-4 border-brand-purple/30 border-t-brand-purple rounded-full animate-spin" />
          </motion.div>
        ) : wishlistItems.length > 0 ? (
          <motion.div
            key="wishlist-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {wishlistItems.map(
              (item: {
                courseId: string;
                title: string;
                thumbnail: string;
                price: number;
                slug: string;
              }) => {
                const isAddedToCart = selectIsInCart(item.courseId)(rootState);
                return (
                  <motion.div
                    key={item.courseId}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-[32px] border border-brand-border premium-shadow overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:border-brand-purple/20 flex flex-col h-full"
                  >
                    {/* Thumbnail Banner */}
                    <div
                      className="h-40 w-full relative flex items-center justify-center text-white p-5 shrink-0 bg-cover bg-center"
                      style={{
                        backgroundImage: item.thumbnail
                          ? `url(${item.thumbnail})`
                          : "linear-gradient(135deg, #7c3aed, #2563eb)",
                      }}
                    >
                      <div className="absolute inset-0 bg-black/15" />
                      <h3 className="font-extrabold text-sm line-clamp-2 px-2 text-center z-10 leading-snug">
                        {item.title}
                      </h3>
                    </div>

                    {/* Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <h3 className="font-extrabold text-sm text-brand-navy mb-2 line-clamp-2">
                        {item.title}
                      </h3>

                      <div className="flex items-center justify-between border-t border-brand-border/60 pt-4 mt-auto">
                        <span className="text-base font-black text-brand-navy">
                          ${item.price}
                        </span>

                        <div className="flex items-center gap-2">
                          {/* Remove */}
                          <button
                            onClick={() => handleRemove(item.courseId)}
                            className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl cursor-pointer transition-colors"
                            title="Remove from Wishlist"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          {/* View details */}
                          <Link
                            to={`/course/${item.slug}`}
                            className="p-2 bg-bg-secondary text-brand-navy hover:text-brand-purple hover:bg-brand-purple/10 rounded-xl cursor-pointer transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          {/* Add to Cart */}
                          <button
                            onClick={() => handleAddToCart(item.courseId)}
                            className={`p-2 rounded-xl border transition-all cursor-pointer ${
                              isAddedToCart
                                ? "bg-brand-blue/10 border-brand-blue/20 text-brand-blue"
                                : "bg-brand-purple text-white border-transparent hover:opacity-95"
                            }`}
                            title={
                              isAddedToCart ? "Remove from Cart" : "Add to Cart"
                            }
                          >
                            <ShoppingBag className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              },
            )}
          </motion.div>
        ) : (
          /* ─── Empty State ────────────────────────────────────── */
          <motion.div
            key="empty-wishlist"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-20 bg-white border border-brand-border rounded-[32px] premium-shadow max-w-xl mx-auto space-y-6"
          >
            <div className="w-20 h-20 bg-brand-purple/10 rounded-full flex items-center justify-center mx-auto text-brand-purple">
              <Heart className="w-9 h-9" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-brand-navy">
                No saved courses yet.
              </h2>
              <p className="text-xs text-brand-gray font-semibold max-w-xs mx-auto leading-relaxed">
                Add courses you are interested in to your wishlist.
              </p>
            </div>
            <Link
              to="/courses"
              className="px-6 py-3 bg-gradient-to-r from-brand-purple to-brand-blue text-white text-xs font-bold rounded-2xl inline-block premium-shadow"
            >
              Browse Catalog
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
