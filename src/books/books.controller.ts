
import { Controller, Get, Post, Put, Body, Param, Patch, Delete, Query, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto.create-book';
import { UpdateBookDto } from './dto.update-book';


@Controller('books')
export class BooksController {
  constructor(private readonly svc: BooksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateBookDto) {
    return this.svc.create(dto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.svc.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Patch(':id')
update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBookDto) {
  return this.svc.update(id, dto);
}

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    this.svc.remove(id);
    return;
  }
}
