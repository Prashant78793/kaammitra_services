import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

export const JobContext = createContext();

export const JobProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);

  const RAW_API_BASE = import.meta.env.VITE_API_BASE;
  const API_BASE = (() => {
    if (!RAW_API_BASE) return "http://localhost:5000/api";
    if (/^https?:\/\//i.test(RAW_API_BASE)) return RAW_API_BASE.replace(/\/$/, "");
    if (RAW_API_BASE.startsWith("/")) return (typeof window !== "undefined" ? window.location.origin : "http://localhost:5173") + RAW_API_BASE.replace(/\/$/, "");
    return RAW_API_BASE;
  })();

  const normalizeJobs = (arr) => {
    if (!Array.isArray(arr)) return [];
    return arr.map((it) => {
      const copy = { ...it };
      if (!copy._id && copy.id) copy._id = copy.id.$oid ?? copy.id;
      if (copy._id && typeof copy._id === "object") copy._id = copy._id.$oid ?? copy._id;
      copy.status = (copy.status || "").toString().toLowerCase();
      return copy;
    });
  };

  const fetchJobs = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/jobs`);
      const arrJobs = Array.isArray(res?.data?.jobs) ? res.data.jobs : [];
      const normalized = normalizeJobs(arrJobs);
      setJobs(normalized);
      return normalized;
    } catch (err) {
      console.error("JobContext fetchJobs error:", err?.response?.data ?? err.message);
      setJobs([]);
      return [];
    }
  }, [API_BASE]);

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, [fetchJobs]);

  const addJob = async (formData) => {
    try {
      const res = await axios.post(`${API_BASE}/jobs`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const created = res.data?.job ?? res.data;
      if (created) {
        const normalized = normalizeJobs([created]);
        setJobs((prev) => [...normalized, ...(Array.isArray(prev) ? prev : [])]);
      }
      return created;
    } catch (err) {
      console.error("JobContext addJob error:", err?.response?.data ?? err.message);
      throw err;
    }
  };

  return (
    <JobContext.Provider value={{ jobs, addJob, fetchJobs }}>
      {children}
    </JobContext.Provider>
  );
};