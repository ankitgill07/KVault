import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Hexagon, ArrowLeft } from 'lucide-react';
import { RegistrationForm, type RegistrationData } from './RegistrationForm';
import { OtpVerification } from './OtpVerification';
import { useUser } from '../context/UserContext';
import { authService } from '../services/authService';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const handleFormSubmit = async (data: RegistrationData) => {
    setError(''); setIsLoading(true);
    try {
      const response = await authService.register({
        name: data.fullName, email: data.email,
        password: data.password, confirmPassword: data.confirmPassword,
      });
      if (response.success) {
        // Server already sends OTP automatically during registration
        // Show OTP verification on the same page
        setRegisteredEmail(data.email);
        setShowOtpVerification(true);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally { setIsLoading(false); }
  };

  const handleOtpVerified = () => {
    // After successful OTP verification, navigate to homepage
    navigate('/', {
      replace: true,
      state: { verified: 'Email verified! Welcome to KVault.' },
    });
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col lg:flex-row relative w-full">
      <button onClick={() => navigate('/')}
        className="absolute top-2 left-10 z-50 flex items-center gap-2 px-4 py-2 bg-white/80 hover:bg-white border border-brand-border rounded-full text-xs font-bold text-brand-navy premium-shadow cursor-pointer">
        <ArrowLeft className="w-3.5 h-3.5 text-brand-purple" /><span>Back to Home</span>
      </button>
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
          <h1 className="text-4xl sm:text-5xl font-black leading-tight">Begin your<br />learning journey.</h1>
          <p className="text-sm font-semibold text-white/80 leading-relaxed">
            Create your KVault account in seconds. Access curated roadmaps,
            hands-on sandboxes, and industry-recognized certifications.
          </p>
        </div>
        <div className="text-xs font-bold text-white/60 z-10">2026 KVault — Learn Beyond Boundaries</div>
      </div>
      <div className="lg:w-7/12 flex items-center justify-center p-8 bg-bg-primary w-full">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white rounded-[32px] border border-brand-border premium-shadow p-8 relative">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-purple/10 text-brand-purple rounded-full text-[10px] font-bold w-fit mb-6"><span>Create account</span></div>
          <h2 className="text-2xl font-extrabold text-brand-navy tracking-tight mb-1">Join KVault</h2>
          <p className="text-xs font-semibold text-brand-gray mb-6">Create an account to start learning today.</p>
          {!showOtpVerification ? (
            <>
              <RegistrationForm onSubmit={handleFormSubmit} isLoading={isLoading} error={error} />
              <div className="mt-6 text-center text-xs font-bold text-brand-gray">
                Already have an account?{' '}
                <button onClick={() => navigate('/login')} className="text-brand-purple hover:underline cursor-pointer">Sign in instead</button>
              </div>
            </>
          ) : (
            <OtpVerification 
              email={registeredEmail} 
              onVerified={handleOtpVerified}
              isInline={true}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};