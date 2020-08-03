import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiGatewayIntegration } from '@aws-serverless-tools/nest';
import { ApiResponse, ApiOkResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiGatewayIntegration('LoudChorusApiLambda')
  @ApiOkResponse()
  getHello(): string {
    return this.appService.getHello();
  }
}
