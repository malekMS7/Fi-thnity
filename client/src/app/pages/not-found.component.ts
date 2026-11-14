import { Component } from '@angular/core';

@Component({
  selector: 'app-not-found',
  host: { class: 'block' },
  template: `
    <section>
      <p class="text-xs font-bold uppercase tracking-widest text-corail">Erreur 404</p>
      <h1 class="mt-1 text-3xl">Page introuvable</h1>
      <p class="mt-4 text-ardoise">À développer (voir la maquette de l'objectif 2).</p>
    </section>
  `,
})
export class NotFoundComponent {}
