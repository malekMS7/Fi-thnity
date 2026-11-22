import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from '../ui/toast.component';
import { FooterComponent } from './footer.component';
import { NavbarComponent } from './navbar.component';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ToastContainerComponent],
  template: `
    <!-- Lien d'évitement (Skip-link) pour l'accessibilité au clavier / lecteurs d'écran (WCAG 2.4.1) -->
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-nuit focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-papier focus:shadow-lg focus:outline-hidden"
    >
      Passer directement au contenu principal
    </a>

    <div class="flex min-h-screen flex-col">
      <app-navbar />
      <main id="main-content" tabindex="-1" class="mx-auto w-full max-w-6xl flex-1 px-4 py-8 focus:outline-hidden animate-fade-in">
        <router-outlet />
      </main>
      <app-footer />
      <app-toast-container />
    </div>
  `,
})
export class LayoutComponent {}
