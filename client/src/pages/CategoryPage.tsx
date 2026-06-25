import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, BookOpen, Clock, Star, Heart, ShoppingBag, Eye, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { COURSES, CATEGORIES } from '../data/courses';
import { Breadcrumbs } from '../components/Breadcrumbs';

interface CategoryPageProps {
  cart: string[];
  wishlist: string[];
  onToggleCart: (courseId: string) => void;
  onToggleWishlist: (courseId: string) => void;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({
  cart,
  wishlist,
  onToggleCart,
  onToggleWishlist,
}) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // Find active category
  const activeCategory = CATEGORIES.find(c => c.slug === slug);

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
  const filteredCourses = COURSES.filter(course => {
    // Category match
    const categoryMatches = course.category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-') === slug?.toLowerCase() ||
                             course.category === activeCategory.name;

    const matchesLevel = selectedLevel 
      ? course.difficulty.toLowerCase() === selectedLevel.toLowerCase()
      : true;

    const matchesPrice = maxPrice !== null
      ? course.price <= maxPrice
      : true;

    const matchesRating = minRating !== null
      ? course.rating >= minRating
      : true;

    return categoryMatches && matchesLevel && matchesPrice && matchesRating;
  }).sort((a, b) => {
    if (sortBy === 'popular') return b.studentsCount - a.studentsCount;
    if (sortBy === 'newest') return b.lastUpdated.localeCompare(a.lastUpdated);
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
      <Breadcrumbs />

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
                {CATEGORIES.filter(c => c.id !== activeCategory.id).slice(0, 4).map(cat => (
                  <Link
                    key={cat.id}
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
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {paginatedCourses.map((course) => {
                    const isWishlisted = wishlist.includes(course.id);
                    const isAddedToCart = cart.includes(course.id);

                    return (
                      <motion.div
                        key={course.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="group bg-white rounded-[32px] border border-brand-border premium-shadow overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:border-brand-purple/35 flex flex-col h-full"
                      >
                        <div className="h-40 w-full relative flex items-center justify-center text-white p-5 shrink-0" style={{ background: course.gradient }}>
                          <div className="absolute inset-0 bg-black/10"></div>
                          
                          <button
                            onClick={() => onToggleWishlist(course.id)}
                            className={`absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center border backdrop-blur transition-all duration-200 cursor-pointer ${
                              isWishlisted 
                                ? 'bg-red-500/20 border-red-500/30 text-red-500' 
                                : 'bg-white/20 border-white/10 text-white hover:bg-white/40'
                            }`}
                          >
                            <Heart className={`w-4.5 h-4.5 ${isWishlisted ? 'fill-red-500' : ''}`} />
                          </button>

                          <h4 className="font-extrabold text-sm line-clamp-2 px-2 text-center z-10">{course.title}</h4>
                        </div>

                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div className="flex items-center gap-2 mb-4">
                            <img
                              src={course.instructorAvatar}
                              alt={course.instructor}
                              className="w-7 h-7 rounded-full object-cover"
                            />
                            <p className="text-xs font-bold text-brand-navy">{course.instructor}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-2 border-t border-brand-border/60 pt-3 mb-4 text-xs font-bold text-brand-navy">
                            <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-brand-gold text-brand-gold" /> {course.rating}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-brand-blue" /> {course.duration.split(' ')[0]}</span>
                          </div>

                          <div className="flex items-center justify-between mt-auto pt-2">
                            <span className="text-lg font-extrabold text-brand-navy">${course.price}</span>
                            <div className="flex items-center gap-1.5">
                              <Link
                                to={`/course/${course.slug}`}
                                className="p-2.5 rounded-2xl bg-bg-secondary hover:bg-brand-purple/10 text-brand-navy hover:text-brand-purple transition-colors cursor-pointer"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => onToggleCart(course.id)}
                                className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                                  isAddedToCart
                                    ? 'bg-brand-blue/10 border-brand-blue/20 text-brand-blue'
                                    : 'bg-gradient-to-r from-brand-purple to-brand-blue text-white border-transparent'
                                }`}
                              >
                                <ShoppingBag className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>

                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8 pt-4 border-t border-brand-border/60">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="p-2 border border-brand-border rounded-xl hover:bg-bg-secondary disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ArrowLeft className="w-4.5 h-4.5" />
                  </button>
                  <span className="text-xs font-bold text-brand-navy">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="p-2 border border-brand-border rounded-xl hover:bg-bg-secondary disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ArrowRight className="w-4.5 h-4.5" />
                  </button>
                </div>
              )}

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
