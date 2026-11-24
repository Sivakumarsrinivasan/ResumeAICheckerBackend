import { Request, Response, NextFunction } from "express";
import { registerServices, loginService } from "../services/auth.service";
import { loginType, registerType } from "../validator/auth.validator";

export async function handleRegister(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await registerServices(req.body as registerType);
    return res.status(201).json(result);
  } catch (err) {
   
     next(err);
  }
}

export async function handleLogin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await loginService(req.body as loginType);
    return res.json(result);
  } catch (err) {

     next(err);
  }
}