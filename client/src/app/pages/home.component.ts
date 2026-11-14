import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent } from '../components/ui/button.component';
import { inputValue } from '../utils/dom';

@Component({
  selector: 'app-home',
  imports: [ButtonComponent],
  host: { class: 'block' },
  template: `
    <section class="max-w-2xl">
      <p class="text-xs font-bold uppercase tracking-widest text-corail">Covoiturage entre étudiants et actifs</p>
      <h1 class="mt-2 text-4xl leading-tight md:text-5xl">Partage la route, partage les frais.</h1>
      <p class="mt-4 text-ardoise">Trouve un trajet en quelques secondes ou propose tes places libres.</p>

      <form (submit)="handleSubmit($event)" class="mt-8 grid gap-3 rounded-charte border border-nuit bg-white p-4 md:grid-cols-4">
        <input class="min-h-11 rounded-charte border border-filet px-3" placeholder="Départ" aria-label="Départ" [value]="depart()" (input)="depart.set(inputValue($event))" />
        <input class="min-h-11 rounded-charte border border-filet px-3" placeholder="Arrivée" aria-label="Arrivée" [value]="arrivee()" (input)="arrivee.set(inputValue($event))" />
        <input type="date" class="min-h-11 rounded-charte border border-filet px-3" aria-label="Date" [value]="date()" (input)="date.set(inputValue($event))" />
        <button app-button type="submit" variant="accent">Rechercher</button>
      </form>
    </section>
  `,
})
export class HomeComponent {
  private readonly router = inject(Router);

  protected readonly depart = signal('');
  protected readonly arrivee = signal('');
  protected readonly date = signal('');
  protected readonly inputValue = inputValue;

  protected handleSubmit(e: Event): void {
    e.preventDefault();
    this.router.navigate(['/trajets'], {
      queryParams: { depart: this.depart(), arrivee: this.arrivee(), date: this.date() },
    });
  }
}
