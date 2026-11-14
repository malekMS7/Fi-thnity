import type { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';
import { authGuard } from './core/auth.guard';
import { DashboardComponent } from './pages/dashboard.component';
import { HomeComponent } from './pages/home.component';
import { LoginComponent } from './pages/login.component';
import { NotFoundComponent } from './pages/not-found.component';
import { PublishRideComponent } from './pages/publish-ride.component';
import { RegisterComponent } from './pages/register.component';
import { RideDetailComponent } from './pages/ride-detail.component';
import { RidesComponent } from './pages/rides.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      // Pages publiques
      { path: '', component: HomeComponent, pathMatch: 'full' },
      { path: 'connexion', component: LoginComponent },
      { path: 'inscription', component: RegisterComponent },
      { path: 'trajets', component: RidesComponent },
      { path: 'trajets/:id', component: RideDetailComponent },

      // Pages qui demandent un compte
      { path: 'publier', component: PublishRideComponent, canActivate: [authGuard] },
      { path: 'tableau-de-bord', component: DashboardComponent, canActivate: [authGuard] },

      { path: '**', component: NotFoundComponent },
    ],
  },
];
