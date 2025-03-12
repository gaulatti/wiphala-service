import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { SequelizeModule, SequelizeModuleOptions } from '@nestjs/sequelize';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthorizationModule } from './authorization/authorization.module';
import { CloudWatchService } from './core/cloudwatch/cloudwatch.service';
import { CoreModule } from './core/core.module';
import { MetricsInterceptor } from './core/metrics/metrics.interceptor';
import { DalModule } from './dal/dal.module';
import { OrchestratorModule } from './orchestrator/orchestrator.module';
/**
 * The AWS Secrets Manager client.
 */
const secretsManager = new SecretsManagerClient();

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        /**
         * Retrieve the database name from the configuration.
         */
        const database =
          configService.get<string>('DB_MONGO_DATABASE') ||
          configService.get<string>('DB_DATABASE');

        /**
         * If the USE_LOCAL_MONGO_DATABASE environment variable is set to true, use the local MongoDB database.
         */
        if (configService.get<string>('USE_LOCAL_MONGO_DATABASE') === 'true') {
          const host = configService.get<string>('DB_HOST');
          const username = configService.get<string>('DB_USERNAME');
          const password = configService.get<string>('DB_PASSWORD');
          const encodedUsername = encodeURIComponent(username!);
          const encodedPassword = encodeURIComponent(password!);
          return {
            uri: `mongodb://${encodedUsername}:${encodedPassword}@${host}:27017/${database}?authSource=admin`,
          };
        }

        /**
         * Retrieve the secret from AWS Secrets Manager.
         */
        const secretId = configService.get<string>('DB_CREDENTIALS');
        const secretsManagerClient = new SecretsManagerClient({
          region: configService.get<string>('AWS_REGION') || 'us-east-1',
        });

        const secretResponse = await secretsManagerClient.send(
          new GetSecretValueCommand({ SecretId: secretId }),
        );

        if (secretResponse.SecretString) {
          const { host, username, password } = JSON.parse(
            secretResponse.SecretString,
          );

          const encodedUsername = encodeURIComponent(username);
          const encodedPassword = encodeURIComponent(password);
          return {
            uri: `mongodb://${encodedUsername}:${encodedPassword}@${host}:27017/${database}?authSource=admin`,
          };
        }

        throw new Error(
          'Failed to retrieve database credentials from AWS Secrets Manager.',
        );
      },
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const defaultConfig: SequelizeModuleOptions = {
          dialect: 'mysql',
          port: +3306,
          models: [join(__dirname, '**/*.model.ts')],
          autoLoadModels: true,
        };

        if (configService.get('USE_LOCAL_DATABASE') === 'true') {
          return {
            ...defaultConfig,
            host: configService.get('DB_HOST'),
            port: +configService.get('DB_PORT'),
            username: configService.get('DB_USERNAME'),
            password: configService.get('DB_PASSWORD'),
            database: configService.get('DB_DATABASE'),
          };
        }

        /**
         * Retrieve the secret from AWS Secrets Manager.
         */
        const secretResponse = await secretsManager.send(
          new GetSecretValueCommand({
            SecretId: configService.get('DB_CREDENTIALS'),
          }),
        );

        /**
         * If the secret response contains a secret string, parse it and return the database configuration.
         */
        if (secretResponse.SecretString) {
          const { host, port, username, password } = JSON.parse(
            secretResponse.SecretString,
          );

          const remoteConfig = {
            ...defaultConfig,
            host: host,
            port: +port,
            username,
            password,
            database: configService.get('DB_DATABASE'),
          };

          return {
            ...remoteConfig,
          };
        }

        throw new Error(
          'Failed to retrieve database credentials from AWS Secrets Manager.',
        );
      },
      inject: [ConfigService],
    }),
    CoreModule,
    DalModule,
    AuthorizationModule,
    OrchestratorModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    CloudWatchService,
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
  ],
})
export class AppModule {}
