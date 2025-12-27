import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto, UserListResponseDto, UserResponseDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from 'src/common/database/type-orm/entities';
import { MerchantsService } from '../merchants/merchants.service';
import { EmployeesService } from '../employees/employees.service';

export interface CreateUserWithRoleDto extends CreateUserDto {
  businessName?: string;
  merchantId?: string;
}

export interface CreateUserResult {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  merchantId?: string;
  employeeId?: string;
}

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly merchantsService: MerchantsService,
    private readonly employeesService: EmployeesService,
  ) {}

  async create(
    createUserDto: CreateUserWithRoleDto,
    hashedPassword?: string,
  ): Promise<CreateUserResult> {
    const role = createUserDto.role || UserRole.EMPLOYEE;

    // Validate role-specific requirements
    if (role === UserRole.MERCHANT && !createUserDto.businessName) {
      throw new BadRequestException('businessName is required for merchant registration');
    }

    if (role === UserRole.EMPLOYEE) {
      if (!createUserDto.merchantId) {
        throw new BadRequestException('merchantId is required for employee registration');
      }
      // Verify merchant exists
      const merchant = await this.merchantsService.findById(createUserDto.merchantId);
      if (!merchant) {
        throw new NotFoundException(`Merchant with ID '${createUserDto.merchantId}' not found`);
      }
    }

    // Create user
    const userEntity = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      role,
    });
    const newUser = await this.userRepository.save(userEntity);

    // Create role-specific record and get the ID
    let merchantId: string | undefined;
    let employeeId: string | undefined;

    if (role === UserRole.MERCHANT) {
      const merchant = await this.merchantsService.create({
        name: createUserDto.businessName,
        email: createUserDto.email,
        phone: createUserDto.phone,
        userId: newUser.id as string,
        active: true,
      });
      merchantId = merchant.id;
    } else if (role === UserRole.EMPLOYEE) {
      const employee = await this.employeesService.create({
        name: createUserDto.name,
        email: createUserDto.email,
        phone: createUserDto.phone,
        userId: newUser.id as string,
        merchantId: createUserDto.merchantId,
        active: true,
      });
      employeeId = employee.id;
    }

    return {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      merchantId,
      employeeId,
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const getUser = await this.userRepository.findOne({ where: { email } });
    return getUser;
  }

  async findOne(id: string): Promise<User | null> {
    const getUser = await this.userRepository.findOne({ where: { id } });
    return getUser;
  }

  async findMerchantById(id: string) {
    return this.merchantsService.findById(id);
  }

  async findMerchantByUserId(userId: string) {
    return this.merchantsService.findByUserId(userId);
  }

  async findEmployeeByUserId(userId: string) {
    return this.employeesService.findByUserId(userId);
  }

  /**
   * Get all users
   */
  async findAll(): Promise<UserListResponseDto> {
    const [users, total] = await this.userRepository.findAndCount({
      order: { createdAt: 'DESC' },
    });

    return {
      users: users.map((user) => this.mapToResponse(user)),
      total,
    };
  }

  /**
   * Map entity to response DTO
   */
  private mapToResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      active: user.active,
      createdAt: user.createdAt,
    };
  }
}
