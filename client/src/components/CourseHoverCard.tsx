import {
  Check,
  Clock,
  BarChart3,
  Calendar,
  Users,
  ShoppingCart,
  Loader2,
  Heart,
  Play,
} from "lucide-react";
import { Button } from "../components/ui/button";
import type { Course } from "../api/courseApi";
import { formatDateTime, RatingStars } from "../utils/Helping";
import { useEffect, useState } from "react";
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
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/store";
import { selectEnrollmentByCourseId } from "../store/enrollmentSlice";
import { useNavigate } from "react-router-dom";
interface CourseHoverCardProps {
  course: Course;
}

export function CourseHoverCard({ course }: CourseHoverCardProps) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const inCart = useSelector(selectIsInCart(course._id));
  const inWishlist = useSelector(selectIsInWishlist(course._id));
  const enrollment = useSelector(selectEnrollmentByCourseId(course._id));
  const isEnrolled = !!enrollment;

  // Separate loading flags so buttons don't get stuck disabled
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchCart());
    dispatch(fetchWishlist());
  }, [dispatch]);

  const handleWishlistClick = async () => {
    if (wishlistLoading || isEnrolled) return;
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
    if (cartLoading || isEnrolled) return;
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

  const handleGoToCourse = () => {
    navigate(`/course-player/${course._id}`);
  };

  return (
    <div className="flex w-[22rem] max-w-[90vw] flex-col gap-3 p-5">
      <div>
        <h3 className="line-clamp-2 text-base font-bold leading-snug text-neutral-900">
          {course.title}
        </h3>
      </div>

      <p className="line-clamp-3 text-sm leading-relaxed text-neutral-600">
        {course.description}
      </p>

      <div className="flex items-center gap-2 text-sm text-neutral-700">
        <span className="font-semibold text-amber-600">
          {course.rating.toFixed(1)}
        </span>
        <RatingStars rating={course.rating} size={12} />
        <span className="text-neutral-400">·</span>
        <span className="text-xs text-neutral-500">
          {course.reviewCount} ratings
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-600">
        <span className="flex items-center gap-1">
          <Users size={13} className="text-neutral-400" />
          {course.totalLessons} learners
        </span>
        <span className="flex items-center gap-1">
          <Clock size={13} className="text-neutral-400" />
          {course.duration}
        </span>
        <span className="flex items-center gap-1">
          <Calendar size={13} className="text-neutral-400" />
          Updated {formatDateTime(course.updatedAt)}
        </span>
        <span className="flex items-center gap-1">
          <BarChart3 size={13} className="text-neutral-400" />
          {course.level}
        </span>
      </div>

      <div className="border-t border-neutral-100 pt-3">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-neutral-500">
          What you&apos;ll learn
        </p>
        <ul className="grid grid-cols-1 gap-1.5">
          {course.learningOutcomes.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 text-xs leading-snug text-neutral-700"
            >
              <Check
                size={14}
                className="mt-0.5 shrink-0 text-violet-600"
                strokeWidth={2.5}
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-1 flex gap-3">
        {isEnrolled ? (
          <button
            onClick={handleGoToCourse}
            className="flex-1 flex items-center cursor-pointer justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl font-semibold text-sm transition-all duration-300 hover:bg-green-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-500/25 active:scale-95"
            aria-label="Go to course"
          >
            <Play className="w-4 h-4" />
            <span>Let's Start Learning</span>
          </button>
        ) : (
          <>
            <button
              onClick={handleCartClick}
              disabled={cartLoading || inWishlist}
              className="flex-1 flex items-center cursor-pointer justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-xl font-semibold text-sm transition-all duration-300 hover:bg-purple-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/25 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              aria-label={inCart ? "Remove from cart" : "Add to cart"}
            >
              {" "}
              {cartLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShoppingCart className="w-4 h-4" />
              )}{" "}
              <span>
                {" "}
                {cartLoading
                  ? inCart
                    ? "Removing..."
                    : "Adding..."
                  : inCart
                    ? "Remove from Cart"
                    : "Add to Cart"}{" "}
              </span>{" "}
            </button>
            <button
              onClick={handleWishlistClick}
              disabled={wishlistLoading || inCart}
              className={`px-4 py-3 rounded-xl font-semibold cursor-pointer text-sm border-2 transition-all duration-300 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed ${
                inWishlist
                  ? "border-purple-500 bg-purple-50 text-purple-600"
                  : "border-gray-200 text-gray-500 hover:border-purple-300 hover:text-purple-600"
              }`}
              aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
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
          </>
        )}
      </div>
    </div>
  );
}
