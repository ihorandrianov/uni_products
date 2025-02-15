import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';
import { MessageData } from 'schemas/message.schema';

@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @MessagePattern('product::create')
  productCreated(@Payload() data: MessageData): void {
    console.log(data);
  }

  @MessagePattern('product::delete')
  productDeleted(@Payload() data: MessageData): void {
    console.log(data);
  }
}
