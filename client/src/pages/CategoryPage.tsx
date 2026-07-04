import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, BookOpen, Clock, Star, Heart, ShoppingBag, Eye, ArrowLeft, ArrowRight, Check } from 'lucide-react';

import { type Category } from '../api/categoryApi';
import useAllCourses from '../hooks/useAllCourses';
import CourseCard from '../components/CourseCard';
import type { Course } from '../api/courseApi';
import { categoryService } from '../services/categoryService';



export const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const {courses }= useAllCourses()
  const [category, setCategory] = useState<Category[]>([]);
  const getCategories = async () => {
    const data = await categoryService.getAllCategories();
    setCategory(data);
  };

  useEffect(() => {
    getCategories();
  }, []);
  const activeCategory = category.find(c => c.slug === slug);

  // Filters local state
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>('popular');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // Reset page on category change
    setCurrentPage(1);
  }, [slug]);

  if (!activeCategory) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-black text-brand-navy">Category Not Found</h2>
        <p className="text-xs text-brand-gray mt-2 font-semibold">The requested course classification could not be found.</p>
        <button
          onClick={() => navigate('/courses')}
          className="mt-6 px-6 py-2.5 bg-brand-purple text-white text-xs font-bold rounded-2xl cursor-pointer"
        >
          View All Courses
        </button>
      </div>
    );
  }

  // Filter courses by this category and filters
  const filteredCourses = courses.filter(course => {
    // Category match


    const matchesLevel = selectedLevel 
      ? course.level.toLowerCase() === selectedLevel.toLowerCase()
      : true;

    const matchesPrice = maxPrice !== null
      ? course.price <= maxPrice
      : true;

    const matchesRating = minRating !== null
      ? course.rating >= minRating
      : true;


  }).sort((a, b) => {
    if (sortBy === 'popular') return b.enrollmentCount - a.enrollmentCount;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  // Mock pagination (3 items per page for visual demo of pages)
  const itemsPerPage = 3;
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage) || 1;
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full">


      {/* Category Header */}
      <div className="mt-8 mb-12 relative p-8 sm:p-12 rounded-[32px] overflow-hidden border border-brand-purple/10 bg-gradient-to-tr from-brand-navy to-brand-navy/95 text-white premium-shadow">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-purple/10 rounded-full blur-[90px]"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-blue/10 rounded-full blur-[80px]"></div>
        
        <div className="max-w-xl z-10 relative space-y-4">
          <span className="px-3 py-1 bg-brand-purple/20 text-brand-purple-light border border-brand-purple/30 text-[10px] font-bold rounded-full uppercase tracking-wider block w-fit">
            Specialization Hub
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            {activeCategory.name} Courses
          </h1>
          <p className="text-xs sm:text-sm text-white/80 font-medium leading-relaxed">
            Master modern technologies with curated learning paths, code sandboxes, and verification audits.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Filter Sidebar */}
        <aside className="w-full lg:w-3/12 space-y-6">
          <div className="bg-white rounded-3xl border border-brand-border premium-shadow p-6 space-y-6">
            
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-4">
              <span className="font-extrabold text-sm text-brand-navy flex items-center gap-1.5">
                <SlidersHorizontal className="w-4.5 h-4.5 text-brand-purple" />
                Category Filters
              </span>
            </div>

            {/* Other Categories quick list */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-navy block">Other Categories</label>
              <div className="space-y-1">
                {category.filter(c => c._id !== activeCategory._id).slice(0, 4).map(cat => (
                  <Link
                    key={cat._id}
                    to={`/category/${cat.slug}`}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-brand-navy hover:bg-bg-secondary transition-colors block"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Level */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-navy block">Level</label>
              <div className="grid grid-cols-3 gap-1.5">
                {['Beginner', 'Intermediate', 'Advanced'].map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => { setSelectedLevel(selectedLevel === lvl ? null : lvl); setCurrentPage(1); }}
                    className={`py-2 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                      selectedLevel === lvl
                        ? 'border-brand-purple bg-brand-purple/5 text-brand-purple'
                        : 'border-brand-border text-brand-navy hover:bg-bg-secondary'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-navy flex justify-between">
                <span>Max Price</span>
                <span className="text-brand-purple">{maxPrice ? `$${maxPrice}` : 'Any'}</span>
              </label>
              <input
                type="range"
                min="0"
                max="300"
                step="50"
                value={maxPrice || 300}
                onChange={(e) => {
                  setMaxPrice(Number(e.target.value) === 300 ? null : Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-full accent-brand-purple cursor-pointer"
              />
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-navy block">Minimum Rating</label>
              <div className="flex items-center gap-1.5">
                {[4.5, 4.7, 4.9].map(rate => (
                  <button
                    key={rate}
                    onClick={() => { setMinRating(minRating === rate ? null : rate); setCurrentPage(1); }}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      minRating === rate
                        ? 'border-brand-gold bg-brand-gold/5 text-brand-gold'
                        : 'border-brand-border text-brand-navy hover:bg-bg-secondary'
                    }`}
                  >
                    <Star className="w-3 h-3" />
                    {rate}+
                  </button>
                ))}
              </div>
            </div>

          </div>
        </aside>

        {/* Main courses grid */}
        <main className="w-full lg:w-9/12">
          
          <div className="bg-white rounded-3xl border border-brand-border premium-shadow p-4 mb-6 flex items-center justify-between">
            <span className="text-xs font-bold text-brand-gray">
              Showing {filteredCourses.length} results in {activeCategory.name}
            </span>

            {/* Sorting */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-gray hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-brand-border rounded-2xl text-xs font-bold text-brand-navy focus:border-brand-purple cursor-pointer bg-bg-secondary"
              >
                <option value="popular">Popular</option>
                <option value="newest">Newest</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          {paginatedCourses.length > 0 ? (
           <div>
            {filteredCourses.map((course : Course) => (
            <CourseCard key={course._id} course={course} />
          ))}
           </div>
          ) : (
            <div className="text-center py-16 bg-white border border-brand-border rounded-[32px] premium-shadow">
              <h3 className="font-extrabold text-brand-navy">No courses found in this category</h3>
              <p className="text-xs text-brand-gray mt-2 font-medium">Try resetting your rating or level filters to see available courses.</p>
            </div>
          )}

        </main>
      </div>

    </div>
  );
};
