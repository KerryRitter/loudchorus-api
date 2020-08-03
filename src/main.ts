import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ApiGatewayOpenApi } from '@aws-serverless-tools/nest';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const openApi = await app.get(ApiGatewayOpenApi)
    .setNestAppContext(app)
    .enableDocumentationWebServer();
  await openApi.generateOpenApiFile();

  await app.listen(3000);
}
bootstrap();