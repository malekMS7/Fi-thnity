import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Ride } from '../types';
import { FormatDatePipe, FormatPricePipe } from '../utils/format.pipes';
import { RatingComponent } from './rating.component';

/**
 * Carte de trajet moderne avec coins adoucis (rounded-2xl) et élévation subtile.
 */
@Component({
  selector: 'li[app-ride-card]',
  imports: [RouterLink, RatingComponent, FormatDatePipe, FormatPricePipe],
  host: {
    class: 'block mb-3.5 rounded-2xl border border-filet/80 bg-white p-5 shadow-xs transition-all duration-200 hover:shadow-md hover:border-filet hover:-translate-y-0.5',
  },
  template: `
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <!-- Heure et conducteur -->
      <div class="flex items-center gap-3.5 sm:w-56">
        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-nuit/5 text-base font-bold text-nuit font-titre">
          {{ ride().driverName.charAt(0).toUpperCase() }}
        </div>
        <div>
          <p class="font-titre text-base font-bold text-nuit">{{ ride().time }} · {{ ride().driverName }}</p>
          <p class="text-xs text-ardoise">{{ ride().date | formatDate }}</p>
        </div>
      </div>

      <!-- Itinéraire -->
      <div class="flex-1 sm:px-4">
        <div class="flex items-center gap-2">
          <span class="font-titre text-base font-bold text-nuit">{{ ride().from }}</span>
          <span class="text-xs text-ardoise">→</span>
          <span class="font-titre text-base font-bold text-nuit">{{ ride().to }}</span>
        </div>
        @if (ride().meetingPoint) {
          <p class="text-xs text-ardoise mt-0.5 truncate max-w-sm">📍 {{ ride().meetingPoint }}</p>
        }
      </div>

      <!-- Note, Places, Prix et Bouton -->
      <div class="flex flex-wrap items-center gap-3 sm:gap-4">
        <app-rating [ride]="ride()" />
        <span
          class="rounded-full px-3 py-1 text-xs font-semibold"
          [class]="full() ? 'bg-corail/10 text-corail' : 'bg-papier border border-filet text-ardoise'"
        >
          {{ seatsLabel() }}
        </span>
        <span class="text-lg font-bold text-menthe">{{ ride().price | formatPrice }}</span>
        <a
          [routerLink]="['/trajets', ride().id]"
          class="inline-flex items-center justify-center rounded-full bg-nuit px-4 py-2 text-xs font-bold text-papier transition hover:bg-nuit/90 hover:shadow-sm"
        >
          Voir →
        </a>
      </div>
    </div>
  `,
})
export class RideCardComponent {
  readonly ride = input.required<Ride>();

  protected readonly full = computed(() => this.ride().seatsLeft === 0);

  protected readonly seatsLabel = computed(() => {
    const n = this.ride().seatsLeft;
    return this.full() ? 'Complet' : `${n} place${n > 1 ? 's' : ''}`;
  });
}
