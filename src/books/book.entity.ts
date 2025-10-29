
export class Book {
  constructor(
    public id: number,
    public titulo: string,
    public autor: string,
    public isbn: string,
    public anioPublicacion: number,
    public categoria: string,
    public stock: number,
    public creadoEn?: Date,
    public actualizadoEn?: Date,
  ) {}
}