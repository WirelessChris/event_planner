import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbType = configService.get('DB_TYPE', 'sqlite');

        if (dbType === 'mysql') {
          return {
            type: 'mysql',
            host: configService.get('DB_HOST', 'localhost'),
            port: configService.get('DB_PORT', 3306),
            username: configService.get('DB_USERNAME', 'root'),
            password: configService.get('DB_PASSWORD', ''),
            database: configService.get('DB_DATABASE', 'event_planner'),
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: configService.get('NODE_ENV') !== 'production',
            ssl: configService.get('DB_SSL') === 'true' ? { rejectUnauthorized: true } : false,
          };
        }

        // Default to SQLite for easy development
        return {
          type: 'sqlite',
          database: configService.get('DB_PATH', 'event_planner.db'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true,
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    EventsModule,
    UsersModule,
  ],
})
export class AppModule {}
