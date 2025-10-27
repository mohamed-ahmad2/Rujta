import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Orders from "./pages/Orders";
import Home from "./pages/Home";
import AddProduct from "./pages/add";
import ViewProducts from "./pages/view";
import Settings from "./pages/Settings";
import Log from "./pages/Log";
import Report from "./pages/Report";
import AuthPage from "./pages/AuthPage";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      {isAuthenticated ? (
        // ✅ Dashboard Layout
        <div className="flex">
          <Sidebar />
          <div className="flex-1 bg-gray-100 min-h-screen p-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/add" element={<AddProduct />} />
              <Route path="/view" element={<ViewProducts />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/log" element={<Log />} />
              <Route path="/report" element={<Report />} />
            </Routes>
          </div>
        </div>
      ) : (
        // 🔹 Auth Page
        <AuthPage onAuthSuccess={() => setIsAuthenticated(true)} />
      )}
    </Router>
  );
}
