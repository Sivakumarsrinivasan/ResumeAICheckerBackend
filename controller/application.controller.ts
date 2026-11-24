import { Request, Response, NextFunction } from "express";
import {
  applyToJob,
  getCandidateApplications,
  getApplicationsForJob,
  updateApplicationStatus,
} from "../services/application.service";
import { AppError } from "../utils/error";
import {
  applicationType,
  updateApplicationStatusType,
} from "../validator/application.validator";

function parseId(raw: string, label: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(400, `Invalid ${label}`);
  }
  return id;
}

export async function handleApplyToJob(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await applyToJob(req.user!.id, req.body as applicationType);
    return res.status(201).json(result);
  } catch (err) {
    return next(err);
  }
}

export async function handleGetMyApplications(req: Request, res: Response, next: NextFunction) {
  try {
    const applications = await getCandidateApplications(req.user!.id);
    return res.json({ applications });
  } catch (err) {
    return next(err);
  }
}

export async function handleGetJobApplications(req: Request, res: Response, next: NextFunction) {
  try {
    const jobId = parseId(String(req.params.jobId), "job ID");
    const applications = await getApplicationsForJob(jobId, req.user!.id);
    return res.json({ applications });
  } catch (err) {
    return next(err);
  }
}

export async function handleUpdateApplicationStatus(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const applicationId = parseId(String(req.params.id), "application ID");
    const { status } = req.body as updateApplicationStatusType;
    const updated = await updateApplicationStatus(applicationId, req.user!.id, status);
    return res.json({ application: updated });
  } catch (err) {
    return next(err);
  }
}