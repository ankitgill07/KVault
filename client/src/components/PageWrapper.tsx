import { useAppStateContext } from '../context/AppStateContext';
import { useNavigate } from 'react-router-dom';

export const withPageData = (Component: React.ComponentType<any>) => {
  return (props: any) => {
    const navigate = useNavigate();
    const context = useAppStateContext();
    
    const commonProps = {
      cart: context.cart,
      wishlist: context.wishlist,
      enrolledCourses: context.enrolledCourses,
      courseProgress: context.courseProgress,
      onToggleCart: context.toggleCart,
      onToggleWishlist: context.toggleWishlist,
      onUpdateProgress: context.updateCourseProgress,
      onClearCart: context.clearCart,
      onPurchaseSuccess: context.addToEnrolled,
      user: context.user,
      isSignedIn: context.isSignedIn,
      onLogout: context.logout,
      onNavigateLanding: () => navigate('/'),
      cartCount: context.cartCount,
      wishlistCount: context.wishlistCount,
      isInCart: context.isInCart,
      isInWishlist: context.isInWishlist,
      addToCart: context.addToCart,
      removeFromCart: context.removeFromCart,
      addToWishlist: context.addToWishlist,
      removeFromWishlist: context.removeFromWishlist,
      fetchCart: context.fetchCart,
      fetchWishlist: context.fetchWishlist,
    };

    return <Component {...props} {...commonProps} />;
  };
};