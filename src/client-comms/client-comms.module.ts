import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EventListenerController } from './event-listener.controller';
import { MessageDeserializer } from './serialization/messageDeserializer';
import FoundBlock from '../database/entites/FoundBlock.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScanMangerService } from './scan-manger.service';
import Client from '../database/entites/Client.entity';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'CLIENT_DIRECT_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [
            'amqp://fargsserver:fargsserver@fargs.bibbythe.dev:1752/fargs',
          ],
          exchange: 'client-direct',
          exchangeType: 'direct',
          queueOptions: {
            durable: true,
          },
          wildcards: true,
          deserializer: new MessageDeserializer(),
        },
      },
      {
        name: 'CLIENT_FANOUT_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [
            'amqp://fargsserver:fargsserver@fargs.bibbythe.dev:1752/fargs',
          ],
          exchange: 'client-fanout',
          exchangeType: 'fanout',
          queueOptions: {
            durable: true,
          },
          deserializer: new MessageDeserializer(),
        },
      },
    ]),
    TypeOrmModule.forFeature([FoundBlock, Client]),
  ],
  controllers: [EventListenerController],
  providers: [ScanMangerService],
})
export class ClientCommsModule {}
