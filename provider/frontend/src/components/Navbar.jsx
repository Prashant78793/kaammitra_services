import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

const Navbar = ({ isAuthenticated, handleLogout }) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    if (isAuthenticated) {
      navigate("/profile");
    } else {
      navigate("/register");
    }
  };

  return (
    <nav className="bg-gray-200 dark:bg-gray-900 shadow-md fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <img className="h-10 w-auto" src="logo.png" alt="Logo" />
          </div>
          <div className="flex items-center space-x-8">
            <Link
              to="/"
              className="text-blue-800 dark:text-white hover:text-blue-600 font-medium"
            >
              About
            </Link>
            {isAuthenticated && (
              <button
                onClick={() => {
                  handleLogout();
                  navigate("/");
                }}
                className="ml-2 px-3 py-1 bg-red-600 text-white rounded"
              >
                Logout
              </button>
            )}
            <button
              onClick={handleProfileClick}
              className="p-2 rounded-full bg-white text-blue-700 shadow hover:bg-gray-100"
            >
              <FaUserCircle size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;