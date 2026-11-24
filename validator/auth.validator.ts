import {z} from "zod"
import { Role } from "../generated/prisma/client";
export const registerSchema = z.object({
name:z.string().trim().min(2,"name should above length 2"),
email:z.string().trim().min(0,"email should required").email("Invalid email address"),
role: z.nativeEnum(Role).optional(),
password:z.string().trim().min(6, "Password must be at least 6 characters")
})

export const loginSchema = z.object({
    email: z.string().trim().min(0,"email should required").email("email shoud be in correct format"),
    password:z.string().trim().min(6, "Password must be at least 6 characters")

})

export type registerType = z.infer<typeof registerSchema>
export type loginType = z.infer<typeof loginSchema>