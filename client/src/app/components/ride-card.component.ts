import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Ride } from '../types';
import { FormatDatePipe, FormatPricePipe } from '../utils/format.pipes';
import { RatingComponent } from './rating.component';

/**
 * Une ligne de résultat. S'utilise sur un <li> pour garder une liste HTML valide :
 *   <li app-ride-card [ride]="r"></li>
 */
@Component({
  selector: 'li[app-ride-card]',
  imports: [RouterLink, RatingComponent, FormatDatePipe, FormatPricePipe],
  host: { class: 'flex flex-col gap-2 border-b border-filet py-4 sm:flex-row sm:items-center sm:gap-6' },
  template: `
    <div class="sm:w-48">
      <p class="font-titre text-lg font-semibold">{{ ride().time }} · {{ ride().driverName }}</p>
      <p class="text-sm text-ardoise">{{ ride().date | formatDate }}</p>
    </div>
    <p class="flex-1 text-sm">{{ ride().from }} → {{ ride().to }}</p>
    <div class="flex items-center gap-4">
      <app-rating [ride]="ride()" />
      <span [class]="seatsClass()">{{ seatsLabel() }}</span>
      <span class="text-lg font-bold text-menthe">{{ ride().price | formatPrice }}</span>
      <a [routerLink]="['/trajets', ride().id]" class="border-b-2 border-soleil text-sm font-semibold">Voir</a>
    </div>
  `,
})
export class RideCardComponent {
  readonly ride = input.required<Ride>();

  private readonly full = computed(() => this.ride().seatsLeft === 0);

  protected readonly seatsClass = computed(
    () => `text-sm ${this.full() ? 'font-semibold text-corail' : 'text-ardoise'}`,
  );

  protected readonly seatsLabel = computed(() => {
    const n = this.ride().seatsLeft;
    return this.full() ? 'Complet' : `${n} place${n > 1 ? 's' : ''}`;
  });
}
