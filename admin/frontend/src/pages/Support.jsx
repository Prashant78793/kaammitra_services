import React, { useState } from "react";
import { FaEnvelope, FaPhone, FaQuestionCircle } from "react-icons/fa";

const Support = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert("Please fill all fields!");
      return;
    }
    alert("Your query has been submitted!");
    setFormData({ name: "", email: "", message: "" });
  };

  const faqs = [
    {
      question: "How do I book a service?",
      answer: "Go to Home > Services, select the service you want, and click 'Book Now'.",
    },
    {
      question: "How can I contact a service provider?",
      answer: "After booking a service, you can contact the provider via chat or call.",
    },
    {
      question: "What payment methods are accepted?",
      answer: "KaamMitra accepts UPI, credit/debit cards, and net banking.",
    },
  ];

  return (
    <div className="space-y-8 p-6 md:p-12">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">Support & Help</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Welcome to KaamMitra Support! Here you can find answers to common questions or submit your queries.
      </p>

      {/* FAQ Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h2 className="text-2xl font-semibold text-blue-600 mb-4 flex items-center gap-2">
          <FaQuestionCircle /> Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-3">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">{faq.question}</h3>
              <p className="text-gray-600 dark:text-gray-300 mt-1">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h2 className="text-2xl font-semibold text-blue-600 mb-4 flex items-center gap-2">
          <FaEnvelope /> Contact Us
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Your Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <textarea
            rows="4"
            placeholder="Your Message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          ></textarea>
          <button
            type="submit"
            className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700"
          >
            Submit
          </button>
        </form>
      </div>

      {/* Contact Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h2 className="text-2xl font-semibold text-blue-600 mb-4 flex items-center gap-2">
          <FaPhone /> Other Ways to Contact
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          Phone: <span className="font-semibold">+91 98765 43210</span>
        </p>
        <p className="text-gray-600 dark:text-gray-300">
          Email: <span className="font-semibold">support@kaammitra.com</span>
        </p>
      </div>
    </div>
  );
};

export default Support;
