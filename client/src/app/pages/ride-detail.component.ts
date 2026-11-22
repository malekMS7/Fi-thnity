import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { RatingComponent } from '../components/rating.component';
import { ButtonComponent } from '../components/ui/button.component';
import { SkeletonComponent } from '../components/ui/skeleton.component';
import { SessionService } from '../core/session.service';
import { ToastService } from '../core/toast.service';
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
  imports: [RouterLink, RatingComponent, ButtonComponent, SkeletonComponent, FormatDatePipe, FormatPricePipe],
  host: { class: 'block' },
  template: `
    <!-- Bouton Retour -->
    <div class="mb-6">
      <a routerLink="/trajets" class="inline-flex items-center gap-1.5 text-sm font-semibold text-ardoise hover:text-nuit">
        <span>←</span> Retour à la liste des trajets
      </a>
    </div>

    @if (ride(); as r) {
      <section class="grid gap-10 md:grid-cols-[1.3fr_1fr]">
        <div class="rounded-3xl border border-filet/80 bg-white p-7 shadow-xs">
          <span class="inline-block rounded-full bg-soleil/20 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-nuit">
            Détails de l'itinéraire
          </span>
          <h1 class="mt-2 text-3xl font-titre font-bold text-nuit">{{ r.from }} → {{ r.to }}</h1>
          <p class="mt-1 text-sm text-ardoise">{{ r.date | formatDate }} · Départ prévu à <b>{{ r.time }}</b></p>

          <dl class="mt-6 divide-y divide-filet border-y border-filet text-sm">
            <div class="flex justify-between py-3.5">
              <dt class="text-ardoise">Point de rendez-vous</dt>
              <dd class="font-semibold text-nuit text-right">{{ r.meetingPoint }}</dd>
            </div>
            <div class="flex justify-between py-3.5">
              <dt class="text-ardoise">Places restantes</dt>
              <dd class="font-semibold text-nuit">
                <span [class]="r.seatsLeft === 0 ? 'text-corail' : 'text-menthe'">
                  {{ r.seatsLeft }}
                </span>
                sur {{ r.seats }} places offertes
              </dd>
            </div>
            <div class="flex justify-between py-3.5">
              <dt class="text-ardoise">Prix par place</dt>
              <dd class="text-lg font-bold text-menthe">{{ r.price | formatPrice }}</dd>
            </div>
            <div class="flex justify-between py-3.5">
              <dt class="text-ardoise">Options & Préférences</dt>
              <dd class="font-medium text-nuit">
                @if (r.options.length) {
                  <span class="inline-flex flex-wrap gap-1.5 justify-end">
                    @for (opt of r.options; track opt) {
                      <span class="rounded-full bg-papier px-2.5 py-0.5 text-xs text-ardoise border border-filet">{{ opt }}</span>
                    }
                  </span>
                } @else {
                  <span class="text-ardoise">Aucune option particulière</span>
                }
              </dd>
            </div>
          </dl>

          <!-- Zone de réservation -->
          <div class="mt-8 rounded-2xl border border-filet/70 bg-papier/60 p-6 shadow-2xs">
            <h2 class="font-titre text-base font-bold text-nuit">Réserver ce trajet</h2>

            @if (isOwner()) {
              <p class="mt-2 text-sm text-ardoise">
                Tu es le conducteur de ce trajet. Retrouve tes passagers et réservations dans ton
                <a routerLink="/tableau-de-bord" class="font-semibold text-nuit underline decoration-soleil decoration-2">tableau de bord</a>.
              </p>
            } @else if (full()) {
              <div class="mt-2 rounded-2xl border border-corail/30 bg-corail/10 p-3 text-sm font-semibold text-corail">
                Ce trajet est complet : toutes les places ont été réservées.
              </div>
            } @else {
              <div class="mt-4 flex flex-wrap items-center gap-4">
                <label for="seats-select" class="text-sm font-medium">
                  Nombre de places :
                  <select
                    id="seats-select"
                    (change)="setSeats($event)"
                    class="ml-2 min-h-11 rounded-xl border border-ardoise/30 bg-white px-4 font-semibold text-nuit focus:border-soleil shadow-2xs transition-all"
                  >
                    @for (n of seatOptions(); track n) {
                      <option [value]="n" [selected]="n === seats()">{{ n }} place{{ n > 1 ? 's' : '' }}</option>
                    }
                  </select>
                </label>

                <button
                  app-button
                  variant="accent"
                  type="button"
                  (click)="reserve()"
                  [disabled]="reserving()"
                >
                  {{ reserving() ? 'Validation…' : 'Réserver · ' + (r.price * seats() | formatPrice) }}
                </button>
              </div>

              @if (!session.user()) {
                <p class="mt-3 text-xs text-ardoise">
                  ℹ️ Une connexion ou inscription rapide te sera demandée pour finaliser la réservation.
                </p>
              }
            }

            @if (message(); as m) {
              <div role="status" class="mt-4 rounded-xl p-3 text-sm font-medium" [class]="m.type === 'ok' ? 'bg-menthe/10 text-menthe border border-menthe/30' : 'bg-corail/10 text-corail border border-corail/30'">
                {{ m.text }}
                @if (m.type === 'ok') {
                  · <a routerLink="/tableau-de-bord" class="underline decoration-menthe font-semibold">Voir mes réservations</a>
                }
              </div>
            }
          </div>
        </div>

        <!-- Colonne Conducteur & Avis -->
        <aside class="space-y-6">
          <div class="rounded-3xl border border-filet/80 bg-white p-7 shadow-xs">
            <p class="text-xs font-bold uppercase tracking-widest text-corail">Conducteur</p>
            <div class="mt-3 flex items-center gap-3">
              <div class="flex h-12 w-12 items-center justify-center rounded-full bg-nuit font-titre text-base font-bold text-soleil shadow-xs">
                {{ r.driverName.charAt(0).toUpperCase() }}
              </div>
              <div>
                <h3 class="text-xl font-titre font-bold text-nuit">{{ r.driverName }}</h3>
                <p class="mt-0.5"><app-rating [ride]="r" /></p>
              </div>
            </div>

            <div class="mt-6 border-t border-filet pt-4">
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-bold uppercase tracking-widest text-corail">Avis des passagers ({{ reviews().length }})</h4>
                @if (reviews().length > 3) {
                  <button
                    type="button"
                    (click)="showAllReviews.set(!showAllReviews())"
                    class="text-xs font-semibold text-nuit underline decoration-soleil decoration-2 underline-offset-4"
                  >
                    {{ showAllReviews() ? 'Réduire' : 'Voir tout (' + reviews().length + ')' }}
                  </button>
                }
              </div>

              @if (reviews().length === 0) {
                <p class="mt-2 text-sm text-ardoise">Ce conducteur n'a pas encore reçu d'avis.</p>
              } @else {
                <ul class="mt-3 divide-y divide-filet">
                  @for (rv of displayedReviews(); track rv.id) {
                    <li class="py-3 text-sm">
                      <p class="font-titre italic text-nuit">« {{ rv.comment }} »</p>
                      <div class="mt-1 flex items-center justify-between text-xs text-ardoise">
                        <span class="font-semibold">{{ rv.authorName }}</span>
                        <span class="text-[#8A6410]">★ {{ rv.rating }} / 5</span>
                      </div>
                    </li>
                  }
                </ul>
              }

              <!-- Formulaire interactif pour déposer un avis -->
              @if (session.user(); as currentUser) {
                @if (!isOwner()) {
                  <div class="mt-6 rounded-2xl border border-filet/70 bg-papier/70 p-5 shadow-2xs">
                    <h5 class="font-titre text-xs font-bold uppercase tracking-wider text-nuit">Évaluer ce conducteur</h5>
                    <form (submit)="submitReview($event, r.driverId, currentUser.name)" class="mt-3 space-y-3">
                      <div>
                        <div class="flex items-center gap-1">
                          @for (star of [1, 2, 3, 4, 5]; track star) {
                            <button
                              type="button"
                              (click)="newRating.set(star)"
                              class="text-lg transition-transform hover:scale-125 focus:outline-hidden cursor-pointer"
                              [class]="star <= newRating() ? 'text-[#8A6410]' : 'text-ardoise/30'"
                              [attr.aria-label]="star + ' étoile' + (star > 1 ? 's' : '')"
                            >
                              ★
                            </button>
                          }
                          <span class="ml-2 text-xs font-semibold text-nuit">{{ newRating() }}/5</span>
                        </div>
                      </div>

                      <div>
                        <textarea
                          rows="2"
                          [value]="newComment()"
                          (input)="newComment.set(inputValue($event))"
                          placeholder="Partage ton expérience : ponctualité, convivialité, propreté…"
                          class="w-full rounded-xl border border-ardoise/30 bg-white p-3 text-xs focus:border-soleil shadow-2xs transition-all"
                          required
                        ></textarea>
                      </div>

                      <button
                        app-button
                        type="submit"
                        variant="accent"
                        class="w-full text-xs"
                        [disabled]="submittingReview() || !newComment().trim()"
                      >
                        {{ submittingReview() ? 'Envoi en cours…' : 'Publier mon avis' }}
                      </button>
                    </form>
                  </div>
                }
              } @else {
                <div class="mt-4 rounded-2xl border border-filet bg-papier p-3 text-xs text-ardoise">
                  <a routerLink="/connexion" class="font-semibold text-nuit underline decoration-soleil decoration-2 underline-offset-4">
                    Connecte-toi
                  </a> pour laisser un avis sur ce conducteur.
                </div>
              }
            </div>
          </div>
        </aside>
      </section>
    } @else if (ride() === null) {
      <section class="rounded-3xl border border-filet/80 bg-white p-10 text-center shadow-xs">
        <h1 class="text-2xl font-titre font-bold text-nuit">Trajet introuvable</h1>
        <p class="mt-2 text-sm text-ardoise">Ce trajet n'existe plus ou a été annulé par le conducteur.</p>
        <a routerLink="/trajets" class="mt-5 inline-block text-sm font-semibold underline decoration-soleil decoration-2 underline-offset-4">
          Retour à la liste des trajets
        </a>
      </section>
    } @else {
      <!-- Skeletons du détail de trajet -->
      <section class="grid gap-10 md:grid-cols-[1.3fr_1fr]">
        <div class="space-y-4 rounded-3xl border border-filet/80 bg-white p-7 shadow-xs">
          <app-skeleton width="100px" height="1.25rem" rounded="rounded-full" />
          <app-skeleton width="280px" height="2rem" rounded="rounded-xl" />
          <app-skeleton width="180px" height="1rem" rounded="rounded-lg" />
          <div class="mt-6 space-y-3 pt-4 border-t border-filet">
            <app-skeleton width="100%" height="2.5rem" rounded="rounded-xl" />
            <app-skeleton width="100%" height="2.5rem" rounded="rounded-xl" />
            <app-skeleton width="100%" height="2.5rem" rounded="rounded-xl" />
          </div>
        </div>
        <div class="space-y-4 rounded-3xl border border-filet/80 bg-white p-7 shadow-xs">
          <app-skeleton width="80px" height="1.25rem" rounded="rounded-full" />
          <div class="flex items-center gap-3">
            <app-skeleton width="48px" height="48px" rounded="rounded-full" />
            <div class="space-y-2">
              <app-skeleton width="120px" height="1.25rem" rounded="rounded-lg" />
              <app-skeleton width="90px" height="1rem" rounded="rounded-md" />
            </div>
          </div>
        </div>
      </section>
    }
  `,
})
export class RideDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly ridesService = inject(RidesService);
  private readonly bookingsService = inject(BookingsService);
  private readonly toastService = inject(ToastService);
  protected readonly session = inject(SessionService);

  private readonly id = signal<string | null>(null);
  /** undefined = chargement, null = trajet introuvable. */
  protected readonly ride = signal<Ride | null | undefined>(undefined);
  protected readonly reviews = signal<Review[]>([]);
  protected readonly seats = signal(1);
  protected readonly message = signal<Message | null>(null);
  protected readonly reserving = signal(false);

  protected readonly newRating = signal(5);
  protected readonly newComment = signal('');
  protected readonly submittingReview = signal(false);
  protected readonly showAllReviews = signal(false);
  protected readonly inputValue = inputValue;

  protected readonly displayedReviews = computed(() => {
    const all = this.reviews();
    return this.showAllReviews() ? all : all.slice(0, 3);
  });

  protected readonly isOwner = computed(() => {
    const r = this.ride();
    return !!r && this.session.user()?.id === r.driverId;
  });
  protected readonly full = computed(() => this.ride()?.seatsLeft === 0);
  protected readonly seatOptions = computed(() =>
    Array.from({ length: this.ride()?.seatsLeft ?? 0 }, (_, i) => i + 1),
  );

  constructor() {
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

  protected async reserve(): Promise<void> {
    const r = this.ride();
    if (!r) return;
    const user = this.session.user();
    if (!user) {
      await this.router.navigate(['/connexion'], { state: { from: this.router.url } });
      return;
    }

    this.reserving.set(true);
    this.message.set(null);

    try {
      await this.bookingsService.createBooking(r.id, user, this.seats());
      this.message.set({ type: 'ok', text: 'Réservation confirmée avec succès !' });
      this.toastService.show(`Ta réservation pour ${r.from} → ${r.to} est confirmée !`, 'success');
      this.seats.set(1);
      await this.load();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Réservation impossible.';
      this.message.set({ type: 'error', text: errMsg });
      this.toastService.show(errMsg, 'error');
    } finally {
      this.reserving.set(false);
    }
  }

  protected async submitReview(e: Event, driverId: string, authorName: string): Promise<void> {
    e.preventDefault();
    const comment = this.newComment().trim();
    if (!comment) return;

    this.submittingReview.set(true);
    try {
      await this.ridesService.createReview(driverId, authorName, this.newRating(), comment);
      this.toastService.show('Ton avis a été publié avec succès !', 'success');
      this.newComment.set('');
      this.newRating.set(5);
      await this.load();
    } catch (err) {
      this.toastService.show(err instanceof Error ? err.message : 'Impossible d\'enregistrer l\'avis.', 'error');
    } finally {
      this.submittingReview.set(false);
    }
  }
}
