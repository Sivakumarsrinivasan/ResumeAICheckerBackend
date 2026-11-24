import "dotenv/config"
import express from "express"
import cors from "cors";
import {prisma} from './lib/prisma'
import {errorMiddleware} from "./middleware/error.middleware"
import {validateBody} from "./middleware/validator.middleware"
import {loginSchema,registerSchema} from "./validator/auth.validator"
import {handleLogin,handleRegister} from "./controller/auth.controller"
import jobrouter from "./routers/job.router";
import applicationrouter from "./routers/application.router";
const app = express();

app.use(cors())
app.use(express.json());

app.get('/api/health',async(req,res)=>{
try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Database unreachable" });
  }
})
app.post('/auth/register',validateBody(registerSchema), handleRegister)
app.post('/auth/login',validateBody(loginSchema), handleLogin)
app.use('/job',jobrouter)
app.use('/application',applicationrouter)
app.use(errorMiddleware)
export default app