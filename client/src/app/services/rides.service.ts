import { Injectable, inject } from '@angular/core';
import type { NewRideInput, Review, Ride, RideFilters, User } from '../types';
import { isPast } from '../utils/format';
import { DbService, type DB, type StoredRide } from './db.service';

const norm = (s: string) => s.trim().toLowerCase();

@Injectable({ providedIn: 'root' })
export class RidesService {
  private readonly dbService = inject(DbService);

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
    const db = this.dbService.load();
    return db.rides
      .map((r) => this.enrich(r, db))
      .filter((r) => !isPast(r.date, r.time))
      .filter((r) => !f.depart || norm(r.from).includes(norm(f.depart)))
      .filter((r) => !f.arrivee || norm(r.to).includes(norm(f.arrivee)))
      .filter((r) => !f.date || r.date === f.date)
      .filter((r) => f.prixMax === undefined || r.price <= f.prixMax)
      .filter((r) => f.placesMin === undefined || r.seatsLeft >= f.placesMin)
      .filter((r) => !f.matin || r.time < '12:00')
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  }

  async getRide(id: string): Promise<Ride | null> {
    const db = this.dbService.load();
    const ride = db.rides.find((r) => r.id === id);
    return ride ? this.enrich(ride, db) : null;
  }

  async getReviews(driverId: string): Promise<Review[]> {
    return this.dbService.load().reviews.filter((r) => r.driverId === driverId);
  }

  async createRide(input: NewRideInput, driver: User): Promise<Ride> {
    const db = this.dbService.load();
    const ride: StoredRide = { id: this.dbService.newId('r'), driverId: driver.id, ...input };
    db.rides.push(ride);
    this.dbService.save(db);
    return this.enrich(ride, db);
  }

  async listMyRides(userId: string): Promise<Ride[]> {
    const db = this.dbService.load();
    return db.rides
      .filter((r) => r.driverId === userId)
      .map((r) => this.enrich(r, db))
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  }
}
