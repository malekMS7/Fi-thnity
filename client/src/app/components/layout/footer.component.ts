import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  host: { class: 'block mt-auto' },
  template: `
    <footer class="border-t border-filet bg-white pt-12 pb-8">
      <div class="mx-auto max-w-6xl px-4">
        <div class="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <!-- Col 1: Marque & Mission -->
          <div class="space-y-3">
            <div class="flex items-center gap-2 font-titre text-xl font-bold text-nuit">
              <span>Fi thnity</span>
              <span class="rounded-full bg-soleil px-2 py-0.2 text-[10px] font-bold text-nuit uppercase">TN</span>
            </div>
            <p class="text-xs text-ardoise leading-relaxed">
              Plateforme universitaire et citoyenne de covoiturage en Tunisie. Partagez la route, partagez les frais et réduisez l'empreinte carbone.
            </p>
            <p class="text-[11px] text-ardoise font-medium">
              Créé pour faciliter les trajets partagés en Tunisie.
            </p>
          </div>

          <!-- Col 2: Navigation -->
          <div>
            <h3 class="text-xs font-bold uppercase tracking-wider text-corail">Navigation</h3>
            <ul class="mt-3 space-y-2 text-sm text-ardoise">
              <li>
                <a routerLink="/" class="hover:text-nuit hover:underline">Accueil</a>
              </li>
              <li>
                <a routerLink="/trajets" class="hover:text-nuit hover:underline">Trouver un trajet</a>
              </li>
              <li>
                <a routerLink="/publier" class="hover:text-nuit hover:underline">Proposer un itinéraire</a>
              </li>
              <li>
                <a routerLink="/tableau-de-bord" class="hover:text-nuit hover:underline">Mon tableau de bord</a>
              </li>
            </ul>
          </div>

          <!-- Col 3: Assistance & Infos -->
          <div>
            <h3 class="text-xs font-bold uppercase tracking-wider text-corail">Assistance</h3>
            <ul class="mt-3 space-y-2 text-sm text-ardoise">
              <li>
                <a routerLink="/contact" class="hover:text-nuit hover:underline">Nous contacter</a>
              </li>
              <li>
                <a routerLink="/contact" class="hover:text-nuit hover:underline">Foire aux questions (FAQ)</a>
              </li>
              <li>
                <span class="text-xs text-ardoise">Support : contact&#64;fithnity.tn</span>
              </li>
              <li>
                <span class="text-xs text-ardoise">Technopôle El Ghazala, Ariana</span>
              </li>
            </ul>
          </div>

          <!-- Col 4: Sécurité & Engagement -->
          <div>
            <h3 class="text-xs font-bold uppercase tracking-wider text-corail">Valeurs & Charte</h3>
            <ul class="mt-3 space-y-2 text-xs text-ardoise leading-relaxed">
              <li>🌱 Mobilité durable et partagée</li>
              <li>🤝 Solidarité entre étudiants et actifs</li>
              <li>🛡️ Profils et avis communautaires vérifiés</li>
              <li>💰 0 commission intermédiaire</li>
            </ul>
          </div>
        </div>

        <div class="mt-10 flex flex-col items-center justify-between gap-4 border-t border-filet pt-6 text-xs text-ardoise sm:flex-row">
          <div>
            <p>© 2026 Fi thnity · Covoiturage partagé en Tunisie</p>
            <p class="mt-1 text-[11px] opacity-70">Projet étudiant · <span class="font-medium">Mohamed Laabidi &amp; Maled Slema</span> · SUP'COM</p>
          </div>
          <div class="flex gap-4">
            <a routerLink="/contact" class="hover:underline">Contact</a>
            <span>·</span>
            <a routerLink="/" class="hover:underline">Conditions d'utilisation</a>
            <span>·</span>
            <a routerLink="/" class="hover:underline">Confidentialité</a>
          </div>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {}
