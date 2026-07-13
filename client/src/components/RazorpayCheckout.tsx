import { useEffect, useRef } from 'react';

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayCheckoutProps {
  options: RazorpayOptions;
  onSuccess: (response: any) => void;
  onFailure: (error: any) => void;
  onDismiss?: () => void;
}

const RazorpayCheckout: React.FC<RazorpayCheckoutProps> = ({
  options,
  onSuccess,
  onFailure,
  onDismiss,
}) => {
  const razorpayRef = useRef<any>(null);
  const openedRef = useRef(false);

  useEffect(() => {
    // Load Razorpay script if not already loaded
    const script = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    
    if (!script) {
      const razorpayScript = document.createElement('script');
      razorpayScript.src = 'https://checkout.razorpay.com/v1/checkout.js';
      razorpayScript.async = true;
      document.body.appendChild(razorpayScript);
    }

    // Initialize Razorpay after script is loaded
    const initializeRazorpay = () => {
      if (window.Razorpay && !openedRef.current) {
        openedRef.current = true;
        const razorpay = new window.Razorpay({
          ...options,
          handler: (response: any) => {
            onSuccess(response);
          },
          modal: {
            ...options.modal,
            ondismiss: () => {
              if (onDismiss) onDismiss();
              if (options.modal?.ondismiss) options.modal.ondismiss();
            },
          },
        });

        razorpayRef.current = razorpay;
        razorpay.on("payment.failed", onFailure);
        razorpay.open();
      }
    };

    // Wait for Razorpay to be available
    const checkRazorpay = setInterval(() => {
      if (window.Razorpay) {
        clearInterval(checkRazorpay);
        initializeRazorpay();
      }
    }, 100);

    // Cleanup
    return () => {
      clearInterval(checkRazorpay);
    };
  }, [options, onSuccess, onFailure, onDismiss]);

  return null; // This component doesn't render anything
};

export default RazorpayCheckout;
