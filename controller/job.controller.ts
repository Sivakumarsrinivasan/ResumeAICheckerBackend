import {NextFunction, Request,Response} from "express";
import {ZodError} from "zod";
import {getAllJobs, getJobById, createJob, updateJob, deleteJob} from "../services/job.service";
import { JobStatus } from "../generated/prisma/enums";
import { AppError } from "../utils/error";

function parseJobId(rawId:string):number | null{
const id = Number(rawId);
if(Number.isInteger(id) || id<=0){
    return null
}
return id;
}

export async function listJobsController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const status =
            typeof req.query.status === "string"
                ? req.query.status
                : "OPEN";

        const search =
            typeof req.query.search === "string"
                ? req.query.search
                : "";

        // Validate status
        if (!Object.values(JobStatus).includes(status as JobStatus)) {
            throw new AppError(400, "Invalid job status");
        }

        const jobs = await getAllJobs({
            search,
            status: status as JobStatus,

        });

        res.status(200).json({
            success: true,
            data: jobs,
        });
    } catch (e) {
        next(e);
    }
}

export async function getJobController(req: Request, res: Response, next: NextFunction) {
    try {
        const jobId = parseJobId(String(req.params.id))
        if (!jobId) {
            throw new AppError(404, 'Job id is invalid')
        }
        const job = await getJobById(jobId);
        if (!job) {
            throw new AppError(404, "Job is not found")
        }
        return res.status(200).json({
            message: 'Fetched successfully',
            result: job
        })
    } catch (e) {
        next(e)
    }
}
export async function createJobController(req: Request, res: Response) {
  try {
    const recruiterId = (req as Request & { user?: { id: number } }).user?.id;
    if (!recruiterId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const job = await createJob({
      ...req.body,
      recruiterId,
    });

    return res.status(201).json({ job });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({ message: "Validation failed", issues: error.issues });
    }
    console.error("Error creating job:", error);
    return res.status(500).json({ message: "Failed to create job" });
  }
}

export async function updateJobController(req: Request, res: Response) {
  try {
    const jobId = parseJobId(String(req.params.id));
    if (!jobId) {
      return res.status(400).json({ message: "Invalid job ID" });
    }

    const job = await updateJob(jobId, req.body);
    return res.status(200).json({ job });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({ message: "Validation failed", issues: error.issues });
    }
    if (error?.code === "P2025") {
      return res.status(404).json({ message: "Job not found" });
    }
    console.error("Error updating job:", error);
    return res.status(500).json({ message: "Failed to update job" });
  }
}

export async function deleteJobController(req: Request, res: Response) {
  try {
    const jobId = parseJobId(String(req.params.id));
    if (!jobId) {
      return res.status(400).json({ message: "Invalid job ID" });
    }

    await deleteJob(jobId);
    return res.status(200).json({ message: "Job deleted successfully" });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return res.status(404).json({ message: "Job not found" });
    }
    console.error("Error deleting job:", error);
    return res.status(500).json({ message: "Failed to delete job" });
  }
}