import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LedgerEntry, Employee } from 'src/common/database/type-orm/entities';
import { EmployeeTipsDto, EmployeeListResponseDto, EmployeeResponseDto } from './dto';
import { BaseRepository } from 'src/common/database/type-orm/repositories';

@Injectable()
export class EmployeesService {
  private readonly logger = new Logger(EmployeesService.name);
  constructor(
    @InjectRepository(LedgerEntry)
    private readonly ledgerRepo: BaseRepository<LedgerEntry>,
    @InjectRepository(Employee)
    private readonly employeeRepo: BaseRepository<Employee>,
  ) { }

  /**
   * Get ledger entries and total for an employee
   */
  async getEmployeeTips(employeeId: string): Promise<EmployeeTipsDto> {
  
    // Verify employee exists
    const employee = await this.employeeRepo.findOne({
      where: { id: employeeId },
    });

    if (!employee) {
      this.logger.warn(`Employee with ID '${employeeId}' not found`);
      throw new NotFoundException(`Employee with ID '${employeeId}' not found`);
    }

    // Get ledger entries ordered by creation date (newest first)
    const entries = await this.ledgerRepo.find({
      where: { employeeId },
      order: { createdAt: 'DESC' },
    });

    // Calculate total amount (sum of all entries including negative DEBIT amounts)
    const totalAmount = entries.reduce(
      (sum, entry) => sum + Number(entry.amount),
      0,
    );

    return {
      employeeId,
      entries,
      totalAmount: Math.round(totalAmount * 1000) / 1000, // Round to 3 decimal places
    };
  }

  /**
   * Find an employee by ID
   */
  async findById(id: string): Promise<Employee | null> {
    return this.employeeRepo.findOne({ where: { id } });
  }

  /**
   * Find an employee by user ID
   */
  async findByUserId(userId: string): Promise<Employee | null> {
    return this.employeeRepo.findOne({ where: { userId } });
  }

  /**
   * Create a new employee
   */
  async create(data: Partial<Employee>): Promise<Employee> {
    return this.employeeRepo.save(data);
  }

  /**
   * Get all employees
   */
  async findAll(): Promise<EmployeeListResponseDto> {
    const [employees, total] = await this.employeeRepo.findAndCount({
      order: { createdAt: 'DESC' },
    });

    return {
      employees: employees.map((employee) => this.mapToResponse(employee)),
      total,
    };
  }

  /**
   * Get all employees for a specific merchant
   */
  async findByMerchantId(merchantId: string): Promise<EmployeeListResponseDto> {
    const [employees, total] = await this.employeeRepo.findAndCount({
      where: { merchantId },
      order: { createdAt: 'DESC' },
    });

    return {
      employees: employees.map((employee) => this.mapToResponse(employee)),
      total,
    };
  }

  /**
   * Map entity to response DTO
   */
  private mapToResponse(employee: Employee): EmployeeResponseDto {
    return {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      active: employee.active,
      merchantId: employee.merchantId,
      userId: employee.userId,
      createdAt: employee.createdAt,
    };
  }
}
