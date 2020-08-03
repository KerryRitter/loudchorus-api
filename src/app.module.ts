import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AwsServerlessToolsModule, CloudFormationLambdaParametersConfig } from '@aws-serverless-tools/nest';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    AwsServerlessToolsModule,
    ConfigModule.forRoot({
      load: [CloudFormationLambdaParametersConfig],
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
