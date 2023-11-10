import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {

  constructor(
    private readonly productsService: ProductsService 
  ){}

  async runSeed() {

    await this.insertNewProducts()

    return `Seed Executed`;
  }

  private async insertNewProducts() {
    //TODO Llamamos desde otro modulo el metodo para eliminar productos
    this.productsService.deleteAllProducts()

    const seedProducts = initialData.products
    const insertPromises = []

    seedProducts.forEach((product) => {
      insertPromises.push(this.productsService.create(product))
    })

    await Promise.all(insertPromises)
  }
}
