import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './entities/user.entity';
import { EncriptarPassAdapter } from './adapters/encriptar-pass.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  controllers: [AuthController],
  providers: [AuthService, EncriptarPassAdapter],
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),

    JwtModule.registerAsync({
      //? Importamos el modulo de configuracion
      imports: [ConfigModule],
      //? Inyectamos el servicio de configuracion
      inject: [ConfigService],
      //? Definimos el factory y recibimos el servicio de configuracion
      useFactory: (configService: ConfigService) => {
        //? Usamos el servicio de configuracion para obtener la variable de entorno
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: '2h',
          },
        };
      },
    }),

    // JwtModule.register({
    //   secret: process.env.JWT_SECRET,
    //   signOptions: {
    //     expiresIn: '2h',
    //   },
    // }),
  ],
  exports: [TypeOrmModule],
})
export class AuthModule {}
