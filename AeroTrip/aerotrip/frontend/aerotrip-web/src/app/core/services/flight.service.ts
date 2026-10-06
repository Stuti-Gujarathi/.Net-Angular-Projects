import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CabinClass, FareCalendarDay, FlightSearchResponse, Itinerary, SearchParams } from '../models/models';

@Injectable({ providedIn: 'root' })
export class FlightService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/flights`;

  search(p: SearchParams): Observable<FlightSearchResponse> {
    const params = new HttpParams().set('from', p.from).set('to', p.to).set('date', p.date).set('passengers', p.pax).set('cabin', p.cabin);
    return this.http.get<FlightSearchResponse>(`${this.api}/search`, { params });
  }

  itinerary(id: string, cabin: CabinClass, passengers: number): Observable<Itinerary> {
    const params = new HttpParams().set('cabin', cabin).set('passengers', passengers);
    return this.http.get<Itinerary>(`${this.api}/itineraries/${encodeURIComponent(id)}`, { params });
  }

  fareCalendar(from: string, to: string, start: string, days: number, cabin: CabinClass): Observable<FareCalendarDay[]> {
    const params = new HttpParams().set('from', from).set('to', to).set('start', start).set('days', days).set('cabin', cabin);
    return this.http.get<FareCalendarDay[]>(`${this.api}/fare-calendar`, { params });
  }
}
