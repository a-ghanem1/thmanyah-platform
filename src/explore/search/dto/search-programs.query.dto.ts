import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../browse/dto/pagination.dto';

export class SearchProgramsQueryDto extends PaginationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  q: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  categorySlug?: string;
}
