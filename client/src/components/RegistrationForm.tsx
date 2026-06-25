import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Sparkles } from 'lucide-react';

interface RegistrationFormProps {
  onSubmit: (data: RegistrationData) => void;
  isLoading?: boolean;
  error?: string;
}

export interface RegistrationData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  onSubmit,
  isLoading = false,
  error,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegistrationData>({
    defaultValues: {
      fullName: 'Ankit',
      email: 'gillankit076@gmail.com',
      password: 'Ankit@1234',
      confirmPassword: 'Ankit@1234',
      agreeTerms: false,
    },
  });

  const passwordWatch = watch('password');

  const getPasswordStrength = () => {
    if (!passwordWatch)
      return {
        score: 0,
        text: 'No password',
        color: 'bg-brand-border',
        width: 'w-0',
      };

    let score = 0;
    if (passwordWatch.length >= 6) score += 1;
    if (passwordWatch.length >= 10) score += 1;
    if (/[A-Z]/.test(passwordWatch)) score += 1;
    if (/[0-9]/.test(passwordWatch)) score += 1;
    if (/[^A-Za-z0-9]/.test(passwordWatch)) score += 1;

    switch (score) {
      case 1:
      case 2:
        return { score, text: 'Weak', color: 'bg-red-500', width: 'w-1/3' };
      case 3:
      case 4:
        return {
          score,
          text: 'Medium',
          color: 'bg-brand-gold',
          width: 'w-2/3',
        };
      case 5:
        return {
          score,
          text: 'Strong',
          color: 'bg-brand-success',
          width: 'w-full',
        };
      default:
        return {
          score: 0,
          text: 'Very Weak',
          color: 'bg-red-400',
          width: 'w-1/6',
        };
    }
  };

  const strength = getPasswordStrength();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-[20px] text-xs font-bold text-red-600">
          {error}
        </div>
      )}

      {/* Full Name */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-brand-navy">Full Name</label>
        <input
          type="text"
          placeholder="John Doe"
          {...register('fullName', { required: 'Name is required' })}
          className="w-full px-5 py-2.5 border border-brand-border rounded-[20px] text-sm font-semibold transition-all focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/5"
          disabled={isLoading}
        />
        {errors.fullName && (
          <p className="text-xs text-red-500 font-bold mt-0.5">
            {errors.fullName.message}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-brand-navy">Email Address</label>
        <input
          type="email"
          placeholder="john@example.com"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^\S+@\S+$/i,
              message: 'Invalid email address',
            },
          })}
          className="w-full px-5 py-2.5 border border-brand-border rounded-[20px] text-sm font-semibold transition-all focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/5"
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-xs text-red-500 font-bold mt-0.5">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-brand-navy">Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters',
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message:
                  'Password must contain uppercase, lowercase, and number',
              },
            })}
            onChange={(e) => {
              register('password').onChange(e);
              setPasswordValue(e.target.value);
            }}
            className="w-full pl-5 pr-12 py-2.5 border border-brand-border rounded-[20px] text-sm font-semibold transition-all focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/5"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-gray hover:text-brand-navy transition-colors cursor-pointer"
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Password Strength Indicator */}
        {passwordWatch && (
          <div className="pt-2 space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-bold">
              <span className="text-brand-gray">Strength:</span>
              <span
                className={
                  strength.score <= 2
                    ? 'text-red-500'
                    : strength.score <= 4
                      ? 'text-brand-gold'
                      : 'text-brand-success'
                }
              >
                {strength.text}
              </span>
            </div>
            <div className="w-full h-1 bg-brand-border rounded-full overflow-hidden">
              <div
                className={`h-full ${strength.color} ${strength.width} transition-all duration-300 rounded-full`}
              ></div>
            </div>
          </div>
        )}

        {errors.password && (
          <p className="text-xs text-red-500 font-bold mt-0.5">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-brand-navy">
          Confirm Password
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="••••••••"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (val, formValues) =>
                val === formValues.password || 'Passwords do not match',
            })}
            className="w-full pl-5 pr-12 py-2.5 border border-brand-border rounded-[20px] text-sm font-semibold transition-all focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/5"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-gray hover:text-brand-navy transition-colors cursor-pointer"
            disabled={isLoading}
          >
            {showConfirmPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>

        {errors.confirmPassword && (
          <p className="text-xs text-red-500 font-bold mt-0.5">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Agree to Terms */}
      <div className="pt-1">
        <label className="flex items-start gap-2 text-xs font-bold text-brand-navy cursor-pointer select-none">
          <input
            type="checkbox"
            {...register('agreeTerms', {
              required: 'You must agree to the Terms of Service',
            })}
            className="w-4.5 h-4.5 mt-0.5 rounded-lg border-brand-border text-brand-purple focus:ring-brand-purple"
            disabled={isLoading}
          />
          <span className="leading-tight">
            I agree to the KVault Terms of Service and Privacy Policy.
          </span>
        </label>
        {errors.agreeTerms && (
          <p className="text-xs text-red-500 font-bold mt-1">
            {errors.agreeTerms.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3.5 rounded-[20px] bg-gradient-to-r from-brand-purple to-brand-blue hover:opacity-95 text-white text-sm font-bold transition-all duration-200 premium-shadow hover:scale-[1.01] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Sending Verification Code...' : 'Create Account'}
      </button>

      {/* Info Badge */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-brand-purple/10 text-brand-purple rounded-full text-[10px] font-bold w-fit mx-auto">
        <Sparkles className="w-3 h-3" />
        <span>You'll verify your email next</span>
      </div>
    </form>
  );
};
