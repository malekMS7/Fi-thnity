import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ButtonComponent } from '../components/ui/button.component';
import { FieldComponent } from '../components/ui/field.component';
import { SessionService } from '../core/session.service';
import { ToastService } from '../core/toast.service';
import { AuthService } from '../services/auth.service';
import type { Role } from '../types';

type Errors = Partial<Record<'name' | 'email' | 'phone' | 'password' | 'form', string>>;

interface RegisterForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
}

@Component({
  selector: 'app-register',
  imports: [RouterLink, ButtonComponent, FieldComponent],
  host: { class: 'block' },
  template: `
    <section class="mx-auto max-w-md">
      <p class="text-xs font-bold uppercase tracking-widest text-corail">Inscription</p>
      <h1 class="mt-1 text-3xl">Crée ton compte.</h1>
      <form (submit)="handleSubmit($event)" novalidate class="mt-6 space-y-4">
        <app-field label="Nom complet" [value]="form().name" (valueChange)="set('name', $event)" [error]="errors().name" autocomplete="name" />
        <app-field label="Email" type="email" [value]="form().email" (valueChange)="set('email', $event)" [error]="errors().email" autocomplete="email" />
        <app-field label="Téléphone (optionnel)" type="tel" [value]="form().phone" (valueChange)="set('phone', $event)" [error]="errors().phone" autocomplete="tel" />
        <app-field label="Mot de passe" type="password" [value]="form().password" (valueChange)="set('password', $event)" [error]="errors().password" autocomplete="new-password" />
        <fieldset>
          <legend class="text-sm font-medium">Je suis surtout</legend>
          <div class="mt-1 flex gap-6 text-sm">
            <label class="flex min-h-11 items-center gap-2"><input type="radio" name="role" [checked]="form().role === 'PASSENGER'" (change)="setRole('PASSENGER')" /> Passager</label>
            <label class="flex min-h-11 items-center gap-2"><input type="radio" name="role" [checked]="form().role === 'DRIVER'" (change)="setRole('DRIVER')" /> Conducteur</label>
          </div>
        </fieldset>
        @if (errors().form) {
          <p role="alert" class="text-sm text-corail">Error : {{ errors().form }}</p>
        }
        <button app-button type="submit" class="w-full">Créer mon compte</button>
      </form>
      <p class="mt-4 text-sm text-ardoise">Déjà inscrit ? <a routerLink="/connexion" class="font-semibold text-nuit underline decoration-soleil decoration-2">Se connecter</a></p>
    </section>
  `,
})
export class RegisterComponent {
  private readonly session = inject(SessionService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly form = signal<RegisterForm>({ name: '', email: '', phone: '', password: '', role: 'PASSENGER' });
  protected readonly errors = signal<Errors>({});

  protected set(key: Exclude<keyof RegisterForm, 'role'>, value: string): void {
    this.form.update((f) => ({ ...f, [key]: value }));
  }

  protected setRole(role: Role): void {
    this.form.update((f) => ({ ...f, role }));
  }

  private validate(): Errors {
    const f = this.form();
    const e: Errors = {};
    if (f.name.trim().length < 2) e.name = 'saisis ton nom.';
    if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'adresse email invalide.';
    if (f.phone && !/^[0-9 +]{8,15}$/.test(f.phone)) e.phone = 'numéro invalide (8 chiffres minimum).';
    if (f.password.length < 6) e.password = '6 caractères minimum.';
    return e;
  }

  protected async handleSubmit(ev: Event): Promise<void> {
    ev.preventDefault();
    const e = this.validate();
    this.errors.set(e);
    if (Object.keys(e).length) return;
    try {
      const { token, user } = await this.authService.register(this.form());
      this.session.login(token, user);
      this.toastService.show(`Bienvenue sur Fi thnity, ${user.name} !`, 'success');
      await this.router.navigateByUrl('/tableau-de-bord');
    } catch (err) {
      this.errors.set({ form: err instanceof Error ? err.message : 'Inscription impossible.' });
    }
  }
}
