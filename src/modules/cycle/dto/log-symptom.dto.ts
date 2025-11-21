// src/modules/cycle/dto/log-symptom.dto.ts

import { IsDateString, IsNumber, IsString, Max, Min } from 'class-validator';

/**
 * DTO để ghi lại triệu chứng/tâm trạng/hoạt động hàng ngày.
 */
export class LogSymptomDto {
  /** Ngày ghi nhật ký (Bắt buộc) */
  @IsDateString()
  date: string;

  /** Tên triệu chứng (ví dụ: 'Cramps', 'Headache', 'Mood Swings') */
  @IsString()
  symptomName: string;

  /** Cường độ triệu chứng (1: nhẹ, 5: nghiêm trọng) */
  @IsNumber()
  @Min(1)
  @Max(5)
  intensity: number;
}