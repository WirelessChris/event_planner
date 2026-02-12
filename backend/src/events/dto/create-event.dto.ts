import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be in YYYY-MM-DD format' })
  date: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{2}:\d{2}$/, { message: 'Start time must be in HH:MM format' })
  start_time?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{2}:\d{2}$/, { message: 'End time must be in HH:MM format' })
  end_time?: string;
}
