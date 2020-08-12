import { QldbTable } from 'nest-qldb';

@QldbTable({
  tableName: 'artists',
  tableIndexes: ['id'],
})
export class Artist {
  id: string;
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
  id: string;
  name: string;
  mediaUrl: string;
  playlistIds: string[] = [];

  constructor(partial: Partial<Track>) {
    Object.assign(this, partial);
  }
}

export class Playlist {
  id: string;
  name: string;

  constructor(partial: Partial<Playlist>) {
    Object.assign(this, partial);
  }
}
