import jwt from "jsonwebtoken";


export interface IJwtService {
  generateAccessToken(usreId: string, role: string): string;
  generateRefreshToken(userId: string, role: string): string;
  verifyAccessToken(token: string): { userId: string, role: string };
  verifyRefreshToken(token: string): void;
}

class JwtService implements IJwtService {
  private readonly accessTokenSecret = process.env.JWT_ACCESS_SECRET as string;
  private readonly refreshTokenSecret = process.env.JWT_REFRESH_SECRET as string;

  generateAccessToken(userId: string, role: string): string {
    return jwt.sign({ userId, role }, this.accessTokenSecret, { expiresIn: "15m" });
  }

  generateRefreshToken(userId: string, role: string): string {
    return jwt.sign({ userId, role }, this.refreshTokenSecret, { expiresIn: "7d" });
  }

  verifyAccessToken(token: string): { userId: string; role: string } {
    try {
      return jwt.verify(token, this.accessTokenSecret) as { userId: string; role: string };
    } catch (error) {
      throw new Error("Invalid access token");
    }
  }

  verifyRefreshToken(token: string): { userId: string; role: string } {
    try {
      return jwt.verify(token, this.refreshTokenSecret) as { userId: string; role: string };
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
  }
}

export default new JwtService();