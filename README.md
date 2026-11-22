# Fi thnity

> Partage la route, partage les frais.

## À propos du projet

Nous sommes **Mohamed Laabidi** et **Maled slema**, deux étudiants qui ont créé Fi thnity dans le but de faciliter le covoiturage en Tunisie.

Fi thnity est un site où une personne peut proposer un trajet et où d'autres personnes peuvent chercher une place. Nous avons essayé de faire une application simple à comprendre, aussi bien pour le conducteur que pour le passager.

Le conducteur peut :

- publier un trajet avec le départ, l'arrivée, la date, l'heure, le nombre de places et le prix ;
- voir ses trajets et ses réservations ;
- annuler un trajet si nécessaire.

Le passager peut :

- chercher un trajet par ville et par date ;
- utiliser des filtres pour trouver plus facilement un trajet ;
- consulter les informations du conducteur et ses avis ;
- réserver une ou plusieurs places ;
- annuler sa réservation et donner une note au conducteur.

Un utilisateur ne peut pas réserver son propre trajet ni se donner une note. Le rôle choisi lors de l'inscription peut être modifié dans le profil.

Pour le moment, le site fonctionne surtout avec une petite base de données simulée dans le navigateur. Les informations sont conservées dans `localStorage`. Une API Express et une base PostgreSQL sont aussi préparées pour la prochaine étape.

---

## 1. Les technologies utilisées

Nous avons choisi des technologies que nous pouvions apprendre et utiliser ensemble :

| Partie | Technologie | Utilisation |
|---|---|---|
| Site web | **Angular 22** | Création des pages et des composants du site. |
| Style | **Tailwind CSS v4** | Mise en forme, couleurs et affichage responsive. |
| Serveur | **Node.js, Express 5 et TypeScript** | Préparation de l'API du projet. |
| Base de données | **PostgreSQL et Prisma 7** | Stockage des utilisateurs, trajets, réservations et avis. |
| Connexion | **JWT et bcrypt** | Préparation de la connexion et protection des mots de passe côté API. |
| Validation | **zod** | Vérification de la configuration du serveur. |
| Qualité | **TypeScript strict et règles d'accessibilité** | Réduire les erreurs et rendre le site plus facile à utiliser. |

Nous avons aussi utilisé :

- le chargement différé (*lazy loading*) pour charger les pages quand elles sont nécessaires ;
- des écrans de chargement (*skeletons*) pour rendre l'attente plus agréable ;
- des notifications pour informer l'utilisateur après une action ;
- des fenêtres modales accessibles ;
- des formulaires avec des messages d'erreur clairs ;
- un affichage adapté aux téléphones et aux ordinateurs.

Les principales couleurs du projet sont le bleu nuit, le jaune, le blanc cassé, le vert et le corail. Les polices utilisées sont **Poppins** pour les titres et **Inter** pour le texte.

---

## 2. Ce que l'on peut faire sur le site

| Page | Adresse | Ce qu'elle permet de faire |
|---|---|---|
| Accueil | `/` | Découvrir le site et commencer une recherche rapidement. |
| Trouver un trajet | `/trajets` | Rechercher par départ, arrivée et date, puis filtrer les résultats. |
| Détails d'un trajet | `/trajets/:id` | Voir le trajet, le conducteur, les places disponibles et réserver. |
| Publier un trajet | `/publier` | Ajouter un trajet avec toutes ses informations. |
| Tableau de bord | `/tableau-de-bord` | Voir ses réservations et ses trajets publiés. |
| Profil | `/profil` | Modifier son nom, son téléphone, sa bio et son rôle. |
| Contact et FAQ | `/contact` | Envoyer un message et consulter les questions fréquentes. |
| Inscription | `/inscription` | Créer un compte comme conducteur ou passager. |
| Connexion | `/connexion` | Se connecter à son compte. |
| Page 404 | Toute autre adresse | Afficher un message quand la page n'existe pas. |

Les pages `/publier` et `/tableau-de-bord` demandent d'être connecté. Si un visiteur essaie de les ouvrir, il est envoyé vers la page de connexion puis revient à la page demandée.

Sur l'ensemble du site :

- un trajet passé ou complet ne peut pas être réservé ;
- un même trajet ne peut pas être réservé deux fois par la même personne ;
- le nombre de places demandé doit être disponible ;
- les places restantes et la moyenne des notes sont calculées automatiquement ;
- les erreurs sont affichées directement sous les champs concernés ;
- la session reste active après un rechargement de la page ;
- le menu s'adapte aux petits écrans ;
- les boutons, les formulaires et les messages sont pensés pour être accessibles.

---

## 3. Installer et lancer le projet

### Ce qu'il faut installer

- [Node.js](https://nodejs.org) version 22.22.3 ou plus récente ;
- [Git](https://git-scm.com) ;
- [PostgreSQL](https://www.postgresql.org), seulement si l'on veut lancer l'API.

### Télécharger le projet

```bash
git clone <adresse-du-dépôt>
cd Fi-thnity
```

### A. Lancer seulement le site

Cette méthode est la plus simple. Elle fonctionne sans PostgreSQL.

```bash
cd client
npm install
npm start
```

Le site sera disponible ici : <http://localhost:4200>

Dans ce mode, les trajets, les comptes et les réservations sont enregistrés dans le navigateur. Pour recommencer avec des données propres, il faut supprimer les données du site dans les outils du navigateur.

Comptes de démonstration (mot de passe : `demo1234`) :

| Email | Rôle |
|---|---|
| `walid@demo.tn` | Conducteur avec une note et des avis |
| `ines@demo.tn`, `karim@demo.tn`, `yosra@demo.tn` | Conducteurs |
| `sarra@demo.tn` | Passagère |

### B. Lancer l'API

Pour lancer la partie serveur, il faut avoir PostgreSQL installé et une base de données disponible.

```bash
cd server
npm install
cp .env.example .env
```

Ensuite, il faut renseigner `DATABASE_URL` et `JWT_SECRET` dans le fichier `.env`, puis lancer :

```bash
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

L'API sera disponible ici : <http://localhost:4000>

La page <http://localhost:4000/health> doit afficher :

```json
{"ok":true}
```

Variables importantes du fichier `.env` :

| Variable | À quoi elle sert | Exemple |
|---|---|---|
| `PORT` | Port du serveur | `4000` |
| `DATABASE_URL` | Adresse de la base PostgreSQL | `postgresql://localhost:5432/fithnity` |
| `JWT_SECRET` | Secret utilisé pour les connexions | Une longue chaîne aléatoire |
| `CORS_ORIGINS` | Adresses autorisées à appeler l'API | `http://localhost:4200` |

Pour remettre la base à zéro avant de remettre les données de démonstration :

```bash
npx prisma db push --force-reset
npm run db:seed
```

---

## 4. API REST

Les routes de l'API commencent par `/api`, sauf la route `/health`. Les routes avec 🔒 demandent une connexion.

| Méthode | Adresse | Utilisation |
|---|---|---|
| GET | `/health` | Vérifier que le serveur fonctionne. |
| POST | `/api/auth/register` | Créer un compte. |
| POST | `/api/auth/login` | Se connecter. |
| GET | `/api/rides` | Chercher des trajets. |
| GET | `/api/rides/mine` 🔒 | Voir ses trajets. |
| GET | `/api/rides/:id` | Voir les détails d'un trajet. |
| POST | `/api/rides` 🔒 | Publier un trajet. |
| POST | `/api/bookings` 🔒 | Réserver des places. |
| GET | `/api/bookings/mine` 🔒 | Voir ses réservations. |
| DELETE | `/api/bookings/:id` 🔒 | Annuler une réservation. |

Exemple pour se connecter avec l'API :

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sarra@demo.tn","password":"demo1234"}'
```

Les mots de passe de l'API sont protégés avec **bcrypt** et ne sont pas enregistrés en clair.

---

## 5. Vérifier le projet

Il n'y a pas encore de tests automatisés. Pour vérifier que le projet fonctionne, nous utilisons les commandes suivantes.

Pour vérifier le site :

```bash
cd client
npm run build
```

Pour vérifier le serveur :

```bash
cd server
npx tsc --noEmit
npm run lint
npx prisma validate
```

Nous vérifions aussi manuellement les parcours suivants :

- rechercher un trajet de Sfax vers Tunis et le réserver ;
- créer un compte avec des informations incorrectes pour voir les messages d'erreur ;
- publier un trajet et vérifier qu'il apparaît dans la recherche ;
- réserver puis annuler une réservation ;
- essayer de réserver son propre trajet ;
- essayer d'ouvrir une page réservée sans être connecté ;
- ouvrir une adresse qui n'existe pas pour vérifier la page 404.

---

## 6. Organisation des fichiers

```text
client/                         Partie visible du site Angular
  angular.json                  Configuration du projet
  proxy.conf.json               Redirection de /api vers le serveur
  public/                       Icônes et fichiers publics
  src/
    index.html                  Page HTML principale
    main.ts                     Démarrage de l'application
    styles.css                  Styles et couleurs du projet
    environments/               Adresse de l'API
    app/
      app.routes.ts             Routes du site
      app.config.ts             Configuration Angular
      core/                     Session et protection des pages
      components/               Composants réutilisables
      pages/                    Pages du site
      services/                 Données simulées et services API
      types/                    Types utilisés dans le projet
      utils/                    Fonctions utiles
server/                         Partie serveur Express
  prisma/                       Modèle et données de démonstration
  src/
    index.ts                    Démarrage du serveur
    config/                     Configuration
    routes/                     Routes de l'API
    services/                   Logique de l'application
    middleware/                 Connexion et rôles
    utils/                      Fonctions utiles
```

---

## 7. Organisation de notre travail

| Membre | Travail réalisé |
|---|---|
| Mohamed Laabidi | Interface Angular, pages de recherche et de détail, composants et expérience utilisateur. |
| Maled slema | Authentification, profil, tableau de bord, API et base de données. |

Nous avons travaillé avec des branches Git séparées pour les nouvelles fonctionnalités et les corrections. Avant de réunir les changements, nous relisons le code et nous vérifions que le projet se lance correctement.

---

## 8. Ce qui reste à améliorer

Fi thnity est encore un prototype. Voici ses limites actuelles :

- le site utilise encore principalement une base simulée dans le navigateur ;
- les données de démonstration sont fictives ;
- dans le mode simulé, les mots de passe ne doivent pas être de vrais mots de passe ;
- toutes les données envoyées à l'API ne sont pas encore vérifiées champ par champ ;
- il n'y a pas encore de paiement ni de messagerie ;
- les avis sont affichés, mais ne sont pas encore complètement enregistrés depuis le site ;
- l'API et le site ne sont pas encore déployés en ligne.

---

## 9. Nos prochaines idées

Nous aimerions continuer le projet avec les améliorations suivantes :

- connecter complètement le site à l'API ;
- ajouter des tests automatisés ;
- permettre de laisser un avis après un trajet ;
- permettre de modifier ou d'annuler un trajet publié ;
- ajouter la pagination et une meilleure recherche par ville ;
- ajouter une version arabe de l'interface ;
- ajouter la récupération du mot de passe par email ;
- mettre le site, l'API et la base de données en ligne.
