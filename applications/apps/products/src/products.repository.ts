import { Injectable } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { NotFoundException } from '@nestjs/common';
import {
  CreateProductDTO,
  PaginationResult,
  Product,
  PRODUCT_SCHEMA,
} from 'schemas/product.schema';

@Injectable()
export class ProductsRepository {
  constructor(private readonly dbService: DatabaseService) {}

  async create({
    name,
    description,
    price,
  }: CreateProductDTO): Promise<Product> {
    const productQuery = await this.dbService.query(
      `INSERT INTO products (name, description, price)
       VALUES ($1, $2, $3)
       RETURNING id, name, description, price;`,
      [name, description, price],
    );
    if (productQuery && productQuery.rowCount === 1) {
      const product = PRODUCT_SCHEMA.parse(productQuery?.rows[0]);
      return product;
    } else {
      throw new Error('Failed to create product');
    }
  }

  async delete(id: number): Promise<Product> {
    const deleteQuery = await this.dbService.query(
      'DELETE FROM products WHERE id = $1 RETURNING *',
      [id],
    );
    if (deleteQuery?.rowCount === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    const product = PRODUCT_SCHEMA.parse(deleteQuery?.rows[0]);
    return product;
  }

  async getMany(limit: number, cursor: number): Promise<PaginationResult> {
    const productsQuery = await this.dbService.query(
      `SELECT id, name, description, price
       FROM products
       WHERE id > $1
       ORDER BY id ASC
       LIMIT $2;`,
      [cursor, limit + 1],
    );
    if (!productsQuery) {
      throw new Error('Failed to get products');
    }
    const products = productsQuery.rows
      .slice(0, limit)
      .map((row) => PRODUCT_SCHEMA.parse(row));

    // If we got more results than limit, there are more pages
    const hasMore = productsQuery.rows.length > limit;
    const nextCursor = hasMore ? products[products.length - 1].id : null;

    return {
      products,
      nextCursor,
    };
  }
}
