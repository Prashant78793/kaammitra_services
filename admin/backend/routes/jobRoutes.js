// routes/jobRoutes.js
import express from "express";
import multer from "multer";
import {
  createJob,
  getJobs,
  getJobById,
  updateJobStatus,
  removeCityFromJob,
  addCityToJob,
  deleteJob,
} from "../controllers/jobController.js";

const router = express.Router();

// File upload config for job creation (if used)
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// create job (supports file upload via field 'image' or JSON imageUrl)
router.post("/", upload.single("image"), createJob);

// get bookings/jobs (now backed by Booking when available)
router.get("/", getJobs);

// get by id (booking or job)
router.get("/:id", getJobById);

// update status (booking or job)
router.patch("/:id/status", updateJobStatus);

// remove a single city from a job
router.patch("/:id/remove-city", removeCityFromJob);

// add a single city to a job
router.patch("/:id/add-city", addCityToJob);

// delete a job (or booking) permanently
router.delete("/:id", deleteJob);

export default router;
