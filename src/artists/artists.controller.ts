import { Controller, Get, Param, Post, Body, Put } from '@nestjs/common';
import { Artist, Track } from '../models';
import { InjectRepository, Repository } from 'nest-qldb';

@Controller('artists')
export class ArtistsController {
  constructor(
    @InjectRepository(Artist) private readonly repo: Repository<Artist>,
  ) {}

  @Get('')
  async getAll() {
    const result = await this.repo.query({
      filter: `1 = 1`,
    });
    return result;
  }

  @Get(':artistSlug')
  async retrieve(@Param('artistSlug') artistSlug: string) {
    const result = await this.repo.query({
      filter: `slug = '${artistSlug}'`,
    });
    return result?.pop();
  }

  @Post('')
  async create(@Body() artist: Artist) {
    return await this.repo.create(artist);
  }

  @Put(':artistSlug')
  async replace(@Param('artistSlug') artistSlug: string, @Body() artist: Artist) {
    return await this.repo.replace(artistSlug, artist);
  }

  @Post(':artistSlug/tracks')
  async createTrack(@Param('artistSlug') artistSlug: string, @Body() track: Track) {
    const artist = await this.repo.retrieve(artistSlug);
    artist.tracks = artist.tracks?.length
      ? [...artist.tracks, track]
      : [track];
    return await this.repo.replace(artistSlug, artist);
  }

  @Put(':artistSlug/tracks/:trackSlug')
  async replaceTrack(@Param('artistSlug') artistSlug: string, @Param('trackSlug') trackSlug: string, @Body() track: Track) {
    const artist = await this.repo.retrieve(artistSlug);
    const trackIndex = artist.tracks.findIndex(t => t.slug === trackSlug);
    artist.tracks[trackIndex] = track;
    return await this.repo.replace(artistSlug, artist);
  }
}
