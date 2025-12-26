import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { EmployeeTipsDto, ParamEmployeeDto } from './dto';

@ApiTags('Employees')
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

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
