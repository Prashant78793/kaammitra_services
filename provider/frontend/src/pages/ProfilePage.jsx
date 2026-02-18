import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const ProfilePage = () => {
  return (
    <div className="flex bg-gray-100 dark:bg-gray-900 min-h-screen">
      {/* Sidebar fixed on left */}
      <Sidebar />

      {/* Right side content changes according to route */}
      <div className="flex-1 ml-56 p-8">
        <Outlet />
      </div>
    </div>
  );
};

export default ProfilePage;
