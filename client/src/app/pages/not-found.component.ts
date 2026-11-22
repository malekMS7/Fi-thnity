import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../components/ui/button.component';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, ButtonComponent],
  host: { class: 'block' },
  template: `
    <section class="mx-auto max-w-xl py-12 text-center">
      <div class="inline-flex h-24 w-24 items-center justify-center rounded-full bg-soleil/20 font-titre text-5xl font-extrabold text-nuit">
        404
      </div>

      <p class="mt-6 text-xs font-bold uppercase tracking-widest text-corail">Erreur d'itinéraire</p>
      <h1 class="mt-2 text-3xl font-titre font-bold md:text-4xl text-nuit">Tu as fait fausse route.</h1>
      <p class="mt-3 text-ardoise leading-relaxed">
        La destination demandée n'existe pas, a été déplacée ou le lien suivi est obsolète. Pas d'inquiétude, la communauté Fi thnity te remet sur la bonne voie !
      </p>

      <div class="mt-8 flex flex-wrap items-center justify-center gap-4">
        <a routerLink="/" app-button variant="primary">
          Retour à l'accueil
        </a>
        <a routerLink="/trajets" app-button variant="accent">
          Trouver un trajet
        </a>
      </div>

      <div class="mt-12 rounded-2xl border border-filet/80 bg-white p-5 text-xs text-ardoise shadow-xs">
        Besoin d'un renseignement ou d'aide ? <a routerLink="/contact" class="font-semibold text-nuit underline decoration-soleil decoration-2 underline-offset-4">Écris au support</a>.
      </div>
    </section>
  `,
})
export class NotFoundComponent {}
