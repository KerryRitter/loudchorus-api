import { QldbTable } from 'nest-qldb/dist';

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
  releases: Release[] = [];

  ownerId: string;
  managerIds: { id: string }[];

  constructor(partial: Partial<Artist>) {
    Object.assign(this, partial);
  }
}

export class Release {
  id?: string;

  slug: string;
  name: string;
  imageUrl: string;

  tracks: Track[] = [];

  constructor(partial: Partial<Release>) {
    Object.assign(this, partial);
  }
}

export class Track {
  id?: string;

  slug: string;
  name: string;
  mediaUrl: string;

  constructor(partial: Partial<Track>) {
    Object.assign(this, partial);
  }
}

export class Tokens {
  id_token: string;
  access_token: string;
  refresh_token: string;
}
