import { Injectable, inject } from '@angular/core';
import type { NewRideInput, Review, Ride, RideFilters, User } from '../types';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class RidesService {
  private readonly api = inject(ApiService);

  async listRides(f: RideFilters = {}): Promise<Ride[]> {
    return await this.api.rides.list(f);
  }

  async getRide(id: string): Promise<Ride | null> {
    return await this.api.rides.get(id);
  }

  async getReviews(driverId: string): Promise<Review[]> {
    return await this.api.rides.reviews(driverId);
  }

  async createRide(input: NewRideInput, driver: User): Promise<Ride> {
    return await this.api.rides.create(input, driver);
  }

  async listMyRides(userId: string): Promise<Ride[]> {
    return await this.api.rides.listMyRides(userId);
  }
}
