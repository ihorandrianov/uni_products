import { Server, CustomTransportStrategy } from '@nestjs/microservices';
import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  QueueAttributeName,
  Message,
} from '@aws-sdk/client-sqs';
import { parseBody } from 'schemas/message.schema';
import { ZodError } from 'Zod';

const WAIT_TIME_IN_SECONDS = 20;
const MAX_NUMBER_OF_MESSAGES = 10;

export class SqsServer extends Server implements CustomTransportStrategy {
  private isListening: boolean;

  constructor(
    private sqs: SQSClient,
    private queueUrl: string,
  ) {
    super();
    this.isListening = true;
  }

  listen(callback: () => void) {
    void this.pollQueue();
    callback();
  }

  async close() {
    this.isListening = false;
    // Wait for in-flight messages to complete
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  on() {
    throw new Error('Unimplemented!');
  }

  unwrap<T = never>(): T {
    throw new Error('Unimplemented!');
  }

  private async pollQueue(): Promise<void> {
    while (this.isListening) {
      try {
        const command = new ReceiveMessageCommand({
          QueueUrl: this.queueUrl,
          WaitTimeSeconds: WAIT_TIME_IN_SECONDS,
          MaxNumberOfMessages: MAX_NUMBER_OF_MESSAGES,
          MessageAttributeNames: ['All'], // Fetch all message attributes
          AttributeNames: [QueueAttributeName.All], // Request all attributes
        });

        const { Messages } = await this.sqs.send(command);

        if (Messages) {
          await Promise.all(
            Messages.map(async (message) => {
              try {
                await this.handleMessage(message);
              } catch (error) {
                if (error instanceof ZodError) {
                  await this.deleteMessage(message);
                }
                if (error instanceof Error) {
                  this.logger.error(
                    `Error processing message: ${error.message}`,
                  );
                }
              }
            }),
          );
        }
      } catch (error) {
        if (error instanceof Error) {
          this.logger.error(
            `Error receiving messages from ${this.queueUrl}: ${error.message}`,
          );
        }
      }
    }
  }

  private async handleMessage(message: Message) {
    const body = message.Body;
    if (!body) {
      await this.deleteMessage(message);
      return;
    }

    const { action, data } = parseBody(body);
    const handlers = this.getHandlers();
    const handler = handlers.get(action);
    if (!handler) {
      this.logger.warn(`No handler found for action: ${action}`);
      await this.deleteMessage(message);
      return;
    }
    this.logger.log(`Processing message: ${message.MessageId}`);
    await handler(data);
    await this.deleteMessage(message);
  }

  private async deleteMessage(message: Message) {
    const command = new DeleteMessageCommand({
      QueueUrl: this.queueUrl,
      ReceiptHandle: message.ReceiptHandle,
    });
    await this.sqs.send(command);
    this.logger.log(
      `Deleted message: ${message.MessageId} from ${this.queueUrl}`,
    );
  }
}
