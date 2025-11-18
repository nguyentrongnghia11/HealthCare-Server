import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RunningService } from './running.service';
import { CreateRunningDto } from './dto/create-running.dto';
import { UpdateRunningDto } from './dto/update-running.dto';

@Controller('running')
export class RunningController {
  constructor(private readonly runningService: RunningService) {}

  @Post()
  create(@Body() createRunningDto: CreateRunningDto) {
    return this.runningService.create(createRunningDto);
  }

  @Get()
  findAll() {
    return this.runningService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.runningService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRunningDto: UpdateRunningDto) {
    return this.runningService.update(+id, updateRunningDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.runningService.remove(+id);
  }
}
