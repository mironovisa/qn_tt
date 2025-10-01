import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

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
  });

  it('/auth/register (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test-e2e@example.com',
        password: 'password123',
      })
      .expect(201);

    expect(response.body).toHaveProperty('access_token');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user.email).toBe('test-e2e@example.com');
  });

  it('/auth/login (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test-e2e@example.com',
        password: 'password123',
      })
      .expect(201);

    expect(response.body).toHaveProperty('access_token');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user.email).toBe('test-e2e@example.com');
  });

  it('/auth/register (POST) - should fail with existing email', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test-e2e@example.com',
        password: 'password123',
      })
      .expect(409);
  });

  afterAll(async () => {
    await app.close();
  });
});