import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { AwsSdkModule } from 'nest-aws-sdk';
import { S3 } from 'aws-sdk';

@Module({
  imports: [],
  providers: [
    MediaService,
  ],
})
export class MediaModule {}
