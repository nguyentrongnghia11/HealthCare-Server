import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus, Patch, UseGuards, Req } from '@nestjs/common';
import { CycleService } from './cycle.service';
import { LogPeriodDto } from './dto/log-period.dto';
import { LogSymptomDto } from './dto/log-symptom.dto';
import { UpdateCycleSettingsDto } from './dto/update-cycle-settings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Import Guard

// MOCK_USER_ID đã bị loại bỏ

@Controller('cycle')
export class CycleController {
  constructor(private readonly cycleService: CycleService) {}

  /**
   * Helper function to get userId from token payload
   */
  private getUserId(req: any): string | null {
    // Trích xuất userId từ các trường phổ biến trong JWT payload
    return req?.user?.sub || req?.user?._id || req?.user?.id || req?.user?.userId || null;
  }

  /**
   * [POST] /cycle/period
   * Ghi lại ngày bắt đầu/kết thúc kỳ kinh.
   */
  @Post('period')
  @UseGuards(JwtAuthGuard) // Áp dụng bảo vệ
  @HttpCode(HttpStatus.CREATED)
  async logPeriod(@Body() logPeriodDto: LogPeriodDto, @Req() req: any) { // Thêm @Req() req: any
    const userId = this.getUserId(req);
    if (!userId) {
      return { message: 'Authentication required.' };
    }
    const log = await this.cycleService.logNewPeriod(userId, logPeriodDto);
    return { 
        message: 'Period logged successfully.',
        data: log
    };
  }

  /**
   * [GET] /cycle/status
   * Lấy trạng thái chu kỳ hiện tại (dự đoán).
   */
  @Get('status')
  @UseGuards(JwtAuthGuard) // Áp dụng bảo vệ
  async getCycleStatus(@Req() req: any) { // Thêm @Req() req: any
    const userId = this.getUserId(req);
    if (!userId) {
      return { message: 'Authentication required.' };
    }
    
    const latestLog = await this.cycleService.getLatestCycleLog(userId);

    // TRẢ VỀ CẤU TRÚC ĐÚNG:
    return { 
        message: 'Cycle status retrieved.',
        // Cấu trúc CycleStatusResponse:
        latestLog: latestLog ? { 
             id: latestLog.id, 
             startDate: latestLog.startDate.toISOString(),
             endDate: latestLog.endDate ? latestLog.endDate.toISOString() : null,
             periodLength: latestLog.periodLength,
        } : null,
        summary: {
            currentPhase: 'Mock Phase',
            isOvulationWindow: false,
            daysToNextPeriod: 12,
            estimatedOvulationDate: null, 
        }
    };
  }
  
  /**
   * [POST] /cycle/symptom
   * Ghi lại triệu chứng/tâm trạng hàng ngày.
   */
  @Post('symptom')
  @UseGuards(JwtAuthGuard) // Áp dụng bảo vệ
  @HttpCode(HttpStatus.CREATED)
  async logSymptom(@Body() logSymptomDto: LogSymptomDto, @Req() req: any) { // Thêm @Req() req: any
    const userId = this.getUserId(req);
    if (!userId) {
      return { message: 'Authentication required.' };
    }
    const entry = await this.cycleService.logDailySymptom(userId, logSymptomDto);
    return { 
        message: 'Symptom logged successfully.',
        data: entry
    };
  }

  /**
   * [GET] /cycle/symptoms
   * Lấy triệu chứng đã ghi cho một ngày cụ thể.
   */
  @Get('symptoms')
  @UseGuards(JwtAuthGuard) // Áp dụng bảo vệ
  async getDaySymptoms(@Query('date') dateString: string, @Req() req: any) { // Thêm @Req() req: any
    const userId = this.getUserId(req);
    if (!userId) {
      return { message: 'Authentication required.' };
    }
    const date = new Date(dateString);
    const symptoms = await this.cycleService.getSymptomsForDay(userId, date);
    return { 
        message: 'Symptoms retrieved.',
        data: symptoms 
    };
  }

  /**
   * [PATCH] /cycle/settings
   * Cập nhật cài đặt chu kỳ.
   */
  @Patch('settings')
  @UseGuards(JwtAuthGuard) // Áp dụng bảo vệ
  async updateSettings(@Body() settingsDto: UpdateCycleSettingsDto, @Req() req: any) { // Thêm @Req() req: any
    const userId = this.getUserId(req);
    if (!userId) {
      return { message: 'Authentication required.' };
    }
    // ⚠️ Logic sẽ cập nhật tài liệu User hoặc tài liệu CycleSettings riêng
    return { 
        message: 'Cycle settings updated successfully.', 
        settings: settingsDto 
    };
  }
}
