import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { z, ZodError } from 'zod';

@Injectable()
export class ZodValidationPipe<TOutput, TInput = TOutput>
  implements PipeTransform<TInput, TOutput>
{
  constructor(private schema: z.ZodType<TOutput, z.ZodTypeDef, TInput>) {}

  transform(value: TInput): TOutput {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException('Validation failed', {
          cause: error,
          description: error.errors
            .map((e) => `${e.code}: ${e.message}`)
            .join('\n'),
        });
      }
      throw new BadRequestException('Validation failed');
    }
  }
}
