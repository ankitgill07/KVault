import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Course } from "../api/courseApi";
import { useUser } from "../context/UserContext";
import {
  addToCart as addToCartAction,
  fetchCart,
  removeFromCart as removeFromCartAction,
  selectIsInCart,
} from "../store/cartSlice";
import {
  addToWishlist as addToWishlistAction,
  fetchWishlist,
  removeFromWishlist as removeFromWishlistAction,
  selectIsInWishlist,
} from "../store/wishlistSlice";
import {
  fetchMyEnrollments,
  selectEnrollmentByCourseId,
} from "../store/enrollmentSlice";
import { useAppDispatch, useAppSelector } from "../store";

let hasRequestedCourseLists = false;

export function useCourseLibraryActions(course: Course) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isSignedIn } = useUser();
  const inCart = useAppSelector(selectIsInCart(course._id));
  const inWishlist = useAppSelector(selectIsInWishlist(course._id));
  const enrollment = useAppSelector(selectEnrollmentByCourseId(course._id));
  const isEnrolled = !!enrollment;
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    if (hasRequestedCourseLists) return;

    hasRequestedCourseLists = true;
    dispatch(fetchCart());
    dispatch(fetchWishlist());
    dispatch(fetchMyEnrollments());
  }, [dispatch]);

  const handleWishlistClick = async () => {
    if (!isSignedIn) {
      navigate("/login");
      return;
    }
    if (cartLoading || wishlistLoading || isEnrolled) return;

    setWishlistLoading(true);
    try {
      if (inWishlist) {
        await dispatch(removeFromWishlistAction(course._id)).unwrap();
      } else {
        if (inCart) {
          await dispatch(removeFromCartAction(course._id)).unwrap();
        }
        await dispatch(addToWishlistAction(course._id)).unwrap();
      }
    } catch (err) {
      console.error("Wishlist action failed:", err);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleCartClick = async () => {
    if (!isSignedIn) {
      navigate("/login");
      return;
    }
    if (cartLoading || wishlistLoading || isEnrolled) return;

    setCartLoading(true);
    try {
      if (inCart) {
        await dispatch(removeFromCartAction(course._id)).unwrap();
      } else {
        if (inWishlist) {
          await dispatch(removeFromWishlistAction(course._id)).unwrap();
        }
        await dispatch(addToCartAction(course._id)).unwrap();
      }
    } catch (err) {
      console.error("Cart action failed:", err);
    } finally {
      setCartLoading(false);
    }
  };

  const handleGoToCourse = () => {
    navigate(`/learn/${course.slug}`);
  };

  return {
    cartLoading,
    handleCartClick,
    handleGoToCourse,
    handleWishlistClick,
    inCart,
    inWishlist,
    isEnrolled,
    wishlistLoading,
  };
}
