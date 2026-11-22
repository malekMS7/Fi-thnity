import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import type { Booking, BookingWithRide, NewRideInput, Review, Ride, RideFilters, Role, User } from '../types';

type Params = Record<string, string | number | boolean>;

/**
 * Client HTTP vers l'API Express (remplace api.ts / axios).
 * Le jeton « Bearer » est ajouté automatiquement par auth.interceptor.ts.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  readonly auth = {
    register: (input: { name: string; email: string; phone?: string; password: string; role: Role }) =>
      firstValueFrom(this.http.post<{ token: string; user: User }>(`${this.base}/auth/register`, input)),
    login: (email: string, password: string) =>
      firstValueFrom(this.http.post<{ token: string; user: User }>(`${this.base}/auth/login`, { email, password })),
  };

  readonly rides = {
    list: (filters: Params = {}) =>
      firstValueFrom(this.http.get<Ride[]>(`${this.base}/rides`, { params: filters })),
    get: (id: string) =>
      firstValueFrom(this.http.get<Ride>(`${this.base}/rides/${id}`)),
    create: (input: NewRideInput) =>
      firstValueFrom(this.http.post<Ride>(`${this.base}/rides`, input)),
    mine: () =>
      firstValueFrom(this.http.get<Ride[]>(`${this.base}/rides/mine`)),
    reviews: (driverId: string) =>
      firstValueFrom(this.http.get<Review[]>(`${this.base}/reviews/${driverId}`)),
  };

  readonly bookings = {
    create: (rideId: string, seats: number) =>
      firstValueFrom(this.http.post<Booking>(`${this.base}/bookings`, { rideId, seats })),
    mine: () =>
      firstValueFrom(this.http.get<BookingWithRide[]>(`${this.base}/bookings/mine`)),
    cancel: (id: string) =>
      firstValueFrom(this.http.delete<void>(`${this.base}/bookings/${id}`)),
  };
}
