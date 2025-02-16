import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { NotifyService } from './notify.service';
import { ProductMetricsService } from './products-metric.service';
import { ProductsRepository } from './products.repository';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDTO, Product } from 'schemas/product.schema';

describe('ProductsService', () => {
  let service: ProductsService;

  const mockProduct: Product = {
    id: 1,
    name: 'Test Product',
    description: 'Test Description',
    price: 1000,
  };

  const createProductDto: CreateProductDTO = {
    name: 'Test Product',
    description: 'Test Description',
    price: 1000,
  };

  const mockCreate = jest.fn();
  const mockDelete = jest.fn();
  const mockGetMany = jest.fn();
  const mockNotifyCreated = jest.fn();
  const mockNotifyDeleted = jest.fn();
  const mockIncrementCreated = jest.fn();
  const mockIncrementDeleted = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: NotifyService,
          useValue: {
            notifyProductCreated: mockNotifyCreated,
            notifyProductDeleted: mockNotifyDeleted,
          },
        },
        {
          provide: ProductMetricsService,
          useValue: {
            incrementCreated: mockIncrementCreated,
            incrementDeleted: mockIncrementDeleted,
          },
        },
        {
          provide: ProductsRepository,
          useValue: {
            create: mockCreate,
            delete: mockDelete,
            getMany: mockGetMany,
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  describe('createProduct', () => {
    it('should create a product successfully', async () => {
      mockCreate.mockResolvedValue(mockProduct);

      const result = await service.createProduct(createProductDto);

      expect(result).toEqual(mockProduct);
      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockCreate).toHaveBeenCalledWith(createProductDto);
      expect(mockNotifyCreated).toHaveBeenCalledWith(mockProduct);
      expect(mockIncrementCreated).toHaveBeenCalledWith('success');
    });

    it('should handle database error', async () => {
      mockCreate.mockRejectedValue(new Error('Database error'));

      const createPromise = service.createProduct(createProductDto);

      await expect(createPromise).rejects.toThrow(InternalServerErrorException);
      expect(mockIncrementCreated).toHaveBeenCalledWith('failure');
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product successfully', async () => {
      mockDelete.mockResolvedValue(mockProduct);

      await service.deleteProduct(1);

      expect(mockDelete).toHaveBeenCalledTimes(1);
      expect(mockDelete).toHaveBeenCalledWith(1);
      expect(mockNotifyDeleted).toHaveBeenCalledWith(mockProduct);
      expect(mockIncrementDeleted).toHaveBeenCalledWith('success');
    });

    it('should handle product not found', async () => {
      mockDelete.mockRejectedValue(new NotFoundException());

      const deletePromise = service.deleteProduct(1);

      await expect(deletePromise).rejects.toThrow(NotFoundException);
      expect(mockIncrementDeleted).toHaveBeenCalledWith('failure');
    });

    it('should handle database error during deletion', async () => {
      mockDelete.mockRejectedValue(new Error('Database error'));

      const deletePromise = service.deleteProduct(1);

      await expect(deletePromise).rejects.toThrow(InternalServerErrorException);
      expect(mockIncrementDeleted).toHaveBeenCalledWith('failure');
    });
  });

  describe('getProductsWithCursor', () => {
    const mockPaginationResult = {
      products: [mockProduct],
      nextCursor: null,
    };

    it('should return paginated products successfully', async () => {
      mockGetMany.mockResolvedValue(mockPaginationResult);

      const result = await service.getProductsWithCursor(10, 0);

      expect(result).toEqual(mockPaginationResult);
      expect(mockGetMany).toHaveBeenCalledTimes(1);
      expect(mockGetMany).toHaveBeenCalledWith(10, 0);
    });

    it('should handle pagination with next cursor', async () => {
      const resultWithCursor = {
        products: [mockProduct],
        nextCursor: 2,
      };
      mockGetMany.mockResolvedValue(resultWithCursor);

      const result = await service.getProductsWithCursor(1, 0);

      expect(result.nextCursor).toBe(2);
      expect(result.products).toHaveLength(1);
    });

    it('should handle error when fetching products', async () => {
      mockGetMany.mockRejectedValue(new Error('Database error'));

      const fetchPromise = service.getProductsWithCursor(10, 0);

      await expect(fetchPromise).rejects.toThrow(InternalServerErrorException);
      expect(mockGetMany).toHaveBeenCalledWith(10, 0);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
