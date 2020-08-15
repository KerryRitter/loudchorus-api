import { Controller, Post, Param } from '@nestjs/common';
import { MediaService } from './media.service';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('presign/asset/:file')
  generateAssetUploadPost(@Param('file') file: string) {
    return this.mediaService.generateAssetUploadPost(file);
  }

  @Post('presign/track/:file')
  generateTrackUploadPost(@Param('file') file: string) {
    return this.mediaService.generateTrackUploadPost(file, 10000);
  }
}
