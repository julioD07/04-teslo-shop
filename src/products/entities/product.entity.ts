import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProductImage } from './product-image.entity';
import { User } from 'src/auth/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

// Definimos la entidad
@Entity({name: 'products'})
export class Product {

  @ApiProperty({
    example: '2ef63b58-8275-4808-8177-2d7df4877070',
    description: 'The id of the product',
    format: 'uuid',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'T-Shirt',
    description: 'The title of the product',
    uniqueItems: true,
  })
  @Column('text', {
    unique: true,
  })
  title: string;

  @ApiProperty({
    example: 1000,
    description: 'The price of the product',
    minimum: 0,
  })
  @Column('float', {
    default: 0,
  })
  price: number;

  @ApiProperty({
    example: 'This is a t-shirt',
    description: 'The description of the product',
    nullable: true,
  })
  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @ApiProperty({
    example: 'this-is-a-t-shirt',
    description: 'The slug of the product',
    uniqueItems: true,
  })
  @Column('text', {
    unique: true,
  })
  slug: string;

  @ApiProperty({
    example: 0,
    description: 'The stock of the product',
    minimum: 0,
  })
  @Column('int', {
    default: 0,
  })
  stock: number;

  @ApiProperty({
    example: ['XS','S','M','L','XL','XXL','XXXL'],
    description: 'The sizes of the product',
    type: 'array',
    items: {
      type: 'string',
      enum: ['XS','S','M','L','XL','XXL','XXXL'],
    },
  })
  @Column('text', {
    array: true,
  })
  sizes: string[];

  @ApiProperty({
    example: ['men','women','kid','unisex'],
    description: 'The gender of the product',
    type: 'array',
    items: {
      type: 'string',
      enum: ['men','women','kid','unisex']
    }
  })
  @Column('text')
  gender: string;

  //? TAGS
  @ApiProperty({
    example: ['shirts','pants','hoodies','hats'],
    description: 'The tags of the product',
    type: 'array',
    items: {
      type: 'string',
      enum: ['shirts','pants','hoodies','hats'],
    },
  })
  @Column({
    type: 'text', 
    array: true,
    default: []
  })
  tags: string[]

  //? IMAGES
  @ApiProperty({
    description: 'The images of the product',
    type: [ProductImage]
  })
  @OneToMany(
    () => ProductImage,
    (productImage) => productImage.product,
    { cascade: true, eager: true }
  )
  images?: ProductImage[]

  @ManyToOne(
    () => User,
    (user) => user.product,
    { eager: true }
  )
  user: User

  //? Realiza cambios en la insercion
  @BeforeInsert()
  checkSlugInsert() {
    if (!this.slug) {
      this.slug = this.title;
    }
    this.checkSlug()
  }

  //? Realiza cambios en la actualizacion
  @BeforeUpdate()
  checkSlugUpdate() {
    this.checkSlug()
  }

  private checkSlug() {
    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }
}
