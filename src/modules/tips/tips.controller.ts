import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TipsService } from './tips.service';
import { CreateTipIntentDto, TipIntentResponseDto, ParamTipIntentDto } from './dto';

@ApiTags('Tips')
@Controller('tips')
export class TipsController {
  constructor(private readonly tipsService: TipsService) {}

  @Post('intents')
  @ApiOperation({ summary: 'Create a new tip intent (idempotent)' })
  @ApiResponse({
    status: 201,
    description: 'Tip intent created successfully',
    type: TipIntentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Table not found' })
  async createTipIntent(
    @Body() dto: CreateTipIntentDto,
  ): Promise<TipIntentResponseDto> {
    return this.tipsService.createTipIntent(dto);
  }

  @Post('intents/:id/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirm a tip intent (idempotent, concurrency-safe)',
  })
  @ApiParam({
    name: 'id',
    description: 'Tip Intent UUID',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Tip confirmed successfully',
    type: TipIntentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid state transition' })
  @ApiResponse({ status: 404, description: 'Tip intent not found' })
  async confirmTipIntent(
    @Param() params: ParamTipIntentDto,
  ): Promise<TipIntentResponseDto> {
    return this.tipsService.confirmTipIntent(params.id);
  }

  @Post('intents/:id/reverse')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reverse a confirmed tip (idempotent)' })
  @ApiParam({
    name: 'id',
    description: 'Tip Intent UUID',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Tip reversed successfully',
    type: TipIntentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid state transition' })
  @ApiResponse({ status: 404, description: 'Tip intent not found' })
  async reverseTipIntent(
    @Param() params: ParamTipIntentDto,
  ): Promise<TipIntentResponseDto> {
    return this.tipsService.reverseTipIntent(params.id);
  }

  @Get('intents/:id')
  @ApiOperation({ summary: 'Get a tip intent by ID' })
  @ApiParam({
    name: 'id',
    description: 'Tip Intent UUID',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Tip intent found',
    type: TipIntentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tip intent not found' })
  async getTipIntent(@Param() params: ParamTipIntentDto): Promise<TipIntentResponseDto> {
    return this.tipsService.getTipIntent(params.id);
  }
}
