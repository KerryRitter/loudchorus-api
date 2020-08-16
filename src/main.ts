import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get<ConfigService>(ConfigService);
  app.use(cookieParser());
  app.enableCors({
    credentials: true,
    origin: (origin, cb) => {
      const allowedOrigins = [
        config.get('UI_DOMAIN_NAME'),
        config.get('ARTIST_PORTAL_DOMAIN_NAME'),
      ];

      const originHost = origin.split('/')[2].split(':').shift();
      
      return cb(null, allowedOrigins.includes(originHost));
    },
  });
  await app.listen(3000);
}
bootstrap();
