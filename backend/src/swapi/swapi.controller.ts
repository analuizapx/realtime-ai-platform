import { Controller, Get, Query } from '@nestjs/common';
import { SwapiService } from './swapi.service';

@Controller('swapi')
export class SwapiController {
  constructor(private readonly swapiService: SwapiService) {}

  // GET /swapi/people?page=1 -> paginated characters
  @Get('people')
  getPeople(@Query('page') page?: string) {
    return this.swapiService.getPeople(page ? Number(page) : 1);
  }

  // GET /swapi/films -> list of films
  @Get('films')
  getFilms() {
    return this.swapiService.getFilms();
  }
}
