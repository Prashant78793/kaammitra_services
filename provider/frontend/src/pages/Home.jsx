import React from "react";
import SearchCard from "../components/SearchCard";

const Home = ({ homeServices, isAuthenticated, setIsAuthenticated }) => (
  <div className="bg-gray-50 dark:bg-gray-800">
    {/* Search and Hero Sections */}
    <SearchCard isAuthenticated={isAuthenticated} />
    <div className="container mx-auto px-6">
      {/* Why Choose KaamMitra Maids Section */}
      <div className="bg-indigo-600 text-white shadow-md p-8 mt-12">
        <h2 className="text-2xl font-bold text-center mb-6">
          Why Choose KaamMitra Maids?
        </h2>
        <ul className="list-disc pl-6 space-y-2 text-lg">
          <li>
            <strong>Verified & Trusted Professionals –</strong> All our maids go
            through strict background checks for your safety and peace of mind.
          </li>
          <li>
            <strong>Skilled & Trained Staff –</strong> From dusting and mopping
            to kitchen and bathroom cleaning, our maids are trained in modern
            cleaning techniques.
          </li>
          <li>
            <strong>Flexible Plans –</strong> Hire by the hour, day, or
            month—tailored to your schedule.
          </li>
          <li>
            <strong>Eco-Friendly Products –</strong> We use safe and effective
            cleaning supplies to protect your home and family.
          </li>
          <li>
            <strong>100% Satisfaction Guarantee –</strong> Not happy with the
            service? We’ll make it right.
          </li>
        </ul>
      </div>

      {/* Services We Offer Section */}
      <div className="mt-16 text-center">
        <h2 className="text-3xl font-bold text-blue-700 mb-8">
          Services We Offer
        </h2>

        {/* Services Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white dark:bg-gray-700 shadow-lg overflow-hidden">
            <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
              <img
                src="repairing1.png"
                alt="Regular House Cleaning"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Regular House Cleaning
              </h3>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white dark:bg-gray-700 shadow-lg overflow-hidden">
            <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
              <img
                src="https://i.ibb.co/pJ1hDyp/cleaning2.jpg"
                alt="Kitchen & Bathroom Deep Cleaning"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Kitchen & Bathroom Deep Cleaning
              </h3>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white dark:bg-gray-700 shadow-lg overflow-hidden">
            <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
              <img
                src="https://i.ibb.co/sbBqkxd/cleaning3.jpg"
                alt="Laundry & Ironing Services"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Laundry & Ironing Services
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="mt-16 text-center">
        <h2 className="text-3xl font-bold text-blue-700 mb-10">How It Works</h2>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-8">
          <div className="bg-indigo-600 text-white rounded-full p-8 w-60 h-60 flex flex-col justify-center items-center shadow-lg">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3064/3064176.png"
              alt="Book Online"
              className="w-14 mb-4"
            />
            <h3 className="text-lg font-semibold">Book Online</h3>
          </div>

          <div className="bg-indigo-600 text-white rounded-full p-8 w-60 h-60 flex flex-col justify-center items-center shadow-lg">
            <img
              src="https://cdn-icons-png.flaticon.com/512/942/942833.png"
              alt="Assign a Professional"
              className="w-14 mb-4"
            />
            <h3 className="text-lg font-semibold">We Assign a Professional</h3>
          </div>

          <div className="bg-indigo-600 text-white rounded-full p-8 w-60 h-60 flex flex-col justify-center items-center shadow-lg">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3048/3048122.png"
              alt="Relax and Enjoy"
              className="w-14 mb-4"
            />
            <h3 className="text-lg font-semibold">Relax & Enjoy</h3>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto py-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-700 dark:text-blue-400">
          Popular Home Services
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {homeServices.map((service) => (
            <div
              key={service.name}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 flex flex-col items-center"
            >
              <img
                src={service.img}
                alt={service.name}
                className="w-32 h-32 object-cover rounded-full mb-4"
              />
              <span className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                {service.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default Home;
