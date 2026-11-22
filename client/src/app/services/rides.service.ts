import { Injectable, inject } from '@angular/core';
import type { NewRideInput, Ride, RideFilters, User } from '../types';
import { isPast } from '../utils/format';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class RidesService {
  private readonly api = inject(ApiService);

  /** Complète un trajet stocké avec le conducteur, sa note et les places restantes. */
  enrich(ride: StoredRide, db: DB): Ride {
    const driver = db.users.find((u) => u.id === ride.driverId);
    const reviews = db.reviews.filter((r) => r.driverId === ride.driverId);
    const booked = db.bookings
      .filter((b) => b.rideId === ride.id && b.status === 'CONFIRMED')
      .reduce((sum, b) => sum + b.seats, 0);
    const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null;
    return {
      ...ride,
      driverName: driver?.name ?? 'Conducteur',
      driverRating: avg === null ? null : Math.round(avg * 10) / 10,
      driverReviews: reviews.length,
      seatsLeft: ride.seats - booked,
    };
  }

  async listRides(f: RideFilters = {}): Promise<Ride[]> {
    return await this.api.rides.list(f);
  }

  async getRide(id: string): Promise<Ride | null> {
    return await this.api.rides.get(id);
  }

  async createRide(input: NewRideInput, driver: User): Promise<Ride> {
    return await this.api.rides.create(input, driver);
  }

  async listMyRides(userId: string): Promise<Ride[]> {
    return await this.api.rides.listMyRides(userId);
  }
}
