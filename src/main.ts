import './instrument';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { MessageDeserializer } from './client-comms/serialization/messageDeserializer';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [
        'amqp://' +
          process.env.RMQ_USERNAME +
          ':' +
          process.env.RMQ_PASSWORD +
          '@fargs.bibbythe.dev:1752/fargs',
      ],
      exchange: 'client-direct',
      exchangeType: 'direct',
      routingKey: 'server',
      queue: 'server-inbound',
      queueOptions: {
        exclusive: true,
        durable: false,
      },
      deserializer: new MessageDeserializer(),
    },
  });
  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();
