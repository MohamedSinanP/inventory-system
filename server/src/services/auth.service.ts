import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import IAuthService from "../interfaces/services/auth.service";
import { AuthDTO, IUser } from "../types/user";
import IUserRepository from "../interfaces/repositories/user.repository"
import { HttpError } from "../utils/http.error";
import { StatusCode } from "../types/type";
import { IJwtService } from "../utils/jwt";
import UserRepository from "../repositories/user.repository";
import JwtServie from "../utils/jwt";
import { Request, Response } from "express";

const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

class AuthService implements IAuthService {
  constructor(
    private _userRepository: IUserRepository,
    private _jwtService: IJwtService
  ) { };
  async userSignup(data: IUser): Promise<AuthDTO> {
    const existingUser = await this._userRepository.findOne({ email: data.email });
    if (existingUser) {
      throw new HttpError(StatusCode.BAD_REQUEST, "User with this email already exists.");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const userToCreate = { ...data, password: hashedPassword };
    const newUser = await this._userRepository.create(userToCreate);

    if (!newUser) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Signup failed.");
    }

    const accessToken = this._jwtService.generateAccessToken(newUser.id, newUser.role);
    const refreshToken = this._jwtService.generateRefreshToken(newUser.id, newUser.role);

    await this._userRepository.update(newUser.id, { refreshToken });

    return {
      email: newUser.email,
      role: newUser.role,
      refreshToken,
      accessToken
    };
  }

  async login(email: string, password: string): Promise<AuthDTO> {
    if (!email?.trim() || !password?.trim()) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Email and password are required.");
    }

    const user = await this._userRepository.findOne({ email: email.trim() });
    if (!user) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Invalid email or password.");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Invalid email or password.");
    }

    const accessToken = this._jwtService.generateAccessToken(user.id, user.role);
    const refreshToken = this._jwtService.generateRefreshToken(user.id, user.role);

    await this._userRepository.update(user.id, { refreshToken });

    return {
      email: user.email,
      role: user.role,
      accessToken,
      refreshToken
    };
  }

  async rotateRefreshToken(refreshToken: string): Promise<{ newAccessToken: string; newRefreshToken: string; }> {
    if (!refreshToken) {
      throw new HttpError(401, "No refresh token provided");
    }

    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, REFRESH_SECRET!);
    } catch (err) {
      throw new HttpError(StatusCode.FORBIDDEN, "Invalid or malformed refresh token");
    }

    if (
      !decoded ||
      typeof decoded !== "object" ||
      !("userId" in decoded) ||
      typeof decoded.userId !== "string"
    ) {
      throw new HttpError(StatusCode.FORBIDDEN, "Invalid or malformed refresh token");
    }

    const { userId } = decoded;

    const user = await this._userRepository.findById(userId);

    if (!user || user.refreshToken !== refreshToken) {
      throw new HttpError(StatusCode.FORBIDDEN, "Invalid or expired refresh token");
    }

    const newAccessToken = this._jwtService.generateAccessToken(String(user._id), user.role);
    const newRefreshToken = this._jwtService.generateRefreshToken(String(user._id), user.role);

    await this._userRepository.update(String(user._id), { refreshToken: newRefreshToken });

    return {
      newAccessToken,
      newRefreshToken
    };
  }

  async logout(req: Request, res: Response): Promise<void> {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new HttpError(StatusCode.BAD_REQUEST, "No refresh token found");
    }

    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, REFRESH_SECRET!);
    } catch (err) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "strict"
      });
      throw new HttpError(StatusCode.FORBIDDEN, "Invalid refresh token");
    }

    const { userId } = decoded;

    const user = await this._userRepository.findById(userId);
    if (!user) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "strict"
      });
      throw new HttpError(StatusCode.NOT_FOUND, "User not found");
    }

    // Set refreshToken to null in DB
    await this._userRepository.update(user.id, { refreshToken: null });

    // Clear cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict"
    });
  }

}


export default new AuthService(UserRepository, JwtServie);