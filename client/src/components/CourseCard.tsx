import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { Course } from "../api/courseApi";
import { Heart, Loader2, ShoppingCart, Star } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../store";

import { Price, RatingStars } from "../utils/Helping";
import { cn } from "../lib/utils";
import { CourseHoverCard } from "./CourseHoverCard";

interface CourseCardProps {
  course: Course;
}

const CourseCard = ({ course }: CourseCardProps) => {
  const navigate = useNavigate();

  const [hovered, setHovered] = useState(false);

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

  

  return (
    <div
      className={cn("group relative")}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      
    >
      <article
        tabIndex={0}
        className={cn(
          "flex h-full w-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white",
          "shadow-sm transition-all duration-300 ease-out",
          "group-hover:-translate-y-1 group-hover:shadow-xl group-hover:ring-1 group-hover:ring-violet-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
        )}
      >
        {/* Thumbnail — fixed aspect keeps width/height consistent across cards */}
        <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-neutral-100">
          <img
            src={course.thumbnail}
            alt={course.title}
            loading="lazy"
            className={cn(
              "h-full w-full object-cover transition-transform duration-500 ease-out",
              "group-hover:scale-105",
            )}
          />
  
        </div>

        {/* Body — flex-1 with fixed-height zones so every card matches */}
        <div className="flex flex-1 flex-col gap-2 p-4">
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-snug text-neutral-900">
            {course.title}
          </h3>

          <p className="line-clamp-1 text-xs text-neutral-500">
         Ankit 
          </p>

          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-amber-600">
              {course.rating.toFixed(1)}
            </span>
            <RatingStars rating={course.rating} size={12} />
      
            <span className="text-xs text-neutral-400">
              ({course.reviewCount})
            </span>
          </div>

          <Price
            currentPrice={course.discountPrice as number}
            originalPrice={course.price}
            className="pt-1"
          />
        </div>
      </article>

      {hovered && (
        <div
          className={cn(
            "absolute top-0 z-30 hidden overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl",
            "md:block",
            "left-full ml-2 w-[22rem]",
            "animate-[hoverFadeIn_0.2s_ease-out]",
          )}
          role="complementary"
        >
          <CourseHoverCard course={course} />
        </div>
      )}
    </div>
  );
};

export default CourseCard;
