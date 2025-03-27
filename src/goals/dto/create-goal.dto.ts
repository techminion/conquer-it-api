import { IsOptional, IsString } from 'class-validator';

export class CreateGoalDto {
  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsString()
  @IsOptional()
  duration?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
