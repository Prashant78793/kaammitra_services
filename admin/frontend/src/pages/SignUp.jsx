import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", mobile: "" });
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputs = useRef([]);

  const handleOtpChange = (e, index) => {
    const value = e.target.value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      inputs.current[index + 1].focus();
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Signup Info:\nName: ${form.name}\nMobile: ${form.mobile}\nOTP: ${otp.join("")}`);
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="relative bg-white dark:bg-gray-800 p-6 rounded shadow-md w-80"
      >
        {/* Back Arrow */}
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="absolute top-4 left-4 text-gray-700 dark:text-gray-300 hover:text-blue-600 transition"
        >
          <FaArrowLeft size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800 dark:text-gray-200">
          Signup
        </h2>

        {/* Name Input */}
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          className="w-full mb-2 p-2 border rounded"
          required
        />

        {/* Mobile Input */}
        <input
          type="tel"
          name="mobile"
          placeholder="Mobile Number"
          value={form.mobile}
          onChange={handleChange}
          className="w-full mb-4 p-2 border rounded"
          required
        />

        {/* OTP Inputs */}
        <div className="flex justify-between mb-4">
          {otp.map((data, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              value={data}
              onChange={(e) => handleOtpChange(e, index)}
              ref={(el) => (inputs.current[index] = el)}
              className="w-12 h-12 text-center border rounded"
              required
            />
          ))}
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        >
          Signup
        </button>

        <p className="text-sm text-gray-500 mt-4 text-center">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-blue-600 cursor-pointer"
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
};

export default Signup;
