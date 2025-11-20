import { IsNumber, IsOptional, IsArray, IsDateString, IsString } from 'class-validator';

export class CreateRunningDto {
	@IsNumber()
	distanceKm: number;

	@IsNumber()
	@IsOptional()
	durationSec?: number;

	@IsNumber()
	@IsOptional()
	timeSeconds?: number; // Frontend sends this

	@IsNumber()
	@IsOptional()
	calories?: number;

	@IsNumber()
	@IsOptional()
	caloriesBurned?: number; // Frontend sends this

	@IsDateString()
	@IsOptional()
	startTime?: string;

	@IsString()
	@IsOptional()
	date?: string; // Frontend sends YYYY-MM-DD

	@IsArray()
	@IsOptional()
	route?: Array<any>;
}
