import React, { useState } from "react";

const Notification = () => {
  const [notifications, setNotifications] = useState({
    sms: true,
    email: true,
    push: true,
    priority: true,
    cancellations: true,
    bookings: true,
    signups: true,
  });

  const toggleNotification = (type) => {
    setNotifications((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-blue-700 mb-4">Notifications</h2>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 w-full md:w-2/3">
        <div className="space-y-4">
          {[
            { key: "sms", label: "SMS Alerts" },
            { key: "email", label: "Email Alerts" },
            { key: "push", label: "Push Notification" },
            { key: "priority", label: "Priority Notification" },
            { key: "cancellations", label: "Cancellations" },
            { key: "bookings", label: "New Bookings" },
            { key: "signups", label: "New Sign Ups" },
          ].map((item) => (
            <div key={item.key} className="flex justify-between items-center border-b dark:border-gray-700 pb-2">
              <span
                className={`${
                  item.key === "priority" ? "text-blue-600 font-semibold" : "text-gray-800 dark:text-gray-200"
                }`}
              >
                {item.label}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications[item.key]}
                  onChange={() => toggleNotification(item.key)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 
                peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] 
                after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 
                after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Notification;
