import React from 'react';
import { Link } from 'react-router-dom';

interface CourseCardProps {
  course: {
    _id: string;
    title: string;
    slug: string;
    thumbnail: string;
    description: string;
    price: number;
    discountPrice?: number;
    rating: number;
    enrollmentCount: number;
    level: string;
    duration: number;
    totalLessons: number;
    instructor?: {
      name: string;
    };
    category?: {
      name: string;
    };
  };
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star ${i <= rating ? 'filled' : 'empty'}`}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="course-card">
      <Link to={`/courses/${course.slug}`}>
        <div className="course-image">
          <img src={course.thumbnail} alt={course.title} />
          {course.discountPrice && course.discountPrice < course.price && (
            <span className="discount-badge">
              {Math.round(((course.price - course.discountPrice) / course.price) * 100)}% OFF
            </span>
          )}
        </div>
      </Link>

      <div className="course-content">
        {course.category && (
          <span className="course-category">{course.category.name}</span>
        )}
        
        <Link to={`/courses/${course.slug}`}>
          <h3 className="course-title">{course.title}</h3>
        </Link>

        <p className="course-description">
          {course.description.substring(0, 100)}...
        </p>

        {course.instructor && (
          <p className="course-instructor">By {course.instructor.name}</p>
        )}

        <div className="course-rating">
          <div className="stars">{renderStars(Math.round(course.rating))}</div>
          <span className="rating-value">{course.rating.toFixed(1)}</span>
          <span className="enrollment-count">({course.enrollmentCount} students)</span>
        </div>

        <div className="course-meta">
          <span className="course-level">{course.level}</span>
          <span className="course-duration">{formatDuration(course.duration)}</span>
          <span className="course-lessons">{course.totalLessons} lessons</span>
        </div>

        <div className="course-price">
          {course.discountPrice && course.discountPrice < course.price ? (
            <>
              <span className="current-price">{formatPrice(course.discountPrice)}</span>
              <span className="original-price">{formatPrice(course.price)}</span>
            </>
          ) : (
            <span className="current-price">{formatPrice(course.price)}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;