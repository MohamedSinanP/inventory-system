import { NextFunction, Request, Response } from "express"
export default interface IAuthController {
  signupUser(req: Request, res: Response, next: NextFunction): Promise<void>;
  login(req: Request, res: Response, next: NextFunction): Promise<void>;
  logout(req: Request, res: Response, next: NextFunction): Promise<void>;
  rotateRefreshToken(req: Request, res: Response, next: NextFunction): Promise<void>;
}