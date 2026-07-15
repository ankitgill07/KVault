import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, PlusCircle, Users, Star, User, Settings, Menu, X, Bell, ChevronDown,
  BarChart3, Hexagon,
} from 'lucide-react';
import { useState } from 'react';
import { useUser } from '../context/UserContext';

const navigation = [
  { name: 'Dashboard',     href: '/instructor',              icon: LayoutDashboard },
  { name: 'My Courses',    href: '/instructor/courses',       icon: BookOpen },
  { name: 'Students',      href: '/instructor/students',      icon: Users },
  { name: 'Analytics',     href: '/instructor/analytics',     icon: BarChart3 },
  { name: 'Reviews',       href: '/instructor/reviews',       icon: Star },
];

export default function InstructorLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useUser();

  const getCurrentPageTitle = () => {
    const activeRoute = navigation.find(n => location.pathname === n.href || location.pathname.startsWith(n.href + '/'));
    return activeRoute ? activeRoute.name : 'Instructor';
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased font-sans">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-zinc-950 text-zinc-400 border-r border-zinc-800/80 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-zinc-800/80">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 cursor-pointer group text-left"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-purple to-brand-blue flex items-center justify-center text-white premium-shadow transition-transform group-hover:scale-105">
                <Hexagon className="w-6 h-6" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white to-brand-purple bg-clip-text text-transparent">
                  KVault
                </span>
                <span className="text-[9px] text-zinc-500 font-semibold tracking-wider uppercase leading-none">
                  Instructor Console
                </span>
              </div>
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Create Course CTA */}
          <div className="px-4 pt-4">
            <button
              onClick={() => { navigate('/course/create'); setSidebarOpen(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-md shadow-violet-900/20"
            >
              <PlusCircle size={16} />
              <span>Create New Course</span>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
            {navigation.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.href === '/instructor'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-md shadow-violet-900/20'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                    }`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={17} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>


        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                aria-label="Open Sidebar"
              >
                <Menu size={20} />
              </button>
              <h1 className="text-base font-semibold text-zinc-900 dark:text-white tracking-tight">
                {getCurrentPageTitle()}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors relative">
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-600 rounded-full ring-2 ring-white dark:ring-zinc-950" />
                <Bell size={18} />
              </button>
              <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />
              <button className="flex items-center gap-2.5 p-1.5 pr-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl transition-all">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-950 flex items-center justify-center text-violet-700 dark:text-violet-300 font-semibold text-sm">
                    {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'IN'}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 leading-none">{user?.name || 'Instructor'}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5 leading-none capitalize">{user?.role || 'Instructor'}</p>
                </div>
                <ChevronDown size={14} className="text-zinc-400 hidden sm:block" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}