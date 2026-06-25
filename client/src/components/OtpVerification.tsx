import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Loader, Check, RotateCcw, Sparkles } from 'lucide-react';

interface OtpVerificationProps {
  email: string;
  onVerifySuccess: (otp: string) => void;
  onBackToForm: () => void;
  isLoading?: boolean;
}

export const OtpVerification: React.FC<OtpVerificationProps> = ({
  email,
  onVerifySuccess,
  onBackToForm,
  isLoading = false,
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      onVerifySuccess(otpCode);
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      // Trigger resend OTP in parent component
      const event = new CustomEvent('resendOtp', { detail: { email } });
      window.dispatchEvent(event);
      setResendCountdown(60);
      setOtp(['', '', '', '', '', '']);
      setError('');
    } catch (err: any) {
      setError('Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full space-y-6"
    >
      {/* Email Verification Icon */}
      <div className="flex justify-center">
        <div className="p-4 bg-brand-purple/10 rounded-full">
          <Mail className="w-8 h-8 text-brand-purple" />
        </div>
      </div>

      {/* Title and Description */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-extrabold text-brand-navy tracking-tight">
          Verify Your Email
        </h2>
        <p className="text-xs text-brand-gray font-semibold">
          We've sent a 6-digit code to
        </p>
        <p className="text-sm font-bold text-brand-purple break-all">
          {email}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-3 bg-red-50 border border-red-200 rounded-[20px] text-xs font-bold text-red-600"
        >
          {error}
        </motion.div>
      )}

      {/* OTP Input Fields */}
      <div className="space-y-4">
        <label className="text-xs font-bold text-brand-navy block">
          Enter Verification Code
        </label>
        <div className="flex gap-3 justify-center">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-14 h-14 text-center text-lg font-bold border-2 border-brand-border rounded-[12px] focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10 transition-all"
              disabled={isVerifying}
            />
          ))}
        </div>
      </div>

      {/* Verify Button */}
      <button
        onClick={handleVerify}
        disabled={isVerifying || otp.join('').length !== 6}
        className="w-full py-3.5 rounded-[20px] bg-gradient-to-r from-brand-purple to-brand-blue hover:opacity-95 text-white text-sm font-bold transition-all duration-200 premium-shadow hover:scale-[1.01] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isVerifying ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            Verifying...
          </>
        ) : (
          <>
            <Check className="w-4 h-4" />
            Verify Email
          </>
        )}
      </button>

      {/* Resend OTP Section */}
      <div className="space-y-3">
        <p className="text-xs text-brand-gray font-semibold text-center">
          Didn't receive the code?
        </p>
        <button
          onClick={handleResend}
          disabled={resendCountdown > 0 || resendLoading}
          className="w-full py-2.5 rounded-[20px] border-2 border-brand-border bg-white hover:bg-bg-secondary text-brand-purple text-xs font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {resendLoading ? (
            <>
              <Loader className="w-3.5 h-3.5 animate-spin" />
              Sending...
            </>
          ) : resendCountdown > 0 ? (
            <>
              <RotateCcw className="w-3.5 h-3.5" />
              Resend in {resendCountdown}s
            </>
          ) : (
            <>
              <RotateCcw className="w-3.5 h-3.5" />
              Resend Code
            </>
          )}
        </button>
      </div>

      {/* Back Button */}
      <button
        onClick={onBackToForm}
        disabled={isVerifying}
        className="w-full py-2.5 rounded-[20px] text-brand-purple hover:bg-brand-purple/5 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
      >
        ← Back to Form
      </button>

      {/* Info Badge */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-brand-blue/10 text-brand-blue rounded-full text-[10px] font-bold w-fit mx-auto">
        <Sparkles className="w-3 h-3" />
        <span>Code expires in 10 minutes</span>
      </div>
    </motion.div>
  );
};
