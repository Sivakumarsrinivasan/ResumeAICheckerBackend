import {Request,Response,NextFunction} from "express"

export const errorMiddleware = (err:any,req:Request,res:Response,next:NextFunction)=>{
 const statusCode = err.statusCode || 500
 const statusMessage = err.statusMessage || "Internal server error";

 return res.status(statusCode).json({
    message:statusMessage,
    status:statusCode,
    success:false
 })
    
}