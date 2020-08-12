import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { Artist, Track, Playlist } from '../src/models';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // it('/artists (POST)', () => {
  //   return request(app.getHttpServer())
  //     .post('/artists')
  //     .send(
  //       new Artist({
  //         id: 'nothing-good',
  //         name: 'Nothing Good',
  //         imageUrl:
  //           'https://s.gravatar.com/avatar/e2ddebed02095dddf92bc28ca83ef67b?size=496&default=retro',
  //         shortDescription: 'An awesome band from Illinois',
  //         tracks: [
  //           new Track({
  //             id: 'ricflair',
  //             name: 'Ric Flair',
  //             mediaUrl: '/assets/ricflair.mp3',
  //             playlistIds: ['playlist1'],
  //           }),
  //         ],
  //         playlists: [new Playlist({ id: 'playlist1', name: 'Playlist 1 ' })],
  //       }),
  //     )
  //     .expect(201);
  // });

  it('/artists/nothing-good (GET)', () => {
    return request(app.getHttpServer())
      .get('/artists/nothing-good')
      .expect(200)
      .then(r => console.log(r.body));
  });
});
