import { Router } from "express";
import {
  listJobsController,
  getJobController,
  createJobController,
  updateJobController,
  deleteJobController,
} from "../controller/job.controller";
import { authenticate, authorizeRole } from "../middleware/auth.middleware"; // adjust to your actual middleware names/paths

const jobrouter = Router();

// Public job board endpoints
jobrouter.get("/", listJobsController);
jobrouter.get("/:id", getJobController);

// Recruiter-only job management endpoints
jobrouter.post("/", authenticate, authorizeRole("RECRUITER"), createJobController);
jobrouter.patch("/:id", authenticate, authorizeRole("RECRUITER"), updateJobController);
jobrouter.delete("/:id", authenticate, authorizeRole("RECRUITER"), deleteJobController);

export default jobrouter;