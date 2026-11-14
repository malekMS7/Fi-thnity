import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';

type Params = Record<string, string | number | boolean>;

/**
 * Client HTTP vers l'API Express (remplace api.ts / axios).
 * Comme dans la version React, il n'est pas encore utilisé par les pages
 * (elles passent par les services simulés) : il est prêt pour le branchement.
 * Le jeton « Bearer » est ajouté automatiquement par auth.interceptor.ts.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  readonly auth = {
    register: (input: { name: string; email: string; phone?: string; password: string; role: 'DRIVER' | 'PASSENGER' }) =>
      this.http.post(`${this.base}/auth/register`, input),
    login: (email: string, password: string) =>
      this.http.post(`${this.base}/auth/login`, { email, password }),
  };

  readonly rides = {
    list: (filters: Params = {}) => this.http.get(`${this.base}/rides`, { params: filters }),
    get: (id: string) => this.http.get(`${this.base}/rides/${id}`),
    create: (input: Record<string, unknown>) => this.http.post(`${this.base}/rides`, input),
    mine: () => this.http.get(`${this.base}/rides/mine`),
  };

  readonly bookings = {
    create: (rideId: string, seats: number) => this.http.post(`${this.base}/bookings`, { rideId, seats }),
    mine: () => this.http.get(`${this.base}/bookings/mine`),
    cancel: (id: string) => this.http.delete(`${this.base}/bookings/${id}`),
  };
}
