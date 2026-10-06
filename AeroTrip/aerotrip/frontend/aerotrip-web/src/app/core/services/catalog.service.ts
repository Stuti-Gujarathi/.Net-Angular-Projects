import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Airline, Airport, Offer, PopularRoute } from '../models/models';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  /** Reference data rarely changes, so it's fetched once and shared. */
  readonly airports$: Observable<Airport[]> = this.http.get<Airport[]>(`${this.api}/catalog/airports`).pipe(shareReplay(1));
  readonly airlines$: Observable<Airline[]> = this.http.get<Airline[]>(`${this.api}/catalog/airlines`).pipe(shareReplay(1));

  popularRoutes(): Observable<PopularRoute[]> {
    return this.http.get<PopularRoute[]>(`${this.api}/catalog/popular-routes`);
  }

  offers(): Observable<Offer[]> {
    return this.http.get<Offer[]>(`${this.api}/offers`);
  }
}
