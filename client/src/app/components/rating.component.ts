import { Component, computed, input } from '@angular/core';
import type { Ride } from '../types';

/** Note du conducteur (« Nouveau » tant qu'il n'a pas d'avis). */
@Component({
  selector: 'app-rating',
  template: `
    @if (rating() === null) {
      <span class="text-sm text-ardoise">Nouveau</span>
    } @else {
      <span class="text-sm font-bold text-[#8A6410]">★ {{ rating() }} <span class="font-normal text-ardoise">({{ ride().driverReviews }})</span></span>
    }
  `,
})
export class RatingComponent {
  readonly ride = input.required<Ride>();

  protected readonly rating = computed(() => {
    const r = this.ride().driverRating;
    return r === null ? null : r.toString().replace('.', ',');
  });
}
