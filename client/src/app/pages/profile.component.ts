import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ButtonComponent } from '../components/ui/button.component';
import { FieldComponent } from '../components/ui/field.component';
import { SessionService } from '../core/session.service';
import { AuthService } from '../services/auth.service';
import { inputValue } from '../utils/dom';

@Component({
  selector: 'app-profile',
  imports: [RouterLink, ButtonComponent, FieldComponent],
  host: { class: 'block' },
  template: `
    @if (session.user(); as user) {
      <section class="mx-auto max-w-3xl">
        <!-- En-tête -->
        <p class="text-xs font-bold uppercase tracking-widest text-corail">Espace Utilisateur</p>
        <h1 class="mt-1 text-3xl font-titre md:text-4xl">Mon Profil</h1>
        <p class="mt-2 text-ardoise">Consulte et mets à jour tes informations personnelles.</p>

        <!-- Carte récapitulative -->
        <div class="mt-8 flex flex-col gap-6 rounded-charte border border-filet bg-white p-6 shadow-xs sm:flex-row sm:items-center">
          <!-- Avatar avec initiales -->
          <div class="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-nuit font-titre text-2xl font-bold text-soleil">
            {{ initials() }}
          </div>

          <div class="flex-1 space-y-1">
            <div class="flex flex-wrap items-center gap-3">
              <h2 class="text-2xl font-titre font-bold text-nuit">{{ user.name }}</h2>
              <span
                class="rounded-full px-3 py-0.5 text-xs font-semibold tracking-wide"
                [class]="user.role === 'DRIVER' ? 'bg-menthe/10 text-menthe' : 'bg-ardoise/10 text-ardoise'"
              >
                {{ user.role === 'DRIVER' ? 'Conducteur' : 'Passager' }}
              </span>
            </div>
            <p class="text-sm text-ardoise">{{ user.email }}</p>
            @if (user.phone) {
              <p class="text-xs text-ardoise">📞 {{ user.phone }}</p>
            }
          </div>

          <div class="flex flex-col gap-2 sm:items-end">
            <a routerLink="/tableau-de-bord" class="text-sm font-semibold underline decoration-soleil decoration-2 underline-offset-4">
              Mes réservations & trajets →
            </a>
            <button
              type="button"
              (click)="handleLogout()"
              class="text-xs text-corail underline decoration-corail underline-offset-4"
            >
              Déconnexion
            </button>
          </div>
        </div>

        <!-- Formulaire d'édition -->
        <div class="mt-8 rounded-charte border border-filet bg-white p-6 shadow-xs">
          <h2 class="text-lg font-titre font-semibold text-nuit">Modifier mes informations</h2>
          <p class="mt-1 text-sm text-ardoise">Ces informations permettent aux conducteurs et passagers de te reconnaître lors de la prise en charge.</p>

          @if (saved()) {
            <div role="status" class="mt-4 rounded-charte border border-menthe/30 bg-menthe/10 p-3 text-sm text-menthe">
              Vos informations ont été mises à jour avec succès !
            </div>
          }

          @if (error()) {
            <p role="alert" class="mt-4 text-sm text-corail">Error : {{ error() }}</p>
          }

          <form (submit)="handleSubmit($event)" novalidate class="mt-6 space-y-4">
            <app-field
              label="Nom complet"
              [value]="form().name"
              (valueChange)="setField('name', $event)"
              autocomplete="name"
              required
            />

            <div>
              <label for="profile-email" class="block text-sm font-medium">Adresse email</label>
              <input
                id="profile-email"
                type="email"
                [value]="user.email"
                disabled
                class="mt-1 min-h-11 w-full rounded-charte border border-filet bg-papier px-3 text-sm text-ardoise cursor-not-allowed"
              />
              <p class="mt-1 text-xs text-ardoise">L'adresse email ne peut pas être modifiée pour des raisons de sécurité.</p>
            </div>

            <app-field
              label="Numéro de téléphone"
              type="tel"
              [value]="form().phone"
              (valueChange)="setField('phone', $event)"
              autocomplete="tel"
            />

            <div>
              <label for="profile-bio" class="block text-sm font-medium">Bio & Présentation (optionnel)</label>
              <textarea
                id="profile-bio"
                rows="3"
                [value]="form().bio"
                (input)="setField('bio', inputValue($event))"
                placeholder="Ex. Étudiant, trajets fréquents les vendredis vers Sfax…"
                class="mt-1 w-full rounded-charte border border-ardoise bg-white p-3 text-sm focus:border-soleil"
              ></textarea>
              <p class="mt-1 text-xs text-ardoise">Une brève présentation rassure la communauté et facilite la prise de contact.</p>
            </div>

            <div class="flex items-center gap-4 pt-2">
              <button app-button type="submit" variant="accent" [disabled]="loading()">
                {{ loading() ? 'Enregistrement…' : 'Enregistrer les modifications' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Raccourcis utiles -->
        <div class="mt-8 grid gap-4 sm:grid-cols-2">
          <div class="rounded-charte border border-filet bg-papier p-4">
            <h3 class="font-titre text-sm font-bold text-nuit">Besoin d'un trajet ?</h3>
            <p class="mt-1 text-xs text-ardoise">Recherche parmi des dizaines d'itinéraires interurbains et réservez en quelques clics.</p>
            <a routerLink="/trajets" class="mt-2 inline-block text-xs font-semibold underline decoration-soleil decoration-2 underline-offset-4">
              Rechercher un trajet →
            </a>
          </div>

          <div class="rounded-charte border border-filet bg-papier p-4">
            <h3 class="font-titre text-sm font-bold text-nuit">Tu prends le volant ?</h3>
            <p class="mt-1 text-xs text-ardoise">Propose tes places disponibles pour amortir tes frais d'essence et de péage.</p>
            <a routerLink="/publier" class="mt-2 inline-block text-xs font-semibold underline decoration-soleil decoration-2 underline-offset-4">
              Publier un itinéraire →
            </a>
          </div>
        </div>
      </section>
    }
  `,
})
export class ProfileComponent {
  protected readonly session = inject(SessionService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly inputValue = inputValue;
  protected readonly saved = signal(false);
  protected readonly error = signal('');
  protected readonly loading = signal(false);

  protected readonly form = signal({
    name: this.session.user()?.name ?? '',
    phone: this.session.user()?.phone ?? '',
    bio: this.session.user()?.bio ?? '',
  });

  protected readonly initials = computed(() => {
    const name = this.session.user()?.name ?? '';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || 'U';
  });

  protected setField(key: 'name' | 'phone' | 'bio', value: string): void {
    this.form.update((f) => ({ ...f, [key]: value }));
    this.saved.set(false);
  }

  protected async handleSubmit(e: Event): Promise<void> {
    e.preventDefault();
    const user = this.session.user();
    if (!user) return;

    const { name, phone, bio } = this.form();
    if (!name.trim() || name.trim().length < 2) {
      this.error.set('Le nom doit comporter au moins 2 caractères.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    try {
      const updated = await this.authService.updateProfile(user.id, {
        name: name.trim(),
        phone: phone.trim() || undefined,
        bio: bio.trim() || undefined,
      });
      this.session.updateUser(updated);
      this.saved.set(true);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Erreur lors de la mise à jour.');
    } finally {
      this.loading.set(false);
    }
  }

  protected handleLogout(): void {
    this.session.logout();
    this.router.navigateByUrl('/');
  }
}
