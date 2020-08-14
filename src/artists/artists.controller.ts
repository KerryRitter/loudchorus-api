import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { Artist, Track } from '../models';
import { InjectRepository, Repository } from 'nest-qldb';
import { User } from '../auth/user.decorator';
import { IUser } from '../auth/user.model';
import { AuthGuard } from '@nestjs/passport';
import { kebabCase } from 'lodash';

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
  @UseGuards(AuthGuard('jwt'))
  async create(@User() user: IUser, @Body() artist: Artist) {
    artist.slug = kebabCase(artist.name);
    artist.ownerId = user.userId;
    artist.managerIds = [{ id: user.userId }];

    return await this.repo.create(artist);
  }

  @Put('')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @User() user: IUser,
    @Body() artistChanges: Partial<Artist>,
  ) {
    const artist = await this.validateOwnership(artistChanges.slug, user);

    artist.name = artistChanges.name;
    artist.shortDescription = artistChanges.shortDescription;
    artist.imageUrl = artistChanges.imageUrl;

    await this.repo.replace(artistChanges.slug, artist);

    return await this.retrieve(artistChanges.slug);
  }

  @Post(':artistSlug/tracks')
  @UseGuards(AuthGuard('jwt'))
  async createTrack(
    @User() user: IUser,
    @Param('artistSlug') artistSlug: string,
    @Body() track: Track,
  ) {
    const artist = await this.validateOwnership(artistSlug, user);

    artist.tracks = artist.tracks?.length ? [...artist.tracks, track] : [track];

    await this.repo.replace(artistSlug, artist);

    return await this.retrieve(artistSlug);
  }

  @Put(':artistSlug/tracks/:trackSlug')
  @UseGuards(AuthGuard('jwt'))
  async updateTrack(
    @User() user: IUser,
    @Param('artistSlug') artistSlug: string,
    @Param('trackSlug') trackSlug: string,
    @Body() trackUpdates: Partial<Track>,
  ) {
    const artist = await this.validateOwnership(artistSlug, user);

    const trackIndex = artist.tracks.findIndex(t => t.slug === trackSlug);
    artist.tracks[trackIndex].name = trackUpdates.name;
    artist.tracks[trackIndex].mediaUrl = trackUpdates.mediaUrl;
    artist.tracks[trackIndex].playlistSlugs = trackUpdates.playlistSlugs;

    await this.repo.replace(artistSlug, artist);

    return await this.retrieve(artistSlug);
  }

  private async validateOwnership(artistSlug: string, user: IUser) {
    const artist = await this.retrieve(artistSlug);

    if (!artist.managerIds?.some(m => m.id === user.userId)) {
      throw new ForbiddenException();
    }

    return artist;
  }
}
