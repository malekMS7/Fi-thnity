import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ButtonComponent } from '../components/ui/button.component';
import { FieldComponent } from '../components/ui/field.component';
import { SessionService } from '../core/session.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [RouterLink, ButtonComponent, FieldComponent],
  host: { class: 'block' },
  template: `
    <section class="mx-auto max-w-md">
      <p class="text-xs font-bold uppercase tracking-widest text-corail">Connexion</p>
      <h1 class="mt-1 text-3xl">Content de te revoir.</h1>
      <form (submit)="handleSubmit($event)" class="mt-6 space-y-4">
        <app-field label="Email" type="email" [value]="email()" (valueChange)="email.set($event)" required />
        <app-field label="Mot de passe" type="password" [value]="password()" (valueChange)="password.set($event)" required />
        @if (error()) {
          <p role="alert" class="text-sm text-corail">Error : {{ error() }}</p>
        }
        <button app-button type="submit" class="w-full">Se connecter</button>
      </form>
      <p class="mt-4 text-sm text-ardoise">
        Pas encore de compte ? <a routerLink="/inscription" class="font-semibold text-nuit underline decoration-soleil decoration-2">S'inscrire</a>
      </p>
      <p class="mt-6 rounded-charte border border-filet p-3 text-xs text-ardoise">
        Compte de démonstration : <b>walid&#64;demo.tn</b> / <b>demo1234</b> (conducteur) ou <b>sarra&#64;demo.tn</b> / <b>demo1234</b> (passagère).
      </p>
    </section>
  `,
})
export class LoginComponent {
  private readonly session = inject(SessionService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  /** Page d'origine transmise par authGuard (ou par « Réserver » sans être connecté). */
  private readonly from = (history.state as { from?: string } | null)?.from ?? '/tableau-de-bord';

  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly error = signal('');

  protected async handleSubmit(e: Event): Promise<void> {
    e.preventDefault();
    this.error.set('');
    try {
      const { token, user } = await this.authService.login(this.email(), this.password());
      this.session.login(token, user);
      await this.router.navigateByUrl(this.from, { replaceUrl: true });
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Connexion impossible.');
    }
  }
}
