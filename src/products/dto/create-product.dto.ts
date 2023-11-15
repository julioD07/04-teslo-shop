import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateProductDto {

  @ApiProperty({
    example: 'T-Shirt',
    description: 'The title of the product',
    uniqueItems: true,
  })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiProperty({
    example: 1000,
    description: 'The price of the product',
    minimum: 0,
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;

  @ApiProperty({
    example: 'This is a t-shirt',
    description: 'The description of the product',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 'this-is-a-t-shirt',
    description: 'The slug of the product',
    uniqueItems: true,
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({
    example: 0,
    description: 'The stock of the product',
    minimum: 0,
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  stock?: number;

  @ApiProperty({
    example: ['red', 'blue', 'green'],
    description: 'The colors of the product',
    nullable: true,
  })
  @IsString({ each: true })
  @IsArray()
  sizes: string[];


  @ApiProperty()
  @IsIn(['men', 'women', 'kid', 'unisex'])
  gender: string;

  @ApiProperty({
    example: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    description: 'The sizes of the product',
    type: 'array',
    items: {
      type: 'string',
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    },
  })
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  tags: string[]

  @ApiProperty({
    example: ['https://example.com/image.jpg'],
    description: 'The images of the product',
    type: 'array',
    items: {
      type: 'string',
    },
  })
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  images?: string[]
}
