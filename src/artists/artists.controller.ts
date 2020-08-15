import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  UseGuards,
  ForbiddenException,
  BadRequestException,
  Delete,
} from '@nestjs/common';
import { Artist, Track, Release } from '../models';
import { InjectRepository, Repository, QldbQueryService } from 'nest-qldb/dist';
import { User } from '../auth/user.decorator';
import { IUser } from '../auth/user.model';
import { AuthGuard } from '@nestjs/passport';
import { kebabCase, pullAt } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

@Controller('')
export class ArtistsController {
  constructor(
    @InjectRepository(Artist) private readonly repo: Repository<Artist>,
    private readonly qs: QldbQueryService,
  ) {}

  @Get('artists')
  async getAll() {
    const result = await this.repo.query({
      filter: `1 = 1`,
    });
    return result;
  }

  @Get('artists/:artistSlug')
  async retrieve(@Param('artistSlug') artistSlug: string) {
    const result = await this.repo.query({
      filter: `slug = '${artistSlug}'`,
    });
    return result?.pop();
  }

  @Post('artists')
  @UseGuards(AuthGuard('jwt'))
  async create(@User() user: IUser, @Body() artist: Artist) {
    this.validateArtist(artist);

    const existingArtistWithUrl = await this.retrieve(artist.slug);
    if (existingArtistWithUrl) {
      throw new BadRequestException('This artist URL is already in use.');
    }

    artist.ownerId = user.userId;
    artist.managerIds = [{ id: user.userId }];

    return await this.repo.create(artist);
  }

  @Put('artists/:artistSlug')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @User() user: IUser,
    @Param('artistSlug') artistSlug: string,
    @Body() artistChanges: Partial<Artist>,
  ) {
    this.validateArtist(artistChanges);

    const artist = await this.validateOwnership(artistSlug, user);

    if (artist.id !== artistChanges.id) {
      throw new BadRequestException('Unexpected artist ID mismatch.');
    }

    artist.name = artistChanges.name;
    artist.shortDescription = artistChanges.shortDescription;
    artist.imageUrl = artistChanges.imageUrl ?? '';
    artist.releases = [];
    await this.repo.replace(artist.id, artist);

    return await this.retrieve(artistChanges.slug);
  }

  @Post('artists/:artistSlug/releases')
  @UseGuards(AuthGuard('jwt'))
  async createRelease(
    @User() user: IUser,
    @Param('artistSlug') artistSlug: string,
    @Body() release: Release,
  ) {
    const artist = await this.validateOwnership(artistSlug, user);

    this.validateRelease(release);

    release.id = uuidv4();

    if (artist.releases.find(s => s.slug === release.slug)) {
      throw new BadRequestException('This release URL is already in use.');
    }

    artist.releases = artist.releases?.length
      ? [...artist.releases, release]
      : [release];

    await this.repo.replace(artist.id, artist);

    return await this.retrieve(artistSlug);
  }

  @Put('artists/:artistSlug/releases')
  @UseGuards(AuthGuard('jwt'))
  async updateRelease(
    @User() user: IUser,
    @Param('artistSlug') artistSlug: string,
    @Body() releaseUpdates: Partial<Release>,
  ) {
    const artist = await this.validateOwnership(artistSlug, user);

    this.validateRelease(releaseUpdates);

    if (
      artist.releases.find(
        s => s.slug === releaseUpdates.slug && s.id !== releaseUpdates.id,
      )
    ) {
      throw new BadRequestException('This release URL is already in use.');
    }

    const releaseIndex = artist.releases.findIndex(
      t => t.slug === releaseUpdates.slug,
    );
    artist.releases[releaseIndex].name = releaseUpdates.name;
    artist.releases[releaseIndex].imageUrl = releaseUpdates.imageUrl;
    artist.releases[releaseIndex].tracks = releaseUpdates.tracks;

    await this.repo.replace(artist.id, artist);

    return await this.retrieve(artistSlug);
  }

  @Delete('artists/:artistSlug/releases/:releaseSlug')
  @UseGuards(AuthGuard('jwt'))
  async deleteRelease(
    @User() user: IUser,
    @Param('artistSlug') artistSlug: string,
    @Param('releaseSlug') releaseSlug: string,
  ) {
    const artist = await this.validateOwnership(artistSlug, user);

    pullAt(
      artist.releases,
      artist.releases.findIndex(t => t.slug === releaseSlug),
    );

    await this.repo.replace(artist.id, artist);
  }

  @Get('my/artists')
  @UseGuards(AuthGuard('jwt'))
  async getCurrentUserArtists(@User() user: IUser) {
    return await this.qs.query(
      `
      SELECT a.*
      FROM artists AS a, 
          a.managerIds AS m
      WHERE m.id = ?
      `,
      user.userId,
    );
  }

  private async validateOwnership(artistSlug: string, user: IUser) {
    const artist = await this.retrieve(artistSlug);

    if (!artist?.managerIds?.some(m => m.id === user.userId)) {
      throw new ForbiddenException();
    }

    return artist;
  }

  private validateArtist(artist: Partial<Artist>) {
    if (!artist.name?.trim()?.length) {
      throw new BadRequestException('Missing artist name.');
    }
    if (!artist.slug?.trim()?.length) {
      throw new BadRequestException('Missing artist URL.');
    }
    if (!artist.shortDescription?.trim()?.length) {
      throw new BadRequestException('Missing artist description.');
    }
    if (!artist.imageUrl?.trim()?.length) {
      throw new BadRequestException('Missing artist image.');
    }
  }

  private validateRelease(release: Partial<Release>) {
    if (!release.name?.trim()?.length) {
      throw new BadRequestException('Missing release name.');
    }
    if (!release.slug?.trim()?.length) {
      throw new BadRequestException('Missing release URL.');
    }
    if (!release.imageUrl?.trim()?.length) {
      throw new BadRequestException('Missing release image.');
    }

    for (const track of release.tracks) {
      if (!track.name?.trim()?.length) {
        throw new BadRequestException('Missing track name.');
      }
      if (!track.slug?.trim()?.length) {
        throw new BadRequestException('Missing track URL.');
      }
      if (!track.mediaUrl?.trim()?.length) {
        throw new BadRequestException('Missing track media.');
      }
    }
  }
}
