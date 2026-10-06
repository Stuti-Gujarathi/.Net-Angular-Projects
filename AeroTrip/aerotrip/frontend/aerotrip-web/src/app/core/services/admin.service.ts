import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AdminStats, AdminUser, Booking, BookingStatus, BookingSummary, FlightSchedule, Offer, PagedResult, UpsertFlightSchedule, UpsertOffer,
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/admin`;

  stats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.api}/stats`);
  }

  bookings(opts: { status?: BookingStatus | null; search?: string; page: number; pageSize: number }): Observable<PagedResult<BookingSummary>> {
    let params = new HttpParams().set('page', opts.page).set('pageSize', opts.pageSize);
    if (opts.status) params = params.set('status', opts.status);
    if (opts.search) params = params.set('search', opts.search);
    return this.http.get<PagedResult<BookingSummary>>(`${this.api}/bookings`, { params });
  }

  booking(id: string): Observable<Booking> {
    return this.http.get<Booking>(`${this.api}/bookings/${id}`);
  }

  cancelBooking(id: string): Observable<Booking> {
    return this.http.post<Booking>(`${this.api}/bookings/${id}/cancel`, {});
  }

  flights(): Observable<FlightSchedule[]> {
    return this.http.get<FlightSchedule[]>(`${this.api}/flights`);
  }

  createFlight(body: UpsertFlightSchedule): Observable<FlightSchedule> {
    return this.http.post<FlightSchedule>(`${this.api}/flights`, body);
  }

  updateFlight(id: string, body: UpsertFlightSchedule): Observable<FlightSchedule> {
    return this.http.put<FlightSchedule>(`${this.api}/flights/${id}`, body);
  }

  setFlightActive(id: string, isActive: boolean): Observable<FlightSchedule> {
    return this.http.patch<FlightSchedule>(`${this.api}/flights/${id}/status`, { isActive });
  }

  offers(): Observable<Offer[]> {
    return this.http.get<Offer[]>(`${this.api}/offers`);
  }

  createOffer(body: UpsertOffer): Observable<Offer> {
    return this.http.post<Offer>(`${this.api}/offers`, body);
  }

  updateOffer(id: string, body: UpsertOffer): Observable<Offer> {
    return this.http.put<Offer>(`${this.api}/offers/${id}`, body);
  }

  setOfferActive(id: string, isActive: boolean): Observable<Offer> {
    return this.http.patch<Offer>(`${this.api}/offers/${id}/status`, { isActive });
  }

  deleteOffer(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/offers/${id}`);
  }

  users(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.api}/users`);
  }

  setUserActive(id: string, isActive: boolean): Observable<AdminUser> {
    return this.http.patch<AdminUser>(`${this.api}/users/${id}/status`, { isActive });
  }
}
