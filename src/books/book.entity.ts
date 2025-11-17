import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity('book') 
@Unique(['titulo', 'autor']) // Aplica la restricción de unicidad para manejar 409 Conflict
export class Book {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  titulo!: string;

  @Column()
  autor!: string;

  @Column()
  isbn!: string;

  @Column()
  anioPublicacion!: number;

  @Column()
  categoria!: string;

  @Column()
  stock!: number;
  
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  creadoEn!: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  actualizadoEn!: Date;
}
