import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter.js';
import { Stream } from '../src/stream.entity.js';
import { User } from '../src/user.entity.js';

async function registerAndLogin(
  app: INestApplication<App>,
  email = 'test@example.com',
): Promise<string> {
  await request(app.getHttpServer())
    .post('/auth/register')
    .send({ email, password: 'secret123' })
    .expect(201);

  const res = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password: 'secret123' })
    .expect(200);

  return res.body.access_token as string;
}

const streamPayload = {
  title: 'My stream',
  description: 'A description',
  genre: 'documentary',
  thumbnail_url: 'https://example.com/thumbnail.jpg',
  video_url: 'https://example.com/video.mp4',
};

describe('StreamingController (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let token: string;

  beforeAll(async () => {
    // Use an in-memory database so tests don't touch the dev database file.
    process.env.DATABASE_PATH = ':memory:';
    const { AppModule } = await import('../src/app.module.js');

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();

    dataSource = app.get(getDataSourceToken());
  });

  beforeEach(async () => {
    await dataSource.getRepository(Stream).clear();
    await dataSource.getRepository(User).clear();
    token = await registerAndLogin(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('authentication', () => {
    it('rejects requests without a token', async () => {
      await request(app.getHttpServer()).get('/api/streaming').expect(401);
      await request(app.getHttpServer()).post('/api/streaming').send(streamPayload).expect(401);
    });

    it('rejects requests with an invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/streaming')
        .set('Authorization', 'Bearer invalid.token')
        .expect(401);
    });
  });

  describe('CRUD', () => {
    it('creates, lists, reads, updates and deletes a stream', async () => {
      const auth = { Authorization: `Bearer ${token}` };

      const createRes = await request(app.getHttpServer())
        .post('/api/streaming')
        .set(auth)
        .send(streamPayload)
        .expect(201);

      expect(createRes.body).toMatchObject({
        title: 'My stream',
        genre: 'documentary',
      });
      const id = createRes.body.id as number;

      const listRes = await request(app.getHttpServer())
        .get('/api/streaming')
        .set(auth)
        .expect(200);
      expect(listRes.body.meta.total).toBe(1);
      expect(listRes.body.data).toHaveLength(1);

      const detailRes = await request(app.getHttpServer())
        .get(`/api/streaming/${id}`)
        .set(auth)
        .expect(200);
      expect(detailRes.body.id).toBe(id);

      const updateRes = await request(app.getHttpServer())
        .put(`/api/streaming/${id}`)
        .set(auth)
        .send({ title: 'Updated title' })
        .expect(200);
      expect(updateRes.body.title).toBe('Updated title');

      await request(app.getHttpServer())
        .delete(`/api/streaming/${id}`)
        .set(auth)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/api/streaming/${id}`)
        .set(auth)
        .expect(404);
    });

    it('returns 404 for a missing record', async () => {
      await request(app.getHttpServer())
        .get('/api/streaming/9999')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('returns 400 when validation fails', async () => {
      await request(app.getHttpServer())
        .post('/api/streaming')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...streamPayload, title: '' })
        .expect(400);
    });
  });
});
