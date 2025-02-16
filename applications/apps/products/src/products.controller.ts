import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Body,
  Param,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { ZodValidationPipe } from 'pipes/zod-validator.pipe';
import {
  CREATE_PRODUCT_SCHEMA,
  CreateProductDTO,
  DELETE_PRODUCT_PARAM,
  DeleteProductInput,
  DeleteProductOutput,
  PAGINATION_PARAMS,
  PaginationInput,
  PaginationOutput,
  PaginationResult,
  Product,
} from 'schemas/product.schema';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async getProducts(
    @Query(
      new ZodValidationPipe<PaginationOutput, PaginationInput>(
        PAGINATION_PARAMS,
      ),
    )
    query: PaginationOutput,
  ): Promise<PaginationResult> {
    const { limit, cursor } = query;
    const products = await this.productsService.getProductsWithCursor(
      limit,
      cursor,
    );

    return products;
  }

  @Post()
  async postProduct(
    @Body(new ZodValidationPipe(CREATE_PRODUCT_SCHEMA))
    createData: CreateProductDTO,
  ): Promise<Product> {
    const product = await this.productsService.createProduct(createData);

    return product;
  }

  @Delete(':id')
  async deleteProduct(
    @Param(
      new ZodValidationPipe<DeleteProductOutput, DeleteProductInput>(
        DELETE_PRODUCT_PARAM,
      ),
    )
    id: number,
  ) {
    await this.productsService.deleteProduct(id);
    return {
      message: 'Deleted successfully',
    };
  }
}
