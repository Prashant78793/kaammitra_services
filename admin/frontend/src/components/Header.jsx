import React, { useEffect, useState } from "react";
import { Bell, Moon, Sun, User } from "lucide-react";
import { useLocation } from "react-router-dom";

const Header = ({ darkMode, setDarkMode }) => {
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState("Dashboard");

  useEffect(() => {
    // Map routes to titles
    const pathTitleMap = {
      "/": "Dashboard",
      "/users": "Users",
      "/providers": "Providers",
      "/jobs": "Jobs",
      "/finance": "Finance",
      "/notification": "Notifications",
      "/support": "Support",
      "/settings": "Settings",
    };

    // Set title based on current pathname
    setPageTitle(pathTitleMap[location.pathname] || "Dashboard");
  }, [location.pathname]);

  return (
    <header className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 shadow">
      {/* ✅ Dynamic Title */}
      <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200 capitalize">
        {pageTitle}
      </h1>

      {/* ✅ Right Icons */}
      <div className="flex items-center gap-4">
        <Bell className="cursor-pointer text-gray-700 dark:text-gray-200" />
        {darkMode ? (
          <Sun
            onClick={() => setDarkMode(false)}
            className="cursor-pointer text-yellow-400"
          />
        ) : (
          <Moon
            onClick={() => setDarkMode(true)}
            className="cursor-pointer text-gray-700"
          />
        )}
       
      </div>
    </header>
  );
};

export default Header;
