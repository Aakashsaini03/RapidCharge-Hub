import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

config();
const configService = new ConfigService();
export const dataSourceOptions: DataSourceOptions = {
type: 'mssql',
  host: configService.get<string>('DB_HOST'),
  port: parseInt(configService.get<string>('DB_PORT') || '1433'),
  username: configService.get<string>('DB_USER'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_NAME'),
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/db/migrations/*.js'],
  synchronize: true,
  extra: {
    options: {
      encrypt: false, // Disable encryption
      trustServerCertificate: true, // Skip self-signed certificate check
    },
  },
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;

