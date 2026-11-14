import { Injectable, inject } from '@angular/core';
import type { Booking, BookingWithRide, User } from '../types';
import { isPast } from '../utils/format';
import { DbService } from './db.service';
import { RidesService } from './rides.service';

@Injectable({ providedIn: 'root' })
export class BookingsService {
  private readonly dbService = inject(DbService);
  private readonly ridesService = inject(RidesService);

  async createBooking(rideId: string, user: User, seats: number): Promise<Booking> {
    const db = this.dbService.load();
    const stored = db.rides.find((r) => r.id === rideId);
    if (!stored) throw new Error('Trajet introuvable.');
    const ride = this.ridesService.enrich(stored, db);

    if (ride.driverId === user.id) throw new Error('Tu ne peux pas réserver ton propre trajet.');
    if (isPast(ride.date, ride.time)) throw new Error('Ce trajet est déjà passé.');
    if (seats < 1 || seats > ride.seatsLeft) throw new Error(`Il ne reste que ${ride.seatsLeft} place(s).`);
    const already = db.bookings.some((b) => b.rideId === rideId && b.passengerId === user.id && b.status === 'CONFIRMED');
    if (already) throw new Error('Tu as déjà réservé ce trajet.');

    const booking: Booking = {
      id: this.dbService.newId('b'), rideId, passengerId: user.id, seats, status: 'CONFIRMED', createdAt: new Date().toISOString(),
    };
    db.bookings.push(booking);
    this.dbService.save(db);
    return booking;
  }

  async listMyBookings(userId: string): Promise<BookingWithRide[]> {
    const db = this.dbService.load();
    return db.bookings
      .filter((b) => b.passengerId === userId)
      .flatMap((b) => {
        const stored = db.rides.find((r) => r.id === b.rideId);
        return stored ? [{ ...b, ride: this.ridesService.enrich(stored, db) }] : [];
      })
      .sort((a, b) => `${a.ride.date}${a.ride.time}`.localeCompare(`${b.ride.date}${b.ride.time}`));
  }

  async cancelBooking(bookingId: string, userId: string): Promise<void> {
    const db = this.dbService.load();
    const booking = db.bookings.find((b) => b.id === bookingId && b.passengerId === userId);
    if (!booking) throw new Error('Réservation introuvable.');
    booking.status = 'CANCELLED';
    this.dbService.save(db);
  }
}
