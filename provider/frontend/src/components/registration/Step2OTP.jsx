import React, { useState, useRef } from "react";
import { CheckCircle } from "lucide-react";

const Step2OTP = ({ nextStep, data }) => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const inputRefs = useRef([]);
  const MOCK_OTP = "1234"; // Mock OTP

  // Handle digit change and auto-focus
  const handleChange = (e, index) => {
    const value = e.target.value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    if (value && index < 3) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle backspace/delete
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 4) {
      setError("Please enter the complete 4-digit OTP.");
      return;
    }

    if (enteredOtp === MOCK_OTP) {
      // Phone is now verified, move to Step 3
      nextStep({ isPhoneVerified: true });
    } else {
      setError("Invalid OTP. Please try again.");
    }
  };
  
  const handleResendOTP = () => {
    setError("");
    // In a real application, an API call would be made here to resend the OTP
    alert(`New Mock OTP sent to +91 ${data.phoneNumber}. (Use '1234')`);
  };


  return (
    <div className="p-4 rounded-xl">
      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-6 text-center">
        Step 2: Verify Phone Number
      </h2>
      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
        Enter the OTP sent to: +91 {data.phoneNumber || "XXXXXXXXXX"}
      </p>

      <form onSubmit={handleVerifyOTP} className="space-y-6">
        <div className="flex justify-center space-x-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-12 h-12 text-2xl text-center border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          ))}
        </div>

        {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
        
        <p className="text-center text-sm text-blue-500 dark:text-blue-400 cursor-pointer pt-2"
           onClick={handleResendOTP}>
           Didn't receive code? Resend OTP
        </p>

        <button
          type="submit"
          className="w-full flex justify-center items-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 mt-6"
        >
          <CheckCircle className="w-4 h-4 mr-2" /> Verify & Continue
        </button>
      </form>
    </div>
  );
};

export default Step2OTP;