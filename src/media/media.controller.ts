import { Controller, Post, Param } from '@nestjs/common';
import { MediaService } from './media.service';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('presign/:file')
  generateAssetUploadPost(@Param('file') file: string) {
    return this.mediaService.generateAssetUploadPost(file);
  }
}
