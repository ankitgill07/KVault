import { LogOutIcon } from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

function ProfileDropDown() {
  const navigate = useNavigate();
  const { logout, user } = useUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      await logout();
      navigate("/login", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div>
      <div className="absolute top-full right-0 mt-2 w-48 bg-bg-card rounded-2xl border border-brand-border premium-shadow py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        {user?.role === "instructor" && (
          <Link
            to="/instructor"
            className="w-full text-left px-4 py-4 text-xs font-bold text-violet-600 hover:bg-bg-secondary transition-colors cursor-pointer block border-b border-brand-border/60"
          >
            Instructor Dashboard
          </Link>
        )}
        <Link
          to="/profile"
          className="w-full text-left px-4 py-4 text-xs font-bold text-brand-navy hover:bg-bg-secondary transition-colors cursor-pointer block"
        >
          View Profile
        </Link>
        <Link
          to="/my-learning"
          className="w-full text-left px-4 py-4 text-xs font-bold text-brand-navy hover:bg-bg-secondary transition-colors cursor-pointer block"
        >
          My learning
        </Link>
        <Link
          to="/cart"
          className="w-full text-left px-4 py-4 text-xs font-bold text-brand-navy hover:bg-bg-secondary transition-colors cursor-pointer block"
        >
          My Cart
        </Link>
        <Link
          to="/wishlist"
          className="w-full text-left px-4 py-4 text-xs font-bold text-brand-navy hover:bg-bg-secondary transition-colors cursor-pointer block"
        >
          Wishlist
        </Link>
        <Link
          to="/purchases"
          className="w-full text-left px-4 py-4 text-xs font-bold text-brand-navy hover:bg-bg-secondary transition-colors cursor-pointer block"
        >
          Purchases
        </Link>
        <hr className="my-2 border-brand-border/60" />
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOutIcon className="w-3.5 h-3.5" />
          {isLoggingOut ? "Logging out..." : "Log out"}
        </button>
      </div>
    </div>
  );
}

export default ProfileDropDown;
