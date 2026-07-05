import React, { useState, useEffect, use } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Hexagon,
  ChevronDown,
  Search,
  Heart,
  ShoppingBag,
  Bell,
  BookOpen,
  GraduationCap,
  User,
  LogOut,
} from "lucide-react";
import { CATEGORIES } from "../data/courses";
import { useUser } from "../context/UserContext";
import { useAppStateContext } from "../context/AppStateContext";
import { categoryService } from "../services/categoryService";
import { type Category } from "../api/categoryApi";
import { useAppSelector } from "../store";
import ProfileDropDown from "../models/ProfileDropDown";

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSignedIn, user, logout } = useUser();

  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [category, setCategory] = useState<Category[]>([]);

  const { wishlist, cart } = useAppSelector((state) => state);
  const getCategories = async () => {
    const data = await categoryService.getAllCategories();
    setCategory(data);
  };

  useEffect(() => {
    getCategories();
  }, []);

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

  return (
    <header className="sticky -top-0.5 z-50 mx-auto w-full">
      <nav className="glass-nav  premium-shadow px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Logo & Mega Menu */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 cursor-pointer group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-purple to-brand-blue flex items-center justify-center text-white premium-shadow transition-transform group-hover:scale-105">
              <Hexagon className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-brand-navy to-brand-purple bg-clip-text text-transparent">
              KVault
            </span>
          </Link>

          {/* Mega Menu Toggle */}
          <div className="relative hidden lg:block">
            <button
              onClick={() => setShowMegaMenu(!showMegaMenu)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-brand-navy hover:text-brand-purple bg-bg-secondary rounded-2xl transition-all duration-200 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-brand-purple" />
              Categories
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 ${showMegaMenu ? "rotate-180" : ""}`}
              />
            </button>

            {showMegaMenu && (
              <div
                className="absolute top-full left-0 mt-3 w-80 bg-white rounded-3xl border border-brand-border premium-shadow p-4 grid grid-cols-1 gap-1 z-50"
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
                {category?.map((cat) => (
                  <Link
                    key={cat._id}
                    to={`/category/${cat.slug}`}
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

        {/* Center: Search Bar */}
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
            className="w-full pl-12 pr-4 py-2.5 bg-bg-secondary border border-transparent rounded-full text-sm font-medium transition-all duration-300 focus:bg-white focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/5"
          />
        </form>

        {/* Right: Actions / Auth */}
        <div className="flex items-center gap-2.5">
          {/* Wishlist */}
          <Link
            to="/playlist"
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

          {/* Cart */}
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

          {/* My Learning Link (Visible when signed in) */}

          <Link
            to="/my-learning"
            className="w-10 h-10 rounded-full hover:bg-bg-secondary flex items-center justify-center text-brand-navy hover:text-brand-purple transition-colors cursor-pointer hidden sm:flex"
            title="My Learning"
          >
            <GraduationCap className="w-5.5 h-5.5" />
          </Link>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-10 h-10 rounded-full hover:bg-bg-secondary flex items-center justify-center text-brand-navy hover:text-brand-purple transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-brand-gold rounded-full border-2 border-white"></span>
            </button>

            {showNotifications && (
              <div
                className="absolute top-full right-0 mt-3 w-80 bg-white rounded-3xl border border-brand-border premium-shadow p-4 animate-in fade-in duration-200 z-50"
                onMouseLeave={() => setShowNotifications(false)}
              >
                <div className="font-bold text-sm text-brand-navy mb-3">
                  Recent Notifications
                </div>
                <div className="space-y-3">
                  <div className="p-2.5 hover:bg-bg-secondary rounded-2xl transition-colors cursor-pointer">
                    <p className="text-xs font-semibold text-brand-navy">
                      ✨ Special Invitation
                    </p>
                    <p className="text-[11px] text-brand-gray mt-0.5">
                      Welcome to KVault Early Access! Explore curated roadmaps.
                    </p>
                  </div>
                  <div className="p-2.5 hover:bg-bg-secondary rounded-2xl transition-colors cursor-pointer">
                    <p className="text-xs font-semibold text-brand-navy">
                      🔥 Weekly Progress Update
                    </p>
                    <p className="text-[11px] text-brand-gray mt-0.5">
                      You are in the top 5% of learners this week. Keep
                      building!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-[1px] bg-brand-border mx-1"></div>

          <div className="relative group">
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2 px-3 py-2 hover:bg-bg-secondary rounded-full transition-colors cursor-pointer"
            >
              <img
                src={`${import.meta.env.VITE_BACKEND_BASE_URL}${user?.avatar}`}
                alt="avatar"
                className="w-8 h-8 rounded-full object-cover bg-brand-purple/10 border border-brand-purple/20"
              />
              <span className="text-xs font-bold text-brand-navy hidden sm:block max-w-[100px] truncate">
                {user?.name}
              </span>
            </button>

            {/* Dropdown */}
            <ProfileDropDown />
          </div>
        </div>
      </nav>
    </header>
  );
};
