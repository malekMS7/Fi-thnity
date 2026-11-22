import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent } from '../components/ui/button.component';
import { FieldComponent } from '../components/ui/field.component';
import { SessionService } from '../core/session.service';
import { ToastService } from '../core/toast.service';
import { RidesService } from '../services/rides.service';
import { isPast, todayISO } from '../utils/format';

interface PublishForm {
  from: string;
  to: string;
  date: string;
  time: string;
  seats: string;
  price: string;
  meetingPoint: string;
}

type Errors = Partial<Record<keyof PublishForm | 'form', string>>;

@Component({
  selector: 'app-publish-ride',
  imports: [ButtonComponent, FieldComponent],
  host: { class: 'block' },
  template: `
    <section class="max-w-3xl">
      <p class="text-xs font-bold uppercase tracking-widest text-corail">Publier un trajet</p>
      <h1 class="mt-1 text-3xl">Où vas-tu ?</h1>
      <form (submit)="handleSubmit($event)" novalidate class="mt-6 grid gap-x-8 gap-y-4 md:grid-cols-2">
        <app-field label="Départ" list="villes-tunisie" [value]="f().from" (valueChange)="set('from', $event)" [error]="errors().from" />
        <app-field label="Arrivée" list="villes-tunisie" [value]="f().to" (valueChange)="set('to', $event)" [error]="errors().to" />
        <app-field label="Date" type="date" [min]="today()" [value]="f().date" (valueChange)="set('date', $event)" [error]="errors().date" />
        <app-field label="Heure" type="time" [value]="f().time" (valueChange)="set('time', $event)" [error]="errors().time" />
        <app-field label="Places disponibles" type="number" [min]="1" [max]="8" [value]="f().seats" (valueChange)="set('seats', $event)" [error]="errors().seats" />
        <app-field label="Prix par place (DT)" type="number" [min]="0" [value]="f().price" (valueChange)="set('price', $event)" [error]="errors().price" />
        <div class="md:col-span-2">
          <app-field label="Point de rendez-vous" [value]="f().meetingPoint" (valueChange)="set('meetingPoint', $event)" [error]="errors().meetingPoint" />
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
        <fieldset class="md:col-span-2">
          <legend class="text-sm font-medium">Options</legend>
          <div class="mt-1 flex flex-wrap gap-6 text-sm">
            @for (o of allOptions; track o) {
              <label class="flex min-h-11 items-center gap-2">
                <input type="checkbox" [checked]="options().includes(o)" (change)="toggleOption(o)" /> {{ o }}
              </label>
            }
          </div>
        </fieldset>
        @if (errors().form) {
          <p role="alert" class="text-sm text-corail md:col-span-2">Error : {{ errors().form }}</p>
        }
        <div class="md:col-span-2"><button app-button type="submit" variant="accent">Publier le trajet</button></div>
      </form>
    </section>
  `,
})
export class PublishRideComponent {
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly ridesService = inject(RidesService);
  private readonly toastService = inject(ToastService);

  protected readonly allOptions = ['Petit bagage', 'Non-fumeur', 'Musique'];
  protected readonly today = todayISO;

  protected readonly f = signal<PublishForm>({ from: '', to: '', date: '', time: '', seats: '3', price: '', meetingPoint: '' });
  protected readonly options = signal<string[]>([]);
  protected readonly errors = signal<Errors>({});

  protected set(key: keyof PublishForm, value: string): void {
    this.f.update((s) => ({ ...s, [key]: value }));
  }

  protected toggleOption(o: string): void {
    this.options.update((list) => (list.includes(o) ? list.filter((x) => x !== o) : [...list, o]));
  }

  private validate(): Errors {
    const f = this.f();
    const e: Errors = {};
    if (!f.from.trim()) e.from = 'indique la ville de départ.';
    if (!f.to.trim()) e.to = 'indique la ville d\'arrivée.';
    else if (f.to.trim().toLowerCase() === f.from.trim().toLowerCase()) e.to = 'le départ et l\'arrivée doivent être différents.';
    if (!f.date) e.date = 'choisis une date.';
    if (!f.time) e.time = 'choisis une heure.';
    else if (f.date && isPast(f.date, f.time)) e.time = 'le départ doit être dans le futur.';
    if (!(Number(f.seats) >= 1 && Number(f.seats) <= 8)) e.seats = 'entre 1 et 8 places.';
    if (!(Number(f.price) >= 0) || f.price === '') e.price = 'indique un prix (0 si gratuit).';
    if (!f.meetingPoint.trim()) e.meetingPoint = 'indique le point de rendez-vous.';
    return e;
  }

  protected async handleSubmit(ev: Event): Promise<void> {
    ev.preventDefault();
    const e = this.validate();
    this.errors.set(e);
    const user = this.session.user();
    if (Object.keys(e).length || !user) return;
    const f = this.f();
    try {
      const ride = await this.ridesService.createRide(
        {
          from: f.from.trim(), to: f.to.trim(), date: f.date, time: f.time,
          seats: Number(f.seats), price: Number(f.price), meetingPoint: f.meetingPoint.trim(), options: this.options(),
        },
        user,
      );
      this.toastService.show('Ton trajet a été publié avec succès !', 'success');
      await this.router.navigate(['/trajets', ride.id]);
    } catch {
      this.errors.set({ form: 'publication impossible, réessaie.' });
    }
  }
}
