import Provider from "../models/Provider.js";
import jwt from "jsonwebtoken";

const parseIfJson = (val) => {
  if (typeof val !== "string") return val;
  try { return JSON.parse(val); } catch { return val; }
};

export const addProvider = async (req, res) => {
  try {
    console.log("POST /api/providers/add - body:", req.body);
    console.log("POST /api/providers/add - files:", req.files);

    const payload = {
      fullName: parseIfJson(req.body.fullName) || "",
      phoneNumber: parseIfJson(req.body.phoneNumber) || "",
      email: parseIfJson(req.body.email) || undefined,
      serviceCategory: parseIfJson(req.body.serviceCategory) || "",
      subService: parseIfJson(req.body.subService) || "",
      experience: req.body.experience ? Number(parseIfJson(req.body.experience)) : 0,
      serviceArea: parseIfJson(req.body.serviceArea) || "",
      pinCode: parseIfJson(req.body.pinCode) || "",
      languageSpoken: parseIfJson(req.body.languageSpoken) || "",
      profilePhoto: req.files?.profilePhoto?.[0]?.filename || parseIfJson(req.body.profilePhoto) || "",
      governmentIDProof: req.files?.governmentIDProof?.[0]?.filename || parseIfJson(req.body.governmentIDProof) || "",
      addressProof: req.files?.addressProof?.[0]?.filename || parseIfJson(req.body.addressProof) || "",
      skillCertificate: req.files?.skillCertificate?.[0]?.filename || parseIfJson(req.body.skillCertificate) || "",
      bankAccountNumber: parseIfJson(req.body.bankAccountNumber) || "",
      ifscCode: parseIfJson(req.body.ifscCode) || "",
      upiId: parseIfJson(req.body.upiId) || "",
      status: "Pending", // New providers start as Pending (capital P to match schema enum)
    };

    // remove empty / falsy email to avoid unique index duplicate
    if (!payload.email) delete payload.email;

    if (!payload.fullName || !payload.phoneNumber) {
      console.warn("addProvider called without name/phone, payload: ", payload);
      return res.status(400).json({ message: "fullName and phoneNumber are required.", payload });
    }

    const exists = await Provider.findOne({ phoneNumber: payload.phoneNumber });
    if (exists) return res.status(400).json({ message: "Provider already exists." });

    const created = await Provider.create(payload);
    console.log("Provider created:", created._id);

    // Emit socket event
    const io = req.app.get("io");
    if (io) {
      io.emit("providerAdded", created);
      const count = await Provider.countDocuments({ status: "active" });
      io.emit("providerCount", { count });
    }

    return res.status(201).json(created);
  } catch (error) {
    console.error("Error in addProvider:", error);
    if (error.code === 11000) return res.status(400).json({ message: "Duplicate key error", keyValue: error.keyValue });
    if (error.name === "ValidationError") {
      const details = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: "Validation error", details });
    }
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getProviders = async (req, res) => {
  try {
    const providers = await Provider.find().sort({ createdAt: -1 });
    return res.json(providers);
  } catch (error) {
    console.error("Error fetching providers:", error);
    return res.status(500).json({ message: "Failed to fetch providers" });
  }
};

// NEW: Get only Active providers
export const getActiveProviders = async (req, res) => {
  try {
    const providers = await Provider.find({ status: "active" }).sort({ createdAt: -1 });
    return res.json(providers);
  } catch (error) {
    console.error("Error fetching active providers:", error);
    return res.status(500).json({ message: "Failed to fetch active providers" });
  }
};

export const getProviderById = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id);
    if (!provider) return res.status(404).json({ message: "Provider not found" });
    return res.json(provider);
  } catch (error) {
    console.error("Error fetching provider:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateProvider = async (req, res) => {
  try {
    const io = req.app.get("io");
    const allowed = [
      "status",
      "serviceCategory",
      "subService",
      "experience",
      "serviceArea",
      "pinCode",
      "languageSpoken",
      "profilePhoto",
      "governmentIDProof",
      "addressProof",
      "skillCertificate",
      "bankAccountNumber",
      "ifscCode",
      "upiId",
      "rating",
    ];
    const filtered = {};
    Object.keys(req.body).forEach((k) => {
      if (allowed.includes(k)) filtered[k] = req.body[k];
    });

    // normalize status value to match schema enum (capitalize first letter)
    if (filtered.status) {
      const s = String(filtered.status).trim();
      filtered.status = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    }

    const provider = await Provider.findByIdAndUpdate(req.params.id, filtered, { new: true });
    if (!provider) return res.status(404).json({ message: "Provider not found" });

    // Emit socket events
    if (io) {
      // Emit events based on normalized status
      if (filtered.status === "active") {
        io.emit("providerUpdated", provider);
      } else if (filtered.status === "suspended") {
        io.emit("providerSuspended", provider);
      } else {
        io.emit("providerUpdated", provider);
      }

      // Emit updated count (providers with status 'active')
      const count = await Provider.countDocuments({ status: "active" });
      io.emit("providerCount", { count });
    }

    return res.json(provider);
  } catch (error) {
    console.error("Error in updateProvider:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getProviderByPhone = async (req, res) => {
  try {
    const { phoneNumber } = req.params;

    if (!phoneNumber) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const provider = await Provider.findOne({ phoneNumber });

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    // Check if suspended (normalize casing)
    if (String(provider.status || "").toLowerCase() === "suspended") {
      return res.status(403).json({ message: "This provider account is suspended" });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        providerId: provider._id,
        phoneNumber: provider.phoneNumber,
      },
      process.env.JWT_SECRET || "your_secret_key_here",
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login successful",
      provider,
      token,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching provider information",
      error: error.message,
    });
  }
};