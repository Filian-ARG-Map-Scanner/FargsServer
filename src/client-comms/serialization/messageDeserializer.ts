import { Deserializer } from '@nestjs/microservices/interfaces/deserializer.interface';
import { Message, MessagesToContentMap } from '../types/Message';
import { MessageType } from '../types/MessageType';

export class MessageDeserializer<
  TInput = any,
  TOutput = any,
> implements Deserializer {
  deserialize(
    value: TInput,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options?: Record<string, any>,
  ): TOutput | Promise<TOutput> {
    const test = value as Message<keyof MessagesToContentMap>;
    if (!Object.values(MessageType).includes(test.type)) {
      // @ts-expect-error aaa
      return value;
    }
    // @ts-expect-error aaa
    return { pattern: test.type, data: test };
  }
}
