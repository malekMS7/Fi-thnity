# Fi thnity — client Angular

Version Angular 22 du client (remplace l'ancien client React/Vite). Mêmes pages, même design (Tailwind v4 + charte graphique), mêmes données de démonstration, même clé `localStorage`.

## Lancer le projet

```bash
cd client
npm install
npm start          # http://localhost:4200  (le proxy /api → http://localhost:4000 est configuré)
npm run build      # sortie dans dist/fithnity/browser
```

Prérequis : Node 22.22.3+ (ou 24.15+). Angular 22 demande TypeScript 6.0.x (`~6.0.2` dans package.json), pas 7.

## Correspondance React → Angular

| React | Angular |
|---|---|
| `main.tsx` + `BrowserRouter` | `main.ts` + `app.config.ts` (`provideRouter`) |
| `App.tsx` (`<Routes>`) | `app.routes.ts` |
| `Layout` + `<Outlet/>` | `LayoutComponent` + `<router-outlet/>` |
| `ProtectedRoute` | `core/auth.guard.ts` (`canActivate`) |
| `AuthContext` / `useAuth()` | `core/session.service.ts` (`SessionService`, signals) |
| `useState` | `signal()` / `computed()` |
| `useEffect` | `ngOnInit`, `toSignal(...)`, abonnement RxJS |
| `useNavigate` / `Link` / `NavLink` | `Router` / `routerLink` / `routerLinkActive` |
| `useSearchParams` | `ActivatedRoute.queryParamMap` |
| `Button`, `Field` (props) | `button[app-button]`, `<app-field>` (inputs/`model`) |
| `RideCard`, `Rating` | `li[app-ride-card]`, `<app-rating>` |
| `formatDate`, `formatPrice` dans le JSX | pipes `formatDate`, `formatPrice` |
| `services/*.ts` (fonctions) | `services/*.service.ts` (classes `@Injectable`) |
| `api.ts` (axios) | `services/api.service.ts` (`HttpClient`) + `core/auth.interceptor.ts` |
| `import.meta.env.VITE_API_URL` | `src/environments/environment.ts` |
| `{cond && <X/>}`, `.map()` | `@if`, `@for` |

## Remarques

- Les pages continuent d'utiliser la base simulée (`services/db.service.ts`). Quand l'API Express sera branchée, seul le dossier `services/` change.
- `ApiService` n'est pas encore utilisé par les pages (comme `api.ts` en React) : il est prêt pour le branchement.
- Dans un template Angular, `@` est un caractère spécial : écrire `&#64;` pour afficher une adresse email (ex. `walid&#64;demo.tn`).
- Fichiers React non repris : `hero.png`, `react.svg`, `vite.svg` (non utilisés), `.oxlintrc.json`.
