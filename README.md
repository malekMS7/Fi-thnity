# Fi thnity

> Partage la route, partage les frais.

**Projet Web — SUP'COM, Université de Carthage · Année universitaire 2025/2026**
Réalisé par **Mohamed Laabidi** & **Maled Slema**

Fi thnity est une plateforme de **covoiturage** pensée pour les étudiants et les actifs en Tunisie. Le site réunit deux rôles :

- **Le conducteur** publie un trajet (départ, arrivée, date, heure, places, prix, point de rendez-vous, options), suit ses réservations depuis son tableau de bord et peut annuler un trajet si nécessaire.
- **Le passager** cherche un trajet avec filtres et suggestions automatiques, consulte la fiche du conducteur (note moyenne recalculée en direct, avis), réserve des places, évalue le conducteur et gère ses annulations.

Le rôle est choisi à l'inscription et modifiable depuis la page de profil. Dans tous les cas, on ne peut pas réserver son propre trajet ni s'auto-évaluer.

> L'application Angular 22 est entièrement optimisée avec **Code Splitting (Lazy Loading)**, **Skeletons animés**, **Notifications Toasts réactives**, **Modales accessibles (ARIA)**, et une base dynamique simulant la latence réseau avec persistance locale (`localStorage`), prête pour la connexion directe sur l'API Express + PostgreSQL.

---

## 1. Choix technologiques

| Couche | Technologie | Pourquoi ce choix |
|---|---|---|
| Interface | **Angular 22** | Le site est fait de composants autonomes (*standalone*) réutilisés partout : bouton, champ de formulaire avec autocomplétion, carte de trajet, skeleton loader, modal accessible, toasts. L'état (session, formulaires, résultats) repose sur les *signals*, et les listes et conditions utilisent la syntaxe `@if` / `@for`. |
| Navigation & Performance | **Angular Router (Lazy Loading)** | Application monopage avec **10 routes découpées en chunks asynchrones** (`loadComponent`). Les filtres de recherche sont dans l'adresse (`/trajets?depart=Sfax&prixMax=20`) : partage facile et historique préservé. Un *guard* protège les pages réservées aux comptes connectés. |
| Outil de build | **Angular CLI** (`@angular/build`) | Serveur de développement avec rechargement, build de production optimisé (taille initiale de ~78 ko transférés, build en ~3 secondes), et un *proxy* qui transmet `/api` au serveur Node. |
| Style | **Tailwind CSS v4** + jetons de la charte | La charte graphique (couleurs, polices, rayon des angles) est centralisée dans `client/src/styles.css` et devient des classes (`bg-nuit`, `text-corail`, `font-titre`…). |
| Backend | **Node.js + Express 5 + TypeScript** | Le même langage côté navigateur et côté serveur. Express suffit pour une API REST de taille moyenne et se lit facilement. |
| Données | **PostgreSQL + Prisma 7** | Un vrai modèle relationnel (utilisateurs, trajets, réservations, avis) avec des contraintes (une réservation par passager et par trajet). Prisma génère un client typé et se connecte via l'adaptateur `@prisma/adapter-pg`. |
| Authentification | **JWT + bcrypt** | Jeton signé valable 7 jours, mots de passe hachés avec bcrypt. |
| Configuration | **zod** | Le serveur refuse de démarrer si `DATABASE_URL` ou `JWT_SECRET` (32 caractères minimum) sont absents ou invalides. |
| Qualité & Accessibilité | **TypeScript strict** + **WCAG AA** | Le client compile avec `strictTemplates` (0 erreur, 0 avertissement). Conforme aux normes d'accessibilité (contraste > 5:1, skip-link, `prefers-reduced-motion`, focus visible, balises ARIA). |

La charte graphique utilise : **nuit** `#0F2A33`, **soleil** `#F4B63F`, **papier** `#F7F4EC`, **menthe** `#23705A`, **corail** `#B8402A`, **ardoise** `#54656D`, **filet** `#DDD8CA` ; polices **Poppins** (titres) et **Inter** (texte).

---

## 2. Fonctionnalités développées

| Page | Adresse | Fonctionnalités |
|---|---|---|
| Accueil | `/` | Hero percutant, formulaire rapide avec suggestions des villes tunisiennes, raccourcis 1-clic vers trajets populaires, guide « Comment ça marche », 4 piliers d'engagement et bannière conducteur. |
| Trouver un trajet | `/trajets` | Recherche par départ, arrivée (datalist de villes) et date, filtres rapides (prix ≤ 20 DT, matin, places ≥ 2), skeletons de chargement, compteur de résultats, tri par date/heure, trajets passés masqués. |
| Fiche d'un trajet | `/trajets/:id` | Itinéraire, date, heure, point de rendez-vous, places restantes, prix, options, note dynamique du conducteur, avis passagers extensibles, formulaire interactif pour déposer un avis (1-5 étoiles + commentaire), réservation avec total calculé. |
| Publier un trajet | `/publier` 🔒 | Formulaire validé champ par champ avec autocomplétion des villes tunisiennes, contrôle des dates futures, 1 à 8 places, prix, point de rendez-vous, options de confort et notification toast de succès. |
| Tableau de bord | `/tableau-de-bord` 🔒 | Compteurs dynamiques (réservations à venir, trajets publiés, passagers transportés), liste de mes réservations avec annulation modale, liste de mes trajets avec annulation possible pour le conducteur. |
| Mon Profil | `/profil` 🔒 | Espace personnel avec avatar (initiales), badge de rôle, formulaire de modification de nom, téléphone et bio, persistance immédiate en base locale et session. |
| Contact & FAQ | `/contact` | Formulaire de contact validé avec retour de confirmation, coordonnées du campus SUP'COM (Technopôle El Ghazala), et FAQ interactive sous forme d'accordéon dynamique. |
| Inscription | `/inscription` | Nom, email, téléphone (optionnel), mot de passe, rôle principal ; validation en temps réel avec message accessible sous chaque champ. |
| Connexion | `/connexion` | Email et mot de passe, gestion claire des erreurs, retour automatique vers la page demandée avant la connexion, toast de bienvenue. |
| Page 404 | toute autre adresse | Écran 404 personnalisé aux couleurs de la charte avec illustration, message d'erreur d'itinéraire et boutons de redirection immédiate. |

🔒 : réservé aux comptes connectés. Un visiteur non connecté est redirigé vers `/connexion`, puis ramené à la page qu'il voulait ouvrir.

**Sur tout le site :**

- **Règles de réservation** : on ne peut pas réserver son propre trajet, un trajet passé ou complet, ni réserver deux fois le même trajet ; le nombre de places demandé ne peut pas dépasser les places restantes.
- **Calculs automatiques** : places restantes (places offertes moins places réservées confirmées) et note moyenne du conducteur, affichée « Nouveau » tant qu'il n'a aucun avis.
- **Formulaires** : un message d'erreur commençant par « Error » apparaît sous le champ concerné, relié au champ pour les lecteurs d'écran (`aria-describedby`, `aria-invalid`).
- **Session** : conservée au rechargement de la page, déconnexion depuis la barre de navigation.
- **Responsive** : menu repliable sur téléphone, grilles qui s'adaptent à la largeur.
- **Accessibilité** : balises sémantiques, libellés visibles, focus visible, cibles tactiles d'au moins 44 px, filtres annoncés avec `aria-pressed`, résultats annoncés avec `aria-live`.

---

## 3. Lancement du projet

**Prérequis :** [Node.js](https://nodejs.org) 22.22.3 ou plus récent (24.15+ accepté) et Git. [PostgreSQL](https://www.postgresql.org) n'est nécessaire que pour lancer l'API.

```bash
git clone <adresse-du-dépôt>
cd Fi-thnity
```

### A. Le site seul (mode démonstration, sans base de données)

```bash
cd client
npm install
npm start
```

- Site : <http://localhost:4200>

Les trajets, comptes et réservations sont enregistrés dans le navigateur (`localStorage`). Pour repartir de zéro, vider les données du site dans les outils du navigateur.

**Comptes de démonstration** (mot de passe : `demo1234`) :

| Email | Rôle |
|---|---|
| `walid@demo.tn` | Conducteur (4,7 / 5, 3 avis) |
| `ines@demo.tn`, `karim@demo.tn`, `yosra@demo.tn` | Conducteurs |
| `sarra@demo.tn` | Passagère |

### B. L'API (Express + PostgreSQL)

```bash
cd server
npm install
cp .env.example .env        # puis renseigner DATABASE_URL et JWT_SECRET
npm run db:generate         # génère le client Prisma (src/generated/prisma)
npm run db:push             # crée les tables dans PostgreSQL
npm run db:seed             # comptes, trajets et avis de démonstration
npm run dev
```

- API : <http://localhost:4000>
- <http://localhost:4000/health> doit répondre `{"ok":true}`

Variables du fichier `.env` :

| Variable | Rôle | Exemple |
|---|---|---|
| `PORT` | Port du serveur | `4000` |
| `DATABASE_URL` | Connexion PostgreSQL | `postgres://user:password@localhost:5432/fithnity` |
| `JWT_SECRET` | Secret de signature des jetons (32 caractères minimum) | une longue chaîne aléatoire |
| `CORS_ORIGINS` | Origines autorisées, séparées par des virgules | `http://localhost:4200` |

> Relancer `npm run db:seed` ajoute une seconde fois les trajets de démonstration. Pour repartir d'une base propre : `npx prisma db push --force-reset` puis `npm run db:seed`.

Pour la production : `npm run build` puis `npm start` (serveur) ; `npm run build` dans `client/` produit le site dans `client/dist/fithnity/browser`.

---

## 4. API REST

Toutes les adresses commencent par `/api`, sauf `/health`. Les routes marquées 🔒 demandent l'en-tête `Authorization: Bearer <token>` reçu à la connexion. Les erreurs ont la forme `{ "error": "<message>" }`.

| Méthode | Adresse | Corps / paramètres | Réponse |
|---|---|---|---|
| GET | `/health` | | `200 { ok: true }` |
| POST | `/api/auth/register` | `{ name, email, phone?, password, role }` | `200 { token, user }` · `400` email déjà pris |
| POST | `/api/auth/login` | `{ email, password }` | `200 { token, user }` · `401` |
| GET | `/api/rides` | `?depart=&arrivee=&date=&prixMax=&placesMin=&matin=` | `200 [trajets]` |
| GET | `/api/rides/mine` 🔒 | | `200 [trajets]` · `401` |
| GET | `/api/rides/:id` | | `200 trajet` · `404` |
| POST | `/api/rides` 🔒 (conducteur) | `{ from, to, date, time, seats, price, meetingPoint, options }` | `200 trajet` · `400` · `401` · `403` |
| POST | `/api/bookings` 🔒 | `{ rideId, seats }` | `201 réservation` · `400` |
| GET | `/api/bookings/mine` 🔒 | | `200 [réservations avec leur trajet]` |
| DELETE | `/api/bookings/:id` 🔒 | | `204` · `400` |

Le filtre `matin` accepte `1` ou `true` (départ avant 12 h). Les mots de passe sont hachés avec **bcrypt** et ne sont jamais stockés en clair.

Exemple :

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sarra@demo.tn","password":"demo1234"}'
```

---

## 5. Vérifications et tests

Le projet n'a pas encore de tests automatisés (voir section 9). Les contrôles disponibles :

```bash
# Client : compile tout, y compris les templates (strictTemplates)
cd client && npm run build

# Serveur : typage, lint, validation du schéma
cd server
npx tsc --noEmit
npm run lint
npx prisma validate
```

**Parcours à tester à la main (mode démonstration) :**

- **A** : Accueil → rechercher Sfax → Tunis → filtre « Prix ≤ 20 DT » → ouvrir un trajet → réserver (connexion demandée, puis retour sur le trajet) → Tableau de bord.
- **B** : Inscription (essayer d'abord avec des champs invalides) → Publier un trajet → vérifier qu'il apparaît dans la recherche.
- **C** : Se connecter avec `sarra@demo.tn` → réserver 2 places → annuler la réservation → vérifier que les places sont rendues.
- **Cas limites** : réserver son propre trajet, réserver deux fois, ouvrir `/publier` sans être connecté, ouvrir une adresse inexistante.

---

## 6. Structure du projet

```text
client/                         Site Angular
  angular.json                  configuration du build, proxy /api
  proxy.conf.json               /api → http://localhost:4000
  public/                       favicon et icônes
  src/
    index.html  main.ts         page et démarrage
    styles.css                  Tailwind + charte graphique
    environments/               adresse de l'API
    app/
      app.routes.ts             les routes du site
      app.config.ts             router, HttpClient, intercepteur
      core/                     session.service (connexion), auth.guard, auth.interceptor
      components/               layout (navbar, footer), ui (button, field), ride-card, rating
      pages/                    une page par fichier (home, rides, ride-detail, publish-ride…)
      services/                 base simulée (db, auth, rides, bookings) + api.service (HTTP)
      types/                    types partagés (User, Ride, Booking…)
      utils/                    format de dates et de prix, pipes
server/                         API Express
  prisma/
    schema.prisma               modèle de données (User, Ride, Booking, Review)
    seed.ts                     données de démonstration
  prisma.config.ts              configuration Prisma 7 (URL de la base)
  src/
    index.ts                    démarrage, CORS, erreurs
    config/                     lecture et validation des variables d'environnement
    routes/                     toutes les routes /api
    services/                   logique métier (auth, rides, bookings)
    middleware/                 authentification JWT, contrôle des rôles
    utils/                      JWT, dates
    types/                      types partagés
    prisma.ts                   client de base de données
```

---

## 7. L'équipe

Ce projet est réalisé par deux étudiants de **SUP'COM** dans le cadre du cours de Développement Web (Objectif 4).

| Membre | Rôle principal |
|---|---|
| **Mohamed Laabidi** | Pages de recherche, fiche trajet, composants UI, accessibilité |
| **Maled Slema** | Authentification, tableau de bord, services, profil utilisateur |

On a travaillé ensemble sur toutes les parties du projet — les frontières ci-dessus sont indicatives.

- Une branche par fonctionnalité (`feat/...`, `fix/...`, `docs/...`), fusionnée après relecture croisée.
- Suivi des tâches : tableau GitHub Projects du dépôt (onglet **Projects**).

---

## 8. Limites du prototype

- **Le site n'est pas encore branché sur l'API.** Les pages utilisent une base simulée dans le navigateur (`client/src/app/services/`). `ApiService` et l'intercepteur de jeton sont prêts pour le branchement.
- **Données de démonstration** : trajets, comptes et avis sont fictifs.
- **Sécurité de la simulation** : dans le navigateur, les mots de passe sont stockés en clair et le « jeton » n'est pas un vrai JWT. Ne jamais y saisir un vrai mot de passe.
- **API** : les requêtes ne sont pas encore validées champ par champ (seules les variables d'environnement le sont), pas de limitation du nombre de requêtes, pas de HTTPS en local.
- **Pas de paiement, pas de messagerie** : le prix affiché est indicatif et le paiement se fait entre les personnes.
- **Dates et heures** : stockées sous forme de texte (`AAAA-MM-JJ`, `HH:MM`) sans gestion des fuseaux horaires.
- **Rôles** : l'API réserve la publication de trajets aux conducteurs, alors que le site simulé laisse tout compte connecté publier.
- **Avis** : affichés mais pas encore saisis depuis le site.

---

## 9. Évolutions possibles

- Brancher le site sur l'API (remplacer les services simulés par `ApiService`).
- Valider les requêtes de l'API avec zod, ajouter des tests (Vitest pour le client et l'API, Playwright pour les parcours complets).
- Laisser un avis après un trajet effectué, modifier ou annuler un trajet publié, prévenir les passagers.
- Pagination et tri des résultats, recherche par ville avec suggestions.
- Traduction de l'interface (arabe), réinitialisation du mot de passe par email.
- Déploiement (hébergement du site statique, de l'API et de PostgreSQL).
