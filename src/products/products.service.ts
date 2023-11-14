import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';
import { ProductImage } from './entities';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    //? INYECTAMOS EL REPOSITORIO PARA HACER EL TRATAMIENTO
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    //? Inyectamos el dataSource para el QueryRunner
    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto, user: User) {
    try {
      const { images = [], ...producDetails } = createProductDto;

      //? Creamos el producto a partir del Repositorio enviando el DTO
      const product = this.productRepository.create({
        ...producDetails,
        user,
        images: images.map((image) =>
          this.productImageRepository.create({ url: image }),
        ),
      });
      //? Guardamos el producto a partir del repositorio creado
      await this.productRepository.save(product);

      return { ...product, images };
    } catch (error) {
      this.handleDbExceptions(error);
    }
  }

  //TODO: PAGINAR
  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      //TODO Relaciones
      relations: {
        images: true,
      },
    });
    return products.map(({ images, ...rest }) => ({
      ...rest,
      images: images.map((img) => img.url),
    }));
  }

  async findOne(term: string) {
    let product: Product;
    //? Validamos que el termino sea un UUID
    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      //? Si el termino no es un UUID hacemos un query para la busqueda
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder
        .where(`UPPER(title) = :title OR slug = :slug`, {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne();
    }

    if (!product)
      throw new NotFoundException(`Product with term ${term} not found`);

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    //? extraemos las imagenes del UpdateProductDto
    const { images, ...toUpdate } = updateProductDto;

    //? Prepraramos el objeto para actualizar
    const product = await this.productRepository.preload({ id, ...toUpdate });

    if (!product)
      throw new NotFoundException(`Product with id ${id} not found`);

    //? Create Query Runner
    const queryRunner = this.dataSource.createQueryRunner();
    //? Conectamos el Query Runner a la base de datos
    await queryRunner.connect();
    //? Iniciamos la transaccion
    await queryRunner.startTransaction();

    try {
      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } });

        product.images = images.map((image) =>
          this.productImageRepository.create({ url: image }),
        );
      }

      //? Guardamos el usuario que actualiza el producto
      product.user = user;
      //? Guardamos el query anterior
      await queryRunner.manager.save(product);

      //? Hacemos el commit de la transaccion y cerramos la conexion con el delete
      await queryRunner.commitTransaction();
      await queryRunner.release();

      // await this.productRepository.save(product);

      return this.findOnePlain(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this.handleDbExceptions(error);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);

    return { message: `This action removes a ${id} product` };
  }

  async findOnePlain(term: string) {
    const { images = [], ...rest } = await this.findOne(term);
    return {
      ...rest,
      images: images.map(({ url }) => url),
    };
  }

  private handleDbExceptions(error: any) {
    //? Error para clave en base de datos duplicada
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');

    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDbExceptions(error)
    }
  }
}
