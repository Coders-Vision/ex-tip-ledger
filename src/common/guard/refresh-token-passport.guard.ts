import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RefreshTokenPassportGuard extends AuthGuard('jwt-refresh') {}