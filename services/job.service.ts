import {Redis1} from "../lib/reddis";
import {prisma} from "../lib/prisma"
import { JobStatus } from "../generated/prisma/enums";

export interface CreateJobInput {
  recruiterId: number;
  title: string;
  company?: string | null;
  location?: string | null;
  experienceMin?: number | null;
  experienceMax?: number | null;
  skills?: string | null;
  description?: string | null;
  status?: string | null;
}

export interface UpdateJobInput {
  title?: string | null;
  company?: string | null;
  location?: string | null;
  experienceMin?: number | null;
  experienceMax?: number | null;
  skills?: string | null;
  description?: string | null;
  status?: string | null;
}

const JOB_LIST_PREFIX = "jobs:list";
const JOB_DETAILS = "job:detail";
const DEFAULT_TTL_SECONDS = 300

function BuildJobListKeys(filter:{search:string,status:JobStatus}){
const statusPart = (filter?.search ?? "").trim().toLowerCase();
const searchPart = filter?.status ?? ""
return `${JOB_LIST_PREFIX}${statusPart}${searchPart}`
}

async function invalidateJobKey(jobId?:number){
try{
const deletedKey = [];
let cursor: string | number = "0";

do{
const [nextCursor,keys]:any = await Redis1?.scan(cursor,{
    count:100,
    match:`${JOB_LIST_PREFIX}*`
})
deletedKey.push(...keys)
cursor = nextCursor
}while(String(cursor)!=="0")

    if(typeof jobId == "number"){
        await Redis1?.del(`${JOB_DETAILS}${jobId}`)
    }
if(deletedKey.length>0){
    await Redis1?.del(...deletedKey)
}

}catch(e){

}
}

export async function getAllJobs(filters:{search:string,status:JobStatus}){
    const cachKey = BuildJobListKeys(filters)
    const chachedJob = await Redis1?.get(cachKey);
    if(chachedJob){
        return chachedJob
    }

const jobs = await prisma.job.findMany({
    where: {
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.search
        ? {
            OR: [
              { title: { contains: filters.search } },
              { description: { contains: filters.search } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });
  await Redis1?.set(cachKey,jobs,{ex:DEFAULT_TTL_SECONDS});
  return jobs
}

export async function getJobById(jobId:number){
    if(!Redis1) return
const cachedJob = await Redis1.get(`${JOB_DETAILS}${jobId}`)
if (cachedJob) {
        return cachedJob;
      }

const job = await prisma.job.findUnique({
    where:{id:jobId}
})
await Redis1.set(`${JOB_DETAILS}${jobId}`,job,{ex:DEFAULT_TTL_SECONDS});
return job
    }

export async function createJob(input: CreateJobInput) {
  const createdJob = await prisma.job.create({
    data: {
      recruiterId: input.recruiterId,
      title: input.title.trim(),
      ...(input.company !== undefined
        ? { company: input.company ? input.company.trim() : null }
        : {}),
      ...(input.location !== undefined
        ? { location: input.location ? input.location.trim() : null }
        : {}),
      ...(input.experienceMin !== undefined ? { experienceMin: input.experienceMin } : {}),
      ...(input.experienceMax !== undefined ? { experienceMax: input.experienceMax } : {}),
      ...(input.skills !== undefined
        ? { skills: input.skills ? input.skills.trim() : null }
        : {}),
      ...(input.description !== undefined
        ? { description: input.description ? input.description.trim() : null }
        : {}),
      ...(input.status !== undefined ? { status: input.status as never } : {}),
    },
  });

  await invalidateJobKey();
  return createdJob;
}
export async function updateJob(jobId: number, input: UpdateJobInput) {
  const updatedJob = await prisma.job.update({
    where: { id: jobId },
    data: {
      ...(input.title !== undefined && input.title !== null
        ? { title: input.title.trim() }
        : {}),
      ...(input.company !== undefined
        ? { company: input.company ? input.company.trim() : null }
        : {}),
      ...(input.location !== undefined
        ? { location: input.location ? input.location.trim() : null }
        : {}),
      ...(input.experienceMin !== undefined ? { experienceMin: input.experienceMin } : {}),
      ...(input.experienceMax !== undefined ? { experienceMax: input.experienceMax } : {}),
      ...(input.skills !== undefined
        ? { skills: input.skills ? input.skills.trim() : null }
        : {}),
      ...(input.description !== undefined
        ? { description: input.description ? input.description.trim() : null }
        : {}),
      ...(input.status !== undefined ? { status: input.status as never } : {}),
    },
  });

  await invalidateJobKey(jobId);
  return updatedJob;
}

export async function deleteJob(jobId: number) {
  const deletedJob = await prisma.job.delete({
    where: { id: jobId },
  });

  await invalidateJobKey(jobId);
  return deletedJob;
}