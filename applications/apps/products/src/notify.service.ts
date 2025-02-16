import { Injectable } from '@nestjs/common';
import { AwsSqsClient } from 'clients/aws-sqs.client';
import { Product } from 'schemas/product.schema';

@Injectable()
export class NotifyService {
  constructor(private readonly sqsClient: AwsSqsClient) {}

  async notifyProductCreated(product: Product): Promise<void> {
    await this.sqsClient.dispatchEvent({
      pattern: 'create',
      data: product,
    });
  }

  async notifyProductDeleted(product: Product): Promise<void> {
    await this.sqsClient.dispatchEvent({
      pattern: 'delete',
      data: product,
    });
  }
}
