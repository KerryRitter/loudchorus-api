import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NestQldbModule, QldbDriver } from 'nest-qldb';
import { ServiceConfigurationOptions } from 'aws-sdk/lib/service';
import { SharedIniFileCredentials } from 'aws-sdk';
import { AwsSdkModule } from 'nest-aws-sdk';
import { AppController } from './app.controller';
import { ArtistsModule } from './artists/artists.module';
import { MediaModule } from './media/media.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    NestQldbModule.forRootAsync({
      qldbDriver: {
        useFactory: async (configService: ConfigService) => {
          const service: ServiceConfigurationOptions = {
            region: 'us-east-1',
            credentials: configService.get('AWS_PROFILE')?.length
              ? new SharedIniFileCredentials({
                  profile: configService.get('AWS_PROFILE'),
                })
              : null,
          };

          return new QldbDriver(configService.get('QLDB_LEDGER'), service);
        },
        inject: [ConfigService],
      },
      createTablesAndIndexes: true,
    }),
    ArtistsModule,
    MediaModule,
    AwsSdkModule.forRootAsync({
      defaultServiceOptions: {
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (cs: ConfigService) => {
          if (cs.get('AWS_PROFILE')) {
            return {
              region: 'us-east-1',
              credentials: new SharedIniFileCredentials({
                profile: cs.get('AWS_PROFILE'),
              }),
            };
          }
          return null;
        },
      },
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
