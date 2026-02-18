import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Users,
  Briefcase,
  DollarSign,
  Bell,
  LifeBuoy,
  Settings,
  UserCog,
  LogOut,
} from "lucide-react";

const Sidebar = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  const menu = [
    { name: "Dashboard", path: "/", icon: Home },
    { name: "Users", path: "/users", icon: Users },
    { name: "Providers", path: "/providers", icon: UserCog },
    { name: "Jobs", path: "/jobs", icon: Briefcase },
    { name: "Finance", path: "/finance", icon: DollarSign },
    { name: "Notification", path: "/notification", icon: Bell },
    { name: "Support", path: "/support", icon: LifeBuoy },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <div className="w-64 bg-white dark:bg-gray-800 shadow-lg p-4 flex flex-col justify-between h-screen">
      {/* ✅ Logo Section */}
      <div>
        <div className="flex justify-center mb-8">
          <img
            src="/logo.png"
            alt="Kaam Mitra Logo"
            className="w-32 h-auto object-contain"
          />
        </div>

        {/* ✅ Navigation Menu */}
        <nav className="space-y-2">
          {menu.map((item, i) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={i}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-700"
                  }`
                }
              >
                <Icon size={20} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* ✅ Logout Button */}
      <div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 rounded-lg text-red-600 hover:bg-red-100 dark:hover:bg-gray-700 transition-all w-full mt-2"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
