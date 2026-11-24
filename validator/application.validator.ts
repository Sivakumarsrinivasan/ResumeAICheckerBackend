import {z} from "zod"
import {ApplicationStatus} from '../generated/prisma/client'
export const applicationValidator = z.object({
    jobId:z.coerce.number().int().positive("valid id is required"),
    resumeUrl:z.string().trim().url("valid url is required").optional(),
    resumeText: z
    .string()
    .trim()
    .min(30, "Resume text must be at least 30 characters for AI evaluation"),
})

export const updateApplicationStatusSchema = z.object({
  status: z.nativeEnum(ApplicationStatus),
});

export type applicationType = z.infer<typeof applicationValidator>
export type updateApplicationStatusType = z.infer<typeof updateApplicationStatusSchema>