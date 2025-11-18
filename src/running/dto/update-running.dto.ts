import { PartialType } from '@nestjs/mapped-types';
import { CreateRunningDto } from './create-running.dto';

export class UpdateRunningDto extends PartialType(CreateRunningDto) {}
