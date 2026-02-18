import React, { useState } from "react";

const Settings = () => {
  // Tax & Commission state
  const [gst, setGst] = useState("xxxxx");
  const [serviceTax, setServiceTax] = useState("xxxxx");
  const [commission, setCommission] = useState("xxxxx");

  // Language & Timezone state
  const [language, setLanguage] = useState("English");
  const [timezone, setTimezone] = useState("GMT+5:30");

  // Save handler
  const handleSave = () => {
    // Basic validation
    if (!gst || !serviceTax || !commission) {
      alert("Please fill all Tax & Commission fields!");
      return;
    }

    // Here you would normally send data to backend
    console.log("Saved Settings:", { gst, serviceTax, commission, language, timezone });
    alert("Settings saved successfully!");
  };

  return (
    <div className="p-6 w-full">
      {/* Header */}
   
      {/* Tax & Commission Section */}
      <div className="mb-8 bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Tax & Commission</h2>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <label className="mb-1">GST</label>
            <input
              type="text"
              value={gst}
              onChange={(e) => setGst(e.target.value)}
              className="p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1">Service Tax</label>
            <input
              type="text"
              value={serviceTax}
              onChange={(e) => setServiceTax(e.target.value)}
              className="p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1">Commission</label>
            <input
              type="text"
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
              className="p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            />
          </div>
        </div>
      </div>

      {/* Language & Localization Section */}
      <div className="mb-8 bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Language & Localization</h2>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <label className="mb-1">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            >
              <option>English</option>
              <option>Hindi</option>
              <option>Spanish</option>
              <option>French</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="mb-1">Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            >
              <option>GMT+5:30</option>
              <option>GMT+0:00</option>
              <option>GMT+1:00</option>
              <option>GMT-5:00</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
      >
        Save Settings
      </button>
    </div>
  );
};

export default Settings;
