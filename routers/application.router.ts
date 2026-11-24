import { Router } from "express";
import {
  handleApplyToJob,
  handleGetMyApplications,
  handleGetJobApplications,
  handleUpdateApplicationStatus,
} from "../controller/application.controller";
import { authenticate, authorizeRole } from "../middleware/auth.middleware"; // adjust to your actual middleware names/paths
// import { validate } from "../middleware/validate.middleware";
// import { applicationSchema, updateApplicationStatusSchema } from "../validator/application.validator";

const applicationrouter = Router();

// All application routes require authentication
applicationrouter.use(authenticate);

// Candidate routes
applicationrouter.post(
  "/",
  authorizeRole("CANDIDATE"),
  // validate(applicationSchema),
  handleApplyToJob
);
applicationrouter.get(
  "/me",
  authorizeRole("CANDIDATE"),
  handleGetMyApplications
);

// Recruiter routes
applicationrouter.get(
  "/job/:jobId",
  authorizeRole("RECRUITER"),
  handleGetJobApplications
);
applicationrouter.patch(
  "/:id/status",
  authorizeRole("RECRUITER"),
  // validate(updateApplicationStatusSchema),
  handleUpdateApplicationStatus
);

export default applicationrouter;