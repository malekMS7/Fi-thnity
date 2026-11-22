import { Injectable, inject } from '@angular/core';
import type { Booking, BookingWithRide, User } from '../types';
import { isPast } from '../utils/format';
import { ApiService } from './api.service';
import { RidesService } from './rides.service';

@Injectable({ providedIn: 'root' })
export class BookingsService {
  private readonly api = inject(ApiService);
  private readonly ridesService = inject(RidesService);

  async createBooking(rideId: string, user: User, seats: number): Promise<Booking> {
    return await this.api.bookings.create(rideId, seats);
  }

  async listMyBookings(userId: string): Promise<BookingWithRide[]> {
    return await this.api.bookings.mine();
  }

  async cancelBooking(bookingId: string, userId: string): Promise<void> {
    await this.api.bookings.cancel(bookingId);
  }
}