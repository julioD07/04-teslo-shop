import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';
import { User } from 'src/auth/entities/user.entity';
import { EncriptarPassAdapter } from 'src/auth/adapters/encriptar-pass.adapter';

@Injectable()
export class SeedService {
  constructor(
    private readonly productsService: ProductsService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    //? Inyectamos el adaptador de encriptación de contraseñas
    private readonly encriptarPassAdapter: EncriptarPassAdapter,
  ) {}

  async runSeed() {
    //? Eliminamos las tablas
    await this.deleteTables();
    //? Insertamos los usuarios
    const adminUser = await this.insertNewUsers();
    //? Insertamos los productos
    await this.insertNewProducts(adminUser);

    return `Seed Executed`;
  }

  private async deleteTables() {
    //? Eliminamos los productos
    await this.productsService.deleteAllProducts();
    //? Eliminamos los usuarios
    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder.delete().where({}).execute();
  }

  private async insertNewUsers() {
    //? Obtenemos los usuarios del archivo de datos
    const seedUsers = initialData.users;
    //? Creamos un array vacio de usuarios
    const users: User[] = [];
    //? Recorremos los usuarios del archivo de datos
    seedUsers.forEach((user) => {
      //? Creamos un usuario a partir del repositorio
      users.push(this.userRepository.create({
        ...user,
        password: this.encriptarPassAdapter.hashSync(user.password),
      }));
    });
    //? Guardamos los usuarios a partir del repositorio
    const dbUsers = await this.userRepository.save(users);

    return dbUsers[0];
  }

  private async insertNewProducts(user: User) {
    //TODO Llamamos desde otro modulo el metodo para eliminar productos
    this.productsService.deleteAllProducts();

    const seedProducts = initialData.products;
    const insertPromises = [];

    seedProducts.forEach((product) => {
      insertPromises.push(this.productsService.create(product, user));
    });

    await Promise.all(insertPromises);
  }
}
