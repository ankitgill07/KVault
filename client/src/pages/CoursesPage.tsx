import React, { useState, useEffect } from 'react';
import { courseService } from '../services/courseService';
import CourseCard from '../components/CourseCard';
import { categoryService } from '../services/courseService';

interface Course {
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
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface CoursesPageProps {
  cart: string[];
  wishlist: string[];
  onToggleCart: (courseId: string) => void;
  onToggleWishlist: (courseId: string) => void;
}

const CoursesPage: React.FC<CoursesPageProps> = ({ cart, wishlist, onToggleCart, onToggleWishlist }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    fetchCategories();
    fetchCourses();
  }, [selectedCategory, selectedLevel, sortBy, currentPage]);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 12,
        sortBy,
        sortOrder: 'desc',
      };

      if (selectedCategory) params.category = selectedCategory;
      if (selectedLevel) params.level = selectedLevel;
      if (searchQuery) params.search = searchQuery;

      const data = await courseService.getAllCourses(params);
      setCourses(data.courses || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch courses. Please try again later.');
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCourses();
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLevel(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="courses-page">
      <div className="courses-header">
        <h1>Explore Courses</h1>
        <p>Discover a wide range of courses to enhance your skills</p>
      </div>

      <div className="courses-filters">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">Search</button>
        </form>

        <div className="filter-group">
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={selectedLevel}
            onChange={handleLevelChange}
            className="filter-select"
          >
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="all_levels">All Levels</option>
          </select>

          <select
            value={sortBy}
            onChange={handleSortChange}
            className="filter-select"
          >
            <option value="createdAt">Newest First</option>
            <option value="rating">Highest Rated</option>
            <option value="enrollmentCount">Most Popular</option>
            <option value="price">Price: Low to High</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading courses...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : courses.length === 0 ? (
        <div className="no-courses">
          <h2>No courses found</h2>
          <p>Try adjusting your filters or search query</p>
        </div>
      ) : (
        <>
          <div className="courses-grid">
            {courses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>

          <div className="pagination">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              Previous
            </button>
            <span className="pagination-info">Page {currentPage}</span>
            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="pagination-button"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CoursesPage;