// src/modules/cycle/dto/update-cycle-settings.dto.ts

import { IsNumber, Min } from 'class-validator';

/**
 * DTO để cập nhật cài đặt dự đoán chu kỳ cá nhân của người dùng.
 */
export class UpdateCycleSettingsDto {
  /** Chiều dài chu kỳ trung bình (Ví dụ: 28) */
  @IsNumber()
  @Min(20)
  avgCycleLength: number;

  /** Chiều dài kỳ kinh trung bình (Ví dụ: 5) */
  @IsNumber()
  @Min(2)
  avgPeriodLength: number;
}