import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ModalComponent } from '../components/ui/modal.component';
import { SkeletonComponent } from '../components/ui/skeleton.component';
import { SessionService } from '../core/session.service';
import { ToastService } from '../core/toast.service';
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
  imports: [RouterLink, ModalComponent, SkeletonComponent, FormatDatePipe, FormatPricePipe],
  host: { class: 'block' },
  template: `
    @if (session.user(); as user) {
      <section>
        <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p class="text-xs font-bold uppercase tracking-widest text-corail">Tableau de bord</p>
            <h1 class="mt-1 text-3xl font-titre font-bold text-nuit">Bonjour {{ firstName() }}.</h1>
            <p class="mt-1 text-sm text-ardoise">Suis tes réservations et tes trajets publiés en un coup d'œil.</p>
          </div>
          <div class="flex gap-3">
            <a routerLink="/profil" class="inline-flex min-h-11 items-center rounded-full border border-nuit/30 bg-white px-5 text-xs font-semibold uppercase tracking-wider text-nuit hover:bg-papier transition-all shadow-2xs">
              Mon Profil
            </a>
            <a routerLink="/publier" class="inline-flex min-h-11 items-center rounded-full bg-nuit px-5 text-xs font-semibold uppercase tracking-wider text-papier hover:bg-nuit/90 transition-all shadow-xs">
              + Publier un trajet
            </a>
          </div>
        </div>

        <dl class="mt-8 flex flex-wrap gap-x-16 gap-y-4 rounded-3xl border border-filet/80 bg-white p-7 shadow-xs">
          <div><dd class="font-titre text-4xl font-bold text-corail">{{ upcoming().length }}</dd><dt class="text-xs font-bold uppercase tracking-wider text-ardoise mt-1">réservations à venir</dt></div>
          <div><dd class="font-titre text-4xl font-bold text-nuit">{{ rides().length }}</dd><dt class="text-xs font-bold uppercase tracking-wider text-ardoise mt-1">trajets publiés</dt></div>
          <div><dd class="font-titre text-4xl font-bold text-menthe">{{ passengers() }}</dd><dt class="text-xs font-bold uppercase tracking-wider text-ardoise mt-1">passagers transportés</dt></div>
        </dl>

        <div class="mt-10 grid gap-8 md:grid-cols-2">
          <!-- Colonne 1: Mes réservations -->
          <div class="rounded-3xl border border-filet/80 bg-white p-7 shadow-xs">
            <div class="flex items-center justify-between">
              <h2 class="text-xs font-bold uppercase tracking-widest text-corail">Mes réservations</h2>
              <a routerLink="/trajets" class="text-xs font-semibold underline decoration-soleil decoration-2 underline-offset-4">
                Trouver un trajet
              </a>
            </div>

            @if (bookings() === null) {
              <div class="mt-4 space-y-3" aria-label="Chargement de mes réservations">
                <app-skeleton width="100%" height="3rem" rounded="rounded-xl" />
                <app-skeleton width="100%" height="3rem" rounded="rounded-xl" />
              </div>
            } @else if (bookings()?.length === 0) {
              <div class="mt-4 rounded-2xl border border-dashed border-filet/90 bg-papier/40 p-6 text-center">
                <p class="text-sm text-ardoise">Tu n'as aucune réservation active.</p>
                <a routerLink="/trajets" class="mt-2 inline-block font-semibold text-nuit underline decoration-soleil decoration-2">
                  Découvrir les trajets disponibles →
                </a>
              </div>
            } @else {
              <ul class="mt-3 divide-y divide-filet border-y border-filet">
                @for (b of bookingList(); track b.id) {
                  <li class="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 text-sm">
                    <div class="flex-1">
                      <a [routerLink]="['/trajets', b.ride.id]" class="font-titre text-base font-semibold hover:text-menthe">
                        {{ b.ride.from }} → {{ b.ride.to }}
                      </a>
                      <p class="text-xs text-ardoise">
                        {{ b.ride.date | formatDate }} · {{ b.ride.time }} · {{ b.seats }} place{{ b.seats > 1 ? 's' : '' }} · {{ b.ride.price * b.seats | formatPrice }}
                      </p>
                    </div>
                    <span [class]="'text-xs font-semibold uppercase tracking-wider ' + status[b.status].cls">
                      {{ status[b.status].label }}
                    </span>
                    @if (canCancel(b)) {
                      <button
                        type="button"
                        (click)="askCancel(b)"
                        class="min-h-11 text-xs font-semibold text-corail underline decoration-corail underline-offset-4"
                      >
                        Annuler
                      </button>
                    }
                  </li>
                }
              </ul>
            }
          </div>

          <!-- Colonne 2: Mes trajets publiés -->
          <div class="rounded-3xl border border-filet/80 bg-white p-7 shadow-xs">
            <div class="flex items-center justify-between">
              <h2 class="text-xs font-bold uppercase tracking-widest text-corail">Mes trajets publiés</h2>
              <a routerLink="/publier" class="text-xs font-semibold underline decoration-soleil decoration-2 underline-offset-4">
                Proposer un trajet
              </a>
            </div>

            @if (rides().length === 0) {
              <div class="mt-4 rounded-2xl border border-dashed border-filet/90 bg-papier/40 p-6 text-center">
                <p class="text-sm text-ardoise">Tu n'as publié aucun trajet en tant que conducteur.</p>
                <a routerLink="/publier" class="mt-2 inline-block font-semibold text-nuit underline decoration-soleil decoration-2">
                  Publier mon premier trajet →
                </a>
              </div>
            } @else {
              <ul class="mt-3 divide-y divide-filet border-y border-filet">
                @for (r of rides(); track r.id) {
                  <li class="flex flex-wrap items-center gap-4 py-3 text-sm">
                    <div class="flex-1 min-w-[140px]">
                      <a [routerLink]="['/trajets', r.id]" class="font-titre text-base font-semibold hover:text-menthe">
                        {{ r.from }} → {{ r.to }}
                      </a>
                      <p class="text-xs text-ardoise">{{ r.date | formatDate }} · Départ à {{ r.time }}</p>
                    </div>
                    <span class="rounded-full bg-papier px-2.5 py-1 text-xs font-semibold text-ardoise border border-filet">
                      {{ r.seats - r.seatsLeft }}/{{ r.seats }} places
                    </span>
                    @if (canCancelRide(r)) {
                      <button
                        type="button"
                        (click)="askCancelRide(r)"
                        class="min-h-11 text-xs font-semibold text-corail underline decoration-corail underline-offset-4"
                      >
                        Annuler
                      </button>
                    }
                  </li>
                }
              </ul>
            }
          </div>
        </div>

        <!-- Modale de confirmation d'annulation -->
        <app-modal
          [isOpen]="modalOpen()"
          [title]="modalTitle()"
          [confirmText]="modalConfirmText()"
          cancelText="Retour"
          confirmVariant="secondary"
          (confirm)="confirmAction()"
          (cancel)="closeModal()"
        >
          @if (modalType() === 'booking' && selectedBooking(); as sb) {
            <p>
              Es-tu certain de vouloir annuler ta réservation pour le trajet
              <b>{{ sb.ride.from }} → {{ sb.ride.to }}</b> du <b>{{ sb.ride.date | formatDate }}</b> à <b>{{ sb.ride.time }}</b> ?
            </p>
            <p class="mt-2 text-xs text-ardoise">
              Tes {{ sb.seats }} place{{ sb.seats > 1 ? 's' : '' }} seront immédiatement remises à la disposition d'autres passagers.
            </p>
          } @else if (modalType() === 'ride' && selectedRide(); as sr) {
            <p>
              Es-tu certain de vouloir annuler ton trajet publié
              <b>{{ sr.from }} → {{ sr.to }}</b> du <b>{{ sr.date | formatDate }}</b> à <b>{{ sr.time }}</b> ?
            </p>
            <p class="mt-2 text-xs text-corail">
              Cette action supprimera définitivement le trajet et annulera les réservations éventuelles de tes passagers.
            </p>
          }
        </app-modal>
      </section>
    }
  `,
})
export class DashboardComponent implements OnInit {
  protected readonly session = inject(SessionService);
  private readonly bookingsService = inject(BookingsService);
  private readonly ridesService = inject(RidesService);
  private readonly toastService = inject(ToastService);

  protected readonly status = STATUS;

  /** null = chargement en cours. */
  protected readonly bookings = signal<BookingWithRide[] | null>(null);
  protected readonly rides = signal<Ride[]>([]);

  protected readonly modalOpen = signal(false);
  protected readonly modalType = signal<'booking' | 'ride'>('booking');
  protected readonly selectedBooking = signal<BookingWithRide | null>(null);
  protected readonly selectedRide = signal<Ride | null>(null);

  protected readonly modalTitle = computed(() =>
    this.modalType() === 'booking' ? 'Annuler ma réservation' : 'Supprimer mon trajet',
  );
  protected readonly modalConfirmText = computed(() =>
    this.modalType() === 'booking' ? 'Confirmer l\'annulation' : 'Supprimer définitivement',
  );

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

  protected canCancelRide(r: Ride): boolean {
    return !isPast(r.date, r.time);
  }

  private async load(): Promise<void> {
    const user = this.session.user();
    if (!user) return;
    this.bookings.set(await this.bookingsService.listMyBookings(user.id));
    this.rides.set(await this.ridesService.listMyRides(user.id));
  }

  protected askCancel(booking: BookingWithRide): void {
    this.selectedBooking.set(booking);
    this.modalType.set('booking');
    this.modalOpen.set(true);
  }

  protected askCancelRide(ride: Ride): void {
    this.selectedRide.set(ride);
    this.modalType.set('ride');
    this.modalOpen.set(true);
  }

  protected closeModal(): void {
    this.modalOpen.set(false);
    this.selectedBooking.set(null);
    this.selectedRide.set(null);
  }

  protected async confirmAction(): Promise<void> {
    const user = this.session.user();
    if (!user) return;

    if (this.modalType() === 'booking') {
      const sb = this.selectedBooking();
      if (!sb) return;
      try {
        await this.bookingsService.cancelBooking(sb.id, user.id);
        this.toastService.show(`Réservation pour ${sb.ride.from} → ${sb.ride.to} annulée.`, 'info');
        this.closeModal();
        await this.load();
      } catch (err) {
        this.toastService.show(err instanceof Error ? err.message : 'Erreur lors de l\'annulation.', 'error');
      }
    } else {
      const sr = this.selectedRide();
      if (!sr) return;
      try {
        await this.ridesService.cancelRide(sr.id, user.id);
        this.toastService.show(`Trajet ${sr.from} → ${sr.to} supprimé avec succès.`, 'info');
        this.closeModal();
        await this.load();
      } catch (err) {
        this.toastService.show(err instanceof Error ? err.message : 'Erreur lors de la suppression.', 'error');
      }
    }
  }
}
