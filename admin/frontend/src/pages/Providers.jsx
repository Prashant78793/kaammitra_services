import React, { useState, useEffect } from "react";
import { Search, Eye, X } from "lucide-react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000");

const Providers = () => {
  const [providers, setProviders] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [imageView, setImageView] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch providers
  const fetchProviders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/providers");
      const raw = Array.isArray(res.data) ? res.data : [];
      // normalize status to lowercase for reliable comparisons
      const normalized = raw.map((p) => ({ ...p, status: (p.status || "pending").toString().toLowerCase() }));
      setProviders(normalized);
    } catch (err) {
      console.error("Error fetching providers:", err);
    }
  };

  useEffect(() => {
    fetchProviders();
    const id = setInterval(fetchProviders, 8000);

    // Real-time updates
    socket.on("providerAdded", () => fetchProviders());
    socket.on("providerUpdated", () => fetchProviders());
    socket.on("providerSuspended", () => fetchProviders());

    return () => {
      clearInterval(id);
      socket.off("providerAdded");
      socket.off("providerUpdated");
      socket.off("providerSuspended");
    };
  }, []);

  const filtered = providers.filter((p) => {
    const text = search.trim().toLowerCase();
    const matchText =
      p.fullName?.toLowerCase().includes(text) ||
      p.phoneNumber?.toLowerCase().includes(text) ||
      p.serviceCategory?.toLowerCase().includes(text) ||
      p.email?.toLowerCase().includes(text);
    const matchesFilter = filter === "All" || p.status === filter.toString().toLowerCase();
    return matchText && matchesFilter;
  });

  const getStatusColor = (s) => {
    const status = (s || "").toString().toLowerCase();
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200";
      case "suspended":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-200";
    }
  };

  const displayStatus = (s) => {
    if (!s) return "Pending";
    const status = s.toString();
    if (status === "in-progress") return "In Progress";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Accept Provider
  const acceptProvider = async (id) => {
    try {
      setLoading(true);
      await axios.put(`http://localhost:5000/api/providers/${id}`, {
        status: "Active",
      });
      fetchProviders();
      setSelectedProvider(null);
      socket.emit("providerUpdated");
    } catch (err) {
      console.error("Error accepting provider:", err);
      alert("Failed to accept provider");
    } finally {
      setLoading(false);
    }
  };

  // Suspend Provider
  const suspendProvider = async (id) => {
    const confirmSuspend = window.confirm(
      "Are you sure you want to suspend this provider?"
    );
    if (!confirmSuspend) return;

    try {
      setLoading(true);
      await axios.put(`http://localhost:5000/api/providers/${id}`, {
        status: "Suspended",
      });
      fetchProviders();
      setSelectedProvider(null);
      socket.emit("providerSuspended");
    } catch (err) {
      console.error("Error suspending provider:", err);
      alert("Failed to suspend provider");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-blue-800 mb-4">Service Providers</h2>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded p-2 w-full max-w-md">
          <Search size={16} className="mr-2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name / phone / service"
            className="bg-transparent outline-none w-full dark:text-white"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {["All", "Active", "Pending", "Suspended"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                filter === s
                  ? "bg-blue-600 text-white"
                  : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-700 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Email</th>
              <th className="p-3">Status</th>
              <th className="p-3">Rating</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length > 0 ? (
              filtered.map((p) => (
                <tr
                  key={p._id}
                  className="border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <td className="p-3 font-medium">{p.fullName || "N/A"}</td>
                  <td className="p-3">{p.serviceCategory || "N/A"}</td>
                  <td className="p-3">{p.phoneNumber || "N/A"}</td>
                  <td className="p-3">{p.email || "N/A"}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        p.status
                      )}`}
                    >
                      {displayStatus(p.status)}
                    </span>
                  </td>
                  <td className="p-3">{p.rating ?? "0"}</td>
                  <td className="p-3">
                    <button
                      onClick={() => setSelectedProvider(p)}
                      className="px-3 py-1 rounded bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 flex items-center gap-2 text-sm font-medium"
                    >
                      <Eye size={14} /> View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="text-center p-6 text-gray-500 dark:text-gray-400"
                >
                  No providers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Provider Detail Popup */}
      {selectedProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">Provider Details</h3>
              <button
                onClick={() => setSelectedProvider(null)}
                className="p-2 hover:bg-blue-500 rounded-full transition"
              >
                <X size={24} className="text-white" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 p-6 space-y-4">
              
              {/* Provider ID */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Provider ID</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {selectedProvider.providerId || selectedProvider._id.slice(0, 8)}
                </p>
              </div>

              {/* Status Badge */}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Status</p>
                <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold inline-block ${getStatusColor(
                      selectedProvider.status
                    )}`}
                  >
                    {displayStatus(selectedProvider.status)}
                  </span>
              </div>

              {/* Basic Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Full Name</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedProvider.fullName || "—"}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedProvider.phoneNumber || "—"}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedProvider.email || "—"}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Rating</p>
                  <p className="text-lg font-semibold text-yellow-500">
                    ⭐ {selectedProvider.rating ?? "0"}
                  </p>
                </div>
              </div>

              {/* Service Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Service Category</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedProvider.serviceCategory || "—"}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Sub-Service</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedProvider.subService || "—"}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Experience</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedProvider.experience || "0"} yrs
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Service Area</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedProvider.serviceArea || "—"}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pin Code</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedProvider.pinCode || "—"}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Language</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedProvider.languageSpoken || "—"}
                  </p>
                </div>
              </div>

              {/* Bank Details */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-2">
                  Bank Details
                </p>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Account:</strong>{" "}
                    {selectedProvider.bankAccountNumber
                      ? `*****${selectedProvider.bankAccountNumber.slice(-4)}`
                      : "—"}
                  </p>
                  <p>
                    <strong>IFSC:</strong> {selectedProvider.ifscCode || "—"}
                  </p>
                  <p>
                    <strong>UPI:</strong> {selectedProvider.upiId || "—"}
                  </p>
                </div>
              </div>

              {/* Documents */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-3">
                  Verification Documents
                </p>
                <div className="space-y-2">
                  {[
                    { label: "Profile Photo", key: "profilePhoto" },
                    { label: "Govt ID", key: "governmentIDProof" },
                    { label: "Address Proof", key: "addressProof" },
                    { label: "Skill Cert", key: "skillCertificate" },
                  ].map((doc) => (
                    <p key={doc.key} className="flex items-center gap-2 text-sm">
                      <strong>{doc.label}:</strong>{" "}
                      {selectedProvider[doc.key] ? (
                        <>
                          <span className="text-gray-600 dark:text-gray-400">
                            {selectedProvider[doc.key]}
                          </span>
                          <button
                            onClick={() =>
                              setImageView(selectedProvider[doc.key])
                            }
                            className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                          >
                            View
                          </button>
                        </>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </p>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer Actions */}
            <div className="bg-gray-100 dark:bg-gray-800 p-4 flex gap-3 border-t dark:border-gray-700 flex-wrap">
              <button
                onClick={() => setSelectedProvider(null)}
                className="flex-1 px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg font-medium transition"
                disabled={loading}
              >
                Close
              </button>

              {selectedProvider.status === "pending" && (
                <button
                  onClick={() => acceptProvider(selectedProvider._id)}
                  className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Accept"}
                </button>
              )}

              {selectedProvider.status !== "suspended" && (
                <button
                  onClick={() => suspendProvider(selectedProvider._id)}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Suspend"}
                </button>
              )}

              {selectedProvider.status === "suspended" && (
                <button
                  onClick={() => acceptProvider(selectedProvider._id)}
                  className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Reactivate"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Full Image Popup */}
      {imageView && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={() => setImageView("")}
        >
          <div className="relative max-w-4xl">
            <button
              onClick={() => setImageView("")}
              className="absolute -top-10 right-0 text-white text-3xl hover:text-red-500"
            >
              ✕
            </button>
            <img
              src={`http://localhost:5000/uploads/${imageView}`}
              alt="Document"
              className="max-h-[80vh] max-w-full rounded shadow-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Providers;
