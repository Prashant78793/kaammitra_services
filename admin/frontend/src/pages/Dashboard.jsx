// src/pages/Dashboard.jsx
import React, { useState, useContext, useEffect } from "react";
import { Users, Briefcase, DollarSign, CheckCircle } from "lucide-react";
import axios from "axios";
import { JobContext } from "../context/jobContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000");

const Dashboard = () => {
  const { addJob, jobs, fetchJobs } = useContext(JobContext);
  const [showPopup, setShowPopup] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    subService: "",
    description: "",
    requirement: "",
    imageUrl: "",
    price: "",
    // changed: multiple cities
    cities: [],
    cityInput: "",
  });
  const [providerCount, setProviderCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);

  const towns = [
    "New Delhi","Mumbai","Bengaluru","Kolkata","Chennai","Hyderabad","Pune",
    "Ahmedabad","Jaipur","Lucknow","Kanpur","Nagpur","Indore","Thane","Bhopal",
    "Visakhapatnam","Pimpri-Chinchwad","Patna","Vadodara","Ghaziabad","Ludhiana",
    "Agra","Nashik","Faridabad","Meerut","Rajkot","Kalyan-Dombivli","Vasai-Virar",
    "Varanasi","Srinagar","Dhanbad","Jodhpur","Amritsar","Raipur","Allahabad",
    "Ranchi","Howrah","Coimbatore","Jabalpur","Gwalior","Vijayawada","Madurai",
    "Kota","Bareilly","Noida","Gurugram","Moradabad","Aligarh","Tiruchirappalli"
  ];

  // Fetch provider/customer counts
  useEffect(() => {
    const fetchProviderCount = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/providers");
        setProviderCount(res.data.length);
      } catch (err) {
        console.error("Error fetching provider count:", err);
      }
    };
    const fetchCustomerCount = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/customers");
        setCustomerCount(res.data.length);
      } catch (err) {
        console.error("Error fetching customer count:", err);
      }
    };

    const fetchAll = async () => {
      await fetchProviderCount();
      await fetchCustomerCount();
    };

    fetchAll();
    const interval = setInterval(fetchAll, 5000);

    socket.on("customerCount", ({ count }) => {
      if (typeof count === "number") setCustomerCount(count);
    });
    socket.on("providerCount", ({ count }) => {
      if (typeof count === "number") setProviderCount(count);
    });

    return () => {
      clearInterval(interval);
      socket.off("customerCount");
      socket.off("providerCount");
    };
  }, []);

  // Keep JobContext jobs fresh in real-time
  useEffect(() => {
    const onAdd = () => {
      console.log("Job added event received");
      fetchJobs();
    };
    const onUpdate = () => {
      console.log("Job updated event received");
      fetchJobs();
    };

    socket.on("jobAdded", onAdd);
    socket.on("jobUpdated", onUpdate);
    socket.on("jobDeleted", onUpdate);

    return () => {
      socket.off("jobAdded", onAdd);
      socket.off("jobUpdated", onUpdate);
      socket.off("jobDeleted", onUpdate);
    };
  }, [fetchJobs]);

  // Real-time revenue data simulation
  const [revenueData, setRevenueData] = useState(() => {
    const today = new Date();
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      return {
        date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        revenue: Math.floor(50000 + Math.random() * 50000),
      };
    });
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setRevenueData((prev) => {
        const lastRevenue = prev[prev.length - 1].revenue;
        const newRevenue = lastRevenue + Math.floor(Math.random() * 20000 - 10000);
        const today = new Date();
        const newEntry = {
          date: today.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
          revenue: Math.max(newRevenue, 0),
        };
        return [...prev.slice(1), newEntry];
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAddCity = (city) => {
    setFormData((prev) => {
      const next = new Set([...(prev.cities || []), String(city).trim()]);
      return { ...prev, cities: Array.from(next), cityInput: "" };
    });
  };

  const handleRemoveCity = (city) => {
    setFormData((prev) => ({ ...prev, cities: (prev.cities || []).filter((c) => c !== city) }));
  };
  
  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { category, subService, description, requirement, imageUrl, price, cities, cityInput } = formData;

    if (!category || !subService || !description || !requirement) {
      alert("Please fill required fields!");
      return;
    }
    if (!price || isNaN(Number(price))) {
      alert("Please enter a valid price");
      return;
    }

    const data = new FormData();
    data.append("category", category);
    data.append("subService", subService);
    data.append("description", description);
    data.append("requirement", requirement);
    if (imageUrl) data.append("imageUrl", imageUrl);
    data.append("price", price);

    // append cities: send as JSON string (backend will parse)
    const cityList = (cities && cities.length) ? cities : (cityInput ? [cityInput] : []);
    data.append("cities", JSON.stringify(cityList));
    // for backward compatibility, also append single city
    data.append("city", cityList[0] || "");

    try {
      console.log("Adding service...");
      await addJob(data);
      setShowPopup(false);
      setFormData({
        category: "",
        subService: "",
        description: "",
        requirement: "",
        imageUrl: "",
        price: "",
        cities: [],
        cityInput: "",
      });
      await fetchJobs();
      console.log("Service added successfully");
    } catch (err) {
      console.error("Error adding service:", err);
      alert("Failed to add service!");
    }
  };

  const safeJobs = Array.isArray(jobs) ? jobs : [];
  
  // ✅ Real job count - total jobs in database
  const totalJobsCount = safeJobs.length;

  // Pagination state and logic
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;
  const totalPages = Math.max(1, Math.ceil(totalJobsCount / PAGE_SIZE));

  // Ensure current page is valid when jobs change
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const paginatedJobs = safeJobs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = [
    { title: "Total Customers", value: customerCount, icon: Users },
    { title: "Total Providers", value: providerCount, icon: CheckCircle },
    { title: "Total Jobs", value: totalJobsCount, icon: Briefcase },
    {
      title: "Today's Revenue",
      value: `Rs ${revenueData[revenueData.length - 1].revenue.toLocaleString()}`,
      icon: DollarSign,
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map(({ title, value, icon: Icon }) => (
          <div
            key={title}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow flex items-center gap-4"
          >
            <Icon className="text-blue-600" size={30} />
            <div>
              <p className="text-gray-500 text-sm">{title}</p>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {value}
              </h2>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-2 text-blue-700">Real-Time Revenue Growth</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(v) => `Rs ${v.toLocaleString()}`} labelFormatter={(label) => `Date: ${label}`} />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
        <h2 className="font-semibold mb-2">Quick Actions</h2>
        <button onClick={() => setShowPopup(true)} className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 w-full">
          Add Service
        </button>
      </div>

      {/* Services List */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-blue-700">All Services ({totalJobsCount})</h2>
          <div className="text-sm text-gray-600">Page {page} of {totalPages}</div>
        </div>

        {safeJobs.length === 0 ? (
          <p className="text-gray-500">No services added yet.</p>
        ) : (
          <>
            <div className="grid md:grid-cols-3 gap-4">
              {paginatedJobs.map((service) => (
                <div key={service._id} className="border rounded-lg p-3 dark:border-gray-700 shadow">
                  {service.imageUrl && (
                    <img src={service.imageUrl} alt={service.category} className="w-full h-40 object-cover rounded-md mb-2" />
                  )}
                  <h3 className="font-semibold text-lg">{service.category || "Service"} — Rs {service.price?.toLocaleString() || "—"}</h3>
                  <p className="text-sm text-gray-500">Subcategory: {service.subService || "—"}</p>
                  <p className="text-gray-700 dark:text-gray-300 mt-2 text-sm">{service.description || ""}</p>
                  <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm"><strong>City:</strong> {service.cities && service.cities.length ? service.cities.join(", ") : (service.city || "—")}</p>
                  <p className="text-gray-500 text-xs mt-1">{service.status} • {service.date} {service.time ? `• ${service.time}` : ""}</p>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 disabled:opacity-50"
              >
                Prev
              </button>

              {/* page numbers */}
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-1 rounded ${page === pageNum ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-700"}`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      {/* Popup Form */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-[600px] relative overflow-y-auto max-h-screen">
            <h2 className="text-2xl font-bold text-blue-700 mb-4 text-center">Add New Service</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Service Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full border rounded-md p-2 dark:bg-gray-700 dark:text-white"
                required
              />

              <input
                type="text"
                placeholder="Sub-Service"
                value={formData.subService}
                onChange={(e) => setFormData({ ...formData, subService: e.target.value })}
                className="w-full border rounded-md p-2 dark:bg-gray-700 dark:text-white"
                required
              />

              <textarea
                rows="3"
                placeholder="Service Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border rounded-md p-2 dark:bg-gray-700 dark:text-white"
                required
              />

              <textarea
                rows="2"
                placeholder="Service Requirement"
                value={formData.requirement}
                onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
                className="w-full border rounded-md p-2 dark:bg-gray-700 dark:text-white"
                required
              />

              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Image URL (e.g., https://...)"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-2/3 border rounded-md p-2 dark:bg-gray-700 dark:text-white"
                />
                <input
                  type="number"
                  placeholder="Price (Rs)"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-1/3 border rounded-md p-2 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="flex gap-2">
                    <input
                      value={formData.cityInput}
                      onChange={(e) => setFormData({ ...formData, cityInput: e.target.value })}
                      placeholder="Type city and press Add"
                      className="w-full border rounded-md p-2 dark:bg-gray-700 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (formData.cityInput?.trim()) handleAddCity(formData.cityInput.trim());
                      }}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md"
                    >
                      Add
                    </button>
                  </div>

                  <datalist id="towns">
                    {towns.map((t) => <option key={t} value={t} />)}
                  </datalist>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {(formData.cities || []).map((c) => (
                      <span key={c} className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full text-sm flex items-center gap-2">
                        <span>{c}</span>
                        <button type="button" onClick={() => handleRemoveCity(c)} className="text-red-500">✕</button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                  {towns.slice(0, 6).map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => handleAddCity(t)}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-500"
                    >
                      + {t}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="bg-blue-600 text-white py-2 w-full rounded-md hover:bg-blue-700">
                Add Service
              </button>
            </form>
            <button
              type="button"
              onClick={() => setShowPopup(false)}
              className="absolute top-2 right-3 text-gray-500 hover:text-red-600 text-xl"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
