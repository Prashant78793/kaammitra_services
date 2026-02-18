import React, { useState } from "react";
import { Briefcase } from "lucide-react";

const Step3ServiceDetails = ({ nextStep, data }) => {
  const [serviceCategory, setServiceCategory] = useState(data.serviceCategory || "");
  const [subService, setSubService] = useState(data.subService || "");
  const [experience, setExperience] = useState(data.experience || "");
  const [serviceArea, setServiceArea] = useState(data.serviceArea || "");
  const [pinCode, setPinCode] = useState(data.pinCode || "");
  const [languageSpoken, setLanguageSpoken] = useState(data.languageSpoken || "");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!serviceCategory || !subService || !experience || !serviceArea || !pinCode || !languageSpoken) {
      setError("All fields are mandatory. Please fill in all details.");
      return;
    }

    if (!/^\d+$/.test(pinCode) || pinCode.length !== 6) {
        setError("Please enter a valid 6-digit PIN Code.");
        return;
    }
    
    nextStep({
      serviceCategory,
      subService,
      experience,
      serviceArea,
      pinCode,
      languageSpoken,
    });
  };

  return (
    <div className="p-4 rounded-xl">
      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-6 text-center">
        Step 3: Service Details
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text" value={serviceCategory} onChange={(e) => setServiceCategory(e.target.value)}
            placeholder="Service Category (e.g., Maid)" required
            className="col-span-2 px-3 py-2 border rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
          />
          <input
            type="text" value={subService} onChange={(e) => setSubService(e.target.value)}
            placeholder="Sub-Service (e.g., Cooking)" required
            className="px-3 py-2 border rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
          />
          <input
            type="number" value={experience} onChange={(e) => setExperience(e.target.value)}
            placeholder="Experience (Years)" min="0" required
            className="px-3 py-2 border rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
          />
          <input
            type="text" value={serviceArea} onChange={(e) => setServiceArea(e.target.value)}
            placeholder="Service City/Area" required
            className="px-3 py-2 border rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
          />
          <input
            type="text" inputMode="numeric" value={pinCode} onChange={(e) => setPinCode(e.target.value)}
            placeholder="PIN Code (6 digits)" maxLength="6" required
            className="px-3 py-2 border rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
          />
          <input
            type="text" value={languageSpoken} onChange={(e) => setLanguageSpoken(e.target.value)}
            placeholder="Language Spoken" required
            className="col-span-2 px-3 py-2 border rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

        <button
          type="submit"
          className="w-full py-2 px-4 border rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 mt-6"
        >
          NEXT
        </button>
      </form>
    </div>
  );
};

export default Step3ServiceDetails;