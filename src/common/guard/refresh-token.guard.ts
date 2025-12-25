import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  private jwtService: JwtService;

  constructor(private readonly configService: ConfigService) {
    // Manually instantiate JwtService with options
    this.jwtService = new JwtService({
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const refreshToken = this.extractTokenFromCookie(request);
    if (!refreshToken) throw new UnauthorizedException('Invalid Refresh Token');
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
      request['user'] = payload;
    } catch (err) {
      throw new UnauthorizedException('Invalid Refresh Token');
    }

    return true;
  }

  private extractTokenFromCookie(request: Request) {
    const refreshToken = request.cookies?.refreshToken;
    return refreshToken ? refreshToken : undefined;
  }
}
