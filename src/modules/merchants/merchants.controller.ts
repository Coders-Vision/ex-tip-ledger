import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { MerchantsService } from './merchants.service';
import { MerchantTipSummaryDto, ParamMerchantDto, MerchantListResponseDto } from './dto';

@ApiTags('Merchants')
@Controller('merchants')
export class MerchantsController {
  constructor(private readonly merchantsService: MerchantsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all merchants' })
  @ApiResponse({
    status: 200,
    description: 'List of merchants retrieved successfully',
    type: MerchantListResponseDto,
  })
  async findAll(): Promise<MerchantListResponseDto> {
    return this.merchantsService.findAll();
  }

  @Get(':id/tips/summary')
  @ApiOperation({ summary: 'Get tip summary for a merchant grouped by status' })
  @ApiParam({
    name: 'id',
    description: 'Merchant UUID',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Tip summary retrieved successfully',
    type: MerchantTipSummaryDto,
  })
  @ApiResponse({ status: 404, description: 'Merchant not found' })
  async getTipSummary(
    @Param() params: ParamMerchantDto,
  ): Promise<MerchantTipSummaryDto> {
    return this.merchantsService.getTipSummary(params.id);
  }
}
