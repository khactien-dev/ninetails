import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { IJwtPayload, IJwtRefreshToken } from '../payloads/jwt-payload.payload';
@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  async createLoginToken(user: IJwtPayload, opLogin = false) {
    const accessTokenPayload = { ...user };
    const refreshTokenPayload: IJwtRefreshToken = { id: user.id };

    const accessTokenOptions: JwtSignOptions = {
      expiresIn: process.env.COMMON_API_JWT_EXPIRES_IN,
      secret: process.env.COMMON_API_JWT_SECRET,
    };
    const refreshTokenOptions: JwtSignOptions = {
      expiresIn: process.env.COMMON_API_JWT_REFRESH_TOKEN_EXPIRES_IN,
      secret: process.env.COMMON_API_JWT_SECRET,
    };
    if (opLogin) refreshTokenPayload.opLogin = true;
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessTokenPayload, accessTokenOptions),
      this.jwtService.signAsync(refreshTokenPayload, refreshTokenOptions),
    ]);

    const time = new Date();

    const expired_access = new Date(
      +time.getTime() + +accessTokenOptions.expiresIn,
    );
    const expired_refresh = new Date(
      +time.getTime() + +refreshTokenOptions.expiresIn,
    );

    return {
      accessToken,
      refreshToken,
      expired_access,
      expired_refresh,
    };
  }

  async createChangePasswordToken(data: { id: number; email: string }) {
    const accessTokenPayload = data;
    const accessTokenOptions: JwtSignOptions = {
      expiresIn: 900, //15 minutes
      secret: process.env.COMMON_API_JWT_SECRET,
    };
    const [accessToken] = await Promise.all([
      this.jwtService.signAsync({ ...accessTokenPayload }, accessTokenOptions),
    ]);

    return accessToken;
  }

  async getUserFromToken(token: string) {
    try {
      const decoded = this.jwtService.decode(token) as any;
      return { ...decoded };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async verifyToken(refreshToken: string) {
    return await this.jwtService.verify(refreshToken, {
      secret: process.env.COMMON_API_JWT_SECRET,
    });
  }
}
