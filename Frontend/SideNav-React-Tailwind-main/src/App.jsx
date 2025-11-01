import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Components
import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/Sidebar";

// Pages
import Hero from "./components/Hero/Hero";
import AuthPage from "./pages/AuthPage";
import Home from "./pages/Home";
import Add from "./pages/add";
import View from "./pages/view";
import Orders from "./pages/Orders";
import Settings from "./pages/Settings";
import Log from "./pages/Log";
import Report from "./pages/Report";

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-6">
        <Routes>
          <Route path="home" element={<Home />} />
          <Route path="add" element={<Add />} />
          <Route path="view" element={<View />} />
          <Route path="orders" element={<Orders />} />
          <Route path="settings" element={<Settings />} />
          <Route path="log" element={<Log />} />
          <Route path="report" element={<Report />} />
        </Routes>
      </div>
    </div>
  );
};
const App = () => {
  return (
    <Router>
      <Routes>
        {/* ✅ Home page with Navbar + Hero */}
        <Route
          path="/"
          element={
            <div className="overflow-x-hidden bg-page min-h-screen">
              <Navbar />
              <Hero />
            </div>
          }
        />

        {/* ✅ Full-page Auth (no Navbar, no Hero) */}
        <Route
          path="/auth"
          element={
            <div className="flex items-center justify-center h-screen bg-gray-100">
              <AuthPage />
            </div>
          }
        />
          {/* ✅ Dashboard Pages */}
        <Route path="/dashboard/*" element={<DashboardLayout />} />
      </Routes>
    </Router>
  );
};

export default App;