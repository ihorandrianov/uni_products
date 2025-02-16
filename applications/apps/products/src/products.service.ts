import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { DatabaseService } from './database.service';
import {
  CreateProductDTO,
  PaginationResult,
  Product,
} from 'schemas/product.schema';
import { DatabaseError } from 'pg';
import { NotifyService } from './notify.service';
import { ProductMetricsService } from './products-metric.service';
import { ProductsRepository } from './products.repository';

@Injectable()
export class ProductsService {
  constructor(
    private readonly dbService: DatabaseService,
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
    } catch (error) {
      if (error instanceof DatabaseError && error.code === '23505') {
        this.productMetricService.incrementCreated('failure');
        throw new ConflictException('Product with this name already exists');
      }
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
      this.productMetricService.incrementDeleted('failure');
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete user');
    }
  }

  async getProductsWithCursor(
    limit: number,
    cursor: number,
  ): Promise<PaginationResult> {
    try {
      const result = this.productRepository.getMany(limit, cursor);

      return result;
    } catch {
      throw new InternalServerErrorException('Failed to fetch products');
    }
  }
}
