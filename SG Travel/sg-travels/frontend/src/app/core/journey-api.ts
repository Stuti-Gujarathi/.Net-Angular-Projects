import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, InjectionToken, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';

import {
  DiscoveryResponse,
  EnquiryConfirmation,
  EnquiryRequest,
  Feeling,
  FeelingAxis,
  JourneyDetail,
  JourneySummary,
} from './models';

/**
 * Base URL for the API. Empty means "same origin": the dev server proxies /api to
 * http://localhost:5080 (proxy.conf.json) and nginx does the same in Docker.
 */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => '',
});

@Injectable({ providedIn: 'root' })
export class JourneyApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL);

  // The catalogue rarely changes during a session, so share one request.
  private readonly allJourneys$ = this.http
    .get<JourneySummary[]>(`${this.base}/api/journeys`)
    .pipe(shareReplay({ bufferSize: 1, refCount: false }));

  private readonly axes$ = this.http
    .get<FeelingAxis[]>(`${this.base}/api/feelings`)
    .pipe(shareReplay({ bufferSize: 1, refCount: false }));

  feelingAxes(): Observable<FeelingAxis[]> {
    return this.axes$;
  }

  journeys(): Observable<JourneySummary[]> {
    return this.allJourneys$;
  }

  featured(): Observable<JourneySummary[]> {
    return this.http.get<JourneySummary[]>(`${this.base}/api/journeys`, {
      params: { featured: true },
    });
  }

  journey(slug: string): Observable<JourneyDetail> {
    return this.http.get<JourneyDetail>(`${this.base}/api/journeys/${encodeURIComponent(slug)}`);
  }

  discover(feeling: Feeling, take = 4): Observable<DiscoveryResponse> {
    const params = new HttpParams({
      fromObject: {
        zenWild: feeling.zenWild,
        romanticAdventurous: feeling.romanticAdventurous,
        luxuryRaw: feeling.luxuryRaw,
        take,
      },
    });
    return this.http.get<DiscoveryResponse>(`${this.base}/api/discover`, { params });
  }

  reserve(request: EnquiryRequest): Observable<EnquiryConfirmation> {
    return this.http.post<EnquiryConfirmation>(`${this.base}/api/enquiries`, request);
  }
}
