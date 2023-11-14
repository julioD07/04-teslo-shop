import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { LoginUserDto, CreateUserDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { EncriptarPassAdapter } from './adapters/encriptar-pass.adapter';

import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces';

@Injectable()
export class AuthService {
  constructor(
    //? Inyectamos el repositorio de usuarios para poder hacer operaciones con la base de datos
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    //? Inyectamos el adaptador de encriptación de contraseñas
    private readonly encriptarPassAdapter: EncriptarPassAdapter,

    //? Inyectamos el servicio para generar el token
    private readonly jwtService: JwtService,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    try {
      //? Obtenemos la contraseña del usuario y esparcimos el resto de propiedades
      const { password, ...userData } = createUserDto;

      //? Preparamos el usuario para ser guardado en la base de datos
      const user = this.userRepository.create({
        ...userData,
        password: this.encriptarPassAdapter.hashSync(password),
      });
      //? Guardamos el usuario en la base de datos
      await this.userRepository.save(user);

      //? Retornamos el usuario creado
      delete user.password;
      return {
        ...user,
        token: this.getJwtToken({ id: user.id }),
      };
      //TODO Regresar el JWT del usuario
    } catch (error) {
      this.handleDBError(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    //? Buscamos al usuario en la base de datos
    const user = await this.userRepository.findOne({
      where: { email },
      select: {
        email: true,
        password: true,
        id: true,
      },
    });

    //? Si el usuario no existe, lanzamos un error
    if (!user)
      throw new UnauthorizedException('Credentials are not valid (email)');

    if (!this.encriptarPassAdapter.compareSync(password, user.password))
      throw new UnauthorizedException('Credentials are not valid (password)');

    //? Eliminamos la contraseña del usuario
    delete user.password;
    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
    //TODO Regresar el JWT del usuario
  }

  async checkAuthStatus(user: User) {
    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  private getJwtToken(payload: JwtPayload) {
    //? Generamos el token a partir del servicio
    return this.jwtService.sign(payload);
  }

  private handleDBError(error: any): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    console.log(error);

    throw new InternalServerErrorException('Please check server logs');
  }
}
