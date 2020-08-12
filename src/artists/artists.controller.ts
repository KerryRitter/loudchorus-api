import { Controller, Get, Param, Post, Body, Put } from '@nestjs/common';
import { Artist, Track } from '../models';
import { InjectRepository, Repository } from 'nest-qldb';

@Controller('artists')
export class ArtistsController {
  constructor(
    @InjectRepository(Artist) private readonly repo: Repository<Artist>,
  ) {}

  @Get(':artistId')
  async retrieve(@Param('artistId') artistId: string) {
    const getAll = await this.repo.query({});
    console.log(getAll);
    return await this.repo.retrieve(artistId);
  }

  @Post('')
  async create(@Body() artist: Artist) {
    return await this.repo.create(artist);
  }

  @Put(':artistId')
  async replace(@Param('artistId') artistId: string, @Body() artist: Artist) {
    return await this.repo.replace(artistId, artist);
  }

  @Post(':artistId/tracks')
  async createTrack(@Param('artistId') artistId: string, @Body() track: Track) {
    const artist = await this.repo.retrieve(artistId);
    artist.tracks = artist.tracks?.length
      ? [...artist.tracks, track]
      : [track];
    return await this.repo.replace(artistId, artist);
  }

  @Put(':artistId/tracks/:trackId')
  async replaceTrack(@Param('artistId') artistId: string, @Param('trackId') trackId: string, @Body() track: Track) {
    const artist = await this.repo.retrieve(artistId);
    const trackIndex = artist.tracks.findIndex(t => t.id === trackId);
    artist.tracks[trackIndex] = track;
    return await this.repo.replace(artistId, artist);
  }
}
