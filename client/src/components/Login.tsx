import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Eye, EyeOff, Hexagon, ArrowLeft, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";


export const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useUser();


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
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = () => {
    setValue("email", "vikram.mehta@kvault.dev");
    setValue("password", "Pass1234!");
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col lg:flex-row relative w-full">
      {/* Back button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/80 hover:bg-white border border-brand-border rounded-full text-xs font-bold text-brand-navy premium-shadow hover:scale-102 transition-all cursor-pointer"
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
          className="w-full max-w-md bg-white rounded-[32px] border border-brand-border premium-shadow p-8 relative"
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
                <a
                  href="#"
                  className="text-xs font-bold text-brand-purple hover:underline"
                >
                  Forgot password?
                </a>
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
            <span className="relative bg-white px-3 text-[10px] uppercase font-bold tracking-wider text-brand-gray">
              Or continue with
            </span>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              disabled={isLoading}
              className="flex items-center justify-center gap-2 py-3 border border-brand-border rounded-[20px] text-xs font-bold text-brand-navy hover:bg-bg-secondary transition-all cursor-pointer hover:scale-[1.01] disabled:opacity-50"
            >
              <svg
                className="w-4 h-4 text-red-500 shrink-0"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.73 0 3.3.63 4.52 1.68l2.42-2.42C17.435 1.58 14.995 0 12.24 0 6.033 0 1 5.033 1 11.24s5.033 11.24 11.24 11.24c5.897 0 10.748-4.229 10.748-10.286 0-.69-.08-1.355-.22-1.909H12.24z" />
              </svg>
              <span>Google</span>
            </button>
            <button
              type="button"
              disabled={isLoading}
              className="flex items-center justify-center gap-2 py-3 border border-brand-border rounded-[20px] text-xs font-bold text-brand-navy hover:bg-bg-secondary transition-all cursor-pointer hover:scale-[1.01] disabled:opacity-50"
            >
              <svg
                className="w-4 h-4 text-brand-navy shrink-0"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                />
              </svg>
              <span>GitHub</span>
            </button>
          </div>

          {/* Demo Filler Panel */}
          <div className="mt-8 p-4 bg-brand-section/50 rounded-[20px] border border-brand-blue/10 flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold text-brand-navy">
                Examine with Demo Account
              </p>
              <p className="text-[10px] text-brand-gray mt-0.5">
                Loads analytics & dashboard instantly.
              </p>
            </div>
            <button
              onClick={fillDemo}
              className="px-3.5 py-2 bg-white hover:bg-bg-secondary border border-brand-border rounded-xl text-[10px] font-extrabold text-brand-purple transition-all cursor-pointer shrink-0"
            >
              Autofill
            </button>
          </div>

          {/* Register Callout */}
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
