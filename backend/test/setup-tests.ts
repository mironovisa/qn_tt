import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(__dirname, '..', '.env.test') });

beforeAll(async () => {
  await new Promise(resolve => setTimeout(resolve, 2000));
});

afterAll(async () => {
  await new Promise(resolve => setTimeout(resolve, 1000));
});