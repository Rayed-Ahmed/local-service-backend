import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  providerId: string;
}
