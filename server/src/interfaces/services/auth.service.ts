import { Request, Response } from "express";
import { AuthDTO, IUser } from "../../types/user";


export default interface IAuthService {
  userSignup(data: IUser): Promise<AuthDTO>;
  rotateRefreshToken(refreshToken: string): Promise<{ newAccessToken: string; newRefreshToken: string; }>;
  login(email: string, password: string): Promise<AuthDTO>;
  logout(req: Request, res: Response): Promise<void>;
}