import { Module } from '@nestjs/common';
import { SentryModule } from '@sentry/nestjs/setup';
import { ClientCommsModule } from './client-comms/client-comms.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    SentryModule.forRoot(),
    ClientCommsModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
      migrationsRun: true,
      migrationsTableName: 'migrations',
      migrationsTransactionMode: 'all',
      host: 'fargs.bibbythe.dev',
      port: 5432,
      database: process.env.DB_DB ? process.env.DB_DB : 'fargsdev',
      password: process.env.DB_PASSWORD ? process.env.DB_PASSWORD : 'fargsdev',
      username: process.env.DB_USERNAME ? process.env.DB_USERNAME : 'fargsdev',
      synchronize: false,
      entities: [__dirname + '/database/entities/*.entity{.ts,.js}'],
      autoLoadEntities: true,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
