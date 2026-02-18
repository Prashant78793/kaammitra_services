import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Layout components
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

// Main pages
import DashboardProvider from "./pages/Dashboard";
import Users from "./pages/Users";
import Providers from "./pages/Providers";
import Jobs from "./pages/Jobs";
import Finance from "./pages/Finance";
import Notification from "./pages/Notification";
import Support from "./pages/Support";
import Settings from "./pages/Settings";

// Auth pages
import Login from "./pages/Login";
import Signup from "./pages/SignUp";

const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ✅ Check token on page load (persist login)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <>
      {isAuthenticated ? (
        // ✅ Main App Layout after login
        <div className={darkMode ? "dark" : ""}>
          <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar setIsAuthenticated={setIsAuthenticated} />
            <div className="flex-1 flex flex-col">
              <Header darkMode={darkMode} setDarkMode={setDarkMode} />
              <main className="p-6 overflow-auto flex-1">
                <Routes>
                  <Route path="/" element={<DashboardProvider />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/providers" element={<Providers />} />
                  <Route path="/jobs" element={<Jobs />} />
                  <Route path="/finance" element={<Finance />} />
                  <Route path="/notification" element={<Notification />} />
                  <Route path="/support" element={<Support />} />
                  <Route path="/settings" element={<Settings />} />
                  {/* Redirect unknown routes */}
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </main>
            </div>
          </div>
        </div>
      ) : (
        // ✅ Auth Pages (Login / Signup)
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route
            path="/login"
            element={<Login setIsAuthenticated={setIsAuthenticated} />}
          />
          <Route
            path="/signup"
            element={<Signup setIsAuthenticated={setIsAuthenticated} />}
          />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </>
  );
};

export default App;
