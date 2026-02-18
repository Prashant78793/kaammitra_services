import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft } from "react-icons/fa";
import Step1Personal from "../components/registration/Step1Personal";
import Step2OTP from "../components/registration/Step2OTP";
import Step3ServiceDetails from "../components/registration/Step3ServiceDetails";
import Step4Identity from "../components/registration/Step4Identity";
import Step5Payment from "../components/registration/Step5Payment";
import StepIndicator from "../components/registration/StepIndicator";

// build normalized API_BASE like admin frontend does (handles VITE_API_BASE variations)
const RAW_API_BASE = import.meta.env.VITE_API_BASE;
const API_BASE = (() => {
  if (!RAW_API_BASE) return "http://localhost:5000/api";
  if (/^https?:\/\//i.test(RAW_API_BASE)) return RAW_API_BASE.replace(/\/$/, "");
  if (RAW_API_BASE.startsWith("/")) return window.location.origin + RAW_API_BASE.replace(/\/$/, "");
  if (RAW_API_BASE.startsWith(":")) {
    // e.g. ":5000/api" -> use same host with given port
    return window.location.protocol + "//" + window.location.hostname + RAW_API_BASE;
  }
  return RAW_API_BASE;
})();

const containsFile = (obj) => {
  if (!obj) return false;
  if (typeof File !== "undefined" && obj instanceof File) return true;
  if (Array.isArray(obj)) return obj.some(containsFile);
  if (typeof obj === "object") return Object.values(obj).some(containsFile);
  return false;
};

const buildFormData = (finalData) => {
  const fd = new FormData();
  Object.entries(finalData).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (typeof File !== "undefined" && v instanceof File) {
      fd.append(k, v);
    } else if (typeof v === "object" && !(v instanceof File)) {
      fd.append(k, JSON.stringify(v));
    } else {
      fd.append(k, v);
    }
  });
  return fd;
};

const Register = ({ setIsAuthenticated }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const totalSteps = 5;

  const nextStep = (data) => {
    setFormData((prevData) => ({ ...prevData, ...data }));
    if (currentStep < totalSteps) setCurrentStep((s) => s + 1);
  };

  const handleSubmit = async (data) => {
    const finalData = { ...formData, ...data };

    // client-side sanity check – make sure we are sending the two mandatory fields
    if (!finalData.fullName || !finalData.phoneNumber) {
      console.error("Cannot submit registration, missing required fields", finalData);
      alert("Internal error: registration data incomplete. Please restart the form.");
      return;
    }

    try {
      setLoading(true);
      let res;

      const url = `${API_BASE.replace(/\/+$/, "")}/providers/add`;
      console.log("Submitting to", url, "finalData=", finalData);
      if (containsFile(finalData)) {
        const fd = buildFormData(finalData);
        res = await axios.post(url, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await axios.post(url, finalData);
      }

      const created = res.data;
      console.log("Provider created successfully:", created);

      // Persist complete provider data for app and profile
      localStorage.setItem("providerData", JSON.stringify(created));
      localStorage.setItem("providerId", created._id || created.id || "");
      localStorage.setItem("providerPhone", created.phone || "");

      setIsAuthenticated(true);
      navigate("/profile");
    } catch (err) {
      console.error("Registration error full:", err);
      console.error("Registration error data:", err.response?.data);
      const msg = err.response?.data?.message || "Registration failed. Please try again.";
      // use toast if available (add simple temporary implementation)
      if (typeof window !== "undefined") {
        const t = document.createElement("div");
        t.textContent = msg;
        t.style.position = "fixed";
        t.style.top = "1rem";
        t.style.right = "1rem";
        t.style.background = "#e74c3c";
        t.style.color = "white";
        t.style.padding = "0.5rem 1rem";
        t.style.borderRadius = "0.25rem";
        document.body.appendChild(t);
        setTimeout(() => document.body.removeChild(t), 3000);
      } else {
        alert(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Personal nextStep={nextStep} data={formData} />;
      case 2:
        return <Step2OTP nextStep={nextStep} data={formData} />;
      case 3:
        return <Step3ServiceDetails nextStep={nextStep} data={formData} />;
      case 4:
        return <Step4Identity nextStep={nextStep} data={formData} />;
      case 5:
        return (
          <Step5Payment
            handleSubmit={handleSubmit}
            data={formData}
            loading={loading}
          />
        );
      default:
        return <Navigate to="/" replace />;
    }
  };

  return (
    <div className="flex justify-center items-center py-16 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-8 w-full max-w-lg mx-4 relative">
        {/* Back Button */}
        <button
          className="absolute left-4 top-4 text-blue-700 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
          onClick={() => {
            if (currentStep > 1) {
              setCurrentStep((s) => s - 1);
            } else {
              navigate(-1);
            }
          }}
          aria-label="Go Back"
        >
          <FaArrowLeft size={24} />
        </button>

        <h1 className="text-2xl font-bold mb-2 text-center text-blue-700 dark:text-blue-400">
          Provider Registration
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 text-sm mb-6">
          Complete all 5 steps to register
        </p>

        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

        <div className="mt-8">{renderStep()}</div>

        {/* Step Info */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
            Step {currentStep} of {totalSteps}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;