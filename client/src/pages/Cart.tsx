import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Heart, ArrowRight, ShoppingBag, Percent, BookOpen, Clock, Tag } from 'lucide-react';
import { COURSES } from '../data/courses';
import { Breadcrumbs } from '../components/Breadcrumbs';

interface CartProps {
  cart: string[];
  wishlist: string[];
  onToggleCart: (courseId: string) => void;
  onToggleWishlist: (courseId: string) => void;
  onClearCart: () => void;
  onPurchaseSuccess: (enrolledList: string[]) => void;
}

export const Cart: React.FC<CartProps> = ({
  cart,
  wishlist,
  onToggleCart,
  onToggleWishlist,
  onClearCart,
  onPurchaseSuccess,
}) => {
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Find course items in Cart
  const cartItems = COURSES.filter(course => cart.includes(course.id));

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const total = subtotal - discountAmount;

  const applyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    
    if (couponCode.toUpperCase() === 'KVAULT50') {
      setDiscountPercent(50);
      setCouponSuccess('Coupon applied! 50% discount has been subtracted.');
    } else if (couponCode.toUpperCase() === 'EARLYACCESS') {
      setDiscountPercent(20);
      setCouponSuccess('Coupon applied! 20% discount has been subtracted.');
    } else {
      setCouponError('Invalid coupon code. Try KVAULT50.');
    }
  };

  const handleCheckout = async () => {
    const token = localStorage.getItem('kvault_access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    onPurchaseSuccess(cart);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full">
      <Breadcrumbs />

      <div className="mt-8 mb-8">
        <h1 className="text-3xl font-black text-brand-navy tracking-tight">Shopping Cart</h1>
        <p className="text-xs text-brand-gray font-bold uppercase tracking-wider mt-1.5">
          {cartItems.length} courses in your queue
        </p>
      </div>

      <AnimatePresence mode="wait">
        {cartItems.length > 0 ? (
          <motion.div
            key="cart-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col lg:flex-row gap-8 items-start"
          >
            {/* Left Side: Cart Items List */}
            <div className="w-full lg:w-8/12 space-y-4">
              <AnimatePresence>
                {cartItems.map((item) => {
                  const isWishlisted = wishlist.includes(item.id);
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      className="bg-white rounded-3xl border border-brand-border premium-shadow p-5 flex flex-col sm:flex-row gap-5 hover:border-brand-purple/20 transition-colors"
                    >
                      {/* Gradient Thumbnail */}
                      <div className="h-28 w-full sm:w-44 rounded-2xl flex items-center justify-center text-white shrink-0 font-extrabold text-xs text-center p-4 relative" style={{ background: item.gradient }}>
                        <div className="absolute inset-0 bg-black/10"></div>
                        <span className="z-10 line-clamp-2">{item.title}</span>
                      </div>

                      {/* Info & Meta */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div className="space-y-1">
                          <span className="px-2 py-0.5 bg-brand-purple/10 text-brand-purple rounded-md text-[8px] font-bold uppercase tracking-wider w-fit block">
                            {item.category}
                          </span>
                          <h3 className="font-extrabold text-sm text-brand-navy truncate leading-snug">
                            {item.title}
                          </h3>
                          <p className="text-[10px] text-brand-gray font-bold">By {item.instructor}</p>
                          
                          <div className="flex items-center gap-4 text-[10px] font-semibold text-brand-gray pt-1.5">
                            <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5 text-brand-purple" /> {item.lessonsCount} lessons</span>
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-brand-blue" /> {item.duration}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-brand-border/60">
                          <button
                            onClick={() => onToggleCart(item.id)}
                            className="text-[10px] font-bold text-red-500 hover:text-red-700 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Remove
                          </button>
                          
                          <button
                            onClick={() => {
                              onToggleCart(item.id);
                              if (!isWishlisted) onToggleWishlist(item.id);
                            }}
                            className="text-[10px] font-bold text-brand-purple hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Heart className="w-3.5 h-3.5 fill-brand-purple/10" />
                            Save for later
                          </button>
                        </div>

                      </div>

                      {/* Price tag */}
                      <div className="text-right flex sm:flex-col justify-between sm:justify-start items-center sm:items-end shrink-0 pl-1 border-t sm:border-t-0 sm:border-l border-brand-border/60 pt-3 sm:pt-0 sm:pl-5">
                        <span className="text-lg font-black text-brand-navy">${item.price}</span>
                        <span className="text-[10px] text-brand-gray line-through font-bold mt-0.5">${item.originalPrice}</span>
                      </div>

                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Right Side: Sticky Checkout Card */}
            <aside className="w-full lg:w-4/12 sticky top-24 z-20">
              <div className="bg-white rounded-[32px] border border-brand-border premium-shadow p-6 space-y-6">
                <h3 className="font-extrabold text-sm text-brand-navy border-b border-brand-border/60 pb-3">
                  Summary
                </h3>

                {/* Price Breakdown */}
                <div className="space-y-3.5 text-xs text-brand-gray font-bold">
                  <div className="flex justify-between">
                    <span>Original Price</span>
                    <span className="text-brand-navy font-semibold">${subtotal}</span>
                  </div>
                  {discountPercent > 0 && (
                    <div className="flex justify-between text-emerald-600 font-extrabold">
                      <span className="flex items-center gap-1"><Percent className="w-3.5 h-3.5" /> Coupon Discount</span>
                      <span>-${discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-brand-navy font-black border-t border-brand-border/60 pt-4">
                    <span>Total</span>
                    <span className="text-brand-purple text-lg">${total}</span>
                  </div>
                </div>

                {/* Coupon input */}
                <form onSubmit={applyCoupon} className="space-y-2 pt-2 border-t border-brand-border/60">
                  <label className="text-[10px] font-bold text-brand-navy uppercase tracking-wider block">Apply Promo Coupon</label>
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
                      className="px-4 py-2 bg-brand-purple hover:bg-brand-purple-light text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && <p className="text-[10px] text-red-500 font-bold mt-1">{couponError}</p>}
                  {couponSuccess && <p className="text-[10px] text-emerald-600 font-bold mt-1">{couponSuccess}</p>}
                </form>

                {/* Checkout Actions */}
                <div className="space-y-3.5 pt-4">
                  <button
                    onClick={handleCheckout}
                    className="w-full py-4 rounded-[20px] bg-gradient-to-r from-brand-purple to-brand-blue hover:opacity-95 text-white text-xs font-extrabold transition-all premium-shadow cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Proceed To Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <Link
                    to="/courses"
                    className="w-full py-3 border border-brand-border rounded-[20px] text-xs font-bold text-brand-navy hover:bg-bg-secondary flex items-center justify-center cursor-pointer transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </div>

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
              <h2 className="text-xl font-extrabold text-brand-navy">Your cart is waiting.</h2>
              <p className="text-xs text-brand-gray font-semibold max-w-xs mx-auto leading-relaxed">
                Explore courses and start building your next skill. Choose from our premium catalog.
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
  );
};
