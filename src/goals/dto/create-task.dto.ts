import { IsBoolean, IsDateString, IsString } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  name: string;

  @IsDateString()
  dueDate: Date;

  @IsBoolean()
  completed: boolean;

  @IsString()
  description: string;
}
