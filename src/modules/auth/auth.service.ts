import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from '../users/users.service';
import { TokenService } from './token.service';
import { RegisterDto, LoginDto, AuthResponseDto, RefreshResponseDto } from './dto';
import { UserRole } from 'src/common/database/type-orm/entities';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 10;

  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    // Check if user already exists
    const existingUser = await this.userService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

    // Create user (UserService handles role validation and Merchant/Employee creation)
    const user = await this.userService.create(
      {
        email: dto.email,
        name: dto.name,
        password: dto.password,
        role: dto.role || UserRole.EMPLOYEE,
        phone: dto.phone,
        businessName: dto.businessName,
        merchantId: dto.merchantId,
      },
      hashedPassword,
    );

    // Generate tokens
    const tokens = await this.tokenService.generateTokens(
      user.id as string,
      user.email as string,
    );

    return {
      ...tokens,
      userId: user.id as string,
      email: user.email as string,
      name: user.name as string,
      role: user.role as string,
      merchantId: user.merchantId,
      employeeId: user.employeeId,
    };
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    // Find user
    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.active) {
      throw new UnauthorizedException('Account is inactive');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.tokenService.generateTokens(user.id, user.email);

    // Get merchantId or employeeId based on role
    let merchantId: string | undefined;
    let employeeId: string | undefined;

    if (user.role === UserRole.MERCHANT) {
      const merchant = await this.userService.findMerchantByUserId(user.id);
      merchantId = merchant?.id;
    } else if (user.role === UserRole.EMPLOYEE) {
      const employee = await this.userService.findEmployeeByUserId(user.id);
      employeeId = employee?.id;
    }

    return {
      ...tokens,
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      merchantId,
      employeeId,
    };
  }

  async refresh(refreshToken: string): Promise<RefreshResponseDto> {
    try {
      // Verify refresh token
      const payload = await this.tokenService.verifyRefreshToken(refreshToken);

      // Verify user still exists and is active
      const user = await this.userService.findOne(payload.sub);
      if (!user || !user.active) {
        throw new UnauthorizedException('User not found or inactive');
      }

      // Generate new access token only
      const accessToken = await this.tokenService.generateAccessToken(
        user.id,
        user.email,
      );

      return { accessToken };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
