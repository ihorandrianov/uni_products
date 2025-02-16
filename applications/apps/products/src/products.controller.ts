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
import {
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiOperation,
} from '@nestjs/swagger';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of products to return (1-100)',
    example: 10,
    schema: {
      minimum: 1,
      maximum: 100,
      default: 10,
    },
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    type: Number,
    description: 'Product ID to start from (for pagination)',
    example: 0,
    schema: {
      minimum: 0,
      default: 0,
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of products',
    schema: {
      type: 'object',
      properties: {
        products: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              name: { type: 'string', example: 'Product Name' },
              description: { type: 'string', example: 'Product Description' },
              price: { type: 'number', example: 1000 },
            },
          },
        },
        nextCursor: {
          type: 'number',
          nullable: true,
          description: 'ID for the next page, null if no more pages',
          example: 2,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid pagination parameters',
  })
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
  @ApiOperation({
    summary: 'Create new product',
    description: 'Creates a new product with the given details',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'description', 'price'],
      properties: {
        name: {
          type: 'string',
          description: 'Product name',
          minLength: 1,
          maxLength: 100,
          example: 'iPhone 13',
        },
        description: {
          type: 'string',
          description: 'Product description',
          minLength: 1,
          maxLength: 500,
          example: 'Latest iPhone model with A15 chip',
        },
        price: {
          type: 'number',
          description: 'Product price in cents (100 = $1.00)',
          minimum: 1,
          example: 99900, // $999.00
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'iPhone 13' },
        description: {
          type: 'string',
          example: 'Latest iPhone model with A15 chip',
        },
        price: { type: 'number', example: 99900 },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Validation failed' },
        error: { type: 'string', example: 'Bad Request' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  async postProduct(
    @Body(new ZodValidationPipe(CREATE_PRODUCT_SCHEMA))
    createData: CreateProductDTO,
  ): Promise<Product> {
    const product = await this.productsService.createProduct(createData);

    return product;
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete product',
    description: 'Deletes a product by its ID',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
    description: 'Product ID to delete',
    example: 1,
    schema: {
      minimum: 0,
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Product deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Deleted successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Product not found' },
        error: { type: 'string', example: 'Not Found' },
        statusCode: { type: 'number', example: 404 },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid ID format',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Validation failed' },
        error: { type: 'string', example: 'Bad Request' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  async deleteProduct(
    @Param(
      new ZodValidationPipe<DeleteProductOutput, DeleteProductInput>(
        DELETE_PRODUCT_PARAM,
      ),
    )
    { id }: DeleteProductOutput,
  ) {
    await this.productsService.deleteProduct(id);
    return {
      message: 'Deleted successfully',
    };
  }
}
