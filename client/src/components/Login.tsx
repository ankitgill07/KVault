import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Hexagon,
  ArrowLeft,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { authService } from "../services/authService";

export const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useUser();

  useEffect(() => {
    // Show success message when redirected after email verification
    const state = location.state as { verified?: string } | null;
    if (state?.verified) {
      setSuccess(state.verified);
      // Clear the state so it doesn't show again on re-render
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: any) => {
    setError("");
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      navigate("/");
    } catch (err: any) {
      const errorMessage =
        err.message || "Login failed. Please check your credentials.";
      // If email is not verified, redirect to OTP verification page
      if (errorMessage.includes("verify your email")) {
        navigate(`/verify-otp?email=${encodeURIComponent(data.email)}`, {
          state: { from: "/login" },
          replace: true,
        });
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = () => {
    setValue("email", "vikram.mehta@kvault.dev");
    setValue("password", "Pass1234!");
  };

  return (
    <div className="min-h-screen  bg-bg-primary flex flex-col lg:flex-row relative w-full">
      {/* Back button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-2 left-10 z-50 flex items-center gap-2 px-4 py-2 bg-bg-card/85 hover:bg-bg-card border border-brand-border rounded-full text-xs font-bold text-brand-navy premium-shadow hover:scale-102 transition-all cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5 text-brand-purple" />
        <span>Back to Home</span>
      </button>

      {/* Left side illustration pane */}
      <div className="lg:w-5/12 bg-gradient-to-tr from-brand-purple to-brand-blue flex flex-col justify-between p-12 text-white relative overflow-hidden shrink-0">
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-white/10 rounded-full blur-[80px]"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-purple-light/20 rounded-full blur-[90px]"></div>

        <div
          className="flex items-center gap-2 cursor-pointer z-10"
          onClick={() => navigate("/")}
        >
          <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center border border-white/20">
            <Hexagon className="w-6 h-6 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight">KVault</span>
        </div>

        <div className="space-y-6 z-10 max-w-sm">
          <h1 className="text-4xl sm:text-5xl font-black leading-tight">
            Welcome <br />
            Back.
          </h1>
          <p className="text-sm font-semibold text-white/80 leading-relaxed">
            Continue your learning journey, build customized sandboxes, and
            secure verifiable industry skills credentials.
          </p>
        </div>

        <div className="z-10 text-xs font-bold text-white/60">
          © 2026 KVault • Learn Beyond Boundaries
        </div>
      </div>

      {/* Right side form pane */}
      <div className="lg:w-7/12 flex items-center justify-center p-8 bg-bg-primary w-full">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-bg-card rounded-[32px] border border-brand-border premium-shadow p-8 relative"
        >
          {/* Sparkle badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-purple/10 text-brand-purple rounded-full text-[10px] font-bold w-fit mb-6">
            <Sparkles className="w-3.5 h-3.5 text-brand-purple" />
            <span>Premium Learning Environment</span>
          </div>

          <h2 className="text-2xl font-extrabold text-brand-navy tracking-tight mb-1">
            Sign In to KVault
          </h2>
          <p className="text-xs font-semibold text-brand-gray mb-8">
            Access your courses, dashboard, and settings.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {success && (
              <div className="p-3.5 bg-green-50 border border-green-200 rounded-[20px] flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                <p className="text-xs font-bold text-green-600">{success}</p>
              </div>
            )}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-[20px] text-xs font-bold text-red-600">
                {error}
              </div>
            )}
            {/* Email input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-navy">
                Email Address
              </label>
              <input
                type="email"
                placeholder="name@company.com"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Invalid email address",
                  },
                })}
                className="w-full px-5 py-3 border border-brand-border rounded-[20px] text-sm font-semibold transition-all focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/5"
              />
              {errors.email && (
                <p className="text-xs text-red-500 font-bold mt-0.5">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-brand-navy">
                  Password
                </label>
    
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  className="w-full pl-5 pr-12 py-3 border border-brand-border rounded-[20px] text-sm font-semibold transition-all focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/5"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-gray hover:text-brand-navy transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 font-bold mt-0.5">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs font-bold text-brand-navy cursor-pointer select-none">
                <input
                  type="checkbox"
                  {...register("rememberMe")}
                  className="w-4.5 h-4.5 rounded-lg border-brand-border text-brand-purple focus:ring-brand-purple"
                />
                <span>Remember me for 30 days</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-[20px] bg-gradient-to-r from-brand-purple to-brand-blue hover:opacity-95 text-white text-sm font-bold transition-all duration-200 premium-shadow hover:scale-[1.01] cursor-pointer disabled:opacity-50"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Social Sign-in Divider */}
          <div className="relative my-8 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brand-border/80"></div>
            </div>
            <span className="relative bg-bg-card px-3 text-[10px] uppercase font-bold tracking-wider text-brand-gray">
              Or continue with
            </span>
          </div>
          <div className="mt-8 text-center text-xs font-bold text-brand-gray">
            New to KVault?{" "}
            <button
              onClick={() => navigate("/sign-up")}
              className="text-brand-purple hover:underline cursor-pointer"
            >
              Create early access account
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
