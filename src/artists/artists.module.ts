import { Module } from '@nestjs/common';
import { ArtistsController } from './artists.controller';

@Module({
  controllers: [ArtistsController],
  providers: [],
})
export class ArtistsModule {}
