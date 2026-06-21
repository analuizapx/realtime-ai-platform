import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

// Clean shapes we expose to the frontend (normalized from swapi.tech)
export interface SwapiPerson {
  uid: string;
  name: string;
  url: string;
}

export interface SwapiPeopleResponse {
  page: number;
  totalPages: number;
  totalRecords: number;
  results: SwapiPerson[];
}

export interface SwapiFilm {
  uid: string;
  title: string;
  episodeId: number;
  director: string;
  producer: string;
  releaseDate: string;
  openingCrawl: string;
}

@Injectable()
export class SwapiService {
  private readonly logger = new Logger(SwapiService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpService,
    config: ConfigService,
  ) {
    this.baseUrl = config.get<string>('SWAPI_BASE_URL')!;
  }

  // First SWAPI endpoint: paginated list of characters
  async getPeople(page = 1, limit = 10): Promise<SwapiPeopleResponse> {
    const url = `${this.baseUrl}/people?page=${page}&limit=${limit}`;
    this.logger.log(`Fetching people: ${url}`);

    const { data } = await firstValueFrom(this.http.get(url));

    return {
      page,
      totalPages: data.total_pages,
      totalRecords: data.total_records,
      results: data.results,
    };
  }

  // Second SWAPI endpoint: list of films (different response shape)
  async getFilms(): Promise<SwapiFilm[]> {
    const url = `${this.baseUrl}/films`;
    this.logger.log(`Fetching films: ${url}`);

    const { data } = await firstValueFrom(this.http.get(url));

    // Films come wrapped in result[].properties — flatten into a clean shape
    return data.result.map((item: any) => ({
      uid: item.uid,
      title: item.properties.title,
      episodeId: item.properties.episode_id,
      director: item.properties.director,
      producer: item.properties.producer,
      releaseDate: item.properties.release_date,
      openingCrawl: item.properties.opening_crawl,
    }));
  }
}
