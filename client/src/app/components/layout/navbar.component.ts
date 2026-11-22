import { Component, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { SessionService } from '../../core/session.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  host: { class: 'block sticky top-0 z-40' },
  template: `
    <header class="border-b border-filet bg-papier/95 backdrop-blur-xs">
      <nav class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3" aria-label="Navigation principale">
        <!-- Logo de marque -->
        <a routerLink="/" class="flex items-center gap-2 font-titre text-2xl font-bold tracking-tight text-nuit" (click)="close()">
          <span>Fi thnity</span>
          <span class="rounded-full bg-soleil px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase text-nuit">TN</span>
        </a>

        <!-- Bouton hamburger (mobile) -->
        <button
          type="button"
          class="flex h-11 w-11 items-center justify-center rounded-charte border border-nuit text-nuit transition hover:bg-nuit/5 md:hidden"
          (click)="open.set(!open())"
          [attr.aria-expanded]="open()"
          aria-controls="main-menu"
          aria-label="Ouvrir le menu de navigation"
        >
          @if (open()) {
            <span class="text-xl font-bold leading-none">✕</span>
          } @else {
            <span class="text-xl font-bold leading-none">☰</span>
          }
        </button>

        <!-- Menu de navigation -->
        <div
          id="main-menu"
          class="w-full flex-col gap-2 pt-2 md:flex md:w-auto md:flex-1 md:flex-row md:items-center md:gap-6 md:pt-0"
          [class]="open() ? 'flex' : 'hidden'"
        >
          <div class="flex flex-col gap-1 md:flex-row md:items-center md:gap-5">
            <a routerLink="/trajets" routerLinkActive #trajets="routerLinkActive" [class]="linkClass(trajets.isActive)" (click)="close()">
              Trouver un trajet
            </a>
            <a routerLink="/publier" routerLinkActive #publier="routerLinkActive" [class]="linkClass(publier.isActive)" (click)="close()">
              Publier un trajet
            </a>
            <a routerLink="/contact" routerLinkActive #contact="routerLinkActive" [class]="linkClass(contact.isActive)" (click)="close()">
              Contact & FAQ
            </a>
          </div>

          <!-- Section utilisateur / Connexion -->
          <div class="mt-3 flex flex-wrap items-center gap-3 border-t border-filet pt-3 md:ml-auto md:mt-0 md:border-t-0 md:pt-0">
            @if (session.user(); as user) {
              <a
                routerLink="/tableau-de-bord"
                routerLinkActive #dashboard="routerLinkActive"
                [class]="linkClass(dashboard.isActive)"
                (click)="close()"
              >
                Mes réservations
              </a>

              <a
                routerLink="/profil"
                routerLinkActive #profile="routerLinkActive"
                [class]="linkClass(profile.isActive)"
                class="flex items-center gap-1.5 font-medium"
                (click)="close()"
              >
                <span class="flex h-7 w-7 items-center justify-center rounded-full bg-nuit text-xs font-bold text-soleil">
                  {{ user.name.charAt(0).toUpperCase() }}
                </span>
                <span class="text-sm text-nuit">{{ user.name }}</span>
              </a>

              <button
                type="button"
                (click)="handleLogout()"
                class="min-h-11 text-xs font-semibold text-corail underline decoration-corail underline-offset-4"
              >
                Déconnexion
              </button>
            } @else {
              <a
                routerLink="/connexion"
                class="min-h-11 inline-flex items-center text-sm font-semibold text-nuit hover:text-menthe"
                (click)="close()"
              >
                Connexion
              </a>
              <a
                routerLink="/inscription"
                (click)="close()"
                class="inline-flex min-h-11 items-center rounded-charte bg-nuit px-4 text-sm font-semibold text-papier transition hover:bg-nuit/90"
              >
                S'inscrire
              </a>
            }
          </div>
        </div>
      </nav>
    </header>
  `,
})
export class NavbarComponent {
  protected readonly session = inject(SessionService);
  private readonly router = inject(Router);

  protected readonly open = signal(false);

  protected linkClass(active: boolean): string {
    return `py-2 text-sm font-medium transition border-b-2 ${
      active ? 'border-soleil font-semibold text-nuit' : 'border-transparent text-ardoise hover:border-filet hover:text-nuit'
    }`;
  }

  protected close(): void {
    this.open.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) {
      this.close();
    }
  }

  protected handleLogout(): void {
    this.session.logout();
    this.close();
    this.router.navigateByUrl('/');
  }
}
