import React, { useState, useEffect } from "react";
import { Search, Eye, X } from "lucide-react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const Users = () => {
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch customers from backend
  const fetchCustomers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/customers");
      setCustomers(res.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  useEffect(() => {
    fetchCustomers();

    // Listen for socket events (real-time)
    socket.on("customerAdded", (newCustomer) => {
      setCustomers((prev) => [newCustomer, ...prev]);
    });

    socket.on("customerUpdated", (updated) => {
      setCustomers((prev) =>
        prev.map((c) => (c._id === updated._id ? updated : c))
      );
    });

    socket.on("customerDeleted", (deleted) => {
      const id = deleted?.id || deleted;
      setCustomers((prev) => prev.filter((c) => c._id !== id));
    });

    return () => {
      socket.off("customerAdded");
      socket.off("customerUpdated");
      socket.off("customerDeleted");
    };
  }, []);

  const filters = ["All", "Active", "Suspended", "New"];

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = Object.values(customer)
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesFilter =
      filter === "All" || customer.status?.toLowerCase() === filter.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  const stats = [
    { title: "Total Customers", value: customers.length },
    {
      title: "Active Customers",
      value: customers.filter((c) => c.status === "Active").length,
    },
    {
      title: "Suspended Customers",
      value: customers.filter((c) => c.status === "Suspended").length,
    },
    {
      title: "New Signups",
      value: customers.filter((c) => {
        const createdDate = new Date(c.createdAt);
        const today = new Date();
        const diff = (today - createdDate) / (1000 * 60 * 60 * 24);
        return diff < 7;
      }).length,
    },
  ];

  const buildImageUrl = (img) => {
    if (!img) return "https://via.placeholder.com/40";
    return img.startsWith("http") ? img : `http://localhost:5000${img.startsWith("/") ? "" : "/"}${img}`;
  };

  const handleViewDetails = (customer) => {
    setSelectedCustomer(customer);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedCustomer(null);
  };

  return (
    <div className="flex flex-col p-6 bg-gray-50 min-h-screen dark:bg-gray-900 dark:text-white">
      {/* Search Bar */}
      <div className="flex items-center mb-4 bg-white dark:bg-gray-800 rounded-lg p-2 shadow-sm">
        <Search className="w-5 h-5 text-gray-400 ml-2" />
        <input
          type="text"
          placeholder="Search by name, phone, or date..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 bg-transparent outline-none ml-2 dark:text-white"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-3 mb-6">
        {filters.map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === item
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 text-center"
          >
            <h3 className="text-sm text-gray-500 dark:text-gray-400">
              {stat.title}
            </h3>
            <p className="text-xl font-semibold mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-sm">
            <tr>
              <th className="px-4 py-3">Profile</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Registered</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <tr
                  key={customer._id}
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <td className="px-4 py-3">
                    <img
                      src={buildImageUrl(customer.image)}
                      alt={customer.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium">{customer.name}</td>
                  <td className="px-4 py-3">{customer.phone}</td>
                  <td className="px-4 py-3">{customer.email || "N/A"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        customer.status === "Active"
                          ? "bg-green-500 text-white"
                          : customer.status === "Suspended"
                          ? "bg-red-500 text-white"
                          : "bg-yellow-500 text-white"
                      }`}
                    >
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleViewDetails(customer)}
                      className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm"
                    >
                      <Eye size={16} /> View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="text-center py-6 text-gray-500 dark:text-gray-400"
                >
                  No customers found matching "{searchTerm}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Customer Details Modal - COMPACT SIZE */}
      {modalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto relative">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-600 transition z-10"
            >
              <X size={20} />
            </button>

            {/* Modal Header - Compact */}
            <div className="bg-blue-600 text-white p-4 flex items-center gap-3">
              <img
                src={buildImageUrl(selectedCustomer.image)}
                alt={selectedCustomer.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-white"
              />
              <div>
                <h2 className="text-lg font-bold">{selectedCustomer.name}</h2>
                <p className="text-sm text-blue-100">{selectedCustomer.phone}</p>
              </div>
            </div>

            {/* Modal Body - Compact */}
            <div className="p-4 space-y-3">
              {/* Personal Information */}
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">
                  Personal Info
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Email:</span>
                    <span className="font-medium dark:text-white">{selectedCustomer.email || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <span>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          selectedCustomer.status === "Active"
                            ? "bg-green-500 text-white"
                            : selectedCustomer.status === "Suspended"
                            ? "bg-red-500 text-white"
                            : "bg-yellow-500 text-white"
                        }`}
                      >
                        {selectedCustomer.status}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">
                  Address
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Street:</span>
                    <span className="font-medium dark:text-white text-right max-w-xs">{selectedCustomer.address || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">City:</span>
                    <span className="font-medium dark:text-white">{selectedCustomer.city || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">State:</span>
                    <span className="font-medium dark:text-white">{selectedCustomer.state || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">
                  Account
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Registered:</span>
                    <span className="font-medium dark:text-white">
                      {new Date(selectedCustomer.createdAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Actions:</span>
                    <span className="font-medium dark:text-white">{selectedCustomer.actions || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-100 dark:bg-gray-700 p-3 flex justify-end">
              <button
                onClick={closeModal}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;