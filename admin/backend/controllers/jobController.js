import Booking from "../models/Booking.js";
import Job from "../models/Job.js";
import Provider from "../models/Provider.js";
import Client from "../models/Client.js"; // <-- ensure Client model is registered for populate
import jwt from "jsonwebtoken";

// Escape special regex chars in user-provided strings
const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");

/** Resolve provider by token in Authorization header. Returns provider or null */
const resolveProviderFromToken = async (req) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    let token = null;
    if (authHeader && typeof authHeader === "string") {
      token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
    }
    if (!token) return null;
    const secret = process.env.JWT_SECRET || "your_jwt_secret";
    const payload = jwt.verify(token, secret);
    const providerId = payload.providerId || payload.sub || payload.id;
    let provider = null;
    if (providerId) provider = await Provider.findById(providerId);
    if (!provider && payload.email) provider = await Provider.findOne({ email: payload.email });
    return provider || null;
  } catch {
    return null;
  }
};

/** POST /api/jobs - create a new Job (accepts multipart/form-data or JSON) */
export const createJob = async (req, res) => {
  try {
    const io = req.app.get("io");
    const body = { ...(req.body || {}) };

    if (req.file && req.file.filename) {
      body.imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl && typeof req.body.imageUrl === "string") {
      body.imageUrl = req.body.imageUrl;
    }

    // normalize price
    const price = body.price ? Number(body.price) : 0;

    // build cities array (accepts: cities[]=..., cities as JSON string, comma separated city string, or single city)
    let cities = [];
    if (body.cities) {
      if (Array.isArray(body.cities)) {
        cities = body.cities.map((c) => String(c).trim()).filter(Boolean);
      } else {
        try {
          const parsed = JSON.parse(body.cities);
          if (Array.isArray(parsed)) cities = parsed.map((c) => String(c).trim()).filter(Boolean);
          else cities = String(body.cities).split(",").map((c) => c.trim()).filter(Boolean);
        } catch {
          cities = String(body.cities).split(",").map((c) => c.trim()).filter(Boolean);
        }
      }
    } else if (body.city) {
      cities = String(body.city).split(",").map((c) => c.trim()).filter(Boolean);
    }

    const cityFirst = cities[0] || (body.city ? String(body.city).trim() : "");

    const jobId = body.jobId || `JOB-${Date.now().toString(36)}-${Math.floor(Math.random() * 9000) + 1000}`;

    const now = new Date();
    const payload = {
      jobId,
      category: body.category || body.category?.toString?.() || "",
      subService: body.subService || "",
      description: body.description || "",
      requirement: body.requirement || "",
      imageUrl: body.imageUrl || "",
      price,
      // store cities array and keep single 'city' for backward compatibility
      cities,
      city: cityFirst,
      status: (body.status || "pending").toString().toLowerCase(),
      date: body.date || now.toLocaleDateString("en-IN"),
      time: body.time || now.toLocaleTimeString("en-IN"),
    };

    const created = await Job.create(payload);

    if (io) io.emit("jobAdded", created);

    return res.status(201).json({ job: created });
  } catch (error) {
    console.error("createJob error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/** GET /api/jobs - returns job items (Job collection) and bookings optionally filtered by provider area */
export const getJobs = async (req, res) => {
  try {
    const provider = await resolveProviderFromToken(req);
    const { status } = req.query;

    const bookingQuery = {};
    const jobQuery = {};

    // helper removes parenthesized bit and any digits so that "Mumbai (150096)" -> "Mumbai"
    const normalizeArea = (s) => {
      let t = String(s || "").trim();
      t = t.replace(/\(.*\)/, "").trim(); // drop parentheses
      t = t.replace(/[0-9]+/g, "").trim(); // drop digits
      t = t.replace(/^-+|-+$/g, "").trim(); // drop leading/trailing hyphens
      t = t.replace(/\s+/g, " ").trim(); // normalize whitespace
      return t.toLowerCase(); // convert to lowercase for matching
    };

    if (provider && provider.serviceArea) {
      const serviceAreaRaw = String(provider.serviceArea || "").trim();
      const areas = serviceAreaRaw
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean)
        .map(normalizeArea)
        .filter(Boolean);

      if (areas.length) {
        // use ^...$ regex so that value must exactly equal the normalized area (case-insensitive)
        const regexes = areas.map((a) => new RegExp(`^${escapeRegex(a)}$`, "i"));

        // bookings: city field may be a string; normalize it before matching
        bookingQuery.city = { $in: regexes };

        // jobs: match either element of `cities` array or legacy `city` field
        // MongoDB allows regex in queries; both arrays and strings will be tested
        jobQuery.$or = [
          ...regexes.map((r) => ({ cities: r })),
          ...regexes.map((r) => ({ city: r })),
        ];
      }
    }

    if (status) {
      const s = String(status).toLowerCase();
      if (
        ["pending", "accepted", "in-progress", "completed", "cancelled"].includes(
          s
        )
      ) {
        bookingQuery.status = s;
        jobQuery.status = s;
      }
    }

    // populate may fail if Client model isn't registered everywhere; fallback to non-populated results
    let bookings = [];
    try {
      bookings = await Booking.find(bookingQuery)
        .populate("userId", "fullName phoneNumber email")
        .sort({ createdAt: -1 })
        .lean();
    } catch (popErr) {
      console.warn(
        "Populate failed in getJobs, returning bookings without populate:",
        popErr.message
      );
      bookings = await Booking.find(bookingQuery)
        .sort({ createdAt: -1 })
        .lean();
    }

    const jobs = await Job.find(jobQuery).sort({ createdAt: -1 }).lean();

    return res.status(200).json({ bookings: bookings || [], jobs: jobs || [] });
  } catch (error) {
    console.error("getJobs error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/** GET /api/jobs/:id - check Booking first, fallback to Job */
export const getJobById = async (req, res) => {
  try {
    const id = req.params.id;
    let booking = null;
    try {
      booking = await Booking.findById(id).populate("userId", "fullName phoneNumber email").lean();
    } catch (popErr) {
      console.warn("Populate failed in getJobById, fetching booking without populate:", popErr.message);
      booking = await Booking.findById(id).lean();
    }
    if (booking) return res.json({ booking });
    const job = await Job.findById(id).lean();
    if (job) return res.json({ job });
    return res.status(404).json({ message: "Not found" });
  } catch (error) {
    console.error("getJobById error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/** PATCH /api/jobs/:id/status - update booking or job status */
export const updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const id = req.params.id;
    const io = req.app.get("io");
    const s = String(status).toLowerCase();
    if (!["pending", "accepted", "in-progress", "completed", "cancelled", "inactive", "active"].includes(s)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const booking = await Booking.findById(id);
    if (booking) {
      booking.status = s;
      await booking.save();
      if (io) io.emit("bookingUpdated", booking);
      return res.json({ success: true, booking });
    }

    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ message: "Booking/Job not found" });

    job.status = s;
    const now = new Date();
    job.date = now.toLocaleDateString("en-IN");
    job.time = now.toLocaleTimeString("en-IN");
    await job.save();

    if (io) io.emit("jobUpdated", job);
    return res.json({ success: true, job });
  } catch (error) {
    console.error("updateJobStatus error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/** PATCH /api/jobs/:id/remove-city - remove a single city from a Job's cities array */
export const removeCityFromJob = async (req, res) => {
  try {
    const id = req.params.id;
    const { city } = req.body;
    const io = req.app.get("io");

    if (!city || !String(city).trim()) {
      return res.status(400).json({ message: "city is required in request body" });
    }

    const cityStr = String(city).trim();
    const regex = new RegExp(`^${escapeRegex(cityStr)}$`, "i");

    // Prefer updating Job documents directly (jobs collection)
    let job = await Job.findById(id);
    if (!job) {
      // maybe client passed a Booking id; try resolve Job id from booking.service
      try {
        const booking = await Booking.findById(id).lean();
        if (booking && booking.service) {
          // booking.service could be an id or an object
          const svc = booking.service;
          const jobId = (typeof svc === "string" && svc) || (svc && svc._id) || (svc && svc.id);
          if (jobId) job = await Job.findById(jobId);
        }
      } catch (bErr) {
        console.warn("removeCityFromJob booking lookup failed:", bErr.message);
      }
    }

    if (!job) return res.status(404).json({ message: "Job not found; pass a Job id or a Booking referencing a Job" });

    // perform atomic update: pull matching city (case-insensitive) by reading array and filtering
    const updatedCities = (Array.isArray(job.cities) ? job.cities : []).filter((c) => !regex.test(String(c)));
    const newCity = job.city && regex.test(String(job.city)) ? (updatedCities.length ? updatedCities[0] : "") : job.city || (updatedCities.length ? updatedCities[0] : "");

    job.cities = updatedCities;
    job.city = newCity;
    await job.save();

    if (io) io.emit("jobUpdated", job);
    return res.json({ success: true, job });
  } catch (error) {
    console.error("removeCityFromJob error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/** PATCH /api/jobs/:id/add-city - add a single city to a Job's cities array (or Booking) */
export const addCityToJob = async (req, res) => {
  try {
    const id = req.params.id;
    const { city } = req.body;
    const io = req.app.get("io");

    if (!city || !String(city).trim()) {
      return res.status(400).json({ message: "city is required in request body" });
    }

    const cityStr = String(city).trim();
    const regex = new RegExp(`^${escapeRegex(cityStr)}$`, "i");

    // Prefer updating Job documents directly (jobs collection)
    let job = await Job.findById(id);
    if (!job) {
      // maybe client passed a Booking id; try resolve Job id from booking.service
      try {
        const booking = await Booking.findById(id).lean();
        if (booking && booking.service) {
          const svc = booking.service;
          const jobId = (typeof svc === "string" && svc) || (svc && svc._id) || (svc && svc.id);
          if (jobId) job = await Job.findById(jobId);
        }
      } catch (bErr) {
        console.warn("addCityToJob booking lookup failed:", bErr.message);
      }
    }

    if (!job) return res.status(404).json({ message: "Job not found; pass a Job id or a Booking referencing a Job" });

    job.cities = Array.isArray(job.cities) ? job.cities : [];
    const existsJob = job.cities.some((c) => regex.test(String(c)));
    if (!existsJob) job.cities.push(cityStr);
    if (!job.city) job.city = job.cities[0] || "";

    await job.save();
    if (io) io.emit("jobUpdated", job);
    return res.json({ success: true, job });
  } catch (error) {
    console.error("addCityToJob error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// delete job or booking by id
export const deleteJob = async (req, res) => {
  try {
    const id = req.params.id;
    const io = req.app.get("io");

    let booking = null;
    try {
      booking = await Booking.findById(id);
    } catch {}
    if (booking) {
      await booking.remove();
      if (io) io.emit("bookingDeleted", booking);
      return res.json({ success: true });
    }

    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ message: "Booking/Job not found" });
    await job.remove();
    if (io) io.emit("jobDeleted", job);
    return res.json({ success: true });
  } catch (error) {
    console.error("deleteJob error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};