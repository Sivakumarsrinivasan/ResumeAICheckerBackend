import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {registerType,loginType} from "../validator/auth.validator"
import {prisma} from "../lib/prisma"
import {Role} from "../generated/prisma/client"
import {mail} from "../utils/reusable"
import {AppError} from "../utils/error"
export const registerServices = async(input:registerType) =>{
const existing = await prisma.user.findMany({
    where:{
        email:mail(input.email)
    }
}) 

if(existing.length>0){
    throw new AppError(409,'User already exist')
}
const hashPassword = await bcrypt.hash(input.password,10);
await prisma.user.create({
    data:{
        email:mail(input.email),
        name:input.name,
        passwordHash:hashPassword,
        role:  Role.CANDIDATE,
    },
    select:{
        id:true,
        name:true,
        email:true,
        createdAt:true
    }
})
}

export const loginService = async(login:loginType) =>{
    const existing = await prisma.user.findMany({where:{
        email:mail(login.email)
    }})
    if(existing.length == 0){
        throw new AppError(401,'User not found please login with correct credentials')
    }
    const checkPassword = await bcrypt.compare(login.password,existing[0]?.passwordHash ?? '');
if(!checkPassword){
        throw new AppError(422,'password mismatched')

}
const token = jwt.sign({email:existing[0]?.email,id:existing[0]?.id,name:existing[0]?.name },process.env.SECRET!,{expiresIn:'1hr'})
return {
    token
}
}