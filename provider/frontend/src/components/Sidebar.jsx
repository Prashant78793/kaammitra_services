import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Briefcase, IndianRupee, Bell, User } from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // 1. Remove the authentication token/data from local storage
    localStorage.removeItem("providerData"); 
    
    // 2. Redirect the user to the home page or login page
    // Redirecting to "/" will cause App.jsx to re-evaluate isAuthenticated state
    navigate("/"); 
    
    // 3. Forcing a state refresh in App.jsx (if using global state) 
    // In our case, the App component already checks localStorage on load.
    // However, if we were using a state prop in App.jsx to handle auth, 
    // we would need to call a function passed from App.jsx to update the state.
    
    // Since we rely on local storage for initial load in App.jsx,
    // a quick window reload is sometimes the most robust way to guarantee
    // the state resets across all components and the router correctly applies
    // the unauthenticated route guards.
    window.location.reload(); // Ensures App.jsx re-checks localStorage and forces redirect if needed.
  };

  const linkClasses = ({ isActive }) =>
    `flex items-center px-4 py-2 rounded-lg mb-2 font-medium transition-colors duration-200 ${
      isActive
        ? "bg-blue-600 border-blue-600 text-white shadow-md"
        : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
    }`;

  return (
    <div className="fixed top-16 left-0 w-56 h-[calc(100vh-64px)] bg-white dark:bg-gray-800 shadow-xl p-4 overflow-y-auto">
      <nav>
        <NavLink to="/profile" end className={linkClasses}>
          <LayoutDashboard className="w-5 h-5 mr-2" /> Dashboard
        </NavLink>
        <NavLink to="/profile/jobs" className={linkClasses}>
          <Briefcase className="w-5 h-5 mr-2" /> Jobs
        </NavLink>
        <NavLink to="/profile/earnings" className={linkClasses}>
          <IndianRupee className="w-5 h-5 mr-2" /> Earnings
        </NavLink>
        <NavLink to="/profile/notifications" className={linkClasses}>
          <Bell className="w-5 h-5 mr-2" /> Notifications
        </NavLink>
        <hr className="my-4 border-gray-200 dark:border-gray-700"/>
        <NavLink to="/profile/profiledetails" className={linkClasses}>
          <User className="w-5 h-5 mr-2" /> My Profile
        </NavLink>

        {/* LOGOUT BUTTON */}
        <button
          onClick={handleLogout}
          className="w-full mt-8 bg-red-600 text-white py-2 rounded-lg shadow hover:bg-red-700 transition-colors duration-200"
        >
          Logout
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;