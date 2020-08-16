import { AppModule } from './app.module';
import { createExpressHandler } from '@aws-serverless-tools/nest';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';

export const handler = createExpressHandler(AppModule, null, app => {
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
}
);
