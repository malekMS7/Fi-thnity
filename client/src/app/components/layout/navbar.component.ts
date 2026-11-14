import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { SessionService } from '../../core/session.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  host: { class: 'block' },
  template: `
    <header class="border-b border-filet bg-papier">
      <nav class="mx-auto flex max-w-6xl flex-wrap items-center gap-6 px-4 py-3" aria-label="Navigation principale">
        <a routerLink="/" class="font-titre text-xl font-bold" (click)="close()">Fi thnity</a>

        <!-- Bouton menu (mobile) -->
        <button
          type="button"
          class="ml-auto min-h-11 rounded-charte border border-nuit px-3 text-sm md:hidden"
          (click)="open.set(!open())"
          [attr.aria-expanded]="open()"
          aria-controls="menu"
        >
          Menu
        </button>

        <div
          id="menu"
          class="w-full flex-col gap-3 md:flex md:w-auto md:flex-1 md:flex-row md:items-center md:gap-6"
          [class]="open() ? 'flex' : 'hidden'"
        >
          <a routerLink="/trajets" routerLinkActive #trajets="routerLinkActive" [class]="linkClass(trajets.isActive)" (click)="close()">Trouver un trajet</a>
          <a routerLink="/publier" routerLinkActive #publier="routerLinkActive" [class]="linkClass(publier.isActive)" (click)="close()">Publier</a>
          @if (session.user()) {
            <a routerLink="/tableau-de-bord" routerLinkActive #dashboard="routerLinkActive" [class]="linkClass(dashboard.isActive)" (click)="close()">Mes réservations</a>
          }

          <div class="flex items-center gap-4 md:ml-auto">
            @if (session.user(); as user) {
              <span class="text-sm text-ardoise">{{ user.name }}</span>
              <button type="button" (click)="handleLogout()" class="text-sm font-medium underline decoration-soleil decoration-2 underline-offset-4">
                Déconnexion
              </button>
            } @else {
              <a routerLink="/connexion" class="text-sm font-medium" (click)="close()">Connexion</a>
              <a routerLink="/inscription" (click)="close()" class="inline-flex min-h-11 items-center rounded-charte bg-nuit px-4 text-sm font-semibold text-papier">
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
    return `py-2 text-sm font-medium border-b-2 ${active ? 'border-soleil' : 'border-transparent hover:border-filet'}`;
  }

  protected close(): void {
    this.open.set(false);
  }

  protected handleLogout(): void {
    this.session.logout();
    this.close();
    this.router.navigateByUrl('/');
  }
}
