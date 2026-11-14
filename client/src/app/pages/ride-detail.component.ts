import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { RatingComponent } from '../components/rating.component';
import { ButtonComponent } from '../components/ui/button.component';
import { SessionService } from '../core/session.service';
import { BookingsService } from '../services/bookings.service';
import { RidesService } from '../services/rides.service';
import type { Review, Ride } from '../types';
import { inputValue } from '../utils/dom';
import { FormatDatePipe, FormatPricePipe } from '../utils/format.pipes';

interface Message {
  type: 'ok' | 'error';
  text: string;
}

@Component({
  selector: 'app-ride-detail',
  imports: [RouterLink, RatingComponent, ButtonComponent, FormatDatePipe, FormatPricePipe],
  host: { class: 'block' },
  template: `
    @if (ride(); as r) {
      <section class="grid gap-10 md:grid-cols-[1.3fr_1fr]">
        <div>
          <p class="text-xs font-bold uppercase tracking-widest text-corail">Trajet</p>
          <h1 class="mt-1 text-3xl">{{ r.from }} → {{ r.to }}</h1>
          <p class="mt-2 text-ardoise">{{ r.date | formatDate }} · départ {{ r.time }}</p>

          <dl class="mt-6 divide-y divide-filet border-y border-filet text-sm">
            <div class="flex justify-between py-3"><dt>Point de rendez-vous</dt><dd class="font-semibold">{{ r.meetingPoint }}</dd></div>
            <div class="flex justify-between py-3"><dt>Places restantes</dt><dd class="font-semibold">{{ r.seatsLeft }} sur {{ r.seats }}</dd></div>
            <div class="flex justify-between py-3"><dt>Prix par place</dt><dd class="font-semibold text-menthe">{{ r.price | formatPrice }}</dd></div>
            <div class="flex justify-between py-3"><dt>Options</dt><dd>{{ r.options.length ? r.options.join(' · ') : 'Aucune' }}</dd></div>
          </dl>

          <div class="mt-6 space-y-3">
            @if (isOwner()) {
              <p class="text-sm text-ardoise">C'est ton trajet. Retrouve les réservations dans ton <a routerLink="/tableau-de-bord" class="font-semibold underline decoration-soleil decoration-2">tableau de bord</a>.</p>
            } @else if (full()) {
              <p class="font-semibold text-corail">Complet : plus aucune place disponible.</p>
            } @else {
              <div class="flex flex-wrap items-center gap-3">
                <label class="text-sm">Places<select
                    (change)="setSeats($event)"
                    class="ml-2 min-h-11 rounded-charte border border-ardoise bg-white px-2"
                  >
                    @for (n of seatOptions(); track n) {
                      <option [value]="n" [selected]="n === seats()">{{ n }}</option>
                    }
                  </select></label>
                <button app-button variant="accent" type="button" (click)="reserve()">Réserver · {{ r.price * seats() | formatPrice }}</button>
              </div>
            }
            @if (!session.user() && !isOwner() && !full()) {
              <p class="text-sm text-ardoise">Une connexion te sera demandée pour réserver.</p>
            }
            @if (message(); as m) {
              <p role="status" [class]="messageClass(m)">
                {{ m.type === 'ok' ? '' : 'Error : ' }}{{ m.text }}
                @if (m.type === 'ok') {
                  <a routerLink="/tableau-de-bord" class="underline decoration-soleil decoration-2">Voir mes réservations</a>
                }
              </p>
            }
          </div>
        </div>

        <aside>
          <p class="text-xs font-bold uppercase tracking-widest text-corail">Conducteur</p>
          <h2 class="mt-1 text-2xl">{{ r.driverName }}</h2>
          <p class="mt-1"><app-rating [ride]="r" /></p>
          <h3 class="mt-6 text-xs font-bold uppercase tracking-widest text-corail">Avis récents</h3>
          @if (reviews().length === 0) {
            <p class="mt-2 text-sm text-ardoise">Pas encore d'avis.</p>
          }
          <ul class="mt-2 divide-y divide-filet">
            @for (rv of reviews().slice(0, 3); track rv.id) {
              <li class="py-3">
                <p class="font-titre">« {{ rv.comment }} »</p>
                <p class="text-sm text-ardoise">{{ rv.authorName }} · ★ {{ rv.rating }}</p>
              </li>
            }
          </ul>
        </aside>
      </section>
    } @else if (ride() === null) {
      <section>
        <h1 class="text-3xl">Trajet introuvable</h1>
        <a routerLink="/trajets" class="mt-4 inline-block font-semibold underline decoration-soleil decoration-2">Retour à la recherche</a>
      </section>
    } @else {
      <p class="text-ardoise">Chargement…</p>
    }
  `,
})
export class RideDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly ridesService = inject(RidesService);
  private readonly bookingsService = inject(BookingsService);
  protected readonly session = inject(SessionService);

  private readonly id = signal<string | null>(null);
  /** undefined = chargement, null = trajet introuvable. */
  protected readonly ride = signal<Ride | null | undefined>(undefined);
  protected readonly reviews = signal<Review[]>([]);
  protected readonly seats = signal(1);
  protected readonly message = signal<Message | null>(null);

  protected readonly isOwner = computed(() => {
    const r = this.ride();
    return !!r && this.session.user()?.id === r.driverId;
  });
  protected readonly full = computed(() => this.ride()?.seatsLeft === 0);
  protected readonly seatOptions = computed(() =>
    Array.from({ length: this.ride()?.seatsLeft ?? 0 }, (_, i) => i + 1),
  );

  constructor() {
    // Recharge le trajet quand l'identifiant dans l'URL change (/trajets/:id).
    this.route.paramMap
      .pipe(map((p) => p.get('id')), takeUntilDestroyed())
      .subscribe((id) => {
        this.id.set(id);
        void this.load();
      });
  }

  private async load(): Promise<void> {
    const id = this.id();
    const r = id ? await this.ridesService.getRide(id) : null;
    this.ride.set(r);
    if (r) this.reviews.set(await this.ridesService.getReviews(r.driverId));
  }

  protected setSeats(e: Event): void {
    this.seats.set(Number(inputValue(e)));
  }

  protected messageClass(m: Message): string {
    return `text-sm font-semibold ${m.type === 'ok' ? 'text-menthe' : 'text-corail'}`;
  }

  protected async reserve(): Promise<void> {
    const r = this.ride();
    if (!r) return;
    const user = this.session.user();
    if (!user) {
      await this.router.navigate(['/connexion'], { state: { from: this.router.url } });
      return;
    }
    try {
      await this.bookingsService.createBooking(r.id, user, this.seats());
      this.message.set({ type: 'ok', text: 'Réservation confirmée !' });
      this.seats.set(1);
      await this.load();
    } catch (err) {
      this.message.set({ type: 'error', text: err instanceof Error ? err.message : 'Réservation impossible.' });
    }
  }
}
