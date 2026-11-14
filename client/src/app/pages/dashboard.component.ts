import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SessionService } from '../core/session.service';
import { BookingsService } from '../services/bookings.service';
import { RidesService } from '../services/rides.service';
import type { BookingStatus, BookingWithRide, Ride } from '../types';
import { isPast } from '../utils/format';
import { FormatDatePipe, FormatPricePipe } from '../utils/format.pipes';

const STATUS: Record<BookingStatus, { label: string; cls: string }> = {
  CONFIRMED: { label: 'Confirmée', cls: 'text-menthe' },
  CANCELLED: { label: 'Annulée', cls: 'text-ardoise line-through' },
};

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, FormatDatePipe, FormatPricePipe],
  host: { class: 'block' },
  template: `
    @if (session.user(); as user) {
      <section>
        <p class="text-xs font-bold uppercase tracking-widest text-corail">Tableau de bord</p>
        <h1 class="mt-1 text-3xl">Bonjour {{ firstName() }}.</h1>

        <dl class="mt-6 flex flex-wrap gap-x-16 gap-y-4">
          <div><dd class="font-titre text-4xl font-bold text-corail">{{ upcoming().length }}</dd><dt class="text-sm text-ardoise">réservations à venir</dt></div>
          <div><dd class="font-titre text-4xl font-bold">{{ rides().length }}</dd><dt class="text-sm text-ardoise">trajets publiés</dt></div>
          <div><dd class="font-titre text-4xl font-bold">{{ passengers() }}</dd><dt class="text-sm text-ardoise">passagers sur mes trajets</dt></div>
        </dl>

        <div class="mt-10 grid gap-10 md:grid-cols-2">
          <div>
            <h2 class="text-xs font-bold uppercase tracking-widest text-corail">Mes réservations</h2>
            @if (bookings() === null) {
              <p class="mt-3 text-ardoise">Chargement…</p>
            }
            @if (bookings()?.length === 0) {
              <p class="mt-3 text-sm text-ardoise">Aucune réservation. <a routerLink="/trajets" class="font-semibold text-nuit underline decoration-soleil decoration-2">Trouver un trajet</a></p>
            }
            <ul class="mt-2 divide-y divide-filet border-y border-filet">
              @for (b of bookingList(); track b.id) {
                <li class="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 text-sm">
                  <div class="flex-1">
                    <a [routerLink]="['/trajets', b.ride.id]" class="font-titre text-base font-semibold">{{ b.ride.from }} → {{ b.ride.to }}</a>
                    <p class="text-ardoise">{{ b.ride.date | formatDate }} · {{ b.ride.time }} · {{ b.seats }} place{{ b.seats > 1 ? 's' : '' }} · {{ b.ride.price * b.seats | formatPrice }}</p>
                  </div>
                  <span [class]="'font-semibold ' + status[b.status].cls">{{ status[b.status].label }}</span>
                  @if (canCancel(b)) {
                    <button type="button" (click)="cancel(b.id, user.id)" class="min-h-11 text-sm font-medium underline decoration-corail decoration-2 underline-offset-4">Annuler</button>
                  }
                </li>
              }
            </ul>
          </div>

          <div>
            <h2 class="text-xs font-bold uppercase tracking-widest text-corail">Mes trajets publiés</h2>
            @if (rides().length === 0) {
              <p class="mt-3 text-sm text-ardoise">Aucun trajet publié. <a routerLink="/publier" class="font-semibold text-nuit underline decoration-soleil decoration-2">Publier un trajet</a></p>
            }
            <ul class="mt-2 divide-y divide-filet border-y border-filet">
              @for (r of rides(); track r.id) {
                <li class="flex items-center gap-4 py-3 text-sm">
                  <div class="flex-1">
                    <a [routerLink]="['/trajets', r.id]" class="font-titre text-base font-semibold">{{ r.from }} → {{ r.to }}</a>
                    <p class="text-ardoise">{{ r.date | formatDate }} · {{ r.time }}</p>
                  </div>
                  <span class="text-ardoise">{{ r.seats - r.seatsLeft }}/{{ r.seats }} places</span>
                </li>
              }
            </ul>
          </div>
        </div>
      </section>
    }
  `,
})
export class DashboardComponent implements OnInit {
  protected readonly session = inject(SessionService);
  private readonly bookingsService = inject(BookingsService);
  private readonly ridesService = inject(RidesService);

  protected readonly status = STATUS;

  /** null = chargement en cours. */
  protected readonly bookings = signal<BookingWithRide[] | null>(null);
  protected readonly rides = signal<Ride[]>([]);

  protected readonly bookingList = computed(() => this.bookings() ?? []);
  protected readonly upcoming = computed(() => this.bookingList().filter((b) => this.canCancel(b)));
  protected readonly passengers = computed(() => this.rides().reduce((s, r) => s + (r.seats - r.seatsLeft), 0));
  protected readonly firstName = computed(() => this.session.user()?.name.split(' ')[0] ?? '');

  ngOnInit(): void {
    void this.load();
  }

  /** Réservation confirmée dont le départ n'est pas encore passé. */
  protected canCancel(b: BookingWithRide): boolean {
    return b.status === 'CONFIRMED' && !isPast(b.ride.date, b.ride.time);
  }

  private async load(): Promise<void> {
    const user = this.session.user();
    if (!user) return;
    this.bookings.set(await this.bookingsService.listMyBookings(user.id));
    this.rides.set(await this.ridesService.listMyRides(user.id));
  }

  protected async cancel(bookingId: string, userId: string): Promise<void> {
    if (!window.confirm('Annuler cette réservation ?')) return;
    await this.bookingsService.cancelBooking(bookingId, userId);
    await this.load();
  }
}
