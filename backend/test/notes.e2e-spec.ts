import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('NotesController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
    }));
    
    app.enableCors({
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    });

    await app.init();

    const authResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'notes-test@example.com',
        password: 'password123',
      });

    authToken = authResponse.body.access_token;
  });

  it('/notes (GET) - should require auth', async () => {
    await request(app.getHttpServer())
      .get('/notes')
      .expect(401);
  });

  it('/notes (POST) - should create note', async () => {
    const response = await request(app.getHttpServer())
      .post('/notes')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Test Note E2E',
        content: 'Test content for E2E',
        tags: ['test', 'e2e'],
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe('Test Note E2E');
    expect(response.body.tags).toEqual(['test', 'e2e']);
  });

  it('/notes (GET) - should return notes for authenticated user', async () => {
    const response = await request(app.getHttpServer())
      .get('/notes')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('/notes?tags=test (GET) - should filter by tags', async () => {
    const response = await request(app.getHttpServer())
      .get('/notes?tags=test')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    response.body.forEach(note => {
      expect(note.tags).toContain('test');
    });
  });

  afterAll(async () => {
    await app.close();
  });
});