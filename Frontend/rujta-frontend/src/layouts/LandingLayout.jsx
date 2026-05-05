import { Outlet } from "react-router-dom";
import NavbarLanding from "../features/landing/components/Navbarlanding";
import HeroLanding from "../features/landing/pages/Herolanding";

const LandingLayout = () => {
  return (
    <div className="min-h-screen bg-page sm:px-4 md:px-4 lg:px-6">
      <NavbarLanding />
      <HeroLanding />
      <Outlet />
    </div>
  );
};

export default LandingLayout;
