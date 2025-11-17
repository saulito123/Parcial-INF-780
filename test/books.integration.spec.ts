import { Repository } from 'typeorm';
import { BooksService } from 'src/books/books.service';
import { Book } from 'src/books/book.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';

describe('Books Integration Tests', () => {
  let service: BooksService;
  let repository: Repository<Book>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
        TypeOrmModule.forFeature([Book]),
      ],
      providers: [BooksService],
    }).compile();

    service = module.get<BooksService>(BooksService);
    repository = module.get<Repository<Book>>(getRepositoryToken(Book));
  });

  // Después de cada prueba
  afterEach(async () => {
    await repository.query('DELETE FROM book;');
  });

  // Después de finalizar las pruebas
  afterAll(async () => {
    const connection = repository.manager.connection;
    if (connection.isInitialized) {
      await connection.destroy();
    }
  });

  // Prueba de creación de nuevo libro
  it('Debería crear un libro en la base de datos', async () => {
    const nuevoLibro = {
      titulo: 'Libro de prueba',
      autor: 'Autor desconocido',
      isbn: '9780000000000',
      anioPublicacion: 2024,
      categoria: 'prueba',
      stock: 5,
    };

    const libroCreado = await service.create(nuevoLibro);

    // Verificar la respuesta del servicio
    expect(libroCreado).toHaveProperty('id');
    expect(libroCreado.titulo).toBe(nuevoLibro.titulo);
    expect(libroCreado.autor).toBe(nuevoLibro.autor);

    // Verificar que el libro se haya guardado en la base de datos
    const librosEnBD = await repository.findOneBy({ id: libroCreado.id });
    expect(librosEnBD).not.toBeNull();
    if (librosEnBD) {
      expect(librosEnBD.titulo).toBe(nuevoLibro.titulo);
    }
  });

  it('Debería obtener todos los libros', async () => {
    // Crear varios libros
    const books = [
      { titulo: 'Libro 1', autor: 'Autor 1', isbn: '1', anioPublicacion: 2024, categoria: 'prueba', stock: 1 },
      { titulo: 'Libro 2', autor: 'Autor 2', isbn: '2', anioPublicacion: 2024, categoria: 'prueba', stock: 1 },
      { titulo: 'Libro 3', autor: 'Autor 3', isbn: '3', anioPublicacion: 2024, categoria: 'prueba', stock: 1 },
    ];

    // Guardar los libros en la base de datos
    await repository.save(books);

    // Obtener los libros mediante el servicio
    const result = await service.findAll();

    // Verificar que se obtengan los libros
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(3);

    // Verificar los datos
    const titles = result.map((b) => b.titulo);
    expect(titles).toContain('Libro 1');
    expect(titles).toContain('Libro 2');
    expect(titles).toContain('Libro 3');

    // Verificar la integridad del contenido
    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('titulo');
    expect(result[0]).toHaveProperty('autor');
  });

  it('Debería obtener un libro por ID', async () => {
    // Crear un libro en la base de datos
    const book = {
      titulo: 'Libro de prueba',
      autor: 'Autor desconocido',
      isbn: '9780000000000',
      anioPublicacion: 2024,
      categoria: 'prueba',
      stock: 5,
    };
    const bookSave = await repository.save(book);

    // Obtener un libro mediante el servicio
    const result = await service.findOne(bookSave.id);

    // Verificar que sea el mismo libro
    expect(result).toBeDefined();
    expect(result.titulo).toBe(book.titulo);
    expect(result.autor).toBe(book.autor);

    // Verificar la integridad del contenido
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('titulo');
    expect(result).toHaveProperty('autor');
  });

  it('findOne - Debería lanzar NotFoundException si el libro no existe', async () => {
    await expect(service.findOne(9999)).rejects.toThrow(
      `Libro con ID 9999 no existe`,
    );
  });
});
