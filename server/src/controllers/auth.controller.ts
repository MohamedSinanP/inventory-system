import { Request, Response, NextFunction } from "express";
import IAuthController from "../interfaces/controllers/auth.controller";
import IAuthService from "../interfaces/services/auth.service";
import { IUser } from "../types/user";
import { HttpError } from "../utils/http.error";
import { StatusCode } from "../types/type";
import { HttpResponse } from "../utils/http.response";
import AuthService from "../services/auth.service";

class AuthController implements IAuthController {
  constructor(private _authService: IAuthService) { }

  async signupUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, role = "user" } = req.body;

      if (!email?.trim() || !password?.trim()) {
        throw new HttpError(StatusCode.BAD_REQUEST, "Missing required fields: email or password");
      }

      const userData: IUser = {
        email: email.trim(),
        password: password.trim(),
        role,
        isBlocked: false,
      };

      const createdUser = await this._authService.userSignup(userData);

      const { accessToken, refreshToken, ...user } = createdUser;

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? 'none' : 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(StatusCode.CREATED).json(
        HttpResponse.created({ ...user, accessToken }, "User registered successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      const createdUser = await this._authService.login(email, password);

      const { accessToken, refreshToken, ...user } = createdUser;

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? 'none' : 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(StatusCode.OK).json(HttpResponse.success({ ...user, accessToken }, "LoggedIn successfully."));
    } catch (error) {
      next(error);
    }
  }

  async rotateRefreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { newAccessToken, newRefreshToken } = await this._authService.rotateRefreshToken(req.cookies.refreshToken);
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? 'none' : 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.status(StatusCode.OK).json(HttpResponse.success({ newAccessToken }));
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this._authService.logout(req, res);
      res.status(StatusCode.OK).json(HttpResponse.success({}, "Logget out successfully"));
    } catch (error) {
      next(error);
    }
  }

}

export default new AuthController(AuthService);