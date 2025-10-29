
import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';

describe('BooksController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist:true, transform:true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/books (POST) creates', async () => {
    const res = await request(app.getHttpServer())
      .post('/books')
      .send({ titulo:'Clean Code', autor:'Robert C. Martin', isbn:'9780132350884', anioPublicacion:2008, categoria:'tecnico', stock:5 })
      .expect(201);
    expect(res.body).toHaveProperty('id');
  });

  it('/books (GET) list and pagination', async () => {
    const res = await request(app.getHttpServer())
      .get('/books?q=Clean&page=1&limit=10')
      .expect(200);
    expect(res.body).toHaveProperty('data');
  });

  it('/books/:id GET 404', async () => {
    await request(app.getHttpServer()).get('/books/9999').expect(404);
  });

  it('/books/:id PATCH and DELETE', async () => {
    const create = await request(app.getHttpServer())
      .post('/books')
      .send({ titulo:'ToUpdate', autor:'A', isbn:'i', anioPublicacion:2001, categoria:'t', stock:2 })
      .expect(201);
    const id = create.body.id;
    await request(app.getHttpServer()).patch(`/books/${id}`).send({ stock: 10 }).expect(200);
    await request(app.getHttpServer()).delete(`/books/${id}`).expect(204);
  });
});
