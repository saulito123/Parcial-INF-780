
import { PartialType } from '@nestjs/mapped-types';
import { CreateBookDto } from './dto.create-book';

export class UpdateBookDto extends PartialType(CreateBookDto) {}
