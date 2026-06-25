import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Globe, Clock, Award, Smartphone, Infinity as InfinityIcon, Play, ChevronDown, Check, User, Globe as GlobeIcon, Heart, ShoppingBag } from 'lucide-react';
import { COURSES } from '../data/courses';
import { Breadcrumbs } from '../components/Breadcrumbs';

interface CourseDetailProps {
  cart: string[];
  wishlist: string[];
  onToggleCart: (courseId: string) => void;
  onToggleWishlist: (courseId: string) => void;
}

export const CourseDetail: React.FC<CourseDetailProps> = ({
  cart,
  wishlist,
  onToggleCart,
  onToggleWishlist,
}) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // Find matching course
  const course = COURSES.find(c => c.slug === slug);

  // Accordion curriculum control state (module active ids)
  const [activeModules, setActiveModules] = useState<string[]>(course ? [course.chapters[0]?.id].filter(Boolean) : []);

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-black text-brand-navy">Course Not Found</h2>
        <p className="text-xs text-brand-gray mt-2 font-semibold">The requested learning course could not be located.</p>
        <button
          onClick={() => navigate('/courses')}
          className="mt-6 px-6 py-2.5 bg-brand-purple text-white text-xs font-bold rounded-2xl cursor-pointer"
        >
          View All Courses
        </button>
      </div>
    );
  }

  const isWishlisted = wishlist.includes(course.id);
  const isAddedToCart = cart.includes(course.id);

  const toggleModule = (id: string) => {
    setActiveModules(prev => 
      prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
    );
  };

  // Find related courses (in same category, excluding current course)
  const relatedCourses = COURSES.filter(c => c.category === course.category && c.id !== course.id);

  const handleBuyNow = () => {
    if (!isAddedToCart) {
      onToggleCart(course.id);
    }
    navigate('/cart');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full relative">
      <Breadcrumbs />

      {/* Main Course Header / Hero Block */}
      <div className="mt-8 mb-12 bg-gradient-to-tr from-brand-navy to-brand-navy/90 text-white rounded-[32px] p-6 sm:p-10 relative overflow-hidden border border-brand-navy/50 premium-shadow">
        
        {/* Decorative Light Glows */}
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-brand-purple/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-brand-blue/15 rounded-full blur-[80px]"></div>

        <div className="max-w-4xl relative z-10 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-brand-purple/20 text-brand-purple-light border border-brand-purple/30 text-xs font-bold rounded-full uppercase tracking-wider">
              {course.category}
            </span>
            <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider border ${
              course.difficulty === 'Beginner' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
              course.difficulty === 'Intermediate' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
              'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              {course.difficulty}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight max-w-3xl">
            {course.title}
          </h1>

          <p className="text-sm sm:text-base text-white/80 font-medium leading-relaxed max-w-2xl">
            {course.description}
          </p>

          {/* Quick stats / metadata */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-bold text-white/70">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-brand-gold text-brand-gold" />
              <span className="text-white font-extrabold">{course.rating}</span>
              <span>({course.reviewsCount} reviews)</span>
            </div>
            <div>•</div>
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-brand-purple-light" />
              <span>By {course.instructor}</span>
            </div>
            <div>•</div>
            <div className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-brand-blue-light" />
              <span>{course.language}</span>
            </div>
            <div>•</div>
            <div>Last updated {course.lastUpdated}</div>
            <div>•</div>
            <div className="px-2 py-0.5 bg-white/10 rounded-md text-[10px] text-white">
              {course.studentsCount} Students Enrolled
            </div>
          </div>

          {/* CTAs on Mobile (Hidden on Desktop because of Sticky Card) */}
          <div className="flex flex-wrap items-center gap-3 pt-4 lg:hidden">
            <button
              onClick={handleBuyNow}
              className="flex-1 min-w-[120px] py-3 rounded-2xl bg-gradient-to-r from-brand-purple to-brand-blue text-white text-xs font-extrabold hover:opacity-95 cursor-pointer text-center"
            >
              Buy Now
            </button>
            <button
              onClick={() => onToggleCart(course.id)}
              className={`p-3 rounded-2xl border transition-colors cursor-pointer ${
                isAddedToCart 
                  ? 'bg-brand-blue/20 border-brand-blue/30 text-white' 
                  : 'bg-white/10 border-white/20 hover:bg-white/20 text-white'
              }`}
            >
              <ShoppingBag className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={() => onToggleWishlist(course.id)}
              className={`p-3 rounded-2xl border transition-colors cursor-pointer ${
                isWishlisted 
                  ? 'bg-red-500/20 border-red-500/30 text-red-500' 
                  : 'bg-white/10 border-white/20 hover:bg-white/20 text-white'
              }`}
            >
              <Heart className={`w-4.5 h-4.5 ${isWishlisted ? 'fill-red-500' : ''}`} />
            </button>
          </div>

        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start relative">
        
        {/* Left Columns - Detailed content */}
        <div className="w-full lg:w-8/12 space-y-10">
          
          {/* Video Preview Player */}
          <section className="bg-white rounded-[32px] border border-brand-border premium-shadow p-5 relative overflow-hidden">
            <div className="h-[280px] sm:h-[400px] w-full rounded-2xl flex items-center justify-center text-white relative overflow-hidden group" style={{ background: course.gradient }}>
              <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] transition-all group-hover:bg-black/45"></div>
              
              <button className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur border border-white/30 flex items-center justify-center cursor-pointer transition-transform group-hover:scale-105 z-10 shadow-2xl">
                <Play className="w-7 h-7 text-white fill-white ml-1" />
              </button>

              <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 bg-black/40 backdrop-blur px-3.5 py-1.5 rounded-full text-xs font-bold border border-white/15">
                <Clock className="w-3.5 h-3.5 text-brand-purple-light" />
                <span>Preview Lecture • 2:30 Mins</span>
              </div>
            </div>
          </section>

          {/* What You'll Learn Section */}
          <section className="space-y-4">
            <h3 className="text-xl font-extrabold text-brand-navy">What you'll learn</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {course.whatYouWillLearn && course.whatYouWillLearn.map((outcome, idx) => (
                <div key={idx} className="bg-white border border-brand-border rounded-2xl p-4 flex gap-3 premium-shadow">
                  <div className="w-6 h-6 rounded-full bg-brand-purple/10 flex items-center justify-center text-brand-purple shrink-0 mt-0.5">
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-brand-navy leading-relaxed">{outcome}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Course Curriculum Accordion */}
          <section className="space-y-4">
            <div className="flex justify-between items-baseline">
              <h3 className="text-xl font-extrabold text-brand-navy">Course curriculum</h3>
              <span className="text-xs text-brand-gray font-bold">
                {course.chapters.length} modules • {course.lessonsCount} lessons
              </span>
            </div>

            <div className="border border-brand-border rounded-3xl bg-white overflow-hidden premium-shadow divide-y divide-brand-border/60">
              {course.chapters.map((chapter) => {
                const isOpen = activeModules.includes(chapter.id);
                return (
                  <div key={chapter.id} className="transition-all">
                    
                    {/* Chapter Header Toggle */}
                    <button
                      onClick={() => toggleModule(chapter.id)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left cursor-pointer hover:bg-bg-secondary/40"
                    >
                      <div className="space-y-1 pr-4">
                        <h4 className="text-sm font-extrabold text-brand-navy leading-snug">{chapter.title}</h4>
                        <p className="text-[10px] text-brand-gray font-bold uppercase tracking-wider">
                          {chapter.lessons.length} lectures • {chapter.lessons.reduce((acc, l) => {
                            const [m, s] = l.duration.split(':').map(Number);
                            return acc + (m || 0);
                          }, 0)} mins
                        </p>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-brand-navy transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Lessons Grid under Chapter */}
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="overflow-hidden bg-bg-secondary/20"
                        >
                          <div className="px-6 pb-4 pt-1 divide-y divide-brand-border/40">
                            {chapter.lessons.map((lesson) => (
                              <div key={lesson.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <Play className="w-3.5 h-3.5 text-brand-purple shrink-0" />
                                  <span className="font-semibold text-brand-navy truncate">{lesson.title}</span>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                  <span className="text-brand-gray font-bold">{lesson.duration}</span>
                                  {lesson.preview && (
                                    <button className="px-2.5 py-1 bg-brand-purple/10 text-brand-purple rounded-lg text-[9px] font-extrabold hover:bg-brand-purple/20 cursor-pointer">
                                      Preview
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>
                );
              })}
            </div>
          </section>

          {/* Requirements Section */}
          <section className="space-y-4">
            <h3 className="text-xl font-extrabold text-brand-navy">Requirements</h3>
            <ul className="space-y-3">
              {course.requirements && course.requirements.map((req, idx) => (
                <li key={idx} className="flex gap-2.5 text-xs text-brand-gray font-semibold leading-relaxed">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-purple shrink-0 mt-2"></div>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Instructor Card */}
          <section className="space-y-4">
            <h3 className="text-xl font-extrabold text-brand-navy">Instructor</h3>
            <div className="bg-white border border-brand-border rounded-[32px] premium-shadow p-6 flex flex-col sm:flex-row gap-6">
              <img
                src={course.instructorAvatar}
                alt={course.instructor}
                className="w-24 h-24 rounded-full border border-brand-purple/20 bg-bg-secondary object-cover self-center sm:self-start shrink-0"
              />
              <div className="space-y-3 flex-1">
                <div>
                  <h4 className="font-extrabold text-lg text-brand-navy">{course.instructor}</h4>
                  <p className="text-xs font-bold text-brand-purple mt-0.5">{course.instructorRole}</p>
                </div>
                <p className="text-xs font-semibold text-brand-gray leading-relaxed">
                  {course.instructorBio}
                </p>
                
                {/* Socials */}
                <div className="flex items-center gap-3 pt-2">
                  {course.instructorSocials?.twitter && (
                    <a href={course.instructorSocials.twitter} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-bg-secondary text-brand-gray hover:text-brand-purple hover:bg-brand-purple/10 transition-colors flex items-center justify-center">
                      <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </a>
                  )}
                  {course.instructorSocials?.github && (
                    <a href={course.instructorSocials.github} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-bg-secondary text-brand-gray hover:text-brand-purple hover:bg-brand-purple/10 transition-colors flex items-center justify-center">
                      <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                      </svg>
                    </a>
                  )}
                  {course.instructorSocials?.website && (
                    <a href={course.instructorSocials.website} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-bg-secondary text-brand-gray hover:text-brand-purple hover:bg-brand-purple/10 transition-colors flex items-center justify-center">
                      <GlobeIcon className="w-4.5 h-4.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Reviews Section */}
          <section className="space-y-4">
            <h3 className="text-xl font-extrabold text-brand-navy">Student feedback</h3>
            <div className="bg-white border border-brand-border rounded-[32px] premium-shadow p-6 divide-y divide-brand-border/60 space-y-6">
              
              {/* Aggregated ratings */}
              <div className="pb-6 flex flex-col sm:flex-row gap-6 items-center">
                <div className="text-center sm:border-r sm:border-brand-border/60 sm:pr-8 py-2 shrink-0">
                  <h4 className="text-5xl font-black text-brand-navy">{course.rating}</h4>
                  <div className="flex items-center justify-center gap-0.5 my-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} className="w-4 h-4 fill-brand-gold text-brand-gold" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-brand-purple">Course Rating</span>
                </div>

                <div className="flex-1 w-full space-y-2">
                  <div className="flex items-center gap-3 text-xs font-bold text-brand-navy">
                    <span className="w-12 shrink-0">5 stars</span>
                    <div className="flex-1 h-2.5 bg-bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-brand-gold rounded-full w-[85%]"></div>
                    </div>
                    <span className="w-8 text-right shrink-0">85%</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-brand-navy">
                    <span className="w-12 shrink-0">4 stars</span>
                    <div className="flex-1 h-2.5 bg-bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-brand-gold rounded-full w-[12%]"></div>
                    </div>
                    <span className="w-8 text-right shrink-0">12%</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-brand-navy">
                    <span className="w-12 shrink-0">3 stars</span>
                    <div className="flex-1 h-2.5 bg-bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-brand-gold rounded-full w-[3%]"></div>
                    </div>
                    <span className="w-8 text-right shrink-0">3%</span>
                  </div>
                </div>
              </div>

              {/* Comments */}
              <div className="pt-6 space-y-6">
                {course.reviews && course.reviews.map((rev) => (
                  <div key={rev.id} className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={rev.avatar}
                          alt={rev.name}
                          className="w-8 h-8 rounded-full border border-brand-purple/20 bg-bg-secondary object-cover"
                        />
                        <div>
                          <p className="font-extrabold text-brand-navy">{rev.name}</p>
                          <div className="flex items-center gap-0.5 mt-0.5">
                            {[1, 2, 3, 4, 5].map(starIdx => (
                              <Star key={starIdx} className={`w-3 h-3 ${starIdx <= Math.round(rev.rating) ? 'fill-brand-gold text-brand-gold' : 'text-brand-border'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-brand-gray">{rev.date}</span>
                    </div>
                    <p className="text-brand-gray font-semibold leading-relaxed pl-10.5">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>

            </div>
          </section>

          {/* Related Courses Section */}
          {relatedCourses.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-xl font-extrabold text-brand-navy">Related courses</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {relatedCourses.map((rel) => (
                  <Link
                    key={rel.id}
                    to={`/course/${rel.slug}`}
                    className="flex bg-white rounded-3xl border border-brand-border premium-shadow overflow-hidden transition-all hover:scale-[1.02] hover:border-brand-purple/20"
                  >
                    <div className="w-24 shrink-0" style={{ background: rel.gradient }}></div>
                    <div className="p-4 min-w-0">
                      <span className="px-2 py-0.5 bg-brand-purple/10 text-brand-purple rounded-md text-[8px] font-bold uppercase tracking-wider block w-fit mb-1.5">
                        {rel.difficulty}
                      </span>
                      <h4 className="font-extrabold text-xs text-brand-navy line-clamp-2 leading-snug">{rel.title}</h4>
                      <p className="text-[10px] text-brand-gray font-bold mt-1.5">By {rel.instructor}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="font-extrabold text-xs text-brand-navy">${rel.price}</span>
                        <div className="flex items-center gap-0.5 text-[10px] font-extrabold text-brand-gold">
                          <Star className="w-3 h-3 fill-brand-gold shrink-0" />
                          {rel.rating}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

        </div>

        {/* Right Sticky Purchase Sidebar Card (Desktop) */}
        <aside className="w-full lg:w-4/12 hidden lg:block sticky top-24 z-20">
          <div className="bg-white rounded-[32px] border border-brand-border premium-shadow p-6 space-y-6">
            
            {/* Price */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-brand-navy">${course.price}</span>
                <span className="text-sm text-brand-gray line-through font-bold">${course.originalPrice}</span>
              </div>
              <p className="text-[10px] text-red-500 font-extrabold">🔥 Limited offer: 50% discount included!</p>
            </div>

            {/* Inclusions */}
            <div className="space-y-3.5 border-t border-brand-border/60 pt-5">
              <p className="text-xs font-bold text-brand-navy">This course includes:</p>
              <ul className="space-y-3 text-xs text-brand-gray font-semibold">
                <li className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-brand-purple shrink-0" />
                  <span>{course.duration} on-demand video</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <InfinityIcon className="w-4 h-4 text-brand-purple shrink-0" />
                  <span>Full lifetime access</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Smartphone className="w-4 h-4 text-brand-purple shrink-0" />
                  <span>Access on mobile and desktop</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Award className="w-4 h-4 text-brand-purple shrink-0" />
                  <span>Certificate of completion</span>
                </li>
              </ul>
            </div>

            {/* CTAs */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => onToggleCart(course.id)}
                className={`w-full py-3.5 rounded-[20px] text-xs font-bold transition-all duration-200 border cursor-pointer ${
                  isAddedToCart 
                    ? 'bg-brand-blue/10 border-brand-blue/20 text-brand-blue'
                    : 'bg-white border-brand-purple text-brand-purple hover:bg-brand-purple/5'
                }`}
              >
                {isAddedToCart ? 'Remove From Cart' : 'Add To Cart'}
              </button>

              <button
                onClick={handleBuyNow}
                className="w-full py-3.5 rounded-[20px] bg-gradient-to-r from-brand-purple to-brand-blue text-white text-xs font-bold hover:opacity-95 transition-all premium-shadow cursor-pointer"
              >
                Buy Now
              </button>
            </div>

            {/* Wishlist toggle */}
            <button
              onClick={() => onToggleWishlist(course.id)}
              className="w-full py-2.5 border border-brand-border rounded-[20px] text-xs font-bold text-brand-navy hover:bg-bg-secondary transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-brand-gray'}`} />
              <span>{isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}</span>
            </button>

          </div>
        </aside>

      </div>
    </div>
  );
};
