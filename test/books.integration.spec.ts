
import { Repository } from 'typeorm';
import { BooksService } from 'src/books/books.service';
import { Book } from 'src/books/book.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

describe('Books Integration Tests (Service <-> MySQL)', () => {
    let service: BooksService;
    let repository: Repository<Book>;
    
    // DTO base para reutilizar en las pruebas
    const BASE_CREATE_DTO = {
        titulo: 'Clean Code',
        autor: 'Robert C. Martin',
        isbn: '9780132350884',
        anioPublicacion: 2008,
        categoria: 'tecnico',
        stock: 5,
    };

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

    // Limpieza de datos
    afterEach(async () => {
        // Ejecuta el DELETE para limpiar la tabla 'book' después de cada prueba
        await repository.query('DELETE FROM book;'); 
    });

    // Cerrar conexión
    afterAll(async () => {
        const connection = repository.manager.connection;
        if (connection.isInitialized) {
            await connection.destroy();
        }
    });

    // =========================================================================
    // 1. CREACIÓN (POST /books) - Verifica 201, 409, 400
    // =========================================================================

    it('Debería crear un libro en la base de datos', async () => {
        const libroCreado = await service.create(BASE_CREATE_DTO);

        expect(libroCreado).toHaveProperty('id');
        expect(libroCreado.titulo).toBe(BASE_CREATE_DTO.titulo);

        // Verifica la persistencia en la BD (Integración Service -> DB)
        const librosEnBD = await repository.findOneBy({ id: libroCreado.id });
        expect(librosEnBD).not.toBeNull();
    });

    it('Debería lanzar ConflictException (409) al crear un duplicado de titulo + autor', async () => {
        await service.create(BASE_CREATE_DTO); // Creación inicial

        // La excepción debe ser lanzada por el servicio al intentar guardar en la DB
        await expect(service.create(BASE_CREATE_DTO)).rejects.toThrow(ConflictException); 
        await expect(service.create(BASE_CREATE_DTO)).rejects.toThrow('El libro ya existe');
    });

    it('Debería lanzar BadRequestException (400) si el stock es negativo', async () => {
        const invalidDto = { ...BASE_CREATE_DTO, stock: -5 };

        // La validación ocurre en el Service antes de llamar a la DB
        await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException); 
        await expect(service.create(invalidDto)).rejects.toThrow('Stock inválido');
    });


    it('Debería obtener un libro por ID', async () => {
        const bookSave = await repository.save(repository.create(BASE_CREATE_DTO));

        const result = await service.findOne(bookSave.id);

        expect(result).toBeDefined();
        expect(result.titulo).toBe(BASE_CREATE_DTO.titulo);
    });

    it('findOne - Debería lanzar NotFoundException (404) si el ID no existe', async () => {
        await expect(service.findOne(9999)).rejects.toThrow(NotFoundException);
        await expect(service.findOne(9999)).rejects.toThrow(`Libro con ID 9999 no existe`); 
    });


    it('Debería actualizar parcialmente un campo (stock) y verificar la persistencia', async () => {
        const savedBook = await repository.save(repository.create(BASE_CREATE_DTO));
        const updateDto = { stock: 15 };

        const updatedBook = await service.update(savedBook.id, updateDto);

        expect(updatedBook.stock).toBe(15);
        expect(updatedBook.titulo).toBe(savedBook.titulo); 

        // Verifica la persistencia en la BD
        const bookInDb = await repository.findOneBy({ id: savedBook.id });
        expect(bookInDb?.stock).toBe(15);
    });
    
    it('update - Debería lanzar ConflictException (409) si la actualización causa duplicado', async () => {
        await service.create({ ...BASE_CREATE_DTO, isbn: '111' }); // Libro A
        const libroB = await service.create({ ...BASE_CREATE_DTO, titulo: 'Otro', isbn: '222' }); // Libro B
        
        const updateDto = { titulo: BASE_CREATE_DTO.titulo }; // Intenta darle a B el título de A

        await expect(service.update(libroB.id, updateDto)).rejects.toThrow(ConflictException); 
        await expect(service.update(libroB.id, updateDto)).rejects.toThrow('Conflicto con otro libro');
    });
    
    it('update - Debería lanzar BadRequestException (400) si el stock actualizado es negativo', async () => {
        const savedBook = await repository.save(repository.create(BASE_CREATE_DTO));
        
        await expect(service.update(savedBook.id, { stock: -10 })).rejects.toThrow(BadRequestException); 
        await expect(service.update(savedBook.id, { stock: -10 })).rejects.toThrow('Stock inválido');
    });

  
    
    it('Debería eliminar un libro de la base de datos', async () => {
        const savedBook = await repository.save(repository.create(BASE_CREATE_DTO));

        await service.remove(savedBook.id);

        // Verificar que el libro ya no exista
        const bookInDb = await repository.findOneBy({ id: savedBook.id });
        expect(bookInDb).toBeNull();
    });
    
    it('remove - Debería lanzar NotFoundException (404) al eliminar un ID inexistente', async () => {
        await expect(service.remove(9999)).rejects.toThrow(NotFoundException); 
    });
});
