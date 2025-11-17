// test/books.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from '../src/books/books.controller';
import { BooksService } from '../src/books/books.service';
import { Book } from '../src/books/book.entity';
import { NotFoundException, ConflictException } from '@nestjs/common';

// 1. Definición del Mock Service
const mockBookService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

// Datos de prueba
const bookStub: Book = {
  id: 1,
  titulo: 'Clean Code',
  autor: 'Robert C. Martin',
  isbn: '9780132350884',
  anioPublicacion: 2008,
  categoria: 'tecnico',
  stock: 5,
  creadoEn: new Date(),
  actualizadoEn: new Date(),
};

describe('BooksController (Unit Test)', () => {
  let controller: BooksController;
  let service: BooksService;

  beforeEach(async () => {
    // 2. Creación del Módulo de Prueba
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      // 3. Proveer la simulación del servicio
      providers: [
        {
          provide: BooksService,
          useValue: mockBookService,
        },
      ],
    }).compile();

    controller = module.get<BooksController>(BooksController);
    service = module.get<BooksService>(BooksService);

    // Limpia los mocks antes de cada prueba
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });


  it('POST /books: Debería crear un libro y devolverlo (201)', async () => {
    mockBookService.create.mockResolvedValue(bookStub);
    const createDto = { ...bookStub, id: undefined, creadoEn: undefined, actualizadoEn: undefined };

    const result = await controller.create(createDto as any);

    expect(result).toEqual(bookStub);
    expect(mockBookService.create).toHaveBeenCalledWith(createDto);
  });


  it('GET /books: Debería listar libros y devolver la respuesta con la data (200)', async () => {
    // La respuesta de findAll debe ser la estructura con data, total, page, limit
    const findAllResponse = { data: [bookStub], total: 1, page: 1, limit: 10 };
    mockBookService.findAll.mockResolvedValue(findAllResponse);

    const query = { q: 'clean', conStock: '1', page: 1, limit: 10 };
    const result = await controller.findAll(query);

    expect(result).toEqual(findAllResponse);
    expect(mockBookService.findAll).toHaveBeenCalledWith(query);
  });

  it('GET /books/:id: Debería obtener un libro por ID (200)', async () => {
    mockBookService.findOne.mockResolvedValue(bookStub);

    const id = 1;
    const result = await controller.findOne(id);

    expect(result).toEqual(bookStub);
    expect(mockBookService.findOne).toHaveBeenCalledWith(id); // Debe llamar al servicio con el ID como número
  });

  it('GET /books/:id: Debería propagar NotFoundException si el libro no existe (404)', async () => {
    mockBookService.findOne.mockRejectedValue(new NotFoundException());

    await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
  });
  it('PATCH /books/:id: Debería actualizar un libro (200)', async () => {
      const updateDto = { stock: 12 };
      const updatedStub = { ...bookStub, stock: 12 };
      mockBookService.update.mockResolvedValue(updatedStub);

      const result = await controller.update(1, updateDto as any);

      expect(result).toEqual(updatedStub);
      expect(mockBookService.update).toHaveBeenCalledWith(1, updateDto);
  });

  it('PATCH /books/:id: Debería propagar ConflictException si hay duplicado (409)', async () => {
      const updateDto = { titulo: 'Conflicto' };
      mockBookService.update.mockRejectedValue(new ConflictException());

      await expect(controller.update(1, updateDto as any)).rejects.toThrow(ConflictException);
  });



  it('DELETE /books/:id: Debería eliminar un libro y devolver undefined/vacío (204)', async () => {
    mockBookService.remove.mockResolvedValue(undefined);

    const result = await controller.remove(1);

    expect(result).toBeUndefined(); 
    expect(mockBookService.remove).toHaveBeenCalledWith(1);
  });

  it('DELETE /books/:id: Debería propagar NotFoundException si el libro a eliminar no existe (404)', async () => {
    mockBookService.remove.mockRejectedValue(new NotFoundException());

    await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
  });
});
