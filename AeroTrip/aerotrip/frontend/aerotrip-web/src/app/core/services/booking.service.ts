import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SKIP_ERROR_TOAST } from '../interceptors/error.interceptor';
import { Booking, CabinClass, CancellationQuote, CreateBookingRequest, Extras, PaymentRequest, PaymentResult, PriceQuote } from '../models/models';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  quote(body: { itineraryId: string; cabin: CabinClass; passengers: number; extras: Extras; couponCode: string | null }): Observable<PriceQuote> {
    return this.http.post<PriceQuote>(`${this.api}/bookings/quote`, body);
  }

  create(body: CreateBookingRequest): Observable<Booking> {
    return this.http.post<Booking>(`${this.api}/bookings`, body);
  }

  mine(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.api}/bookings/my`);
  }

  get(id: string): Observable<Booking> {
    return this.http.get<Booking>(`${this.api}/bookings/${id}`);
  }

  cancellationQuote(id: string): Observable<CancellationQuote> {
    return this.http.get<CancellationQuote>(`${this.api}/bookings/${id}/cancellation-quote`);
  }

  cancel(id: string): Observable<Booking> {
    return this.http.post<Booking>(`${this.api}/bookings/${id}/cancel`, {});
  }

  /** Payment validation errors are shown inline on the payment form, not as toasts. */
  pay(body: PaymentRequest): Observable<PaymentResult> {
    return this.http.post<PaymentResult>(`${this.api}/payments`, body, { context: new HttpContext().set(SKIP_ERROR_TOAST, true) });
  }
}
