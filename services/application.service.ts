import {prisma} from "../lib/prisma"
import { AppError } from "../utils/error";
import { applicationType } from "../validator/application.validator";
import {JobStatus, ApplicationStatus} from "../generated/prisma/client"
import { resumeChecker } from "./ai.service";
export async function applyToJob(candidateId:number,input:applicationType){
const job = await prisma.job.findMany({
    where:{
        id:input.jobId
    }
})
if(job.length == 0){
    throw new AppError(404,'Job is not found')
}
if(job[0]?.status != JobStatus.OPEN){
        throw new AppError(400,'This job is no longer accepting applications')

}
const existing = await prisma.application.findUnique({
    where:{
        jobId_candidateId:{
            jobId:input.jobId,
            candidateId
        }
    }
})
if(existing){
    throw new AppError(409,"You have already applied for this job")
}
const aiResult = await resumeChecker({jobTitle:job[0].title,jobDescription:job[0].description,resumeText:input.resumeText,skills:job[0].skills,yearsofexperience:job[0].experienceMin})
const applicaton = await prisma.application.create({
    data:{
       jobId:input.jobId,
       candidateId:candidateId,
       resumeUrl:input.resumeUrl ?? '',
       resumeText:input.resumeText,
       aimatchscore:aiResult.score,
       status: ApplicationStatus.IN_PROGRESS
    }
})
}

export async function getCandidateApplications(candidateId: number) {
  return prisma.application.findMany({
    where: { candidateId },
    orderBy: { appliedate: "desc" },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          company: true,
          location: true,
          status: true,
        },
      },
    },
  });
}

export async function getApplicationsForJob(jobId:number,recruiterId:number){
const result = await prisma.application.findUnique({
    where:{
    id:jobId
}})
if(!result){
    throw new AppError(404,"Job not found")
}
if(result.candidateId!=recruiterId){
        throw new AppError(403,"You can view only your application")

}
return prisma.application.findMany({
    where: { jobId },
    orderBy: [{ aimatchscore: "desc" }, { appliedate: "desc" }],
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}

export async function updateApplicationStatus(applicationId:number,recruiterId:number,status:ApplicationStatus){
 const check = await prisma.application.findUnique({
    where:{
        id:applicationId,
    },
    include:{job:true}
 })  
 if(!check){
        throw new AppError(404,"Job not found")

 } 
 if(check.job.recruiterId != recruiterId){
            throw new AppError(403,"You can view only your application")

 }
 return prisma.application.update({
    where: { id: applicationId },
    data: { status },
  });
}