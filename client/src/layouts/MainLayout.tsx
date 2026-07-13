import { Outlet } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-premium-mesh selection:bg-brand-purple/20 selection:text-brand-purple flex flex-col justify-between">
      <Header />
      <div className="flex-1 w-full flex flex-col">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};
