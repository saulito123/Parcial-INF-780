
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { Book } from './book.entity';
import { CreateBookDto } from './dto.create-book';
import { UpdateBookDto } from './dto.update-book';

@Injectable()
export class BooksService {
  private books: Book[] = [];
  private seq = 1;

  create(dto: CreateBookDto): Book {
    const exists = this.books.find(b => b.titulo === dto.titulo && b.autor === dto.autor);
    if (exists) throw new ConflictException('El libro ya existe');
    if (dto.stock < 0) throw new BadRequestException('Stock inválido');
    const book: Book = { id: this.seq++, ...dto, creadoEn: new Date(), actualizadoEn: new Date() };
    this.books.push(book);
    return book;
  }

  findAll(query: any) {
    let data = [...this.books];
    if (query.q) {
      const q = String(query.q).toLowerCase();
      data = data.filter(b => b.titulo.toLowerCase().includes(q) || b.autor.toLowerCase().includes(q));
    }
    if (query.conStock === '1' || query.conStock === 1 || query.conStock === true) {
      data = data.filter(b => b.stock > 0);
    }
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const total = data.length;
    const start = (page - 1) * limit;
    const paged = data.slice(start, start + limit);
    return { data: paged, total, page, limit };
  }

  findOne(id: number) {
    const b = this.books.find(x => x.id === id);
    if (!b) throw new NotFoundException('No encontrado');
    return b;
  }

    update(id: number, dto: UpdateBookDto) {
    const idx = this.books.findIndex(x => x.id === id);
    if (idx === -1) throw new NotFoundException('No encontrado');

    // Acceder de forma segura a propiedades opcionales de UpdateBookDto
    const dtoAny = dto as any;

    // conflicto: si cambiás titulo+autor y coinciden con otro libro
    if (dtoAny.titulo || dtoAny.autor) {
      const newTitulo = dtoAny.titulo ?? this.books[idx].titulo;
      const newAutor = dtoAny.autor ?? this.books[idx].autor;
      const conflict = this.books.find(b => b.id !== id && b.titulo === newTitulo && b.autor === newAutor);
      if (conflict) throw new ConflictException('Conflicto con otro libro');
    }

    const updated = { ...this.books[idx], ...dtoAny, actualizadoEn: new Date() };
    this.books[idx] = updated;
    return updated;
  }


  remove(id: number) {
    const idx = this.books.findIndex(x => x.id === id);
    if (idx === -1) throw new NotFoundException('No encontrado');
    this.books.splice(idx,1);
    return;
  }
}
