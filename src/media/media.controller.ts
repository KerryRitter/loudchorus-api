import { Controller, Post, Param, Get } from '@nestjs/common';
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
    return this.mediaService.generateTrackUploadPost(file);
  }

  @Get('download/track/:file')
  generateTrackDownloadUrl(@Param('file') file: string) {
    return this.mediaService.generateTrackDownloadUrl(file);
  }
}
