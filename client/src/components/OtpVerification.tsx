import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { MailCheck, Sparkles, Clock, ShieldCheck, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { authService } from '../services/authService';
import { useUser } from '../context/UserContext';

interface OtpVerificationProps {
  email?: string;
  onVerified?: () => void;
  isInline?: boolean;
}

export const OtpVerification: React.FC<OtpVerificationProps> = ({
  email: propEmail,
  onVerified,
  isInline = false,
}) => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useUser();

  const [email, setEmail] = useState(propEmail || searchParams.get('email') || '');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timer, setTimer] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (!email) {
      if (isInline) {
        // If inline and no email, don't navigate away
        return;
      }
      navigate('/login');
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [email, navigate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    pastedData.split('').forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.verifyOtp({ email, otp: otpValue });
      setSuccess('Email verified successfully! Redirecting to homepage...');

      // Update user context with the logged-in user data
      if (response.data?.user) {
        setUser({
          id: response.data.user.id,
          name: response.data.user.name,
          email: response.data.user.email,
        });
      }

      setTimeout(() => {
        if (isInline && onVerified) {
          onVerified();
        } else {
          navigate('/', {
            replace: true,
            state: { verified: 'Email verified! Welcome to KVault.' },
          });
        }
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError('');
    setSuccess('');

    try {
      await authService.resendOtp(email);
      setSuccess('OTP resent successfully! Please check your email.');
      setTimer(600);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const OtpForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* OTP Input */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-brand-navy mb-3 block">Verification Code</label>
        <div className="flex gap-2.5 justify-center" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-12 h-14 text-center text-xl font-extrabold border-2 rounded-[16px] outline-none transition-all ${
                digit
                  ? 'border-brand-purple ring-4 ring-brand-purple/10 text-brand-navy'
                  : 'border-brand-border text-brand-navy'
              } focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/5`}
              disabled={loading}
            />
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || otp.join('').length !== 6}
        className="w-full py-3.5 rounded-[20px] bg-gradient-to-r from-brand-purple to-brand-blue hover:opacity-95 text-white text-sm font-bold transition-all duration-200 premium-shadow hover:scale-[1.01] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Verifying...
          </span>
        ) : (
          'Verify OTP'
        )}
      </button>
    </form>
  );

  const ResendSection = () => (
    <div className="mt-6 text-center">
      <p className="text-xs font-bold text-brand-gray">
        Didn't receive the code?{' '}
        <button
          onClick={handleResend}
          disabled={!canResend || resendLoading}
          className="text-brand-purple hover:underline disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {resendLoading ? (
            <span className="inline-flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin" /> Resending...
            </span>
          ) : canResend ? (
            'Resend OTP'
          ) : (
            `Resend in ${formatTime(timer)}`
          )}
        </button>
      </p>
    </div>
  );

  const InfoBadge = () => (
    <div className="mt-6 pt-6 border-t border-brand-border flex items-center gap-1.5 px-3 py-2 bg-brand-purple/10 text-brand-purple rounded-full text-[10px] font-bold w-fit mx-auto">
      <Sparkles className="w-3 h-3" />
      <span>Your account will be activated after verification</span>
    </div>
  );

  if (isInline) {
    return (
      <div className="w-full">
        {/* Error Message */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-[20px]">
            <p className="text-xs font-bold text-red-600">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-5 p-3.5 bg-green-50 border border-green-200 rounded-[20px]">
            <p className="text-xs font-bold text-green-600">{success}</p>
          </div>
        )}

        <OtpForm />
        <ResendSection />
        <InfoBadge />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col lg:flex-row relative w-full">

      {/* Left Panel */}
      <div className="lg:w-5/12 bg-gradient-to-tr from-brand-purple to-brand-blue flex flex-col justify-between p-12 text-white relative overflow-hidden shrink-0">
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-white/10 rounded-full blur-[80px]"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-purple-light/20 rounded-full blur-[90px]"></div>
        <div className="space-y-6 z-10 max-w-sm">
          <h1 className="text-4xl sm:text-5xl font-black leading-tight">Verify your<br />email address.</h1>
          <p className="text-sm font-semibold text-white/80 leading-relaxed">
            We've sent a 6-digit verification code to your email. Enter it below
            to activate your account and start learning.
          </p>
          <div className="flex items-center gap-3 mt-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/15 rounded-full border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-white/80" />
              <span className="text-[10px] font-bold text-white/70">Secure verification</span>
            </div>
          </div>
        </div>
        <div className="text-xs font-bold text-white/60 z-10">2026 KVault — Learn Beyond Boundaries</div>
      </div>

      {/* Right Panel */}
      <div className="lg:w-7/12 flex items-center justify-center p-8 bg-bg-primary w-full">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-bg-card rounded-[32px] border border-brand-border premium-shadow p-8 relative"
        >
          <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-purple/10 text-brand-purple rounded-full text-[10px] font-bold w-fit mb-6">
            <MailCheck className="w-3 h-3" />
            <span>Email verification</span>
          </div>

          <h2 className="text-2xl font-extrabold text-brand-navy tracking-tight mb-1">Enter OTP</h2>
          <p className="text-xs font-semibold text-brand-gray mb-2">
            A 6-digit code was sent to{' '}
            <span className="text-brand-purple">{email}</span>
          </p>

          {/* Timer */}
          <div className="flex items-center gap-1.5 mb-6">
            <Clock className="w-3.5 h-3.5 text-brand-gray" />
            {timer > 0 ? (
              <p className="text-[10px] font-bold text-brand-gray">
                Code expires in <span className="text-brand-purple">{formatTime(timer)}</span>
              </p>
            ) : (
              <p className="text-[10px] font-bold text-red-500">Code has expired — request a new one</p>
            )}
          </div>

          <OtpForm />
          <ResendSection />
          <InfoBadge />
        </motion.div>
      </div>
    </div>
  );
};
