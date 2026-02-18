import React, { useState, useEffect } from "react";
import { StarFill } from "react-bootstrap-icons";
import { Bell, Edit } from "lucide-react";
import axios from "axios";
import { io } from "socket.io-client";
import ProfileJobs from "./Profilejobs";

const API = "http://localhost:5000/api";
const socket = io("http://localhost:5000", { autoConnect: false });

const STATUS_LABEL = {
  pending: "Pending",
  accepted: "Accepted",
  "in-progress": "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
  declined: "Declined",
  active: "Active",
  inactive: "Inactive",
};

// ---- Provider Info Card ----
const ProviderInfoCard = ({ provider }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border p-6 mb-6">
    <div className="flex items-start justify-between">
      <div className="flex items-center space-x-4">
        {provider.profilePhoto && (
          <img
            src={`/uploads/${provider.profilePhoto}`}
            alt={provider.fullName}
            className="w-16 h-16 rounded-full object-cover"
          />
        )}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {provider.fullName}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {provider.phoneNumber || provider.phone}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {provider.email}
          </p>
        </div>
      </div>
      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
        <Edit className="w-5 h-5 text-blue-600" />
      </button>
    </div>
  </div>
);

// ---- Stat Card ----
const StatCard = ({ title, value, isCurrency = false, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border flex flex-col items-center cursor-pointer"
  >
    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
      {title}
    </p>
    {isCurrency ? (
      <p className="text-xl md:text-2xl font-bold">
        Rs {value.toLocaleString("en-IN")}
      </p>
    ) : (
      <p className="text-3xl font-bold text-blue-600">{value}</p>
    )}
  </div>
);

// ---- Main Dashboard ----
const ProfileDashboard = () => {
  const [showJobs, setShowJobs] = useState(null);
  const [counts, setCounts] = useState({
    active: 0,
    pending: 0,
    completed: 0,
  });
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState(null);

  // Fetch provider data from localStorage/backend
  useEffect(() => {
    const d = localStorage.getItem("providerData");
    if (d) try { setProvider(JSON.parse(d)); } catch(e){ console.error(e); }
  }, []);

  // Fetch jobs from backend
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("providerToken") || localStorage.getItem("token");
      if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      let res = await axios.get(`${API}/bookings`).catch(() => null);
      if (!res || !res.data) res = await axios.get(`${API}/jobs`).catch(() => null);
      if (!res) { setAllJobs([]); setCounts({ active:0,pending:0,completed:0 }); return; }

      let raw = Array.isArray(res.data) ? res.data : (Array.isArray(res.data.bookings) ? res.data.bookings : (Array.isArray(res.data.data) ? res.data.data : []));

      const normalized = raw.map((r) => {
        const b = { ...r };
        if (!b._id && b.id) b._id = b.id.$oid ?? b.id;
        if (b._id && typeof b._id === "object") b._id = b._id.$oid ?? b._id;
        b.status = (b.status||"").toString().toLowerCase();
        if (b.date) {
          if (typeof b.date === "object") b.date = new Date(b.date.$date ?? b.date);
          else b.date = new Date(b.date);
        }
        return b;
      }).filter(Boolean);

      // enforce provider.serviceArea === booking.city (case-insensitive)
      let providerDataLocal = provider;
      try { providerDataLocal = providerDataLocal || JSON.parse(localStorage.getItem("providerData") || "null"); } catch(e) { providerDataLocal = providerDataLocal || null; }

      const serviceArea = providerDataLocal?.serviceArea ? String(providerDataLocal.serviceArea).trim().toLowerCase() : null;

      const filteredByArea = serviceArea
        ? normalized.filter((b) => ((b.city || "").toString().trim().toLowerCase()) === serviceArea)
        : []; // if provider has no serviceArea, show 0 bookings per requirement

      setAllJobs(filteredByArea);

      setCounts({
        active: filteredByArea.filter((j) => ["active", "accepted", "in-progress"].includes(j.status)).length,
        pending: filteredByArea.filter((j) => j.status === "pending").length,
        completed: filteredByArea.filter((j) => j.status === "completed").length,
      });
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setAllJobs([]);
      setCounts({ active:0,pending:0,completed:0 });
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and socket setup
  useEffect(() => {
    fetchJobs();
    const token = localStorage.getItem("providerToken") || localStorage.getItem("token");
    if (token) socket.auth = { token };
    if (!socket.connected) socket.connect();

    const onAdd = (p) => {
      // normalize then check serviceArea before adding
      const b = normalizeForDashboard(p);
      let providerDataLocal = provider;
      try { providerDataLocal = providerDataLocal || JSON.parse(localStorage.getItem("providerData") || "null"); } catch(e) { providerDataLocal = providerDataLocal || null; }
      const serviceArea = providerDataLocal?.serviceArea ? String(providerDataLocal.serviceArea).trim().toLowerCase() : null;
      if (!serviceArea) return; // don't add if provider has no serviceArea
      if (((b.city || "").toString().trim().toLowerCase()) === serviceArea) {
        setAllJobs((prev) => [b, ...(prev || [])]);
        setCounts((prev) => ({
          ...prev,
          pending: prev.pending + (b.status === "pending" ? 1 : 0),
          active: prev.active + (["active", "accepted", "in-progress"].includes(b.status) ? 1 : 0),
          completed: prev.completed + (b.status === "completed" ? 1 : 0),
        }));
      }
    };
    const onUpd = (p) => {
      const b = normalizeForDashboard(p);
      let providerDataLocal = provider;
      try { providerDataLocal = providerDataLocal || JSON.parse(localStorage.getItem("providerData") || "null"); } catch(e) { providerDataLocal = providerDataLocal || null; }
      const serviceArea = providerDataLocal?.serviceArea ? String(providerDataLocal.serviceArea).trim().toLowerCase() : null;

      if (!serviceArea) {
        // provider has no serviceArea -> ensure no jobs shown
        setAllJobs([]);
        setCounts({ active:0,pending:0,completed:0 });
        return;
      }

      if (((b.city || "").toString().trim().toLowerCase()) === serviceArea) {
        setAllJobs((prev) => prev.map((j) => (j._id === (b._id || b.id?.$oid) ? b : j)));
        // recompute counts with updated status
        setCounts((prev) => {
          const updated = (allJobs || []).map((j) => (j._id === (b._id || b.id?.$oid) ? b : j));
          return {
            active: updated.filter((j) => ["active", "accepted", "in-progress"].includes(j.status)).length,
            pending: updated.filter((j) => j.status === "pending").length,
            completed: updated.filter((j) => j.status === "completed").length,
          };
        });
      } else {
        // updated booking moved out of provider area -> remove it
        setAllJobs((prev) => (prev || []).filter((j) => j._id !== (b._id || b.id?.$oid)));
        setCounts((prev) => {
          // recompute counts conservatively
          const arr = (allJobs || []).filter((j) => j._id !== (b._id || b.id?.$oid));
          return {
            active: arr.filter((j) => ["active", "accepted", "in-progress"].includes(j.status)).length,
            pending: arr.filter((j) => j.status === "pending").length,
            completed: arr.filter((j) => j.status === "completed").length,
          };
        });
      }
    };
    function normalizeForDashboard(r){
      const b = {...r};
      if (!b._id && b.id) b._id = b.id.$oid ?? b.id;
      if (b._id && typeof b._id === "object") b._id = b._id.$oid ?? b._id;
      b.status = (b.status||"").toString().toLowerCase();
      if (b.date) {
        if (typeof b.date === "object") b.date = new Date(b.date.$date ?? b.date);
        else b.date = new Date(b.date);
      }
      return b;
    }

    socket.on("bookingAdded", onAdd);
    socket.on("bookingUpdated", onUpd);
    socket.on("jobAdded", onAdd);
    socket.on("jobUpdated", onUpd);
    // Provider status updates from admin (verify / suspend)
    const onProviderUpdated = (p) => {
      try {
        const currentId = provider?._id || localStorage.getItem("providerId");
        if (!currentId) return;
        const updatedId = p._id || p.id || (p._id && p._id.$oid) || null;
        if (!updatedId) return;
        if (String(updatedId) === String(currentId)) {
          // update local state and localStorage so UI reflects new status immediately
          setProvider(p);
          try { localStorage.setItem("providerData", JSON.stringify(p)); } catch (e) { console.warn(e); }
        }
      } catch (e) {
        console.error("providerUpdated handler error:", e);
      }
    };
    socket.on("providerUpdated", onProviderUpdated);
    socket.on("providerSuspended", onProviderUpdated);

    return () => {
      socket.off("bookingAdded", onAdd);
      socket.off("bookingUpdated", onUpd);
      socket.off("jobAdded", onAdd);
      socket.off("jobUpdated", onUpd);
      socket.off("providerUpdated", onProviderUpdated);
      socket.off("providerSuspended", onProviderUpdated);
      try { socket.disconnect(); } catch(e){}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (showJobs) {
    return (
      <ProfileJobs
        defaultTab={showJobs}
        onBack={() => setShowJobs(null)}
        onCountsUpdate={setCounts}
      />
    );
  }

  return (
    <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Provider Info */}
      {provider && <ProviderInfoCard provider={provider} />}

      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Dashboard Overview
        </h2>
        <div className="relative">
          <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition">
            <Bell className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            {counts.pending > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {counts.pending > 9 ? "9+" : counts.pending}
              </span>
            )}
          </button>
        </div>
      </div>

      {loading && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
          Loading real-time jobs...
        </div>
      )}

      {/* Dashboard Grid */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <StatCard
          title="Pending Requests"
          value={counts.pending}
          onClick={() => setShowJobs("Pending")}
        />
        <StatCard
          title="Active Jobs"
          value={counts.active}
          onClick={() => setShowJobs("Active")}
        />
        <StatCard title="Total Income" value={1589} isCurrency={true} />
      </div>

      {/* Recent Jobs */}
      {allJobs.length > 0 && (
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md border p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {allJobs.slice(0, 5).map((job) => (
              <div
                key={job._id}
                className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {job.serviceType ||
                      (job.service && job.service.serviceName) ||
                      "Service"}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Rs {job.price?.toLocaleString() || "—"} • {job.city}
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    ["active", "accepted", "in-progress"].includes(job.status)
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      : job.status === "pending"
                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                      : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                  }`}
                >
                  {STATUS_LABEL[job.status] || job.status}
                </span>
              </div>
            ))}
          </div>
          {allJobs.length > 5 && (
            <button
              onClick={() => setShowJobs("Active")}
              className="mt-4 w-full text-center py-2 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              View all bookings ({allJobs.length})
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileDashboard;