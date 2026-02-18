import React, { useState } from "react";
import {
  Briefcase,
  CreditCard,
  CheckCircle,
  Star,
  Bell,
  DollarSign,
  Settings,
} from "lucide-react";

// Notification List Item
const NotificationItem = ({ icon: Icon, title, description, time, iconColor }) => (
  <div className="flex items-start justify-between p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition duration-150 rounded-lg cursor-pointer">
    <div className="flex items-start">
      <div className={`p-2 rounded-full ${iconColor} bg-opacity-10 mr-4 mt-1`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div>
        <p className="font-semibold text-gray-900 dark:text-white">{title}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </div>
    <span className="text-xs text-gray-400 dark:text-gray-500">{time}</span>
  </div>
);

// Preference Toggle
const PreferenceToggle = ({ label, isPriority = false }) => {
  const [isEnabled, setIsEnabled] = useState(true);

  const toggleClass = isEnabled
    ? "translate-x-full bg-blue-600"
    : "bg-gray-300 dark:bg-gray-600";

  return (
    <div
      className={`flex justify-between items-center py-2 ${
        isPriority ? "border-t border-gray-200 dark:border-gray-700 pt-4" : ""
      }`}
    >
      <p
        className={`font-medium ${
          isPriority
            ? "text-blue-700 dark:text-blue-400"
            : "text-gray-700 dark:text-gray-200"
        }`}
      >
        {label}
      </p>
      <button
        onClick={() => setIsEnabled(!isEnabled)}
        className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 ${
          isEnabled ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-600"
        }`}
        role="switch"
        aria-checked={isEnabled}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 rounded-full shadow transform ring-0 transition ease-in-out duration-200 ${toggleClass}`}
        />
      </button>
    </div>
  );
};

const ProfileNotifications = () => {
  // Notifications bell toggle state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const notifications = [
    {
      icon: Briefcase,
      title: "New job request",
      description: "new job requested of ac repair",
      time: "04:10 pm",
      color: "text-blue-600",
    },
    {
      icon: CreditCard,
      title: "Payment Recieved",
      description: "got payment",
      time: "04:10 pm",
      color: "text-blue-600",
    },
    {
      icon: CheckCircle,
      title: "Profile verification",
      description: "new job requested of ac repair",
      time: "04:10 pm",
      color: "text-green-500",
    },
    {
      icon: Star,
      title: "Customer rating",
      description: "Recieved rating",
      time: "04:10 pm",
      color: "text-yellow-500",
    },
    {
      icon: Bell,
      title: "Job Reminder",
      description: "your service is waiting",
      time: "04:10 pm",
      color: "text-orange-500",
    },
    {
      icon: DollarSign,
      title: "Payment Pending",
      description: "pending payment",
      time: "04:10 pm",
      color: "text-gray-600",
    },
    {
      icon: Briefcase,
      title: "Job Cancelled",
      description: "your job is cancelled by customer",
      time: "04:10 pm",
      color: "text-red-600",
    },
    {
      icon: Settings,
      title: "New Feature",
      description: "feature updates",
      time: "04:10 pm",
      color: "text-blue-400",
    },
  ];

  return (
    <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Provider name
          </h2>
          <span className="text-green-500">✓</span>
          <span className="bg-gray-300 dark:bg-gray-600 text-xs text-gray-800 dark:text-gray-200 py-1 px-3 rounded-full font-medium">
            complete profile
          </span>
        </div>

        {/* Bell Button */}
        <div className="flex space-x-4 items-center">
          <button
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className={`focus:outline-none ${
              notificationsEnabled
                ? "text-blue-600"
                : "text-gray-600 dark:text-gray-300"
            }`}
          >
            <Bell className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notifications List */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Latest Notifications
          </h3>
          <div className="space-y-2">
            {notifications.map((notif, index) => (
              <NotificationItem
                key={index}
                icon={notif.icon}
                title={notif.title}
                description={notif.description}
                time={notif.time}
                iconColor={notif.color}
              />
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 h-fit sticky top-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Notification preferences
          </h3>
          <div className="space-y-1">
            <PreferenceToggle label="SMS Alerts" />
            <PreferenceToggle label="Email Alerts" />
            <PreferenceToggle label="Push Notification" />
          </div>

          <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-6 mb-3">
            Priority Notification
          </h3>
          <div className="space-y-1">
            <PreferenceToggle label="Job Alerts" isPriority={true} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileNotifications;
