import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import { AwsServiceFactory } from 'nest-aws-sdk';

@Injectable()
export class MediaService {
  private readonly s3: S3;
  
  constructor(
    private readonly configService: ConfigService,
    awsServiceFactory: AwsServiceFactory,
  ) {
    this.s3 = awsServiceFactory.create(S3, {
      endpoint: this.configService.get('WASABI_ENDPOINT'),
      accessKeyId: this.configService.get('WASABI_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('WASABI_SECRET_ACCESS_KEY'),
    });
  }

  generatePublicAssetUploadPost(file: string) {
    if (!['.png', '.jpg'].includes(file.substring(file.lastIndexOf('.')))) {
      throw new BadRequestException();
    }
    const post = this.publicAssetsS3.createPresignedPost({
      Bucket: this.configService.get('PUBLIC_ASSETS_BUCKET'),
      Fields: {
        key: file,
      },
    });
    return post;
  }

  generateMediaDownloadUrl(bucket: string, key: string) {
    return this.publicAssetsS3.getSignedUrl('getObject', { Bucket: bucket, Key: key });
  }

  generateMediaUploadPost(file: string, sizeLimit: number) {
    const post = this.publicAssetsS3.createPresignedPost({
      Bucket: this.configService.get('MEDIA_BUCKET'),
      Fields: {
        key: file,
      },
      Conditions: [['content-length-range', 0, sizeLimit]],
    });
    return post;
  }

  async getStorageSize(prefix) {
    let result: S3.ListObjectsOutput;
    let storageSize = 0;
    do {
      result = await this.publicAssetsS3
        .listObjects({
          Bucket: this.configService.get('MEDIA_BUCKET'),
          Prefix: prefix,
          Marker: result?.NextMarker,
        })
        .promise();
      for (const content of result.Contents) {
        storageSize += content.Size;
      }
    } while (result.NextMarker);

    return storageSize;
  }
}
