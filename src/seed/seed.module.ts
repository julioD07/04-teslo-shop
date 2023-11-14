import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { ProductsModule } from 'src/products/products.module';
import { AuthModule } from 'src/auth/auth.module';
import { EncriptarPassAdapter } from 'src/auth/adapters/encriptar-pass.adapter';

@Module({
  controllers: [SeedController],
  providers: [SeedService, EncriptarPassAdapter],
  imports: [ProductsModule, AuthModule]
})
export class SeedModule {}
