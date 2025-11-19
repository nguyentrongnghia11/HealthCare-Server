import { IsNumber, IsOptional, IsArray, IsDateString } from 'class-validator';

export class CreateRunningDto {
	@IsNumber()
	distanceKm: number;

	@IsNumber()
	durationSec: number;

	@IsNumber()
	@IsOptional()
	calories?: number;

	@IsDateString()
	startTime: string;

	@IsArray()
	@IsOptional()
	route?: Array<any>;
}
