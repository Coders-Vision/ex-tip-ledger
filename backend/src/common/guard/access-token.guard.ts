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
export class AccessTokenGuard implements CanActivate {
  private jwtService: JwtService;

  constructor(private readonly configService: ConfigService) {
    // Manually instantiate JwtService with options
    this.jwtService = new JwtService({
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
    });
  }
  // From Header

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) throw new UnauthorizedException();

    try {
      const payload = await this.jwtService.verifyAsync(token);
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request) {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  //From Cookie

  // async canActivate(context: ExecutionContext): Promise<boolean> {
  //   const request = context.switchToHttp().getRequest<Request>();
  //   const accessToken = this.extractTokenFromCookie(request);

  //   if (!accessToken) throw new UnauthorizedException();

  //   try {
  //     const payload = await this.jwtService.verifyAsync(accessToken, {
  //       secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
  //     });
  //     request['user'] = payload;
  //   } catch (err) {
  //     throw new UnauthorizedException('Invalid Access Token');
  //   }

  //   return true;
  // }

  // private extractTokenFromCookie(request: Request) {
  //   const accessToken = request.cookies?.accessToken;
  //   return accessToken ? accessToken : undefined;
  // }
}
