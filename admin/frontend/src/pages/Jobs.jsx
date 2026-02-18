// src/pages/Jobs.jsx
import React, { useState, useContext, useEffect } from "react";
import { JobContext } from "../context/jobContext";
import { X } from "lucide-react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000");

const Jobs = () => {
  const { jobs, fetchJobs } = useContext(JobContext);
  // Resolve API base robustly: allow VITE_API_BASE to be absolute or relative
  const RAW_API_BASE = import.meta.env.VITE_API_BASE;
  const API_BASE = (() => {
    if (!RAW_API_BASE) return "http://localhost:5000/api";
    if (/^https?:\/\//i.test(RAW_API_BASE)) return RAW_API_BASE.replace(/\/$/, "");
    if (RAW_API_BASE.startsWith("/")) return window.location.origin + RAW_API_BASE.replace(/\/$/, "");
    return RAW_API_BASE;
  })();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [selectedJob, setSelectedJob] = useState(null);
  const [loadingJob, setLoadingJob] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addQuery, setAddQuery] = useState("");
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // pagination
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  // helper to activate a job
  const setActive = async (id) => {
    try {
      await axios.patch(`${API_BASE}/jobs/${id}/status`, { status: "active" });
      await fetchJobs();
      setSelectedJob(null);
      setEditing(false);
      showToast("Job marked active");
    } catch (e) {
      console.error("Error setting active:", e);
      alert("Error updating job status");
    }
  };

  // delete job permanently
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this job?")) return;
    try {
      await axios.delete(`${API_BASE}/jobs/${id}`);
      await fetchJobs();
      setSelectedJob(null);
      showToast("Job deleted", "error");
    } catch (e) {
      console.error("Error deleting job:", e);
      const msg = e?.response?.data?.message || e.message || "Error deleting job";
      showToast(msg, "error");
    }
  };

  // real-time updates
  useEffect(() => {
    const onChange = () => fetchJobs();
    const onDelete = () => fetchJobs();

    socket.on("jobAdded", onChange);
    socket.on("jobUpdated", onChange);
    socket.on("jobDeleted", onDelete);
    return () => {
      socket.off("jobAdded", onChange);
      socket.off("jobUpdated", onChange);
      socket.off("jobDeleted", onDelete);
    };
  }, [fetchJobs]);

  const filteredJobs = (Array.isArray(jobs) ? jobs : []).filter((j) => {
    const matchesSearch =
      (j.jobId || "").toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      (j.category || "").toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      (j.subService || "").toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      (String(j.price || "")).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (j.city || "").toString().toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "All" || (j.status || "").toString().toLowerCase() === activeTab.toLowerCase();
    return matchesSearch && matchesTab;
  });

  // reset to first page when search or tab changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm, activeTab]);

  const totalJobs = filteredJobs.length;
  const totalPages = Math.max(1, Math.ceil(totalJobs / PAGE_SIZE));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const paginatedJobs = filteredJobs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // top cities list (simple set of popular Indian cities)
  const TOP_CITIES = [
    "Mumbai",
    "Delhi",
    "Bengaluru",
    "Kolkata",
    "Chennai",
    "Hyderabad",
    "Pune",
    "Ahmedabad",
    "Surat",
    "Jaipur",
    "Lucknow",
    "Kanpur",
    "Nagpur",
    "Indore",
    "Thane",
    "Bhopal",
    "Visakhapatnam",
    "Pimpri-Chinchwad",
    "Patna",
    "Vadodara",
  ];

  // View job details (fetch latest from backend)
  const handleView = async (job) => {
    try {
      setLoadingJob(true);
      const id = job._id;
      const res = await axios.get(`${API_BASE}/jobs/${id}`);
      const payload = res.data.booking || res.data.job || res.data;
      setSelectedJob(payload);
      setEditing(false);
    } catch (err) {
      console.error("Error fetching job details:", err);
      showToast(e?.response?.data?.message || "Error loading job details", "error");
    } finally {
      setLoadingJob(false);
    }
  };

  // Mark job completed
  const markCompleted = async (id) => {
    try {
      await axios.patch(`${API_BASE}/jobs/${id}/status`, { status: "completed" });
      fetchJobs();
      setSelectedJob(null);
      showToast("Job marked completed");
    } catch (e) {
      console.error("Error marking completed:", e);
      showToast(e?.response?.data?.message || "Error marking job as completed", "error");
    }
  };

  // Set job inactive
  const setInactive = async (id) => {
    try {
      await axios.patch(`${API_BASE}/jobs/${id}/status`, { status: "inactive" });
      await fetchJobs();
      setSelectedJob(null);
      setEditing(false);
      showToast("Job marked inactive");
    } catch (e) {
      console.error("Error setting inactive:", e);
      showToast(e?.response?.data?.message || "Error updating job status", "error");
    }
  };

  // Remove a single city from job
  const removeCity = async (jobId, city) => {
    try {
      const res = await axios.patch(`${API_BASE}/jobs/${jobId}/remove-city`, { city });
      const updated = res.data.booking || res.data.job || (res.data && res.data.job === undefined && res.data.booking === undefined ? res.data : null) || res.data;
      // update selectedJob (replace with returned booking/job object) and refresh job list
      if (updated && typeof updated === "object" && (updated._id || updated.jobId)) {
        setSelectedJob(updated);
      } else if (res.data.booking) {
        setSelectedJob(res.data.booking);
      }
      await fetchJobs();
      showToast(`Removed city ${city}`, "warning");
    } catch (e) {
      console.error("Error removing city:", e);
      showToast(e?.response?.data?.message || "Error removing city", "error");
    }
  };

  // Add a single city to job
  const addCity = async (jobId, city) => {
    try {
      const res = await axios.patch(`${API_BASE}/jobs/${jobId}/add-city`, { city });
      const updated = res.data.booking || res.data.job || res.data;
      if (updated && typeof updated === "object") setSelectedJob(updated);
      await fetchJobs();
      setShowAdd(false);
      setAddQuery("");
      showToast(`Added city ${city}`);
    } catch (e) {
      console.error("Error adding city:", e);
      showToast(e?.response?.data?.message || "Error adding city", "error");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-blue-700 mb-4">Jobs / Bookings</h2>
      {/* toast popup */}
      {toast && (
        <div className={`fixed top-4 right-4 px-4 py-2 rounded shadow-lg text-white z-50 ${toast.type === "error" ? "bg-red-500" : toast.type === "warning" ? "bg-yellow-600" : "bg-green-600"}`}>
          {toast.message}
        </div>
      )}

      <input
        type="text"
        placeholder="Search by Job ID, category, price, or city"
        className="w-full md:w-1/2 p-2 border rounded-md mb-4 dark:bg-gray-700 dark:text-gray-200"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="flex flex-wrap gap-2 mb-4">
        {["All", "Active", "Pending", "Completed"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200 hover:bg-gray-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Jobs Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
        <table className="min-w-full border border-gray-300 dark:border-gray-600">
          <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
            <tr className="text-left">
              <th className="p-3">Job ID</th>
              <th className="p-3">Category</th>
              <th className="p-3">Sub-Service</th>
              <th className="p-3">Price (Rs)</th>
              <th className="p-3">City</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date / Time</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {totalJobs === 0 ? (
              <tr>
                <td colSpan="8" className="p-4 text-center text-gray-500">
                  No jobs found
                </td>
              </tr>
            ) : (
              paginatedJobs.map((j) => (
                <tr key={j._id} className="border-t dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <td className="p-3 font-semibold">{j.jobId || j._id.slice(0, 8)}</td>
                  <td className="p-3">{j.category || "—"}</td>
                  <td className="p-3">{j.subService || "—"}</td>
                  <td className="p-3 font-medium">Rs {j.price ? Number(j.price).toLocaleString() : "0"}</td>
                  <td className="p-3">{(j.cities && j.cities.length) ? j.cities.join(", ") : (j.city || "—")}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                        j.status === "active"
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                          : j.status === "pending"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200"
                          : j.status === "completed"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-200"
                      }`}
                    >
                      {j.status || "pending"}
                    </span>
                  </td>
                  <td className="p-3 text-sm">
                    {j.date}
                    {j.time ? ` • ${j.time}` : ""}
                  </td>
                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => handleView(j)}
                      disabled={loadingJob}
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium transition disabled:opacity-50"
                    >
                      {loadingJob ? "..." : "View"}
                    </button>
                    {j.status === "active" && (
                      <button
                        onClick={() => handleDelete(j._id)}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm font-medium transition"
                      >
                        Delete
                      </button>
                    )}
                    {j.status !== "active" && j.status !== "completed" && (
                      <button
                        onClick={() => setActive(j._id)}
                        className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm font-medium transition"
                      >
                        Activate
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalJobs > PAGE_SIZE && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 disabled:opacity-50"
          >
            Prev
          </button>

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
      )}

      {/* Enhanced Popup Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">Job Details</h3>
              <button
                onClick={() => setSelectedJob(null)}
                className="p-2 hover:bg-blue-500 rounded-full transition"
                title="Close"
              >
                <X size={24} className="text-white" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 p-6 space-y-4">
              
              {/* Image */}
              {selectedJob.imageUrl && (
                <div className="flex justify-center mb-4">
                  <img
                    src={selectedJob.imageUrl}
                    alt="Job"
                    className="w-full max-w-sm h-64 object-cover rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
                  />
                </div>
              )}

              {/* Job ID */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Job ID</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedJob.jobId || selectedJob._id}</p>
              </div>

              {/* Status Badge */}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Status</p>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold inline-block ${
                    selectedJob.status === "active"
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                      : selectedJob.status === "pending"
                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200"
                      : selectedJob.status === "completed"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-200"
                  }`}
                >
                  {selectedJob.status || "pending"}
                </span>
              </div>

              {/* Grid Layout */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Category</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedJob.category || "—"}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Sub-Service</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedJob.subService || "—"}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Price</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">Rs {selectedJob.price ? Number(selectedJob.price).toLocaleString() : "0"}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">City</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(selectedJob.cities && selectedJob.cities.length) ? (
                      selectedJob.cities.map((c) => (
                        <div key={c} className="flex items-center gap-2 bg-white dark:bg-gray-700 px-3 py-1 rounded-full">
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{c}</span>
                          {editing && (
                            <button
                              onClick={() => removeCity(selectedJob._id, c)}
                              className="text-xs text-red-600 hover:text-red-800 ml-2"
                              title={`Remove ${c}`}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedJob.city || "—"}</p>
                    )}
                  </div>
                  {/* Add city UI when editing */}
                  {editing && (
                    <div className="mt-3">
                      {!showAdd ? (
                        <button
                          onClick={() => setShowAdd(true)}
                          className="px-2 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300"
                        >
                          + Add
                        </button>
                      ) : (
                        <div className="mt-2">
                          <input
                            value={addQuery}
                            onChange={(e) => setAddQuery(e.target.value)}
                            placeholder="Search cities..."
                            className="w-full p-2 border rounded-md mb-2"
                          />
                          <div className="max-h-40 overflow-y-auto border rounded-md bg-white dark:bg-gray-700 p-2">
                            {TOP_CITIES.filter((ct) => ct.toLowerCase().includes(addQuery.toLowerCase())).slice(0, 10).map((ct) => (
                              <button
                                key={ct}
                                onClick={() => addCity(selectedJob._id, ct)}
                                className="block w-full text-left px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-sm"
                              >
                                {ct}
                              </button>
                            ))}
                            <div className="mt-2 flex gap-2">
                              <button onClick={() => { setShowAdd(false); setAddQuery(""); }} className="px-3 py-1 bg-gray-300 rounded">Cancel</button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {editing && (!selectedJob.cities || selectedJob.cities.length === 0) && (
                    <p className="text-sm text-gray-500 mt-2">No removable locations available.</p>
                  )}
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Date</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedJob.date || "—"}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Time</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedJob.time || "—"}</p>
                </div>
              </div>

              {/* Description */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Description</p>
                <p className="text-gray-900 dark:text-gray-200 leading-relaxed">{selectedJob.description || selectedJob.remarks || "No description provided"}</p>
              </div>

              {/* Requirement */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Requirements</p>
                <p className="text-gray-900 dark:text-gray-200 leading-relaxed">{selectedJob.requirement || "No requirements specified"}</p>
              </div>

            </div>

            {/* Footer Actions */}
            <div className="bg-gray-100 dark:bg-gray-800 p-4 flex gap-3 border-t dark:border-gray-700">
              {selectedJob.status !== "completed" && (
                <>
                  <button
                    onClick={() => {
                      setEditing((s) => !s);
                      if (editing) {
                        setSelectedJob(null);
                        showToast("Changes saved");
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition"
                  >
                    {editing ? "Save" : "Edit"}
                  </button>
                  {selectedJob.status !== "active" && (
                    <button
                      onClick={() => {
                        setActive(selectedJob._id);
                      }}
                      className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition"
                    >
                      Activate
                    </button>
                  )}
                  {selectedJob.status === "active" && (
                    <button
                      onClick={() => {
                        setInactive(selectedJob._id);
                      }}
                      className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition"
                    >
                      Inactive
                    </button>
                  )}
                  {/* delete option in modal */}
                  <button
                    onClick={() => {
                      handleDelete(selectedJob._id);
                    }}
                    className="flex-1 px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg font-medium transition"
                  >
                    Delete
                  </button>
                </>
              )}
              {selectedJob.status === "completed" && (
                <button
                  onClick={() => {
                    setSelectedJob(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jobs;
