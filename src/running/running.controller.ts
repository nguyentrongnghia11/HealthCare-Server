import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { RunningService } from './running.service';
import { CreateRunningDto } from './dto/create-running.dto';
import { UpdateRunningDto } from './dto/update-running.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

@Controller('running')
export class RunningController {
  constructor(private readonly runningService: RunningService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: any, @Body() createRunningDto: CreateRunningDto) {
    const userId = req?.user?.sub || req?.user?._id || req?.user?.id || req?.user?.userId;
    return this.runningService.create({ ...createRunningDto, userId: userId?.toString() });
  }

  @Get()
  findAll() {
    return this.runningService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.runningService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRunningDto: UpdateRunningDto) {
    return this.runningService.update(id, updateRunningDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.runningService.remove(id);
  }

  /**
   * Get runs for the authenticated user for a given day (YYYY-MM-DD). Defaults to today.
   */
  @Get('me/daily')
  @UseGuards(JwtAuthGuard)
  async getMyDailyRuns(@Req() req: any, @Query('date') date?: string) {
    const userId = req?.user?.sub || req?.user?._id || req?.user?.id || req?.user?.userId;
    if (!userId) return { data: [] };
    const runs = await this.runningService.findRunsByDay(userId.toString(), date);
    return { data: runs };
  }
}
