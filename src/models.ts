import { QldbTable } from 'nest-qldb';

@QldbTable({
  tableName: 'artists',
  tableIndexes: ['slug'],
})
export class Artist {
  id?: string;
  slug: string;
  name: string;
  imageUrl: string;
  shortDescription: string;
  tracks: Track[] = [];
  playlists: Playlist[] = [];

  constructor(partial: Partial<Artist>) {
    Object.assign(this, partial);
  }
}

export class Track {
  id?: string;
  slug: string;
  name: string;
  mediaUrl: string;
  playlistSlugs: string[] = [];

  constructor(partial: Partial<Track>) {
    Object.assign(this, partial);
  }
}

export class Playlist {
  id?: string;
  slug: string;
  name: string;

  constructor(partial: Partial<Playlist>) {
    Object.assign(this, partial);
  }
}
