import { Injectable, Logger } from '@nestjs/common';
import { ClientProxy, ReadPacket, WritePacket } from '@nestjs/microservices';
import {
  SQS,
  SendMessageCommand,
  SendMessageCommandOutput,
  SQSServiceException,
} from '@aws-sdk/client-sqs';
import { SqsPayload } from 'schemas/sqs.schema';
import { Product } from 'schemas/product.schema';

@Injectable()
export class AwsSqsClient extends ClientProxy {
  private readonly logger = new Logger(AwsSqsClient.name);
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000;

  constructor(
    private sqs: SQS,
    private queueUrl: string,
  ) {
    super();
  }

  async connect(): Promise<void> {}

  async close(): Promise<void> {}

  async dispatchEvent(packet: ReadPacket<Product>): Promise<any> {
    const message = this.createSqsMessage(packet);
    try {
      const response = await this.sendMessageWithRetry(
        message,
        this.maxRetries,
      );
      this.logMessage(`Message sent successfully: ${JSON.stringify(response)}`);
      return response;
    } catch (error) {
      this.logMessage(
        `Error sending message to SQS: ${(error as Error).message}`,
        'error',
      );
    }
  }

  publish(
    packet: ReadPacket<Product>,
    callback: (packet: WritePacket<any>) => void,
  ): () => void {
    if (!packet || !packet.data) {
      const errorMessage = 'Invalid packet: missing data';
      this.logMessage(errorMessage, 'error');
      callback({ response: errorMessage });
      return () => {
        this.logMessage('SqsClientProxy: teardown', 'log');
      };
    }

    const message = this.createSqsMessage(packet);

    this.sendMessageWithRetry(message, this.maxRetries)
      .then((data) => {
        this.logMessage(
          `Message sent successfully: ${JSON.stringify(data)}`,
          'log',
        );
        callback({
          response: 'Message sent successfully',
        });
      })
      .catch((error) => {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred';

        this.logMessage(
          `Error sending message to SQS: ${errorMessage}`,
          'error',
        );

        callback({
          response: JSON.stringify({
            code:
              error instanceof SQSServiceException
                ? error.name
                : 'UNKNOWN_ERROR',
            message: errorMessage,
            timestamp: new Date().toISOString(),
          }),
        });
      });

    return () => {
      this.logMessage('SqsClientProxy: teardown', 'log');
    };
  }

  private createSqsMessage(packet: SqsPayload): SendMessageCommand {
    const message = {
      action: packet.pattern,
      product: packet.data,
    };

    const sendMessageCommand = new SendMessageCommand({
      QueueUrl: this.queueUrl,
      MessageBody: JSON.stringify(message),
      MessageGroupId: message.action,
    });
    return sendMessageCommand;
  }

  private async sendMessageWithRetry(
    message: SendMessageCommand,
    retries: number,
    attempt: number = 1,
  ): Promise<SendMessageCommandOutput> {
    try {
      return await this.sqs.send(message);
    } catch (error) {
      // Check if it's a retryable AWS error
      if (!(error instanceof SQSServiceException) || retries <= 0) {
        this.logMessage(
          `Failed to send message to SQS after ${attempt} attempts: ${(error as Error).message}`,
          'error',
        );
        throw error;
      }

      this.logMessage(
        `Error sending message to SQS, retrying (${attempt}/${retries + attempt}): ${error.message}`,
        'error',
      );

      const delay = Math.min(
        this.retryDelay * Math.pow(2, attempt - 1) + Math.random() * 100,
        30000,
      );

      await this.delay(delay);
      return this.sendMessageWithRetry(message, retries - 1, attempt + 1);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private logMessage(message: string, level: 'log' | 'error' = 'log'): void {
    switch (level) {
      case 'error':
        this.logger.error(message);
        break;
      case 'log':
      default:
        this.logger.log(message);
        break;
    }
  }

  unwrap<T = never>(): T {
    throw new Error('Method not implemented.');
  }
}
