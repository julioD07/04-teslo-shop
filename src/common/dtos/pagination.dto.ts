import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto {
  
  @IsOptional()
  @IsPositive()
  //? Transformar Data
  @Type(() => Number) //? Se utiliza si no colocamos el enableImplicitConversions: true
  limit?: number;

  @IsOptional()
  @IsPositive()
  @Min(0)
  @Type(() => Number)
  offset?: number;
}
