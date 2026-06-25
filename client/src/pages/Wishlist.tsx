import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Trash2, ShoppingBag, Eye, Star, BookOpen, Clock } from 'lucide-react';
import { COURSES } from '../data/courses';
import { Breadcrumbs } from '../components/Breadcrumbs';

interface WishlistProps {
  cart: string[];
  wishlist: string[];
  onToggleCart: (courseId: string) => void;
  onToggleWishlist: (courseId: string) => void;
}

export const Wishlist: React.FC<WishlistProps> = ({
  cart,
  wishlist,
  onToggleCart,
  onToggleWishlist,
}) => {
  const navigate = useNavigate();

  // Find course items in Wishlist
  const wishlistItems = COURSES.filter(course => wishlist.includes(course.id));

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full">
      <Breadcrumbs />

      <div className="mt-8 mb-8">
        <h1 className="text-3xl font-black text-brand-navy tracking-tight">My Wishlist</h1>
        <p className="text-xs text-brand-gray font-bold uppercase tracking-wider mt-1.5">
          {wishlistItems.length} saved courses
        </p>
      </div>

      <AnimatePresence mode="wait">
        {wishlistItems.length > 0 ? (
          <motion.div
            key="wishlist-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {wishlistItems.map((item) => {
              const isAddedToCart = cart.includes(item.id);
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-[32px] border border-brand-border premium-shadow overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:border-brand-purple/20 flex flex-col h-full"
                >
                  {/* Thumbnail Banner */}
                  <div className="h-40 w-full relative flex items-center justify-center text-white p-5 shrink-0" style={{ background: item.gradient }}>
                    <div className="absolute inset-0 bg-black/15"></div>
                    <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur border border-white/10 rounded-full text-[9px] font-bold uppercase tracking-wider absolute top-4 left-4">
                      {item.category}
                    </span>
                    <h3 className="font-extrabold text-sm line-clamp-2 px-2 text-center z-10 leading-snug">{item.title}</h3>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <img
                          src={item.instructorAvatar}
                          alt={item.instructor}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-xs font-bold text-brand-navy leading-none">{item.instructor}</p>
                          <p className="text-[9px] text-brand-gray font-medium mt-0.5">{item.instructorRole}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 border-t border-brand-border/60 pt-3 mb-4 text-xs font-bold text-brand-navy">
                        <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-brand-gold text-brand-gold" /> {item.rating}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-brand-blue" /> {item.duration.split(' ')[0]}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-brand-border/60 pt-4 mt-auto">
                      <span className="text-base font-black text-brand-navy">${item.price}</span>
                      
                      <div className="flex items-center gap-2">
                        {/* Remove */}
                        <button
                          onClick={() => onToggleWishlist(item.id)}
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
                          onClick={() => onToggleCart(item.id)}
                          className={`p-2 rounded-xl border transition-all cursor-pointer ${
                            isAddedToCart
                              ? 'bg-brand-blue/10 border-brand-blue/20 text-brand-blue'
                              : 'bg-brand-purple text-white border-transparent hover:opacity-95'
                          }`}
                          title={isAddedToCart ? "Remove from Cart" : "Add to Cart"}
                        >
                          <ShoppingBag className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                </motion.div>
              );
            })}
          </motion.div>
        ) : (
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
              <h2 className="text-xl font-extrabold text-brand-navy">No saved courses yet.</h2>
              <p className="text-xs text-brand-gray font-semibold max-w-xs mx-auto leading-relaxed">
                Add courses that you are interested in to your wishlist to check out later.
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
