import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';

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
    register: async (input: { name: string; email: string; phone?: string; password: string; role: 'DRIVER' | 'PASSENGER' }) =>
      firstValueFrom(this.http.post<{ token: string; user: any }>(`${this.base}/auth/register`, input)),
    login: async (email: string, password: string) =>
      firstValueFrom(this.http.post<{ token: string; user: any }>(`${this.base}/auth/login`, { email, password })),
  };

  readonly rides = {
    list: async (filters: Params = {}) =>
      firstValueFrom(this.http.get<any[]>(`${this.base}/rides`, { params: filters })),
    get: async (id: string) =>
      firstValueFrom(this.http.get<any>(`${this.base}/rides/${id}`)),
    create: async (input: Record<string, unknown>) =>
      firstValueFrom(this.http.post<any>(`${this.base}/rides`, input)),
    mine: async () =>
      firstValueFrom(this.http.get<any[]>(`${this.base}/rides/mine`)),
    reviews: async (driverId: string) =>
      firstValueFrom(this.http.get<any[]>(`${this.base}/rides/${driverId}/reviews`)),
  };

  readonly bookings = {
    create: async (rideId: string, seats: number) =>
      firstValueFrom(this.http.post<any>(`${this.base}/bookings`, { rideId, seats })),
    mine: async () =>
      firstValueFrom(this.http.get<any[]>(`${this.base}/bookings/mine`)),
    cancel: async (id: string) =>
      firstValueFrom(this.http.delete<any>(`${this.base}/bookings/${id}`)),
  };
}