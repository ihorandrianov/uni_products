import { Server, CustomTransportStrategy } from '@nestjs/microservices';
import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from '@aws-sdk/client-sqs';

export class SqsServer extends Server implements CustomTransportStrategy {
  private sqs: SQSClient;

  constructor(private sqsClient: SQSClient) {
    super();
    this.sqs = sqsClient;
  }

  listen(callback: () => void) {
    callback();
  }

  /**
   * Triggered on application shutdown.
   */
  close() {}

  /**
   * You can ignore this method if you don't want transporter users
   * to be able to retrieve the underlying native server. Most custom implementations
   * will not need this.
   */
  unwrap<T = never>(): T {
    throw new Error('Method not implemented.');
  }
}
