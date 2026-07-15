import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  BookOpen,
  ChevronDown,
  GraduationCap,
  Hexagon,
  Heart,
  LogOut,
  Search,
  ShoppingBag,
  Sun,
  Moon,
  User,
} from "lucide-react";

import { useTheme } from "../context/ThemeContext";
import { useUser } from "../context/UserContext";
import { categoryService } from "../services/categoryService";
import ProfileDropDown from "../models/ProfileDropDown";
import { type Category } from "../api/categoryApi";
import { useAppSelector } from "../store";
import { Skeleton } from "./ui/skeleton";

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { isSignedIn, user, loading } = useUser();
  const { theme, toggleTheme } = useTheme();

  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [category, setCategory] = useState<Category[]>([]);

  const { wishlist, cart } = useAppSelector((state) => state);

  const getCategories = async () => {
    const data = await categoryService.getAllCategories();
    setCategory(data);
  };

  useEffect(() => {
    if (!loading) {
      getCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("q") || "";
    setSearchVal(q);
  }, [location.search]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchVal(val);

    if (location.pathname !== "/courses" && val.trim() !== "") {
      navigate(`/courses?q=${encodeURIComponent(val)}`);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/courses?q=${encodeURIComponent(searchVal)}`);
  };

  if (loading) {
    return (
      <header className="sticky -top-0.5 z-50 w-full">
        <nav className="glass-nav premium-shadow w-full">
          <div className="max-w-7xl mx-auto w-full px-4 md:px-6 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Skeleton className="w-10 h-10 rounded-2xl" />
                <Skeleton className="w-20 h-6 rounded-lg" />
              </div>
              <Skeleton className="w-32 h-10 rounded-2xl hidden lg:block" />
            </div>

            <div className="flex-1 max-w-md relative hidden md:block">
              <Skeleton className="w-full h-10 rounded-full" />
            </div>

            <div className="flex items-center gap-2.5">
              <Skeleton className="w-10 h-10 rounded-full" />
              <Skeleton className="w-10 h-10 rounded-full" />
              <Skeleton className="w-10 h-10 rounded-full" />
              <Skeleton className="w-20 h-8 rounded-xl" />
              <Skeleton className="w-20 h-8 rounded-xl" />
            </div>
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header className="sticky -top-0.5 z-50 w-full">
      <nav className="glass-nav premium-shadow w-full">
        <div className="max-w-7xl mx-auto w-full px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-purple to-brand-blue flex items-center justify-center text-white premium-shadow transition-transform group-hover:scale-105">
                <Hexagon className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-brand-navy to-brand-purple bg-clip-text text-transparent">
                KVault
              </span>
            </Link>

            <div className="relative hidden lg:block">
              <button
                onClick={() => setShowMegaMenu((v) => !v)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-brand-navy hover:text-brand-purple bg-bg-secondary rounded-2xl transition-all duration-200 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-brand-purple" />
                Categories
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-300 ${
                    showMegaMenu ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showMegaMenu && (
                <div
                  className="absolute top-full left-0 mt-3 w-80 bg-bg-card rounded-3xl border border-brand-border premium-shadow p-4 grid grid-cols-1 gap-1 z-50"
                  onMouseLeave={() => setShowMegaMenu(false)}
                >
                  <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-gray">
                    Explore Specialties
                  </div>

                  <Link
                    to="/courses"
                    onClick={() => setShowMegaMenu(false)}
                    className="w-full text-left px-3 py-2.5 rounded-2xl text-sm font-medium hover:bg-bg-secondary transition-colors cursor-pointer block text-brand-navy"
                  >
                    All Specialties
                  </Link>

                  {category.map((cat) => (
                    <Link
                      key={cat._id}
                      to={`/courses?category=${encodeURIComponent(cat.slug)}`}
                      onClick={() => setShowMegaMenu(false)}
                      className="w-full text-left px-3 py-2.5 rounded-2xl text-sm font-medium hover:bg-bg-secondary transition-colors flex items-center justify-between cursor-pointer text-brand-navy"
                    >
                      <span>{cat.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-md relative hidden md:block"
          >
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-brand-gray" />
            </div>

            <input
              type="text"
              placeholder="Search skills, technologies, or courses..."
              value={searchVal}
              onChange={handleSearchChange}
              className="w-full pl-12 pr-4 py-2.5 bg-bg-secondary border border-transparent rounded-full text-sm font-medium transition-all duration-300 focus:bg-bg-card focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/5"
            />
          </form>

          <div className="flex items-center gap-2.5">
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full hover:bg-bg-secondary flex items-center justify-center text-brand-navy hover:text-brand-purple transition-colors cursor-pointer"
              title={
                theme === "light"
                  ? "Switch to Dark Mode"
                  : "Switch to Light Mode"
              }
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>

            {isSignedIn ? (
              <>
                <Link
                  to="/wishlist"
                  className="relative w-10 h-10 rounded-full hover:bg-bg-secondary flex items-center justify-center text-brand-navy hover:text-brand-purple transition-colors cursor-pointer"
                  title="Wishlist"
                >
                  <Heart className="w-5 h-5" />
                  {(wishlist.wishlist?.totalItems as number) > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-brand-purple text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center animate-bounce">
                      {wishlist.wishlist?.totalItems as number}
                    </span>
                  )}
                </Link>

                <Link
                  to="/cart"
                  className="relative w-10 h-10 rounded-full hover:bg-bg-secondary flex items-center justify-center text-brand-navy hover:text-brand-purple transition-colors cursor-pointer"
                  title="Cart"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {(cart.cart?.totalItems as number) > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-brand-blue text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center">
                      {cart.cart?.totalItems as number}
                    </span>
                  )}
                </Link>

                <Link
                  to="/my-learning"
                  className="hidden sm:flex w-10 h-10 rounded-full hover:bg-bg-secondary items-center justify-center text-brand-navy hover:text-brand-purple transition-colors cursor-pointer"
                  title="My Learning"
                >
                  <GraduationCap className="w-5.5 h-5.5" />
                </Link>

                <div className="relative group">
                  <button
                    onClick={() => navigate("/profile")}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-bg-secondary rounded-full transition-colors cursor-pointer"
                  >
                    <img
                      src={
                        user?.avatar ||
                        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"
                      }
                      alt="avatar"
                      className="w-8 h-8 rounded-full object-cover bg-brand-purple/10 border border-brand-purple/20"
                    />
                    <span className="hidden sm:block max-w-[100px] truncate text-xs font-bold text-brand-navy">
                      {user?.name}
                    </span>
                  </button>

                  <ProfileDropDown />
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-extrabold text-brand-navy hover:text-brand-purple rounded-xl transition-all cursor-pointer"
                >
                  Sign In
                </Link>
                <Link
                  to="/sign-up"
                  className="px-4 py-2 text-xs font-extrabold text-white bg-brand-purple hover:bg-brand-purple-light rounded-xl transition-all premium-shadow cursor-pointer"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};
