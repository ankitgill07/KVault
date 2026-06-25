import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Hexagon, ArrowLeft } from 'lucide-react';
import { RegistrationForm, type RegistrationData } from './RegistrationForm';
import { OtpVerification } from './OtpVerification';
import { useUser } from '../context/UserContext';
import { authService } from '../services/authService';

type RegistrationStep = 'form' | 'verification';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useUser();
  const [step, setStep] = useState<RegistrationStep>('form');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);

  const handleFormSubmit = async (data: RegistrationData) => {
    setError('');
    setIsLoading(true);

    try {
      // Send registration request (this creates a temporary account and sends OTP)
      const response = await authService.register({
        firstName: data.fullName.split(' ')[0],
        lastName: data.fullName.split(' ')[1] || '',
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });

      if (response.success) {
        // Store registration data for later use
        setRegistrationData(data);
        setEmail(data.email);
        // Move to OTP verification step
        setStep('verification');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (otp: string) => {
    setError('');
    setIsLoading(true);

    try {
      const response = await authService.verifyEmail({
        email,
        otp,
      });

      if (response.success) {
        const { accessToken, refreshToken, user: userData } = response.data;
        // Save tokens
        localStorage.setItem('kvault_access_token', accessToken);
        localStorage.setItem('kvault_refresh_token', refreshToken);

        // Update user context
        // We need to manually set the user since register context method won't be called here
        // The UserContext will pick up the token on next init, but let's also update state
        // For now, redirect to home where UserProvider will initialize
        setTimeout(() => navigate('/'), 500);
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    try {
      await authService.resendOtp({ email });
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP. Please try again.');
    }
  };

  // Listen for resend OTP event from OtpVerification component
  React.useEffect(() => {
    const handleResendEvent = (event: any) => {
      if (event.detail?.email === email) {
        handleResendOtp();
      }
    };

    window.addEventListener('resendOtp', handleResendEvent);
    return () => window.removeEventListener('resendOtp', handleResendEvent);
  }, [email]);

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col lg:flex-row relative w-full">
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/80 hover:bg-white border border-brand-border rounded-full text-xs font-bold text-brand-navy premium-shadow hover:scale-102 transition-all cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5 text-brand-purple" />
        <span>Back to Home</span>
      </button>

      {/* Left side illustration pane */}
      <div className="lg:w-5/12 bg-gradient-to-tr from-brand-purple to-brand-blue flex flex-col justify-between p-12 text-white relative overflow-hidden shrink-0">
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-white/10 rounded-full blur-[80px]"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-purple-light/20 rounded-full blur-[90px]"></div>

        <div className="flex items-center gap-2 cursor-pointer z-10" onClick={() => navigate('/')}>
          <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center border border-white/20">
            <Hexagon className="w-6 h-6 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight">KVault</span>
        </div>

        <div className="space-y-6 z-10 max-w-sm">
          <h1 className="text-4xl sm:text-5xl font-black leading-tight">
            {step === 'form' ? 'Create\nAccount' : 'Verify\nEmail'}
          </h1>
          <p className="text-sm font-semibold text-white/80 leading-relaxed">
            {step === 'form'
              ? 'Begin your learning journey today. Unlock curated roadmaps, code sandboxes, and earn verified certifications.'
              : 'We sent a verification code to your email. Enter it below to complete your registration.'}
          </p>

          {/* Step Indicator */}
          <div className="flex items-center gap-3 z-10">
            <div
              className={`h-1 flex-1 rounded-full transition-all ${
                step === 'form'
                  ? 'bg-white'
                  : 'bg-white/40'
              }`}
            ></div>
            <div
              className={`h-1 flex-1 rounded-full transition-all ${
                step === 'verification'
                  ? 'bg-white'
                  : 'bg-white/40'
              }`}
            ></div>
          </div>
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
          {/* Content */}
          {step === 'form' ? (
            <>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-purple/10 text-brand-purple rounded-full text-[10px] font-bold w-fit mb-6">
                <span>📝</span>
                <span>Step 1: Create Account</span>
              </div>

              <h2 className="text-2xl font-extrabold text-brand-navy tracking-tight mb-1">
                Join KVault
              </h2>
              <p className="text-xs font-semibold text-brand-gray mb-6">
                Create an account to start learning today.
              </p>

              <RegistrationForm
                onSubmit={handleFormSubmit}
                isLoading={isLoading}
                error={error}
              />

              {/* Login Callout */}
              <div className="mt-6 text-center text-xs font-bold text-brand-gray">
                Already have an account?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-brand-purple hover:underline cursor-pointer"
                >
                  Sign in instead
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-purple/10 text-brand-purple rounded-full text-[10px] font-bold w-fit mb-6">
                <span>✉️</span>
                <span>Step 2: Verify Email</span>
              </div>

              <OtpVerification
                email={email}
                onVerifySuccess={handleVerifyOtp}
                onBackToForm={() => {
                  setStep('form');
                  setError('');
                }}
                isLoading={isLoading}
              />

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 p-3 bg-red-50 border border-red-200 rounded-[20px] text-xs font-bold text-red-600"
                >
                  {error}
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};
