import { Component, computed, input } from '@angular/core';
import type { Ride } from '../types';

/** Note du conducteur (« Nouveau » tant qu'il n'a pas d'avis). */
@Component({
  selector: 'app-rating',
  template: `
    @if (rating() === null) {
      <span class="inline-flex items-center rounded-full bg-papier px-2.5 py-0.5 text-xs font-medium text-ardoise border border-filet">Nouveau</span>
    } @else {
      <span class="inline-flex items-center gap-1 rounded-full bg-soleil/15 px-2.5 py-0.5 text-xs font-bold text-[#8A6410]">
        <span>★</span> {{ rating() }} <span class="font-normal text-ardoise text-[11px]">({{ ride().driverReviews }})</span>
      </span>
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
