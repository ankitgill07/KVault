import React, { useEffect, useState } from "react";
import { Star, MessageSquare, Loader2, Send } from "lucide-react";
import { reviewService } from "../services/reviewService";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

interface ReviewSectionProps {
  courseId: string;
  isEnrolled: boolean;
}

export function ReviewSection({ courseId, isEnrolled }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await reviewService.getReviewsByCourse(courseId, 1, 50);
      setReviews(data?.reviews || []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchReviews();
    }
  }, [courseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      await reviewService.createReview({
        course: courseId,
        rating,
        comment: comment.trim(),
      });
      setComment("");
      setRating(5);
      await fetchReviews();
    } catch (err: any) {
      setError(err?.message || "Failed to submit review. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Compute stats
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? parseFloat((reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / totalReviews).toFixed(1))
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Review Summary Header */}
      <div className="bg-bg-secondary/40 border border-brand-border/60 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6 justify-between">
        <div className="text-center md:text-left space-y-1">
          <h3 className="text-lg font-extrabold text-brand-navy">Student Feedback</h3>
          <p className="text-xs text-brand-gray font-semibold">Real ratings from real enrolled learners</p>
        </div>

        {totalReviews > 0 ? (
          <div className="flex items-center gap-6">
            <div className="text-center space-y-0.5">
              <span className="text-4xl font-black text-brand-navy leading-none">{averageRating}</span>
              <div className="flex gap-0.5 justify-center text-amber-500 my-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${s <= Math.round(averageRating) ? "fill-amber-500" : "text-zinc-200"}`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-brand-gray font-bold">{totalReviews} ratings</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-brand-gray font-semibold text-center md:text-right">
            No reviews yet. Be the first to leave feedback!
          </p>
        )}
      </div>

      {/* Review Submission Form for Enrolled Students */}
      {isEnrolled && (
        <form onSubmit={handleSubmit} className="bg-bg-card border border-brand-border rounded-3xl p-6 space-y-4 premium-shadow">
          <div className="space-y-1">
            <h4 className="text-sm font-extrabold text-brand-navy">Rate & Review Course</h4>
            <p className="text-xs text-brand-gray font-semibold">Share your learning experience with others.</p>
          </div>

          {/* Star selector */}
          <div className="flex items-center gap-2 py-1">
            <span className="text-xs font-semibold text-brand-gray">Select rating:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-1 cursor-pointer transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= (hoverRating ?? rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-zinc-200 dark:text-zinc-700"
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-bold text-amber-500 ml-1">
              {rating === 5 ? "Excellent" : rating === 4 ? "Very Good" : rating === 3 ? "Average" : rating === 2 ? "Below Average" : "Poor"}
            </span>
          </div>

          <div className="space-y-1.5">
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what you liked or how we can improve this course..."
              rows={3}
              className="w-full text-xs"
              required
            />
          </div>

          {error && <p className="text-xs text-red-500 font-bold">{error}</p>}

          <Button type="submit" disabled={submitting || !comment.trim()} className="flex items-center gap-2">
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                Submit Feedback
              </>
            )}
          </Button>
        </form>
      )}

      {/* Review List */}
      <div className="space-y-4">
        <h4 className="text-sm font-extrabold text-brand-navy flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-brand-purple" />
          Recent Student Reviews ({totalReviews})
        </h4>

        {loading ? (
          <div className="py-8 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-brand-purple mx-auto" />
            <p className="text-xs text-brand-gray font-bold mt-2">Loading reviews...</p>
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div key={rev._id} className="border border-brand-border/60 bg-bg-card rounded-2xl p-5 space-y-3 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={rev.user?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"}
                      alt={rev.user?.name || "Student"}
                      className="w-8 h-8 rounded-full border border-brand-purple/20 bg-bg-secondary object-cover"
                    />
                    <div>
                      <h5 className="text-xs font-extrabold text-brand-navy">{rev.user?.name || "Anonymous"}</h5>
                      <span className="text-[10px] text-brand-gray font-semibold">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-0.5 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${s <= rev.rating ? "fill-amber-500" : "text-zinc-200"}`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs font-medium text-brand-navy leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-brand-border rounded-2xl py-8 text-center">
            <p className="text-xs text-brand-gray font-semibold">No reviews are currently listed for this course.</p>
          </div>
        )}
      </div>
    </div>
  );
}
