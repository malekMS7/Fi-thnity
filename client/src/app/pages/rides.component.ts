import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { RideCardComponent } from '../components/ride-card.component';
import { ButtonComponent } from '../components/ui/button.component';
import { RidesService } from '../services/rides.service';
import { inputValue } from '../utils/dom';

interface Filter {
  key: string;
  value: string;
  label: string;
}

const FILTERS: Filter[] = [
  { key: 'prixMax', value: '20', label: 'Prix ≤ 20 DT' },
  { key: 'matin', value: '1', label: 'Départ le matin' },
  { key: 'placesMin', value: '2', label: 'Places ≥ 2' },
];

@Component({
  selector: 'app-rides',
  imports: [RideCardComponent, ButtonComponent],
  host: { class: 'block' },
  template: `
    <section>
      <p class="text-xs font-bold uppercase tracking-widest text-corail">Recherche</p>
      <h1 class="mt-1 text-3xl">Trouve ton trajet</h1>

      <form (submit)="submit($event)" class="mt-6 grid gap-3 md:grid-cols-4">
        <input class="min-h-11 rounded-charte border border-ardoise bg-white px-3" placeholder="Départ" aria-label="Départ" [value]="form().depart" (input)="setField('depart', inputValue($event))" />
        <input class="min-h-11 rounded-charte border border-ardoise bg-white px-3" placeholder="Arrivée" aria-label="Arrivée" [value]="form().arrivee" (input)="setField('arrivee', inputValue($event))" />
        <input type="date" class="min-h-11 rounded-charte border border-ardoise bg-white px-3" aria-label="Date" [value]="form().date" (input)="setField('date', inputValue($event))" />
        <button app-button type="submit" variant="accent">Rechercher</button>
      </form>

      <div class="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filtres">
        @for (f of filters; track f.key) {
          <button type="button" [attr.aria-pressed]="isOn(f)" (click)="toggle(f.key, f.value)" [class]="filterClass(f)">
            {{ f.label }}
          </button>
        }
      </div>

      <div class="mt-6" aria-live="polite">
        @if (rides(); as list) {
          @if (list.length === 0) {
            <p class="text-ardoise">Aucun trajet ne correspond. Essaie d'élargir ta recherche.</p>
          } @else {
            <p class="text-sm text-ardoise">{{ list.length }} trajet{{ list.length > 1 ? 's' : '' }} trouvé{{ list.length > 1 ? 's' : '' }}</p>
            <ul class="mt-2 border-t border-filet">
              @for (r of list; track r.id) {
                <li app-ride-card [ride]="r"></li>
              }
            </ul>
          }
        } @else {
          <p class="text-ardoise">Chargement…</p>
        }
      </div>
    </section>
  `,
})
export class RidesComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly ridesService = inject(RidesService);

  protected readonly filters = FILTERS;
  protected readonly inputValue = inputValue;

  /** Équivalent de useSearchParams() : les paramètres de l'URL (?depart=…&prixMax=…). */
  private readonly params = toSignal(this.route.queryParamMap, { initialValue: this.route.snapshot.queryParamMap });

  protected readonly form = signal({
    depart: this.route.snapshot.queryParamMap.get('depart') ?? '',
    arrivee: this.route.snapshot.queryParamMap.get('arrivee') ?? '',
    date: this.route.snapshot.queryParamMap.get('date') ?? '',
  });

  /** Recharge les trajets à chaque changement d'URL (switchMap ignore les réponses obsolètes). */
  protected readonly rides = toSignal(
    this.route.queryParamMap.pipe(
      switchMap((p) =>
        this.ridesService.listRides({
          depart: p.get('depart') ?? undefined,
          arrivee: p.get('arrivee') ?? undefined,
          date: p.get('date') ?? undefined,
          prixMax: p.get('prixMax') ? Number(p.get('prixMax')) : undefined,
          placesMin: p.get('placesMin') ? Number(p.get('placesMin')) : undefined,
          matin: p.get('matin') === '1',
        }),
      ),
    ),
    { initialValue: null },
  );

  protected setField(key: 'depart' | 'arrivee' | 'date', value: string): void {
    this.form.update((f) => ({ ...f, [key]: value }));
  }

  protected isOn(f: Filter): boolean {
    return this.params().get(f.key) === f.value;
  }

  protected filterClass(f: Filter): string {
    return `min-h-11 rounded-full border border-nuit px-4 text-sm ${this.isOn(f) ? 'bg-nuit text-papier' : ''}`;
  }

  protected submit(e: Event): void {
    e.preventDefault();
    const next = this.currentParams();
    for (const [k, v] of Object.entries(this.form())) {
      if (v) next[k] = v;
      else delete next[k];
    }
    this.router.navigate([], { relativeTo: this.route, queryParams: next });
  }

  protected toggle(key: string, value: string): void {
    const next = this.currentParams();
    if (next[key] === value) delete next[key];
    else next[key] = value;
    this.router.navigate([], { relativeTo: this.route, queryParams: next });
  }

  private currentParams(): Record<string, string> {
    const p = this.params();
    const out: Record<string, string> = {};
    for (const k of p.keys) out[k] = p.get(k) ?? '';
    return out;
  }
}
