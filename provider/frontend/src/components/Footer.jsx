import React from 'react';
import { FaInstagram, FaFacebook } from 'react-icons/fa'; // Icons for social media

const Footer = () => {
  return (
    <footer className="bg-[#2a458b] text-white">
      {/* Main footer content section */}
      <div className="container mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Kaammitra Info Section */}
        <div className="flex flex-col items-start space-y-4">
          <h2 className="text-2xl font-bold">Kaammitra</h2>
          <p className="text-sm leading-relaxed">
            Book trusted professionals online for cleaning, repairs, beauty care, and more—delivered right to your doorstep, on time, every time.
          </p>
          <div className="flex items-center space-x-2 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.583 1.844 1.397l.627 2.651c.148.594.14 1.22-.167 1.76l-.757 1.258a1.868 1.868 0 0 0 .285 2.222l2.924 2.924a1.868 1.868 0 0 0 2.222.285l1.259-.757a1.868 1.868 0 0 1 1.76-.167l2.651.627c.814.234 1.397.984 1.397 1.844V19.5a3 3 0 0 1-3 3h-2.25C8.91 22.5 4.5 18.09 4.5 12.75V8.25a3 3 0 0 1 3-3h2.25a.75.75 0 0 0 0-1.5H7.5a4.5 4.5 0 0 0-4.5 4.5v4.5A9.75 9.75 0 0 0 12.75 22.5h2.25a4.5 4.5 0 0 0 4.5-4.5V19.5a1.5 1.5 0 0 0-1.5-1.5h-2.25A11.25 11.25 0 0 1 3 12.75V8.25Z" clipRule="evenodd" />
            </svg>
            <span>+91 XXXXX-XXXXX</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M1.5 8.67v8.586a1.5 1.5 0 0 0 .366.963l6.517 6.517a1.5 1.5 0 0 0 1.06.434H18c2.485 0 4.5-2.015 4.5-4.5v-2.25A.75.75 0 0 0 21.75 12V6.75a3.75 3.75 0 0 0-3.75-3.75H8.25a3.75 3.75 0 0 0-3.626 3H1.5Z" />
              <path d="M15 15.75a3 3 0 1 0-6 0 3 3 0 0 0 6 0Z" />
              <path d="M12.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM15 15.75a3 3 0 1 0-6 0 3 3 0 0 0 6 0Z" />
            </svg>
            <span>Kaammitra@gmail.com</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M11.54 22.351A8.25 8.25 0 0 0 21 12.75a9.75 9.75 0 0 0-18 0 .75.75 0 0 1-1.5 0c0-5.186 3.942-9.444 9-9.957v.924c0 .217.18.398.397.398h.001a.75.75 0 0 0 .397-.398v-.924A10.511 10.511 0 0 1 12 2.25c5.392 0 9.803 4.102 10.45 9.351a.75.75 0 0 1-1.5-.116 8.25 8.25 0 0 0-16.5 0v.116Zm-.93 2.158a3 3 0 0 1-5.717-.523.75.75 0 0 1 1.036-.318 1.5 1.5 0 0 0 2.894.269 1.5 1.5 0 0 0 1.787-.269 3 3 0 0 1 1.002.576.75.75 0 0 1-1.036.318Zm.036-15.009a.75.75 0 0 1 1.5 0v4.5a.75.75 0 0 1-1.5 0v-4.5Z" clipRule="evenodd" />
            </svg>
            <span>address, India</span>
          </div>
        </div>
        
        {/* Navigation Section */}
        <div className="flex flex-col items-start space-y-4">
          <h3 className="text-2xl font-bold">Navigate</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:underline">Home</a></li>
            <li><a href="#" className="hover:underline">Services</a></li>
            <li><a href="#" className="hover:underline">My bookings</a></li>
            <li><a href="#" className="hover:underline">Find services</a></li>
          </ul>
        </div>
        
        {/* Services Section */}
        <div className="flex flex-col items-start space-y-4">
          <h3 className="text-2xl font-bold">Services</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:underline">Home Services</a></li>
            <li><a href="#" className="hover:underline">Repair services</a></li>
            <li><a href="#" className="hover:underline">Proffesional Works</a></li>
            <li><a href="#" className="hover:underline">Digital Works</a></li>
            <li><a href="#" className="hover:underline">Emergency services</a></li>
            <li><a href="#" className="hover:underline">Per day Services</a></li>
            <li><a href="#" className="hover:underline">Medical Helpers</a></li>
          </ul>
        </div>
        
        {/* Legal Section */}
        <div className="flex flex-col items-start space-y-4">
          <h3 className="text-2xl font-bold">Legal</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:underline">About us</a></li>
            <li><a href="#" className="hover:underline">Contact us</a></li>
            <li><a href="#" className="hover:underline">Privacy policy</a></li>
            <li><a href="#" className="hover:underline">Terms & Conditions</a></li>
          </ul>
        </div>
      </div>
      
      {/* Social Media Section */}
      <div className="container mx-auto px-4 py-8">
        <h3 className="text-2xl font-bold mb-4">Connect with us</h3>
        <div className="flex items-center space-x-4">
          <a href="#" className="hover:scale-110 transform transition-transform duration-200">
            <FaInstagram className="text-4xl rounded-lg" style={{ color: '#E1306C' }} />
          </a>
          <a href="#" className="hover:scale-110 transform transition-transform duration-200">
            <FaFacebook className="text-4xl" style={{ color: '#4267B2' }} />
          </a>
        </div>
      </div>
      
      {/* Copyright Section */}
      <div className="bg-[#1f3775] py-4 text-center">
        <p className="text-sm">© 2025 kaammitra. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;