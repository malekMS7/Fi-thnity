import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { RideCardComponent } from '../components/ride-card.component';
import { ButtonComponent } from '../components/ui/button.component';
import { SkeletonComponent } from '../components/ui/skeleton.component';
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
  imports: [RideCardComponent, ButtonComponent, SkeletonComponent],
  host: { class: 'block' },
  template: `
    <section>
      <p class="text-xs font-bold uppercase tracking-widest text-corail">Recherche</p>
      <h1 class="mt-1 text-3xl font-titre font-bold">Trouve ton trajet</h1>

      <form (submit)="submit($event)" class="mt-6 grid gap-4 rounded-3xl border border-filet/90 bg-white p-5 shadow-sm md:grid-cols-4">
        <input list="villes-tunisie" class="min-h-11 rounded-xl border border-filet/90 bg-papier/40 px-4 text-sm focus:border-soleil focus:bg-white focus:ring-3 focus:ring-soleil/20 shadow-2xs transition-all" placeholder="Départ (ex. Sfax)" aria-label="Ville de départ" [value]="form().depart" (input)="setField('depart', inputValue($event))" />
        <input list="villes-tunisie" class="min-h-11 rounded-xl border border-filet/90 bg-papier/40 px-4 text-sm focus:border-soleil focus:bg-white focus:ring-3 focus:ring-soleil/20 shadow-2xs transition-all" placeholder="Arrivée (ex. Tunis)" aria-label="Ville d'arrivée" [value]="form().arrivee" (input)="setField('arrivee', inputValue($event))" />
        <input type="date" class="min-h-11 rounded-xl border border-filet/90 bg-papier/40 px-4 text-sm focus:border-soleil focus:bg-white focus:ring-3 focus:ring-soleil/20 shadow-2xs transition-all" aria-label="Date" [value]="form().date" (input)="setField('date', inputValue($event))" />
        <button app-button type="submit" variant="accent">Rechercher</button>
        <datalist id="villes-tunisie">
          <option value="Tunis"></option>
          <option value="Sfax"></option>
          <option value="Sousse"></option>
          <option value="Bizerte"></option>
          <option value="Nabeul"></option>
          <option value="Monastir"></option>
          <option value="Kairouan"></option>
          <option value="Gabès"></option>
          <option value="Ariana"></option>
          <option value="La Manouba"></option>
        </datalist>
      </form>

      <div class="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filtres rapides">
        @for (f of filters; track f.key) {
          <button type="button" [attr.aria-pressed]="isOn(f)" (click)="toggle(f.key, f.value)" [class]="filterClass(f)">
            {{ f.label }}
          </button>
        }
      </div>

      <div class="mt-6" aria-live="polite">
        @if (rides(); as list) {
          @if (list.length === 0) {
            <div class="mt-8 rounded-3xl border border-filet/80 bg-white p-10 text-center shadow-xs">
              <span class="text-4xl">🚗</span>
              <h2 class="mt-3 font-titre text-xl font-bold text-nuit">Aucun trajet ne correspond</h2>
              <p class="mt-1 text-sm text-ardoise max-w-md mx-auto">
                Aucun trajet ne répond exactement à tes critères. Essaie d'élargir ta date ou d'ajuster tes filtres de recherche.
              </p>
              <div class="mt-6 flex justify-center gap-3">
                <button type="button" (click)="resetFilters()" class="text-sm font-semibold underline decoration-soleil decoration-2 underline-offset-4">
                  Réinitialiser la recherche
                </button>
              </div>
            </div>
          } @else {
            <p class="text-sm font-medium text-ardoise mb-3">{{ list.length }} trajet{{ list.length > 1 ? 's' : '' }} disponible{{ list.length > 1 ? 's' : '' }}</p>
            <ul class="space-y-3">
              @for (r of list; track r.id) {
                <li app-ride-card [ride]="r"></li>
              }
            </ul>
          }
        } @else {
          <!-- Skeleton Loading -->
          <div class="mt-4 space-y-3.5" aria-label="Chargement des trajets">
            @for (i of [1, 2, 3, 4]; track i) {
              <div class="flex flex-col gap-3 rounded-2xl border border-filet/70 bg-white p-5 sm:flex-row sm:items-center shadow-xs">
                <div class="space-y-2 sm:w-56">
                  <app-skeleton width="140px" height="1.25rem" rounded="rounded-lg" />
                  <app-skeleton width="90px" height="0.875rem" rounded="rounded-md" />
                </div>
                <div class="flex-1 space-y-2">
                  <app-skeleton width="240px" height="1.25rem" rounded="rounded-lg" />
                </div>
                <div class="flex items-center gap-3">
                  <app-skeleton width="70px" height="1.5rem" rounded="rounded-full" />
                  <app-skeleton width="60px" height="1.5rem" rounded="rounded-full" />
                  <app-skeleton width="50px" height="2rem" rounded="rounded-full" />
                </div>
              </div>
            }
          </div>
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

  protected resetFilters(): void {
    this.form.set({ depart: '', arrivee: '', date: '' });
    this.router.navigate([], { relativeTo: this.route, queryParams: {} });
  }

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
