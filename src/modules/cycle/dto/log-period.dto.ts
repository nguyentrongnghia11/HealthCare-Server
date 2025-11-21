// src/modules/cycle/dto/log-period.dto.ts

import { IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';

/**
 * DTO để ghi lại một kỳ kinh nguyệt mới hoặc cập nhật kỳ kinh gần nhất.
 */
export class LogPeriodDto {
  /** Ngày bắt đầu kỳ kinh (Bắt buộc) */
  @IsDateString()
  startDate: string;

  /** Ngày kết thúc kỳ kinh (Tùy chọn, có thể null nếu kỳ kinh đang diễn ra) */
  @IsOptional()
  @IsDateString()
  endDate?: string;

  /** Cường độ dòng chảy (1: nhẹ, 3: nặng) */
  @IsOptional()
  @IsNumber()
  @Min(1)
  flowIntensity?: number;

  /** Ghi chú */
  @IsOptional()
  @IsString()
  notes?: string;
}