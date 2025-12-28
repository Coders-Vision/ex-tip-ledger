import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TableQRsService } from './table-qrs.service';
import { TableQRListResponseDto } from './dto';

@ApiTags('Table QRs')
@Controller('table-qrs')
export class TableQRsController {
  constructor(private readonly tableQRsService: TableQRsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all table QRs' })
  @ApiQuery({
    name: 'merchantId',
    required: false,
    description: 'Filter by merchant ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'List of table QRs retrieved successfully',
    type: TableQRListResponseDto,
  })
  async findAll(
    @Query('merchantId') merchantId?: string,
  ): Promise<TableQRListResponseDto> {
    if (merchantId) {
      return this.tableQRsService.findByMerchantId(merchantId);
    }
    return this.tableQRsService.findAll();
  }
}
