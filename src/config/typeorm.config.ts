import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'fargs.bibbythe.dev',
  port: 5432,
  database: process.env.DB_DB ? process.env.DB_DB : 'fargsdev',
  password: process.env.DB_PASSWORD ? process.env.DB_PASSWORD : 'fargsdev',
  username: process.env.DB_USERNAME ? process.env.DB_USERNAME : 'fargsdev',
  synchronize: false,
  entities: ['**/*.entity.ts'],
  migrations: ['src/database/migrations/*-migration.ts'],
  migrationsRun: false,
  logging: true,
});

export default AppDataSource;
