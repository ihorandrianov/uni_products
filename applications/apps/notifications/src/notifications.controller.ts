import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { Product } from 'schemas/product.schema';

@Controller()
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);
  constructor() {}

  @MessagePattern('create')
  productCreated(@Payload() data: Product): void {
    this.logger.log(`Product created successfully: ${JSON.stringify(data)}`);
  }

  @MessagePattern('delete')
  productDeleted(@Payload() data: Product): void {
    this.logger.log(`Product deleted successfully: ${JSON.stringify(data)}`);
  }
}
