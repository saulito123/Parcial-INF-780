// src/app.module.ts (Ejemplo de estructura)

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './book.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Book])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class BooksModule {}

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'admin',
      database: 'notes_test', 
      entities: [Book], 
      synchronize: true,
    }),
    BooksModule,
  ],
})
export class AppModule {}
