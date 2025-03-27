import { IsArray, IsOptional, IsString } from 'class-validator';
import { Task } from '../schemas/task.schema';

export class UpdateGoalDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsArray()
  tasks?: Task[];
}
