import { Test, TestingModule } from '@nestjs/testing';
import { NotifyService } from './notify.service';
import { AwsSqsClient } from 'clients/aws-sqs.client';
import { Product } from 'schemas/product.schema';
import { SQSServiceException } from '@aws-sdk/client-sqs';

describe('NotifyService', () => {
  let service: NotifyService;
  let mockDispatchEvent: jest.Mock;

  const mockProduct: Product = {
    id: 1,
    name: 'Test Product',
    description: 'Test Description',
    price: 1000,
  };

  beforeEach(async () => {
    mockDispatchEvent = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotifyService,
        {
          provide: AwsSqsClient,
          useValue: {
            dispatchEvent: mockDispatchEvent,
          },
        },
      ],
    }).compile();

    service = module.get<NotifyService>(NotifyService);
  });

  describe('notifyProductCreated', () => {
    it('should send create notification with correct product data', async () => {
      mockDispatchEvent.mockResolvedValue(undefined);

      await service.notifyProductCreated(mockProduct);

      expect(mockDispatchEvent).toHaveBeenCalledTimes(1);
      expect(mockDispatchEvent).toHaveBeenCalledWith({
        pattern: 'create',
        data: mockProduct,
      });
    });

    it('should handle AWS SQS service exception', async () => {
      const sqsError = new SQSServiceException({
        name: 'QueueDoesNotExist',
        $metadata: {},
        message: 'Queue does not exist',
        $fault: 'server',
      });
      mockDispatchEvent.mockRejectedValue(sqsError);

      const notifyPromise = service.notifyProductCreated(mockProduct);

      await expect(notifyPromise).rejects.toThrow(SQSServiceException);
      await expect(notifyPromise).rejects.toThrow('Queue does not exist');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network timeout');
      mockDispatchEvent.mockRejectedValue(networkError);

      const notifyPromise = service.notifyProductCreated(mockProduct);

      await expect(notifyPromise).rejects.toThrow('Network timeout');
    });
  });

  describe('notifyProductDeleted', () => {
    it('should send delete notification with correct product data', async () => {
      mockDispatchEvent.mockResolvedValue(undefined);

      await service.notifyProductDeleted(mockProduct);

      expect(mockDispatchEvent).toHaveBeenCalledTimes(1);
      expect(mockDispatchEvent).toHaveBeenCalledWith({
        pattern: 'delete',
        data: mockProduct,
      });
    });

    it('should handle AWS SQS service exception', async () => {
      const sqsError = new SQSServiceException({
        name: 'InvalidMessageContents',
        $metadata: {},
        message: 'Invalid message contents',
        $fault: 'client',
      });
      mockDispatchEvent.mockRejectedValue(sqsError);

      const notifyPromise = service.notifyProductDeleted(mockProduct);

      await expect(notifyPromise).rejects.toThrow(SQSServiceException);
      await expect(notifyPromise).rejects.toThrow('Invalid message contents');
    });
  });

  describe('edge cases', () => {
    it('should handle products with minimum required fields', async () => {
      const minimalProduct: Product = {
        id: 1,
        name: '',
        description: '',
        price: 0,
      };

      await service.notifyProductCreated(minimalProduct);

      expect(mockDispatchEvent).toHaveBeenCalledWith({
        pattern: 'create',
        data: minimalProduct,
      });
    });

    it('should handle maximum length values', async () => {
      const maxProduct: Product = {
        id: Number.MAX_SAFE_INTEGER,
        name: 'a'.repeat(100),
        description: 'a'.repeat(500),
        price: Number.MAX_SAFE_INTEGER,
      };

      await service.notifyProductCreated(maxProduct);

      expect(mockDispatchEvent).toHaveBeenCalledWith({
        pattern: 'create',
        data: maxProduct,
      });
    });

    it('should handle special characters in product fields', async () => {
      const specialProduct: Product = {
        id: 1,
        name: 'Product!@#$%^&*()',
        description: 'Description with 特殊字符 and émojis 🎉',
        price: 1000,
      };

      await service.notifyProductCreated(specialProduct);

      expect(mockDispatchEvent).toHaveBeenCalledWith({
        pattern: 'create',
        data: specialProduct,
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
