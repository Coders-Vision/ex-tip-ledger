import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { EmployeeTipsDto, ParamEmployeeDto, EmployeeListResponseDto } from './dto';

@ApiTags('Employees')
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all employees' })
  @ApiQuery({
    name: 'merchantId',
    required: false,
    description: 'Filter by merchant ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'List of employees retrieved successfully',
    type: EmployeeListResponseDto,
  })
  async findAll(
    @Query('merchantId') merchantId?: string,
  ): Promise<EmployeeListResponseDto> {
    if (merchantId) {
      return this.employeesService.findByMerchantId(merchantId);
    }
    return this.employeesService.findAll();
  }

  @Get(':id/tips')
  @ApiOperation({ summary: 'Get ledger entries and total tips for an employee' })
  @ApiParam({
    name: 'id',
    description: 'Employee UUID',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Employee tips retrieved successfully',
    type: EmployeeTipsDto,
  })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async getEmployeeTips(@Param() params: ParamEmployeeDto): Promise<EmployeeTipsDto> {
    return this.employeesService.getEmployeeTips(params.id);
  }
}
