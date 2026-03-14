import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LeaveRoomDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  roomId: string;
}
