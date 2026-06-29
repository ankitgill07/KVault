import { Outlet } from 'react-router-dom';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-premium-mesh flex items-center justify-center">
      <div className="w-full">
        <Outlet />
      </div>
    </div>
  );
};