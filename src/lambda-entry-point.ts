import { AppModule } from './app.module';
import { createExpressHandler } from '@aws-serverless-tools/nest';

export const handler = createExpressHandler(AppModule);