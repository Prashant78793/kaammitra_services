import express from "express";
import Booking from "../models/Booking.js";

const router = express.Router();

// GET /api/bookings - list bookings (populated)
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("userId", "fullName phoneNumber email")
      .sort({ createdAt: -1 })
      .lean();
    return res.json(bookings || []);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return res.status(500).json({ message: "Failed to fetch bookings" });
  }
});

export default router;
