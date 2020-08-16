import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import { AwsServiceFactory } from 'nest-aws-sdk';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MediaService {
  private readonly s3: S3;
  private readonly twelveMb = 10485760 * 1.2;

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

  generateAssetUploadPost(file: string) {
    if (!['.png', '.jpg'].includes(file.substring(file.lastIndexOf('.')))) {
      throw new BadRequestException();
    }

    const post = this.s3.createPresignedPost({
      Bucket: this.configService.get('WASABI_ASSETS_BUCKET'),
      Fields: {
        key: this.generateRandomName(file),
      },
      Conditions: [
        ['content-length-range', 0, this.twelveMb / 4],
        // ['starts-with', '$Content-Type', 'image/'],
      ],
    });

    return post;
  }

  generateTrackUploadPost(file: string) {
    const post = this.s3.createPresignedPost({
      Bucket: this.configService.get('WASABI_TRACKS_BUCKET'),
      Fields: {
        key: this.generateRandomName(file),
      },
      Conditions: [
        ['content-length-range', 0, this.twelveMb],
        // ['starts-with', '$Content-Type', 'audio/mpeg'],
      ],
    });
    return post;
  }

  generateTrackDownloadUrl(key: string) {
    const url = this.s3.getSignedUrl('getObject', {
      Bucket: this.configService.get('WASABI_TRACKS_BUCKET'),
      Key: key,
    });
    return { url };
  }

  private generateRandomName(fileName: string) {
    const extension = fileName.split('.').pop();
    return `${uuidv4()}.${extension}`;
  }

  // async getStorageSize(prefix) {
  //   let result: S3.ListObjectsOutput;
  //   let storageSize = 0;
  //   do {
  //     result = await this.publicAssetsS3
  //       .listObjects({
  //         Bucket: this.configService.get('MEDIA_BUCKET'),
  //         Prefix: prefix,
  //         Marker: result?.NextMarker,
  //       })
  //       .promise();
  //     for (const content of result.Contents) {
  //       storageSize += content.Size;
  //     }
  //   } while (result.NextMarker);

  //   return storageSize;
  // }
}
