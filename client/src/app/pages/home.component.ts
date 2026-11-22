import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ButtonComponent } from '../components/ui/button.component';
import { inputValue } from '../utils/dom';
import { todayISO } from '../utils/format';

interface PopularRoute {
  from: string;
  to: string;
  price: string;
  duration: string;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink, ButtonComponent],
  host: { class: 'block' },
  template: `
    <div>
      <!-- Hero Section -->
      <section class="relative overflow-hidden py-4 md:py-8">
        <div class="max-w-3xl">
          <span class="inline-flex items-center gap-2 rounded-full border border-corail/30 bg-corail/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-corail">
            <span class="h-1.5 w-1.5 rounded-full bg-corail animate-pulse"></span>
            Covoiturage interurbain en Tunisie
          </span>
          <h1 class="mt-4 text-4xl leading-tight font-titre font-bold text-nuit md:text-5xl lg:text-6xl">
            Partage la route, <br class="hidden sm:inline" />
            <span class="underline decoration-soleil decoration-4 underline-offset-8">partage les frais.</span>
          </h1>
          <p class="mt-4 text-base text-ardoise sm:text-lg leading-relaxed max-w-2xl">
            La solution pensée pour les étudiants et actifs en Tunisie. Rejoins notre communauté universitaire pour voyager sereinement, à prix équitable et en toute convivialité.
          </p>

          <!-- Formulaire de recherche héro moderne & arrondi -->
          <form
            (submit)="handleSubmit($event)"
            class="mt-8 grid gap-4 rounded-3xl border border-filet/90 bg-white p-5 shadow-xl sm:grid-cols-2 md:grid-cols-4"
          >
            <div>
              <label for="home-depart" class="block text-xs font-bold uppercase tracking-wider text-ardoise mb-1">Départ</label>
              <input
                id="home-depart"
                list="villes-tunisie"
                class="min-h-11 w-full rounded-xl border border-filet/90 bg-papier/40 px-4 text-sm focus:border-soleil focus:bg-white focus:ring-3 focus:ring-soleil/20 shadow-2xs transition-all"
                placeholder="Ex. Tunis, Sfax…"
                [value]="depart()"
                (input)="depart.set(inputValue($event))"
              />
            </div>

            <div>
              <label for="home-arrivee" class="block text-xs font-bold uppercase tracking-wider text-ardoise mb-1">Arrivée</label>
              <input
                id="home-arrivee"
                list="villes-tunisie"
                class="min-h-11 w-full rounded-xl border border-filet/90 bg-papier/40 px-4 text-sm focus:border-soleil focus:bg-white focus:ring-3 focus:ring-soleil/20 shadow-2xs transition-all"
                placeholder="Ex. Sousse, Bizerte…"
                [value]="arrivee()"
                (input)="arrivee.set(inputValue($event))"
              />
            </div>

            <div>
              <label for="home-date" class="block text-xs font-bold uppercase tracking-wider text-ardoise mb-1">Date</label>
              <input
                id="home-date"
                type="date"
                [min]="today()"
                class="min-h-11 w-full rounded-xl border border-filet/90 bg-papier/40 px-4 text-sm focus:border-soleil focus:bg-white focus:ring-3 focus:ring-soleil/20 shadow-2xs transition-all"
                [value]="date()"
                (input)="date.set(inputValue($event))"
              />
            </div>

            <div class="flex items-end">
              <button app-button type="submit" variant="accent" class="w-full">
                Trouver un trajet
              </button>
            </div>

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

          <!-- Indicateurs de confiance rapides -->
          <div class="mt-6 flex flex-wrap items-center gap-6 text-xs text-ardoise">
            <span class="flex items-center gap-1.5 font-medium">
              <span class="text-menthe">✓</span> 100% sans commission
            </span>
            <span class="flex items-center gap-1.5 font-medium">
              <span class="text-menthe">✓</span> Conducteurs notés & vérifiés
            </span>
            <span class="flex items-center gap-1.5 font-medium">
              <span class="text-menthe">✓</span> Réservation instantanée
            </span>
          </div>
        </div>
      </section>

      <!-- Trajets populaires / Raccourcis -->
      <section class="mt-16 border-t border-filet pt-12">
        <div class="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <p class="text-xs font-bold uppercase tracking-widest text-corail">Destinations fréquentes</p>
            <h2 class="mt-1 text-2xl font-titre font-semibold">Trajets les plus demandés</h2>
          </div>
          <a routerLink="/trajets" class="text-sm font-semibold underline decoration-soleil decoration-2 underline-offset-4">
            Tous les trajets disponibles →
          </a>
        </div>

        <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          @for (route of popularRoutes; track route.from + route.to) {
            <div
              (click)="selectRoute(route.from, route.to)"
              class="group cursor-pointer rounded-2xl border border-filet/70 bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-soleil/50 hover:shadow-md"
            >
              <div class="flex items-center justify-between text-xs font-semibold text-corail">
                <span>{{ route.duration }}</span>
                <span class="rounded-full bg-menthe/10 px-2 py-0.5 text-menthe font-bold">{{ route.price }}</span>
              </div>
              <h3 class="mt-2 text-base font-titre font-bold text-nuit group-hover:text-menthe">
                {{ route.from }} → {{ route.to }}
              </h3>
              <p class="mt-1 text-xs text-ardoise">Départs réguliers chaque semaine</p>
            </div>
          }
        </div>
      </section>

      <!-- Comment ça marche ? -->
      <section class="mt-16 rounded-3xl border border-filet/70 bg-white p-8 md:p-12 shadow-sm">
        <div class="text-center">
          <p class="text-xs font-bold uppercase tracking-widest text-corail">Simplicité & Efficacité</p>
          <h2 class="mt-1 text-3xl font-titre font-bold">Comment fonctionne Fi thnity ?</h2>
          <p class="mt-2 text-sm text-ardoise max-w-xl mx-auto">
            Une prise en main immédiate, que tu sois au volant ou à la recherche d'une place.
          </p>
        </div>

        <div class="mt-10 grid gap-8 md:grid-cols-3">
          <!-- Étape 1 -->
          <div class="relative flex flex-col items-center text-center">
            <div class="flex h-14 w-14 items-center justify-center rounded-full bg-nuit font-titre text-xl font-bold text-soleil shadow-sm">
              1
            </div>
            <h3 class="mt-4 text-lg font-titre font-bold text-nuit">Cherche ou publie</h3>
            <p class="mt-2 text-sm text-ardoise leading-relaxed">
              Indique ta ville de départ, ta destination et ton horaire. Les conducteurs précisent leurs places disponibles et leurs options.
            </p>
          </div>

          <!-- Étape 2 -->
          <div class="relative flex flex-col items-center text-center">
            <div class="flex h-14 w-14 items-center justify-center rounded-full bg-soleil font-titre text-xl font-bold text-nuit shadow-sm">
              2
            </div>
            <h3 class="mt-4 text-lg font-titre font-bold text-nuit">Réserve en 1 clic</h3>
            <p class="mt-2 text-sm text-ardoise leading-relaxed">
              Consulte la note et les avis du conducteur, choisis le nombre de places souhaité et valide instantanément ta réservation.
            </p>
          </div>

          <!-- Étape 3 -->
          <div class="relative flex flex-col items-center text-center">
            <div class="flex h-14 w-14 items-center justify-center rounded-full bg-menthe font-titre text-xl font-bold text-papier shadow-sm">
              3
            </div>
            <h3 class="mt-4 text-lg font-titre font-bold text-nuit">Voyage & Partage</h3>
            <p class="mt-2 text-sm text-ardoise leading-relaxed">
              Rejoins le point de rendez-vous convenu, profite d'un trajet agréable et règle ta part directement au conducteur.
            </p>
          </div>
        </div>
      </section>

      <!-- Pourquoi choisir Fi thnity ? (Avantages) -->
      <section class="mt-16">
        <p class="text-xs font-bold uppercase tracking-widest text-corail">Pourquoi nous choisir ?</p>
        <h2 class="mt-1 text-2xl font-titre font-semibold md:text-3xl">Conçu par et pour la communauté</h2>

        <div class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div class="rounded-2xl border border-filet/60 bg-white p-6 shadow-xs hover:shadow-md transition-all">
            <span class="text-2xl">💰</span>
            <h3 class="mt-3 font-titre text-base font-bold text-nuit">Économique</h3>
            <p class="mt-1 text-sm text-ardoise leading-relaxed">
              Divise tes frais de route par 2 ou par 3 par rapport aux transports individuels ou aux louages.
            </p>
          </div>

          <div class="rounded-2xl border border-filet/60 bg-white p-6 shadow-xs hover:shadow-md transition-all">
            <span class="text-2xl">🛡️</span>
            <h3 class="mt-3 font-titre text-base font-bold text-nuit">Confiance & Sécurité</h3>
            <p class="mt-1 text-sm text-ardoise leading-relaxed">
              Notes transparentes, avis récents et profils détaillés pour voyager en toute sérénité.
            </p>
          </div>

          <div class="rounded-2xl border border-filet/60 bg-white p-6 shadow-xs hover:shadow-md transition-all">
            <span class="text-2xl">🌿</span>
            <h3 class="mt-3 font-titre text-base font-bold text-nuit">Écologique</h3>
            <p class="mt-1 text-sm text-ardoise leading-relaxed">
              Optimiser les places vides réduit le nombre de véhicules sur les axes routiers et l'empreinte carbone.
            </p>
          </div>

          <div class="rounded-2xl border border-filet/60 bg-white p-6 shadow-xs hover:shadow-md transition-all">
            <span class="text-2xl">🎓</span>
            <h3 class="mt-3 font-titre text-base font-bold text-nuit">Esprit Campus</h3>
            <p class="mt-1 text-sm text-ardoise leading-relaxed">
              Créé pour rapprocher les étudiants et les actifs partout en Tunisie.
            </p>
          </div>
        </div>
      </section>

      <!-- Bannière Conducteur (CTA) -->
      <section class="mt-16 rounded-3xl bg-nuit p-8 text-papier md:p-12 shadow-xl">
        <div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div class="max-w-xl">
            <span class="text-xs font-bold uppercase tracking-widest text-soleil">Espace Conducteurs</span>
            <h2 class="mt-2 text-2xl font-titre font-bold text-papier md:text-3xl">
              Tu prends souvent la route avec des sièges vides ?
            </h2>
            <p class="mt-2 text-sm text-filet leading-relaxed">
              Publie ton trajet en moins de 2 minutes, choisis ton point de rendez-vous et amortis facilement tes dépenses d'essence et de péage.
            </p>
          </div>
          <div class="shrink-0">
            <a routerLink="/publier" app-button variant="accent" class="text-center font-bold">
              Publier un trajet gratuitement
            </a>
          </div>
        </div>
      </section>
    </div>
  `,
})
export class HomeComponent {
  private readonly router = inject(Router);

  protected readonly depart = signal('');
  protected readonly arrivee = signal('');
  protected readonly date = signal('');
  protected readonly today = todayISO;
  protected readonly inputValue = inputValue;

  protected readonly popularRoutes: PopularRoute[] = [
    { from: 'Tunis', to: 'Sfax', price: 'dès 18 DT', duration: '~3h30' },
    { from: 'Tunis', to: 'Sousse', price: 'dès 12 DT', duration: '~1h45' },
    { from: 'Tunis', to: 'Bizerte', price: 'dès 7 DT', duration: '~1h00' },
    { from: 'Nabeul', to: 'Tunis', price: 'dès 8 DT', duration: '~1h15' },
  ];

  protected selectRoute(from: string, to: string): void {
    this.router.navigate(['/trajets'], {
      queryParams: { depart: from, arrivee: to },
    });
  }

  protected handleSubmit(e: Event): void {
    e.preventDefault();
    const queryParams: Record<string, string> = {};
    if (this.depart().trim()) queryParams['depart'] = this.depart().trim();
    if (this.arrivee().trim()) queryParams['arrivee'] = this.arrivee().trim();
    if (this.date()) queryParams['date'] = this.date();

    this.router.navigate(['/trajets'], { queryParams });
  }
}
