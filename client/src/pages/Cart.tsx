import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Heart,
  ArrowRight,
  ShoppingBag,
  Tag,
  Loader2,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "../store";

import {
  fetchCart,
  removeFromCart as removeFromCartAction,
  clearCart as clearCartAction,
} from "../store/cartSlice";
import {
  addToWishlist as addToWishlistAction,
  removeFromWishlist as removeFromWishlistAction,
} from "../store/wishlistSlice";
import { selectCartItems, selectCartLoading } from "../store/cartSlice";
import { selectIsInWishlist } from "../store/wishlistSlice";
import { cartApi, paymentApi } from "../api/cartApi";
import RazorpayCheckout from "../components/RazorpayCheckout";

export const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const cartItems = useAppSelector(selectCartItems);
  const loading = useAppSelector(selectCartLoading);
  const cartData = useAppSelector((state: any) => state.cart.cart);

  // ─── Fetch cart data on mount ────────────────────────────────────────────────

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);
  // ─── Calculations ────────────────────────────────────────────────────────────

  const subtotal = cartItems.reduce(
    (sum: number, item: { price: number }) => sum + item.price,
    0,
  );
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const total = subtotal - discountAmount;

  // ─── Coupon ──────────────────────────────────────────────────────────────────

  const applyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    setCouponSuccess("");

    if (couponCode.toUpperCase() === "KVAULT50") {
      setDiscountPercent(50);
      setCouponSuccess("Coupon applied! 50% discount.");
    } else if (couponCode.toUpperCase() === "EARLYACCESS") {
      setDiscountPercent(20);
      setCouponSuccess("Coupon applied! 20% discount.");
    } else {
      setCouponError("Invalid coupon code. Try KVAULT50.");
    }
  };

  // ─── Checkout ────────────────────────────────────────────────────────────────

  const handleCheckout = async () => {
    try {
      setIsProcessingPayment(true);
      setPaymentError("");

      // Create payment order
      const response = await cartApi.checkout();

      if (response.success && response.data.order) {
        // Open Razorpay checkout
        setRazorpayOrder(response.data.order);
      } else {
        setPaymentError(response.message || "Failed to initiate checkout");
        setIsProcessingPayment(false);
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      setPaymentError(error.message || "Checkout failed. Please try again.");
      setIsProcessingPayment(false);
    }
  };

  const handlePaymentSuccess = async (paymentResponse: any) => {
    try {
      setIsProcessingPayment(true);
      setPaymentError("");

      // Verify payment with backend
      const verifyResponse = await paymentApi.verifyPayment({
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,
      });

      if (verifyResponse.success) {
        // Payment successful - clear cart locally
        await dispatch(clearCartAction());
        setRazorpayOrder(null);
        setPaymentSuccess(true);

        // Redirect to my learning after a short delay
        setTimeout(() => {
          navigate("/my-learning");
        }, 1500);
      } else {
        setPaymentError(
          verifyResponse.message || "Payment verification failed",
        );
        setIsProcessingPayment(false);
      }
    } catch (error: any) {
      console.error("Payment verification error:", error);
      setPaymentError(
        error.message || "Payment verification failed. Please contact support.",
      );
      setIsProcessingPayment(false);
    }
  };

  const handlePaymentFailure = (error: any) => {
    console.error("Payment failed:", error);
    setPaymentError("Payment failed. Please try again.");
    setIsProcessingPayment(false);
    setPaymentSuccess(false);
    setRazorpayOrder(null);
  };

  const handlePaymentDismiss = () => {
    setRazorpayOrder(null);
    setIsProcessingPayment(false);
    setPaymentSuccess(false);
  };

  const [razorpayOrder, setRazorpayOrder] = useState<any>(null);

  // ─── Remove from cart & Save for later ───────────────────────────────────────

  const handleRemove = async (courseId: string) => {
    await dispatch(removeFromCartAction(courseId));
  };

  const handleSaveForLater = async (courseId: string) => {
    await dispatch(removeFromCartAction(courseId));
    await dispatch(addToWishlistAction(courseId));
  };
  const rootState = useAppSelector((state) => state);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full">
        <div className="mt-4 mb-8">
          <h1 className="text-3xl font-black text-brand-navy tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-xs text-brand-gray font-bold uppercase tracking-wider mt-1.5">
            {loading ? "Loading…" : `${cartItems.length} courses in your queue`}
          </p>
        </div>

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
          ) : cartItems.length > 0 ? (
            <motion.div
              key="cart-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col lg:flex-row gap-8 items-start"
            >
              {/* Left */}
              <div className="w-full lg:w-8/12 space-y-4">
                <AnimatePresence>
                  {cartItems.map(
                    (item: {
                      courseId: string;
                      title: string;
                      thumbnail: string;
                      price: number;
                      slug: string;
                    }) => {
                      const isWishlisted = selectIsInWishlist(item.courseId)(
                        rootState,
                      );

                      return (
                        <motion.div
                          key={item.courseId}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -50 }}
                          className="bg-white rounded-3xl border border-brand-border premium-shadow p-5 flex flex-col sm:flex-row gap-5 hover:border-brand-purple/20 transition-colors"
                        >
                          <div
                            className="h-28 w-full sm:w-44 rounded-2xl flex items-center justify-center text-white shrink-0 font-extrabold text-xs text-center p-4 relative bg-cover bg-center"
                            style={{
                              backgroundImage: item.thumbnail
                                ? `url(${item.thumbnail})`
                                : "linear-gradient(135deg, #7c3aed, #2563eb)",
                            }}
                          >
                            <div className="absolute inset-0 bg-black/10 rounded-2xl" />
                            <span className="z-10 line-clamp-2">
                              {item.title}
                            </span>
                          </div>

                          <div className="flex-1 flex flex-col justify-between min-w-0">
                            <h3 className="font-extrabold text-sm text-brand-navy truncate leading-snug">
                              {item.title}
                            </h3>

                            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-brand-border/60">
                              <button
                                onClick={() => handleRemove(item.courseId)}
                                className="text-[10px] font-bold text-red-500 hover:text-red-700 flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Remove
                              </button>

                              {!isWishlisted && (
                                <button
                                  onClick={() =>
                                    handleSaveForLater(item.courseId)
                                  }
                                  className="text-[10px] font-bold text-brand-purple hover:underline flex items-center gap-1"
                                >
                                  <Heart className="w-3.5 h-3.5 fill-brand-purple/10" />
                                  Save for later
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    },
                  )}
                </AnimatePresence>
              </div>

              {/* Right */}
              <aside className="w-full lg:w-4/12">
                <form onSubmit={applyCoupon} className="space-y-2">
                  <label className="text-[10px] font-extrabold text-brand-gray uppercase tracking-wider block">
                    Apply Promo Coupon
                  </label>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-gray" />

                      <input
                        type="text"
                        placeholder="e.g. KVAULT50"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-bg-secondary border border-transparent rounded-xl text-xs font-bold uppercase focus:bg-white"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2 bg-brand-purple hover:bg-brand-purple-light text-white text-xs font-bold rounded-xl"
                    >
                      Apply
                    </button>
                  </div>

                  {couponError && (
                    <p className="text-[10px] text-red-500 font-bold">
                      {couponError}
                    </p>
                  )}

                  {couponSuccess && (
                    <p className="text-[10px] text-emerald-600 font-bold">
                      {couponSuccess}
                    </p>
                  )}
                </form>

                <div className="space-y-3.5 pt-4">
                  {paymentError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-xs text-red-600 font-semibold">
                        {paymentError}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleCheckout}
                    disabled={isProcessingPayment || cartItems.length === 0}
                    className="w-full py-4 rounded-[20px] bg-gradient-to-r from-brand-purple to-brand-blue text-white text-xs font-extrabold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessingPayment ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>Proceed To Checkout</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <Link
                    to="/courses"
                    className="w-full py-3 border border-brand-border rounded-[20px] text-xs font-bold text-brand-navy hover:bg-bg-secondary flex items-center justify-center"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </aside>
            </motion.div>
          ) : (
            <motion.div
              key="empty-cart"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20 bg-white border border-brand-border rounded-[32px] premium-shadow max-w-xl mx-auto space-y-6"
            >
              <div className="w-20 h-20 bg-brand-purple/10 rounded-full flex items-center justify-center mx-auto text-brand-purple">
                <ShoppingBag className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-extrabold text-brand-navy">
                  Your cart is waiting.
                </h2>

                <p className="text-xs text-brand-gray font-semibold max-w-xs mx-auto leading-relaxed">
                  Explore courses and start building your next skill.
                </p>
              </div>

              <Link
                to="/courses"
                className="px-6 py-3 bg-gradient-to-r from-brand-purple to-brand-blue text-white text-xs font-bold rounded-2xl inline-block premium-shadow"
              >
                Browse Courses
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {paymentSuccess && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <div className="bg-white rounded-3xl p-8 max-w-md mx-4 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-brand-navy">Payment Successful!</h3>
            <p className="text-sm text-brand-gray">You are now enrolled in the courses. Redirecting to My Learning...</p>
          </div>
        </motion.div>
      )}

      {razorpayOrder && !paymentSuccess && (
        <RazorpayCheckout
          options={{
            key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_YourKeyId",
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency || "INR",
            name: "KVault",
            description: "Course Purchase",
            order_id: razorpayOrder.orderId,
            prefill: {},
            theme: {
              color: "#7c3aed",
            },
          }}
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentFailure}
          onDismiss={handlePaymentDismiss}
        />
      )}
    </>
  );
};
