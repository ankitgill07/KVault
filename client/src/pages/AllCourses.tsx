import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, BookOpen, Clock, Star, Heart, ShoppingBag, Eye, X, Award, Check } from 'lucide-react';
import { COURSES, CATEGORIES } from '../data/courses';
import type { Course } from '../data/courses';
import { Breadcrumbs } from '../components/Breadcrumbs';

interface AllCoursesProps {
  cart: string[];
  wishlist: string[];
  onToggleCart: (courseId: string) => void;
  onToggleWishlist: (courseId: string) => void;
}

export const AllCourses: React.FC<AllCoursesProps> = ({
  cart,
  wishlist,
  onToggleCart,
  onToggleWishlist,
}) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || '';

  // Local state for search & filters
  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get('category'));
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>('popular');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync state if URL query param changes
  useEffect(() => {
    setSearchQuery(urlQuery);
  }, [urlQuery]);

  // Sync category if URL category param changes
  useEffect(() => {
    const cat = searchParams.get('category');
    setSelectedCategory(cat);
  }, [searchParams]);

  // Handle live search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    setSearchParams(prev => {
      if (val) prev.set('q', val);
      else prev.delete('q');
      return prev;
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedLevel(null);
    setMaxPrice(null);
    setMinRating(null);
    setSortBy('popular');
    setSearchParams({});
  };

  // Filter and sort core logic
  const filteredCourses = COURSES.filter(course => {
    const matchesSearch = searchQuery 
      ? course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        course.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.category.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesCategory = selectedCategory 
      ? course.category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-') === selectedCategory.toLowerCase() ||
        course.category === selectedCategory
      : true;

    const matchesLevel = selectedLevel 
      ? course.difficulty.toLowerCase() === selectedLevel.toLowerCase()
      : true;

    const matchesPrice = maxPrice !== null
      ? course.price <= maxPrice
      : true;

    const matchesRating = minRating !== null
      ? course.rating >= minRating
      : true;

    return matchesSearch && matchesCategory && matchesLevel && matchesPrice && matchesRating;
  }).sort((a, b) => {
    if (sortBy === 'popular') return b.studentsCount - a.studentsCount;
    if (sortBy === 'new') return b.lastUpdated.localeCompare(a.lastUpdated);
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full">
      <Breadcrumbs />

      {/* Top Hero Header Section */}
      <div className="mt-8 mb-12 text-center md:text-left relative overflow-hidden p-8 sm:p-12 rounded-[32px] bg-gradient-to-r from-brand-purple/5 via-brand-blue/5 to-transparent border border-brand-purple/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple/10 rounded-full blur-[80px] -z-10"></div>
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-brand-blue/5 rounded-full blur-[90px] -z-10"></div>
        
        <div className="max-w-2xl">
          <span className="px-3 py-1 bg-brand-purple/10 text-brand-purple text-xs font-bold rounded-full uppercase tracking-wider inline-block mb-4">
            Curated Catalog
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-brand-navy tracking-tight leading-tight">
            Explore Courses
          </h1>
          <p className="mt-4 text-sm sm:text-base font-semibold text-brand-gray leading-relaxed">
            Discover practical courses and learning paths designed for modern learners. Acquire verified credentials and hands-on developer experience.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Sidebar Filters - Desktop */}
        <aside className="w-full lg:w-3/12 space-y-6 hidden lg:block">
          <div className="bg-white rounded-3xl border border-brand-border premium-shadow p-6 space-y-6">
            
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-4">
              <span className="font-extrabold text-sm text-brand-navy flex items-center gap-1.5">
                <SlidersHorizontal className="w-4.5 h-4.5 text-brand-purple" />
                Filters
              </span>
              {(selectedCategory || selectedLevel || maxPrice || minRating || searchQuery) && (
                <button
                  onClick={clearFilters}
                  className="text-xs font-bold text-brand-purple hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Search Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-navy">Search</label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray" />
                <input
                  type="text"
                  placeholder="Keyword..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2 bg-bg-secondary border border-transparent rounded-2xl text-xs font-semibold focus:bg-white"
                />
              </div>
            </div>

            {/* Categories Selector */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-brand-navy block">Category</label>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSearchParams(prev => { prev.delete('category'); return prev; });
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                    !selectedCategory ? 'bg-brand-purple/10 text-brand-purple' : 'hover:bg-bg-secondary text-brand-navy'
                  }`}
                >
                  <span>All Categories</span>
                  {!selectedCategory && <Check className="w-3.5 h-3.5" />}
                </button>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.name);
                      setSearchParams(prev => { prev.set('category', cat.slug); return prev; });
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                      selectedCategory === cat.name || selectedCategory === cat.slug
                        ? 'bg-brand-purple/10 text-brand-purple'
                        : 'hover:bg-bg-secondary text-brand-navy'
                    }`}
                  >
                    <span>{cat.name}</span>
                    {(selectedCategory === cat.name || selectedCategory === cat.slug) && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Level */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-navy block">Level</label>
              <div className="grid grid-cols-3 gap-1.5">
                {['Beginner', 'Intermediate', 'Advanced'].map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setSelectedLevel(selectedLevel === lvl ? null : lvl)}
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

            {/* Price Filter */}
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
                onChange={(e) => setMaxPrice(Number(e.target.value) === 300 ? null : Number(e.target.value))}
                className="w-full accent-brand-purple cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-brand-gray font-bold">
                <span>$0</span>
                <span>$150</span>
                <span>Any</span>
              </div>
            </div>

            {/* Rating Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-navy block">Minimum Rating</label>
              <div className="flex items-center gap-1">
                {[4.5, 4.7, 4.9].map(rate => (
                  <button
                    key={rate}
                    onClick={() => setMinRating(minRating === rate ? null : rate)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      minRating === rate
                        ? 'border-brand-gold bg-brand-gold/5 text-brand-gold'
                        : 'border-brand-border text-brand-navy hover:bg-bg-secondary'
                    }`}
                  >
                    <Star className={`w-3 h-3 ${minRating === rate ? 'fill-brand-gold' : ''}`} />
                    {rate}+
                  </button>
                ))}
              </div>
            </div>

          </div>
        </aside>

        {/* Main Content Grid & Top Filters Bar */}
        <main className="w-full lg:w-9/12">
          
          {/* Filters & Sorting Bar */}
          <div className="bg-white rounded-3xl border border-brand-border premium-shadow p-4 mb-6 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden p-2.5 rounded-2xl bg-bg-secondary hover:bg-brand-purple/10 hover:text-brand-purple text-brand-navy border border-transparent transition-all cursor-pointer"
                title="Filters"
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>
              <span className="text-xs font-bold text-brand-gray">
                Showing {filteredCourses.length} results
              </span>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-gray hidden sm:inline">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-brand-border rounded-2xl text-xs font-bold text-brand-navy focus:border-brand-purple cursor-pointer bg-bg-secondary"
              >
                <option value="popular">Most Popular</option>
                <option value="new">New Releases</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low To High</option>
                <option value="price-high">Price: High To Low</option>
              </select>
            </div>
          </div>

          {/* Courses Grid */}
          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredCourses.map((course) => {
                  const isWishlisted = wishlist.includes(course.id);
                  const isAddedToCart = cart.includes(course.id);
                  
                  return (
                    <motion.div
                      key={course.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="group bg-white rounded-[32px] border border-brand-border premium-shadow overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-brand-purple/30 relative flex flex-col h-full"
                    >
                      {/* Gradient / Thumbnail Placeholder with Category tag */}
                      <div className="h-44 w-full relative flex items-center justify-center text-white p-6 overflow-hidden shrink-0" style={{ background: course.gradient }}>
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-white/20 backdrop-blur rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/10">
                          {course.category}
                        </div>

                        {/* Wishlist Heart Toggle */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            onToggleWishlist(course.id);
                          }}
                          className={`absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center border backdrop-blur transition-all duration-200 cursor-pointer ${
                            isWishlisted 
                              ? 'bg-red-500/20 border-red-500/30 text-red-500' 
                              : 'bg-white/20 border-white/10 text-white hover:bg-white/40'
                          }`}
                        >
                          <Heart className={`w-4.5 h-4.5 ${isWishlisted ? 'fill-red-500' : ''}`} />
                        </button>

                        <div className="text-center z-10 space-y-1 mt-4">
                          <p className="text-xs font-bold tracking-widest text-white/70 uppercase">LEARNING PATH</p>
                          <h4 className="font-extrabold text-base line-clamp-2 px-2">{course.title}</h4>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-5 flex flex-col justify-between flex-1">
                        
                        {/* Instructor Details */}
                        <div className="flex items-center gap-2.5 mb-4">
                          <img
                            src={course.instructorAvatar}
                            alt={course.instructor}
                            className="w-8 h-8 rounded-full border border-brand-purple/20 bg-bg-secondary object-cover"
                          />
                          <div>
                            <p className="text-xs font-bold text-brand-navy">{course.instructor}</p>
                            <p className="text-[10px] text-brand-gray font-medium">{course.instructorRole}</p>
                          </div>
                        </div>

                        {/* Course stats */}
                        <div className="grid grid-cols-3 gap-2 border-y border-brand-border/60 py-3 mb-4 text-center">
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-bold text-brand-gray uppercase tracking-wider block">Rating</span>
                            <span className="text-xs font-extrabold text-brand-navy flex items-center justify-center gap-0.5">
                              <Star className="w-3.5 h-3.5 fill-brand-gold text-brand-gold shrink-0" />
                              {course.rating}
                            </span>
                          </div>
                          <div className="space-y-0.5 border-x border-brand-border/60">
                            <span className="text-[9px] font-bold text-brand-gray uppercase tracking-wider block">Lessons</span>
                            <span className="text-xs font-extrabold text-brand-navy flex items-center justify-center gap-1">
                              <BookOpen className="w-3.5 h-3.5 text-brand-purple shrink-0" />
                              {course.lessonsCount}
                            </span>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-bold text-brand-gray uppercase tracking-wider block">Duration</span>
                            <span className="text-xs font-extrabold text-brand-navy flex items-center justify-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-brand-blue shrink-0" />
                              {course.duration.split(' ')[0]}
                            </span>
                          </div>
                        </div>

                        {/* Price & Actions */}
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xl font-extrabold text-brand-navy">${course.price}</span>
                            <span className="text-xs text-brand-gray line-through font-semibold">${course.originalPrice}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Link
                              to={`/course/${course.slug}`}
                              className="p-2.5 rounded-2xl bg-bg-secondary hover:bg-brand-purple/10 text-brand-navy hover:text-brand-purple border border-transparent transition-colors cursor-pointer"
                              title="View Details"
                            >
                              <Eye className="w-4.5 h-4.5" />
                            </Link>

                            <button
                              onClick={() => onToggleCart(course.id)}
                              className={`p-2.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                                isAddedToCart
                                  ? 'bg-brand-blue/10 border-brand-blue/20 text-brand-blue'
                                  : 'bg-gradient-to-r from-brand-purple to-brand-blue hover:opacity-95 text-white border-transparent premium-shadow'
                              }`}
                              title={isAddedToCart ? "Remove from Cart" : "Add to Cart"}
                            >
                              <ShoppingBag className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-16 bg-white border border-brand-border rounded-[32px] premium-shadow">
              <div className="w-16 h-16 bg-brand-purple/10 rounded-full flex items-center justify-center mx-auto text-brand-purple mb-4">
                <SlidersHorizontal className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-lg text-brand-navy">No courses matched your filters</h3>
              <p className="text-xs text-brand-gray mt-2 max-w-sm mx-auto font-medium">
                Try widening your search terms or clearing categories to see our complete LMS catalog.
              </p>
              <button
                onClick={clearFilters}
                className="mt-6 px-6 py-2.5 bg-brand-purple text-white text-xs font-bold rounded-2xl cursor-pointer hover:opacity-95"
              >
                Clear Filters
              </button>
            </div>
          )}

        </main>
      </div>

      {/* Mobile Drawer Filter Dialog */}
      <AnimatePresence>
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            ></motion.div>

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-80 h-full bg-white relative z-10 p-6 flex flex-col justify-between border-l border-brand-border overflow-y-auto"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-brand-border/60 pb-4">
                  <span className="font-extrabold text-sm text-brand-navy flex items-center gap-1.5">
                    <SlidersHorizontal className="w-4.5 h-4.5 text-brand-purple" />
                    Filters
                  </span>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-1 rounded-full hover:bg-bg-secondary text-brand-gray cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Categories */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-navy block">Category</label>
                  <select
                    value={selectedCategory || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedCategory(val || null);
                      if (val) setSearchParams(prev => { prev.set('category', val); return prev; });
                      else setSearchParams(prev => { prev.delete('category'); return prev; });
                    }}
                    className="w-full px-4 py-2 border border-brand-border rounded-xl text-xs font-bold text-brand-navy bg-bg-secondary"
                  >
                    <option value="">All Categories</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Difficulty level */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-navy block">Difficulty Level</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['Beginner', 'Intermediate', 'Advanced'].map(lvl => (
                      <button
                        key={lvl}
                        onClick={() => setSelectedLevel(selectedLevel === lvl ? null : lvl)}
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

                {/* Price range */}
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
                    onChange={(e) => setMaxPrice(Number(e.target.value) === 300 ? null : Number(e.target.value))}
                    className="w-full accent-brand-purple cursor-pointer"
                  />
                </div>

                {/* Min rating */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-navy block">Min Rating</label>
                  <div className="flex items-center gap-1.5">
                    {[4.5, 4.7, 4.9].map(rate => (
                      <button
                        key={rate}
                        onClick={() => setMinRating(minRating === rate ? null : rate)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1 transition-all cursor-pointer ${
                          minRating === rate
                            ? 'border-brand-gold bg-brand-gold/5 text-brand-gold'
                            : 'border-brand-border text-brand-navy hover:bg-bg-secondary'
                        }`}
                      >
                        <Star className="w-3.5 h-3.5" />
                        {rate}+
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-brand-border/60 flex gap-4 mt-6">
                <button
                  onClick={clearFilters}
                  className="flex-1 py-2.5 rounded-xl border border-brand-border text-xs font-bold text-brand-navy hover:bg-bg-secondary cursor-pointer"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-blue text-white text-xs font-bold cursor-pointer"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
