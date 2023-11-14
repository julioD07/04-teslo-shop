import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product, ProductImage } from './entities';
import { AuthModule } from 'src/auth/auth.module';


@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  // Importamos el modulo de la entidad
  imports: [
    TypeOrmModule.forFeature([Product, ProductImage]),
    AuthModule
  ],
  exports: [ProductsService, TypeOrmModule]
})
export class ProductsModule {}
