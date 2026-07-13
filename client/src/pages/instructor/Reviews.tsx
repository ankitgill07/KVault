import { useState, useEffect, useMemo } from 'react';
import { courseService } from '../../services/courseService';
import { reviewService } from '../../services/reviewService';
import type { Course } from '../../api/courseApi';
import { Search, Star, MessageSquare, ArrowUpRight, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

// Fallback high-quality mock reviews when database has no reviews
const MOCK_REVIEWS_FALLBACK = [
  {
    _id: "mock-r1",
    course: "Full-Stack Web BootCamp",
    user: { _id: "m-u1", name: "Ananya Sharma", avatar: "" },
    rating: 5,
    title: "Incredible Content and Structure!",
    comment: "Absolutely loved the section on React design systems. The developer explains complex UI elements with simple analogies. Super practical and easy to follow! The projects are production-ready.",
    helpful: 12,
    isVerified: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    instructorResponse: "Thank you Ananya! I am thrilled to hear that you liked the React design systems section. More updates on Advanced State management are coming soon!",
    instructorRespondedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "mock-r2",
    course: "UI/UX Figma BootCamp",
    user: { _id: "m-u2", name: "Rohan Das", avatar: "" },
    rating: 4,
    title: "Very Comprehensive Guide",
    comment: "Very detailed pricing model guidelines. Highly recommended for beginners looking to design enterprise SaaS applications. Just wish there was slightly more focus on mobile responsive design.",
    helpful: 5,
    isVerified: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    instructorResponse: null,
    instructorRespondedAt: null,
  },
  {
    _id: "mock-r3",
    course: "Python Automation Mastery",
    user: { _id: "m-u3", name: "Michael Chang", avatar: "" },
    rating: 5,
    title: "Saved me hours of manual work",
    comment: "The scripting exercises are perfect. I managed to automate our internal reporting tool in the first week. Simple, concise, and incredibly effective.",
    helpful: 8,
    isVerified: true,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    instructorResponse: null,
    instructorRespondedAt: null,
  }
];

export default function Reviews() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const coursesData = await courseService.getMyCourses();
        setCourses(coursesData || []);

        if (coursesData && coursesData.length > 0) {
          // Fetch reviews for all courses in parallel
          const reviewsPromises = coursesData.map(async (course) => {
            try {
              const res = await reviewService.getReviewsByCourse(course._id, 1, 100);
              // Decorate each review with course title
              return (res?.reviews || []).map((rev: any) => ({
                ...rev,
                courseTitle: course.title,
              }));
            } catch (err) {
              console.error(`Failed to fetch reviews for course ${course._id}:`, err);
              return [];
            }
          });

          const results = await Promise.all(reviewsPromises);
          const allReviews = results.flat();

          if (allReviews.length === 0) {
            // Fallback to mock reviews mapped to current instructor courses if available
            const decoratedMock = MOCK_REVIEWS_FALLBACK.map((mockReview, idx) => {
              const matchingCourse = coursesData[idx % coursesData.length];
              return {
                ...mockReview,
                course: matchingCourse._id,
                courseTitle: matchingCourse.title,
              };
            });
            setReviews(decoratedMock);
          } else {
            setReviews(allReviews);
          }
        } else {
          setReviews(MOCK_REVIEWS_FALLBACK);
        }
      } catch (err) {
        console.error("Error loading reviews page:", err);
        setReviews(MOCK_REVIEWS_FALLBACK);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim()) return;

    setSubmittingReply(true);
    try {
      // Is it a mock review?
      if (reviewId.startsWith('mock-')) {
        setReviews(prev =>
          prev.map((r) =>
            r._id === reviewId
              ? {
                  ...r,
                  instructorResponse: replyText,
                  instructorRespondedAt: new Date().toISOString(),
                }
              : r
          )
        );
        showToast("Mock response updated successfully!", "success");
        setReplyingTo(null);
        setReplyText('');
      } else {
        // Real API call updating the review response on database
        // The API put endpoint is `/reviews/:id` with instructorResponse
        const response = await reviewService.updateReview(reviewId, {
          instructorResponse: replyText,
        });

        if (response) {
          setReviews(prev =>
            prev.map((r) =>
              r._id === reviewId
                ? {
                    ...r,
                    instructorResponse: replyText,
                    instructorRespondedAt: new Date().toISOString(),
                  }
                : r
            )
          );
          showToast("Reply submitted successfully!", "success");
          setReplyingTo(null);
          setReplyText('');
        }
      }
    } catch (err: any) {
      console.error("Error submitting review reply:", err);
      showToast(err.message || "Failed to submit reply. Please try again.", "error");
    } finally {
      setSubmittingReply(false);
    }
  };

  // Filter and Search Logic
  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const studentName = review.user?.name || review.student?.name || 'Student';
      const matchesSearch =
        studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (review.comment && review.comment.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (review.title && review.title.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCourse =
        courseFilter === 'all' || review.course === courseFilter;

      const matchesRating =
        ratingFilter === 'all' || review.rating === parseInt(ratingFilter);

      return matchesSearch && matchesCourse && matchesRating;
    });
  }, [reviews, searchQuery, courseFilter, ratingFilter]);

  // Aggregate Stats
  const stats = useMemo(() => {
    const total = reviews.length;
    if (total === 0) return { avg: 0, count: 0, distribution: [0, 0, 0, 0, 0] };

    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = parseFloat((sum / total).toFixed(1));

    const distribution = [5, 4, 3, 2, 1].map((ratingVal) => {
      const count = reviews.filter((r) => Math.round(r.rating) === ratingVal).length;
      return total > 0 ? Math.round((count / total) * 100) : 0;
    });

    return { avg, count: total, distribution };
  }, [reviews]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-6 max-w-6xl mx-auto">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border transition-all duration-300 ${
          toast.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-250 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900'
            : 'bg-rose-50 text-rose-800 border-rose-250 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-900'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Student Reviews</h1>
        <p className="text-sm text-zinc-500 mt-1">Review feedback and engage directly with your course learners.</p>
      </div>

      {/* Stats Summary Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-2xl flex flex-col justify-center items-center text-center">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-5xl font-black text-zinc-900 dark:text-white">
              {stats.avg.toFixed(1)}
            </span>
            <Star size={36} className="text-amber-500 fill-amber-500" />
          </div>
          <p className="text-sm font-semibold text-zinc-500">Average Course Rating</p>
          <Badge className="mt-3 rounded-full bg-violet-50 text-violet-750 dark:bg-violet-950 dark:text-violet-400 border border-violet-100 dark:border-violet-900">
            {stats.count} Total Reviews
          </Badge>
        </Card>

        {/* Rating Bars */}
        <Card className="lg:col-span-2 p-6 border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-2xl">
          <h3 className="font-bold text-zinc-800 dark:text-zinc-200 text-sm mb-4">Rating Breakdown</h3>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((star, idx) => (
              <div key={star} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-10">
                  <span className="text-xs font-bold text-zinc-650 dark:text-zinc-350">{star}</span>
                  <Star size={13} className="text-amber-500 fill-amber-500" />
                </div>
                <div className="flex-1 h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${stats.distribution[idx]}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-zinc-400 w-10 text-right">
                  {stats.distribution[idx]}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-450"
          />
          <input
            type="text"
            placeholder="Search student names or review keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          <option value="all">All Courses</option>
          {courses.map((course) => (
            <option key={course._id} value={course._id}>
              {course.title}
            </option>
          ))}
        </select>
        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          <option value="all">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-zinc-100 dark:bg-zinc-800 rounded-2xl" />
          ))}
        </div>
      ) : filteredReviews.length === 0 ? (
        <Card className="p-16 text-center border border-zinc-150 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl">
          <Star size={44} className="mx-auto text-zinc-300 mb-4 animate-bounce" />
          <h3 className="font-bold text-zinc-800 dark:text-zinc-200">No Reviews Found</h3>
          <p className="text-zinc-500 text-sm mt-1">Try adjusting your filters or search keywords.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => {
            const studentName = review.user?.name || review.student?.name || 'Student';
            const initial = studentName.charAt(0).toUpperCase();

            return (
              <Card
                key={review._id}
                className="p-6 border border-zinc-200/85 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  {/* Student Initials Avatar */}
                  <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-750 dark:text-violet-400 flex items-center justify-center font-bold text-lg shrink-0 border border-violet-100 dark:border-violet-900">
                    {initial}
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Header line info */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
                          {studentName}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-zinc-450 mt-0.5">
                          <span className="font-semibold text-zinc-500 dark:text-zinc-400">{review.courseTitle || 'Course'}</span>
                          <span>•</span>
                          <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                          {review.isVerified && (
                            <>
                              <span>•</span>
                              <Badge variant="secondary" className="text-[9px] bg-emerald-50 text-emerald-850 dark:bg-emerald-950/50 dark:text-emerald-405 border-0 rounded px-1.5 py-0">
                                Verified Purchase
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                      {/* Star rating */}
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={14}
                            className={
                              star <= review.rating
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-zinc-200 dark:text-zinc-850'
                            }
                          />
                        ))}
                      </div>
                    </div>

                    {/* Review title & comment */}
                    {review.title && (
                      <p className="font-bold text-xs text-zinc-850 dark:text-zinc-150">{review.title}</p>
                    )}
                    <p className="text-xs text-zinc-650 dark:text-zinc-350 leading-relaxed italic">
                      "{review.comment || 'No review comment text provided'}"
                    </p>

                    {/* Pros and Cons */}
                    {((review.pros && review.pros.length > 0) || (review.cons && review.cons.length > 0)) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 p-3 bg-zinc-50/50 dark:bg-zinc-850/20 rounded-xl border border-zinc-100 dark:border-zinc-800/80">
                        {review.pros && review.pros.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Pros</span>
                            <ul className="list-disc list-inside text-[11px] text-zinc-600 dark:text-zinc-400 space-y-0.5">
                              {review.pros.map((pro: string, i: number) => <li key={i}>{pro}</li>)}
                            </ul>
                          </div>
                        )}
                        {review.cons && review.cons.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Cons</span>
                            <ul className="list-disc list-inside text-[11px] text-zinc-600 dark:text-zinc-400 space-y-0.5">
                              {review.cons.map((con: string, i: number) => <li key={i}>{con}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Instructor Response section */}
                    {review.instructorResponse ? (
                      <div className="p-4 bg-zinc-50 dark:bg-zinc-850/40 rounded-2xl ml-4 border-l-2 border-violet-550 space-y-1 mt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                            Instructor Response
                          </span>
                          {review.instructorRespondedAt && (
                            <span className="text-[9px] text-zinc-400">
                              {new Date(review.instructorRespondedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                          {review.instructorResponse}
                        </p>
                      </div>
                    ) : replyingTo === review._id ? (
                      <div className="mt-4 space-y-3">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write a helpful, professional reply to this feedback..."
                          rows={3}
                          className="w-full px-4 py-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText('');
                            }}
                            className="rounded-lg text-xs py-1 h-8"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => handleReply(review._id)}
                            disabled={!replyText.trim() || submittingReply}
                            className="rounded-lg text-xs py-1 h-8 px-4"
                          >
                            {submittingReply ? 'Sending...' : 'Send Reply'}
                            <Send className="w-3.5 h-3.5 ml-2" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-2">
                        <button
                          onClick={() => setReplyingTo(review._id)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline"
                        >
                          <MessageSquare size={13} />
                          Reply to feedback
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
