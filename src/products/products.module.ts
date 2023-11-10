import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  // Importamos el modulo de la entidad
  imports: [
    TypeOrmModule.forFeature([Product])
  ]
})
export class ProductsModule {}
