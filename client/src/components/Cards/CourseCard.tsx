import { Link } from "react-router-dom";
import type { Course } from "../../api/courseApi";
import {
  BadgeCheck,
  BookOpen,
  Clock,
  Heart,
  Loader2,
  Play,
  ShoppingCart,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";
import { formatDuration } from "../../utils/Helping";
import { useCourseLibraryActions } from "../../hooks/useCourseLibraryActions";
import { getMediaUrl } from "../../utils/mediaUrl";

interface CourseCardProps {
  course: Course;
}

const CourseCard = ({ course }: CourseCardProps) => {
  const {
    cartLoading,
    handleCartClick,
    handleGoToCourse,
    handleWishlistClick,
    inCart,
    inWishlist,
    isEnrolled,
    wishlistLoading,
  } = useCourseLibraryActions(course);

  const categoryName =
    typeof course.category === "object" && course.category?.name
      ? course.category.name
      : "";

  const instructorName =
    course.primaryInstructor &&
    typeof course.primaryInstructor === "object" &&
    (course.primaryInstructor as any).name
      ? (course.primaryInstructor as any).name
      : "Instructor";

  const thumbnailUrl = getMediaUrl(course.thumbnailUrl);

  return (
    <div className="group relative">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="group bg-white dark:bg-bg-card rounded-2xl border border-brand-border/60 dark:border-brand-border hover:border-brand-purple/30 shadow-sm hover:shadow-xl hover:shadow-brand-navy/5 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
      >
        <Link to={`/course/${course.slug}`} className="block w-full">
          {/* Compact Thumbnail (Aspect Video) */}
          <div className="w-full aspect-video relative overflow-hidden bg-gray-100 dark:bg-bg-secondary">
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={course.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-4 text-white bg-gradient-to-br from-brand-navy to-brand-purple transition-transform duration-500 group-hover:scale-105">
                <span className="text-[9px] uppercase font-bold tracking-widest bg-black/20 px-2 py-1 rounded-md mb-2">
                  {categoryName || course.level}
                </span>
                <h3 className="font-extrabold text-sm text-center line-clamp-2 px-2">
                  {course.title}
                </h3>
              </div>
            )}

            {/* Minimal Badges */}
            <div className="absolute top-2 left-2 flex gap-1">
              <span className="text-[9px] font-black uppercase tracking-wider bg-white/90 dark:bg-bg-card/90 backdrop-blur-sm text-brand-navy px-2 py-1 rounded-md shadow-sm">
                {course.level}
              </span>
            </div>
          </div>
        </Link>

        {/* Compact Card Body */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Meta Row: Rating & Category */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-brand-purple uppercase tracking-wider">
              {categoryName}
            </span>
            <div className="flex items-center gap-1 text-brand-gold">
              <Star className="w-3 h-3 fill-current" />
              <span className="text-[11px] font-bold text-brand-navy">
                {" "}
                {course.rating.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Title */}
          <Link to={`/course/${course.slug}`} className="block">
            <h3 className="font-extrabold text-sm text-brand-navy leading-snug line-clamp-2 mb-1.5  transition-colors">
              {course.title}
            </h3>
          </Link>

          {/* Instructor */}
          <p className="text-[11px] font-semibold text-brand-gray/80 mb-3 truncate">
            By {instructorName}
          </p>

          {/* Streamlined Stats */}
          <div className="flex items-center gap-3 text-[11px] font-semibold text-brand-gray/80 mt-auto mb-4">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatDuration(course.duration)}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-brand-border/80"></div>
            <div className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              <span>{course.totalLessons} lessons</span>
            </div>
          </div>

          {/* Footer: Price & Compact Actions */}
          <div className="pt-3 border-t border-brand-border/50 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              {/* Discounted Price */}
              <span className="text-base font-black text-brand-navy">
                ₹{course.discountPrice}
              </span>

              <span className="text-xs font-semibold text-brand-gray/60 line-through">
                ₹{course.price}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {isEnrolled ? (
                <button
                  onClick={handleGoToCourse}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-600 text-white hover:bg-green-700 transition-colors cursor-pointer"
                  title="Start Learning"
                  aria-label="Go to course"
                >
                  <Play className="w-4 h-4 fill-current" />
                </button>
              ) : (
                <>
                  <button
                    onClick={handleWishlistClick}
                    disabled={wishlistLoading || cartLoading}
                    className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-70 ${
                      inWishlist
                        ? "border-brand-purple bg-brand-purple/10 text-brand-purple"
                        : "border-transparent bg-gray-50 dark:bg-bg-secondary text-brand-gray hover:text-brand-purple hover:bg-brand-purple/5"
                    }`}
                    title={inWishlist ? "Added to Wishlist" : "Add to Wishlist"}
                    aria-label={
                      inWishlist ? "Remove from wishlist" : "Add to wishlist"
                    }
                  >
                    {wishlistLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Heart
                        className={`w-4 h-4 ${inWishlist ? "fill-current" : ""}`}
                      />
                    )}
                  </button>

                  <button
                    onClick={handleCartClick}
                    disabled={cartLoading || wishlistLoading}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-70 ${
                      inCart
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-brand-navy dark:bg-brand-purple text-white hover:bg-brand-purple/90 dark:hover:bg-brand-purple/80"
                    }`}
                    title={inCart ? "Already in Cart" : "Add to Cart"}
                    aria-label={inCart ? "Remove from cart" : "Add to cart"}
                  >
                    {cartLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : inCart ? (
                      <BadgeCheck className="w-4 h-4" />
                    ) : (
                      <ShoppingCart className="w-4 h-4" />
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CourseCard;
