// src/books/books.service.ts

import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './book.entity';
import { CreateBookDto } from './dto.create-book'; 
import { UpdateBookDto } from './dto.update-book'; 

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book) 
    private bookRepository: Repository<Book>,
  ) {}

  // Validación 400 Bad Request
  private validateStock(stock: number): void {
    if (stock !== undefined && stock < 0) {
      throw new BadRequestException('Stock inválido'); 
    }
  }

  // Lógica de Creación (POST)
  async create(dto: CreateBookDto): Promise<Book> {
    this.validateStock(dto.stock ?? 0); // Verifica 400

    const newBook = this.bookRepository.create(dto);
    
    try {
      return await this.bookRepository.save(newBook);
    } catch (error) {
        // Captura el error de duplicado de MySQL (Unique Constraint)
        if ((error as any).code === 'ER_DUP_ENTRY') { 
            throw new ConflictException('El libro ya existe');
        }
        throw error;
    }
  }

  // Lógica de Listado (GET)
  async findAll(query: any): Promise<Book[]> {

    return this.bookRepository.find();
  }

  // Lógica de Detalle (GET /:id)
  async findOne(id: number): Promise<Book> {
    const book = await this.bookRepository.findOneBy({ id });
    if (!book) {
      throw new NotFoundException(`Libro con ID ${id} no existe`);
    }
    return book;
  }

  // Lógica de Actualización (PATCH)
  async update(id: number, dto: UpdateBookDto): Promise<Book> {
    this.validateStock(dto.stock ?? 0); // Verifica 400
    
    const book = await this.bookRepository.findOneBy({ id });
    if (!book) {
      throw new NotFoundException(`Libro con ID ${id} no existe`);
    }

    Object.assign(book, dto); 

    try {
        return await this.bookRepository.save(book);
      } catch (error) {
        
        if ((error as any).code === 'ER_DUP_ENTRY') { 
          throw new ConflictException('Conflicto con otro libro');
        }
        throw error;
    }
  }

  // Lógica de Eliminación (DELETE)
  async remove(id: number): Promise<void> {
    const result = await this.bookRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Libro con ID ${id} no existe`); 
    }
  }
}
