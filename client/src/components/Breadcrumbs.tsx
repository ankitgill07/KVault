import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { COURSES, CATEGORIES } from '../data/courses';

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  // Split paths
  const parts = path.split('/').filter(Boolean);

  if (parts.length === 0 || path === '/') return null;

  // Build items list
  const items: { label: string; to: string }[] = [
    { label: 'Home', to: '/' }
  ];

  if (parts[0] === 'courses') {
    items.push({ label: 'Courses', to: '/courses' });
  } else if (parts[0] === 'course' && parts[1]) {
    items.push({ label: 'Courses', to: '/courses' });
    const course = COURSES.find(c => c.slug === parts[1]);
    if (course) {
      // Find category slug
      const categoryObj = CATEGORIES.find(cat => cat.name === course.category);
      if (categoryObj) {
        items.push({ label: categoryObj.name, to: `/category/${categoryObj.slug}` });
      }
      items.push({ label: course.title, to: `/course/${course.slug}` });
    } else {
      items.push({ label: 'Course Details', to: path });
    }
  } else if (parts[0] === 'category' && parts[1]) {
    items.push({ label: 'Courses', to: '/courses' });
    const category = CATEGORIES.find(c => c.slug === parts[1]);
    items.push({ label: category ? category.name : 'Category', to: path });
  } else if (parts[0] === 'cart') {
    items.push({ label: 'Shopping Cart', to: '/cart' });
  } else if (parts[0] === 'playlist') {
    items.push({ label: 'Wishlist', to: '/playlist' });
  } else if (parts[0] === 'my-learning') {
    items.push({ label: 'My Learning', to: '/my-learning' });
  } else if (parts[0] === 'learn' && parts[1]) {
    items.push({ label: 'My Learning', to: '/my-learning' });
    const course = COURSES.find(c => c.slug === parts[1]);
    items.push({ label: course ? `Learn: ${course.title}` : 'Course Player', to: path });
  } else {
    items.push({ label: parts[0].charAt(0).toUpperCase() + parts[0].slice(1), to: path });
  }

  return (
    <div className="max-w-7xl mx-auto w-full px-4 md:px-8 mt-6">
      <nav className="flex items-center gap-1.5 text-xs font-bold text-brand-gray bg-white border border-brand-border px-4 py-2 rounded-full w-fit premium-shadow">
        <Home className="w-3.5 h-3.5 text-brand-purple" />
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={index}>
              <ChevronRight className="w-3 h-3 text-brand-border" />
              {isLast ? (
                <span className="text-brand-navy truncate max-w-[150px] sm:max-w-xs">{item.label}</span>
              ) : (
                <Link to={item.to} className="hover:text-brand-purple transition-colors">
                  {item.label}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    </div>
  );
};
