import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto {
  
  @ApiProperty({
    default: 10,
    minimum: 1,
  })
  @IsOptional()
  @IsPositive()
  //? Transformar Data
  @Type(() => Number) //? Se utiliza si no colocamos el enableImplicitConversions: true
  limit?: number;


  @ApiProperty({
    default: 0,
    minimum: 0,
  })
  @IsOptional()
  @IsPositive()
  @Min(0)
  @Type(() => Number)
  offset?: number;
}
