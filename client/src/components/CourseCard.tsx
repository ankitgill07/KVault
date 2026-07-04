import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { Course } from "../api/courseApi";
import { Heart, Loader2, ShoppingCart, Star } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../store";
import {
  fetchCart,
  addToCart as addToCartAction,
  removeFromCart as removeFromCartAction,
  selectIsInCart,
} from "../store/cartSlice";
import {
  fetchWishlist,
  addToWishlist as addToWishlistAction,
  removeFromWishlist as removeFromWishlistAction,
  selectIsInWishlist,
} from "../store/wishlistSlice";
import { renderStars } from "../utils/Helping";

interface CourseCardProps {
  course: Course;
}

const CourseCard = ({ course }: CourseCardProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const inCart = useSelector(selectIsInCart(course._id));
  const inWishlist = useSelector(selectIsInWishlist(course._id));

  // Separate loading flags so buttons don't get stuck disabled
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  useEffect(() => {
    dispatch(fetchCart());
    dispatch(fetchWishlist());
  }, [dispatch]);

  const handleWishlistClick = async () => {
    if (wishlistLoading) return;
    setWishlistLoading(true);
    try {
      if (inWishlist) {
        await dispatch(removeFromWishlistAction(course._id)).unwrap();
      } else {
        await dispatch(addToWishlistAction(course._id)).unwrap();
      }
    } catch (err) {
      console.error("Wishlist action failed:", err);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleCartClick = async () => {
    if (cartLoading) return;
    setCartLoading(true);
    try {
      if (inCart) {
        await dispatch(removeFromCartAction(course._id)).unwrap();
      } else {
        await dispatch(addToCartAction(course._id)).unwrap();
      }
    } catch (err) {
      console.error("Cart action failed:", err);
    } finally {
      setCartLoading(false);
    }
  };

  return (
    <div>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={course._id}
          layout
          whileHover="hover"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="group bg-white rounded-2xl border cursor-pointer border-gray-200 overflow-hidden transition-all duration-300 hover:border-violet-200 hover:shadow-xl"
        >
          <div>
            <div className="relative  overflow-hidden rounded-t-2xl bg-gray-100">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-contain transition-transform duration-400 ease-out group-hover:scale-110"
              />
            </div>

            <div className="p-5">
              <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-2 mb-2">
                {course.title}
              </h3>


              <div className="flex items-center gap-3 mb-4 text-sm">
                <div className="flex items-center gap-0.5">
                  {renderStars(course.rating)}
                </div>
                <span className="font-semibold text-gray-900">
                  {course.rating.toFixed(1)}
                </span>
                <span className="text-gray-500">
                  ({course.reviewCount.toLocaleString()} Reviews)
                </span>
              </div>

              <div className="flex items-baseline gap-2 mb-5">
                <span className="text-2xl font-bold text-gray-900">
                  ${course.discountPrice}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  ${course.price}
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCartClick}
                  disabled={cartLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-xl font-semibold text-sm transition-all duration-300 hover:bg-purple-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/25 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  aria-label={inCart ? "Remove from cart" : "Add to cart"}
                >
                  {cartLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ShoppingCart className="w-4 h-4" />
                  )}
                  <span>
                    {cartLoading
                      ? inCart
                        ? "Removing..."
                        : "Adding..."
                      : inCart
                        ? "Remove from Cart"
                        : "Add to Cart"}
                  </span>
                </button>
                <button
                  onClick={handleWishlistClick}
                  disabled={wishlistLoading}
                  className={`px-4 py-3 rounded-xl font-semibold text-sm border-2 transition-all duration-300 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed ${
                    inWishlist
                      ? "border-purple-500 bg-purple-50 text-purple-600"
                      : "border-gray-200 text-gray-500 hover:border-purple-300 hover:text-purple-600"
                  }`}
                  aria-label={
                    inWishlist ? "Remove from wishlist" : "Add to wishlist"
                  }
                >
                  {wishlistLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Heart
                      className={`w-4 h-4 transition-transform duration-300 ${
                        inWishlist ? "fill-current scale-110" : ""
                      }`}
                    />
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default CourseCard;
