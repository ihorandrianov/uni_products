import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateProductDTO,
  PaginationResult,
  Product,
} from 'schemas/product.schema';
import { NotifyService } from './notify.service';
import { ProductMetricsService } from './products-metric.service';
import { ProductsRepository } from './products.repository';

@Injectable()
export class ProductsService {
  constructor(
    private readonly notifyService: NotifyService,
    private readonly productMetricService: ProductMetricsService,
    private readonly productRepository: ProductsRepository,
  ) {}

  async createProduct(data: CreateProductDTO): Promise<Product> {
    try {
      const product = await this.productRepository.create(data);
      await this.notifyService.notifyProductCreated(product);
      this.productMetricService.incrementCreated('success');
      return product;
      // eslint-disable-next-line
    } catch (error) {
      this.productMetricService.incrementCreated('failure');
      throw new InternalServerErrorException('Failed to create product');
    }
  }

  async deleteProduct(id: number): Promise<void> {
    try {
      const product = await this.productRepository.delete(id);
      await this.notifyService.notifyProductDeleted(product);
      this.productMetricService.incrementDeleted('success');
    } catch (error) {
      console.log(error);
      this.productMetricService.incrementDeleted('failure');
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete product');
    }
  }

  async getProductsWithCursor(
    limit: number,
    cursor: number,
  ): Promise<PaginationResult> {
    try {
      const result = await this.productRepository.getMany(limit, cursor);
      return result;
      //eslint-disable-next-line
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch products');
    }
  }
}
