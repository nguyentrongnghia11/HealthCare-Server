import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus, Patch, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { CycleService } from './cycle.service';
import { LogPeriodDto } from './dto/log-period.dto';
import { LogSymptomDto } from './dto/log-symptom.dto';
import { UpdateCycleSettingsDto } from './dto/update-cycle-settings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserService } from '../user/user.service';

@Controller('cycle')
export class CycleController {
  constructor(
    private readonly cycleService: CycleService,
    private readonly userService: UserService
  ) {}

  /**
   * [POST] /cycle/period
   * Ghi lại ngày bắt đầu/kết thúc kỳ kinh.
   */
  @Post('period')
  @UseGuards(JwtAuthGuard)
  async logPeriod(@Body() logPeriodDto: LogPeriodDto, @Req() req: any) {
    const email = req?.user?.email;
    if (!email) throw new BadRequestException('Cannot determine user email from token');

    const user = await this.userService.findOneByEmail(email);
    if (!user) throw new BadRequestException('User not found');

    const log = await this.cycleService.logNewPeriod(user._id.toString(), logPeriodDto);
    console.log("log ", log);
    return { 
        message: 'Period logged successfully.',
        data: log
    };
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  async getCycleStatus(@Req() req: any) {
    const email = req?.user?.email;
    if (!email) throw new BadRequestException('Cannot determine user email from token');

    const user = await this.userService.findOneByEmail(email);
    if (!user) throw new BadRequestException('User not found');
    
    const latestLog = await this.cycleService.getLatestCycleLog(user._id.toString());

    return { 
        message: 'Cycle status retrieved.',
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
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async logSymptom(@Body() logSymptomDto: LogSymptomDto, @Req() req: any) {
    const email = req?.user?.email;
    if (!email) throw new BadRequestException('Cannot determine user email from token');

    const user = await this.userService.findOneByEmail(email);
    if (!user) throw new BadRequestException('User not found');

    const entry = await this.cycleService.logDailySymptom(user._id.toString(), logSymptomDto);
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
  @UseGuards(JwtAuthGuard)
  async getDaySymptoms(@Query('date') dateString: string, @Req() req: any) {
    const email = req?.user?.email;
    if (!email) throw new BadRequestException('Cannot determine user email from token');

    const user = await this.userService.findOneByEmail(email);
    if (!user) throw new BadRequestException('User not found');

    const date = new Date(dateString);
    const symptoms = await this.cycleService.getSymptomsForDay(user._id.toString(), date);
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
  @UseGuards(JwtAuthGuard)
  async updateSettings(@Body() settingsDto: UpdateCycleSettingsDto, @Req() req: any) {
    const email = req?.user?.email;
    if (!email) throw new BadRequestException('Cannot determine user email from token');

    const user = await this.userService.findOneByEmail(email);
    if (!user) throw new BadRequestException('User not found');

    // ⚠️ Logic sẽ cập nhật tài liệu User hoặc tài liệu CycleSettings riêng
    return { 
        message: 'Cycle settings updated successfully.', 
        settings: settingsDto 
    };
  }
}
