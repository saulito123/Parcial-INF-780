
import { BooksService } from '../src/books/books.service';

describe('BooksService (in-memory)', () => {
  let service: BooksService;

  beforeEach(() => {
    service = new BooksService();
  });

  it('creates and returns a book', () => {
    const dto = {
      titulo: 'Clean Code',
      autor: 'Robert C. Martin',
      isbn: '9780132350884',
      anioPublicacion: 2008,
      categoria: 'tecnico',
      stock: 5
    };
    const created = service.create(dto as any);
    expect(created).toHaveProperty('id', 1);
    expect(created.titulo).toBe('Clean Code');
  });

  it('throws ConflictException on duplicate titulo+autor', () => {
    const dto = { titulo:'X', autor:'Y', isbn:'1', anioPublicacion:2000, categoria:'t', stock:1 };
    service.create(dto as any);
    expect(()=>service.create(dto as any)).toThrow();
  });

  it('findAll supports q and conStock and pagination', () => {
    for(let i=1;i<=15;i++){
      service.create({ titulo:`Book ${i}`, autor:`Author ${i}`, isbn:`isbn${i}`, anioPublicacion:2000+i, categoria:'t', stock: i%2 } as any);
    }
    const res = service.findAll({ q:'Book', conStock:'1', page:'1', limit:'5' } as any);
    expect(res).toHaveProperty('data');
    expect(res.page).toBe(1);
  });

  it('findOne returns 404 for missing', () => {
    expect(()=>service.findOne(999)).toThrow();
  });

  it('update and conflict check', () => {
    const a = service.create({ titulo:'A', autor:'B', isbn:'1', anioPublicacion:2000, categoria:'t', stock:1 } as any);
    const b = service.create({ titulo:'C', autor:'D', isbn:'2', anioPublicacion:2001, categoria:'t', stock:1 } as any);
    expect(()=>service.update(a.id, { titulo:'C', autor:'D' } as any)).toThrow();
  });

  it('remove deletes existing', () => {
    const a = service.create({ titulo:'ToDel', autor:'X', isbn:'x', anioPublicacion:2000, categoria:'t', stock:1 } as any);
    service.remove(a.id);
    expect(()=>service.findOne(a.id)).toThrow();
  });
});
