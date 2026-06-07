# RAPPORT DE PROJET DE FIN D'ÉTUDES (PFE)

**Titre du projet :** Emploi Maroc IA — Plateforme Intelligente de Recherche d'Emploi
**Filière :** Génie Informatique / Développement Web
**Année universitaire :** 2025 – 2026

---

## REMERCIEMENTS

Nous tenons à exprimer notre profonde gratitude à toutes les personnes qui ont contribué, de près ou de loin, à la réalisation de ce projet de fin d'études.

Nos remerciements s'adressent tout d'abord à **[Nom de l'encadrant pédagogique]**, notre encadrant académique, pour ses conseils avisés, sa disponibilité et son soutien tout au long de cette période.

Nous remercions également **[Nom du tuteur entreprise]**, notre encadrant au sein de l'organisme d'accueil, pour l'accueil chaleureux, l'accompagnement et le partage de son expertise professionnelle.

Nos sincères remerciements vont aussi aux membres du jury qui ont accepté d'évaluer ce travail.

Enfin, nous exprimons notre gratitude à nos familles et amis pour leur soutien moral indéfectible.

---

## DÉDICACES *(optionnel)*

*À nos parents, pour leur amour, leurs sacrifices et leur soutien inconditionnel.*
*À nos enseignants, qui ont semé en nous le goût du savoir.*
*À tous ceux qui croient en la puissance de la technologie pour améliorer la vie.*

---

## RÉSUMÉ

### 3.1 Résumé en français

Dans un marché de l'emploi marocain en pleine mutation numérique, la recherche d'une opportunité professionnelle reste un processus fastidieux et peu personnalisé. Ce projet de fin d'études présente **Emploi Maroc IA**, une plateforme web intelligente dédiée au marché de l'emploi au Maroc.

La plateforme propose une expérience complète aux candidats : recherche avancée d'offres d'emploi par secteur, ville et type de contrat, analyse automatique de CV par intelligence artificielle, interface de swipe inspirée des applications mobiles modernes, gestion de profil candidat (expériences, formations, compétences), suivi des candidatures et création d'alertes emploi personnalisées.

La solution repose sur une architecture moderne de type **full-stack** avec React et TypeScript côté client, Node.js et Express côté serveur, une API type-safe via tRPC, une base de données SQLite/Turso pour le développement et MySQL pour la production, et l'intégration de modèles de langage (LLM) pour les fonctionnalités d'IA.

---

### 3.2 Abstract (English)

In a Moroccan job market undergoing rapid digital transformation, searching for professional opportunities remains a tedious and impersonal process. This final-year project presents **Emploi Maroc IA**, an intelligent web platform dedicated to the Moroccan employment market.

The platform offers candidates a complete experience: advanced job search by sector, city, and contract type, AI-powered CV analysis, a swipe interface inspired by modern mobile apps, candidate profile management (experiences, education, skills), application tracking, and personalized job alert creation.

The solution relies on a modern full-stack architecture using React and TypeScript on the client side, Node.js and Express on the server side, a type-safe API via tRPC, SQLite/Turso for development and MySQL for production, and integration of Large Language Models (LLMs) for AI-powered features.

---

### 3.3 Mots-clés

**Français :** Emploi, Maroc, Intelligence Artificielle, Analyse de CV, React, Node.js, tRPC, SQLite, Recherche d'emploi, Plateforme web, Candidature en ligne, Full-Stack

**English:** Job search, Morocco, Artificial Intelligence, CV Analysis, React, Node.js, tRPC, SQLite, Online recruitment, Full-Stack, Web Platform

---

## INTRODUCTION GÉNÉRALE

### 4.1 Contexte du projet

Le marché de l'emploi au Maroc connaît une transformation digitale accélérée. Avec un taux de chômage qui touche particulièrement les jeunes diplômés, et une offre de plateformes de recrutement peu adaptées aux réalités locales (langue, secteurs, salaires en MAD, villes marocaines), il existe un besoin réel d'une solution numérique moderne, complète et intelligente.

Les plateformes existantes telles que Rekrute.ma, Emploi.ma ou Anapec.org offrent des fonctionnalités de base mais manquent d'intelligence artificielle, de personnalisation poussée et d'une expérience utilisateur moderne.

C'est dans ce contexte que s'inscrit le projet **Emploi Maroc IA**, développé dans le cadre du stage de fin d'études au sein de **[Nom de l'entreprise]**.

### 4.2 Problématique

> **Comment concevoir et développer une plateforme web intelligente, adaptée au marché marocain, permettant aux candidats de trouver des offres d'emploi pertinentes, d'analyser leur CV grâce à l'IA, et de gérer l'ensemble de leur démarche de recherche d'emploi en un seul espace ?**

Les problèmes identifiés sont les suivants :
- Manque de personnalisation dans les plateformes existantes
- Absence d'analyse intelligente des CV adaptée au marché marocain
- Expérience utilisateur vieillissante et non adaptée au mobile
- Absence d'alertes emploi intelligentes et de suivi de candidatures centralisé

### 4.3 Objectifs du projet

Les objectifs principaux de ce projet sont :

1. **Développer** une plateforme web full-stack performante et moderne
2. **Intégrer** l'intelligence artificielle pour l'analyse des CV (score ATS, points forts/faibles, recommandations)
3. **Proposer** une expérience de recherche d'emploi immersive (interface swipe, filtres avancés)
4. **Permettre** la gestion complète du profil candidat (CV, expériences, formations, compétences)
5. **Automatiser** le suivi des candidatures et la création d'alertes emploi
6. **Garantir** la sécurité de l'authentification via OAuth2 (Google, GitHub)

### 4.4 Méthodologie adoptée

Pour mener à bien ce projet, nous avons adopté la méthodologie **Scrum**, une approche agile permettant un développement itératif et incrémental. Le travail a été organisé en sprints d'une semaine, avec des réunions de suivi régulières avec l'encadrant.

Les étapes principales ont été :
1. Analyse des besoins et étude de l'existant
2. Conception de l'architecture et des bases de données
3. Développement itératif (Front-End, Back-End, IA)
4. Tests et validation
5. Déploiement et documentation

### 4.5 Organisation du rapport

Ce rapport est organisé en **six chapitres** :
- **Chapitre 1** présente l'organisme d'accueil
- **Chapitre 2** décrit la gestion et la planification du projet
- **Chapitre 3** analyse et spécifie les besoins
- **Chapitre 4** expose la conception du système
- **Chapitre 5** détaille la réalisation technique
- **Chapitre 6** présente les tests et la validation

---

## CHAPITRE 1 : PRÉSENTATION DE L'ORGANISME D'ACCUEIL

### 1.1 Présentation de l'entreprise

> *[À compléter selon votre entreprise de stage]*

**Nom de l'entreprise :** [Nom]
**Siège social :** [Ville, Maroc]
**Date de création :** [Année]
**Secteur d'activité :** [Secteur]
**Effectif :** [Nombre d'employés]
**Site web :** [URL]

### 1.2 Activités de l'entreprise

> *[Décrire les principaux domaines d'activité, produits et services proposés]*

### 1.3 Organigramme

> *[Insérer l'organigramme de l'entreprise — schéma hiérarchique]*

```
Direction Générale
├── Direction Technique
│   ├── Équipe Front-End
│   ├── Équipe Back-End
│   └── Équipe DevOps
├── Direction Commerciale
└── Direction Administrative et Financière
```

### 1.4 Service d'affectation

Le stage s'est déroulé au sein du **département [Nom du département]**, plus précisément dans l'équipe [Nom de l'équipe]. Ce service est chargé de [décrire les responsabilités].

### 1.5 Analyse de l'existant

Avant le démarrage du projet, une analyse de la situation existante a été réalisée :

| Critère | Situation actuelle |
|---|---|
| Outils utilisés | [Ex : tableurs, processus manuels] |
| Problèmes identifiés | [Ex : perte de données, lenteur] |
| Besoins exprimés | [Ex : automatisation, IA] |

---

## CHAPITRE 2 : GESTION ET PLANIFICATION DU PROJET

### 2.1 Méthodologie de gestion du projet

Nous avons choisi la méthode **Scrum** pour les raisons suivantes :
- Flexibilité face aux changements de besoins
- Livraisons fréquentes et fonctionnelles
- Communication continue avec l'encadrant
- Meilleure gestion des risques par itérations courtes

**Rôles Scrum :**
| Rôle | Personne |
|---|---|
| Product Owner | [Encadrant entreprise] |
| Scrum Master | [Étudiant / vous-même] |
| Développeur | [Étudiant] |

### 2.2 Planification des tâches

Le projet a été découpé en **6 sprints** d'une semaine chacun :

| Sprint | Période | Tâches principales |
|---|---|---|
| Sprint 1 | Semaine 1 | Analyse des besoins, étude de l'existant |
| Sprint 2 | Semaine 2 | Conception architecture, base de données |
| Sprint 3 | Semaine 3 | Développement Back-End (API, authentification, DB) |
| Sprint 4 | Semaine 4 | Développement Front-End (pages, composants) |
| Sprint 5 | Semaine 5 | Intégration IA, tests |
| Sprint 6 | Semaine 6 | Corrections, déploiement, documentation |

### 2.3 Diagramme de Gantt

```
Tâche                          | S1 | S2 | S3 | S4 | S5 | S6
-------------------------------|----|----|----|----|----|----|
Analyse des besoins            | ██ |    |    |    |    |    |
Conception                     |    | ██ |    |    |    |    |
Développement Back-End         |    |    | ██ | ░  |    |    |
Développement Front-End        |    |    | ░  | ██ |    |    |
Intégration IA                 |    |    |    |    | ██ |    |
Tests et validation            |    |    |    |    | ░  | ██ |
Déploiement & Documentation    |    |    |    |    |    | ██ |
```
*(░ = début/fin, ██ = période principale)*

### 2.4 Diagramme PERT

> *[Insérer le diagramme PERT illustrant les dépendances entre les tâches]*

Les tâches critiques identifiées sont :
- Analyse des besoins → Conception → Développement Back-End → Intégration IA → Tests → Déploiement

**Chemin critique :** Analyse → Conception → Back-End → IA → Tests → Déploiement

### 2.5 Analyse des risques

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| Retard de développement | Moyenne | Élevé | Sprints courts, priorisation |
| Problèmes d'intégration LLM | Faible | Moyen | Valeurs de repli (fallback) |
| Indisponibilité de la base de données | Faible | Élevé | Support dual SQLite/MySQL |
| Changement de besoins | Moyenne | Moyen | Méthode Scrum agile |
| Failles de sécurité OAuth | Faible | Élevé | Bibliothèques standards, tokens |

### 2.6 Suivi et organisation du projet

- **Outil de versioning :** Git / GitHub
- **Gestion des tâches :** Trello / GitHub Issues
- **Communication :** réunions hebdomadaires, messagerie instantanée
- **Documentation :** fichiers README, commentaires de code

---

## CHAPITRE 3 : ANALYSE ET SPÉCIFICATION DES BESOINS

### 3.1 Contexte du projet

*[Reprendre et approfondir le contexte présenté en introduction, avec plus de détails techniques et chiffrés sur le marché marocain de l'emploi.]*

### 3.2 Étude de l'existant

Une étude comparative des plateformes existantes a été réalisée :

| Plateforme | Forces | Faiblesses |
|---|---|---|
| Rekrute.ma | Grande base d'offres | UX vieillissante, pas d'IA |
| Emploi.ma | Couverture nationale | Pas d'analyse CV, pas de swipe |
| Anapec.org | Institutionnel | Interface datée, peu interactif |
| LinkedIn | IA intégrée | Pas adapté au marché marocain local |

### 3.3 Critique de l'existant

Les principales lacunes des solutions actuelles sont :
1. **Absence d'IA** pour l'analyse et la correspondance CV/offre
2. **Manque de personnalisation** de l'expérience de recherche
3. **Interface non moderne** — pas d'expérience mobile native
4. **Pas de suivi centralisé** des candidatures
5. **Pas d'alertes intelligentes** adaptées au profil candidat

### 3.4 Besoins fonctionnels

| ID | Besoin | Priorité |
|---|---|---|
| BF01 | Inscription et connexion via OAuth2 (Google/GitHub) | Haute |
| BF02 | Recherche d'offres avec filtres (secteur, ville, contrat, salaire) | Haute |
| BF03 | Consultation détaillée d'une offre | Haute |
| BF04 | Dépôt de candidature avec CV | Haute |
| BF05 | Analyse intelligente du CV par IA (score ATS, recommandations) | Haute |
| BF06 | Interface swipe pour découverte des offres | Moyenne |
| BF07 | Gestion du profil candidat (expériences, formations, compétences) | Haute |
| BF08 | Sauvegarde des offres favorites | Moyenne |
| BF09 | Création et gestion d'alertes emploi | Moyenne |
| BF10 | Tableau de bord avec suivi des candidatures | Haute |
| BF11 | Upload et téléchargement de CV (PDF) | Haute |
| BF12 | Chatbot IA assistant à la recherche | Basse |
| BF13 | Seeding automatique d'offres marocaines | Haute |

### 3.5 Besoins non fonctionnels

| Catégorie | Exigence |
|---|---|
| **Performance** | Temps de réponse API < 500 ms pour les requêtes simples |
| **Sécurité** | Authentification OAuth2, sessions HTTP-only cookies, JWT |
| **Scalabilité** | Architecture compatible MySQL (production) et SQLite (développement) |
| **Maintenabilité** | Code commenté, TypeScript strict, architecture modulaire |
| **Disponibilité** | 99 % de disponibilité en production |
| **Compatibilité** | Responsive design, compatible navigateurs modernes |
| **Accessibilité** | Labels ARIA, navigation clavier |

### 3.6 Acteurs du système

| Acteur | Rôle |
|---|---|
| **Visiteur anonyme** | Consulte les offres et effectue des recherches sans se connecter |
| **Candidat authentifié** | Accède à toutes les fonctionnalités : profil, candidatures, alertes, IA |
| **Administrateur** | Gère les offres (seeding), accède aux statistiques |
| **Système IA (LLM)** | Analyse les CV et répond aux questions du chatbot |
| **Fournisseur OAuth** | Google ou GitHub — authentifie les utilisateurs |

### 3.7 Diagramme de cas d'utilisation

```
┌─────────────────────────────────────────────────────────────┐
│                    SYSTÈME EMPLOI MAROC IA                  │
│                                                             │
│  ┌──────────────────────────────┐                           │
│  │ (UC01) Rechercher des offres │◄──── Visiteur             │
│  └──────────────────────────────┘      Candidat             │
│                                                             │
│  ┌──────────────────────────────┐                           │
│  │ (UC02) Se connecter / OAuth  │◄──── Visiteur             │
│  └──────────────────────────────┘                           │
│                                                             │
│  ┌──────────────────────────────┐                           │
│  │ (UC03) Gérer son profil      │◄──── Candidat             │
│  └──────────────────────────────┘                           │
│                                                             │
│  ┌──────────────────────────────┐                           │
│  │ (UC04) Postuler à une offre  │◄──── Candidat             │
│  └──────────────────────────────┘                           │
│                                                             │
│  ┌──────────────────────────────┐                           │
│  │ (UC05) Analyser son CV (IA)  │◄──── Candidat             │
│  └──────────────────────────────┘                           │
│                                                             │
│  ┌──────────────────────────────┐                           │
│  │ (UC06) Swiper les offres     │◄──── Candidat             │
│  └──────────────────────────────┘                           │
│                                                             │
│  ┌──────────────────────────────┐                           │
│  │ (UC07) Créer une alerte      │◄──── Candidat             │
│  └──────────────────────────────┘                           │
│                                                             │
│  ┌──────────────────────────────┐                           │
│  │ (UC08) Seeder les offres     │◄──── Administrateur       │
│  └──────────────────────────────┘                           │
└─────────────────────────────────────────────────────────────┘
```

### 3.8 Description détaillée des cas d'utilisation

#### UC04 — Postuler à une offre

| Champ | Détail |
|---|---|
| **Nom** | Postuler à une offre |
| **Acteur principal** | Candidat authentifié |
| **Préconditions** | L'utilisateur est connecté et a un profil candidat |
| **Scénario principal** | 1. Le candidat consulte le détail d'une offre → 2. Clique sur "Postuler" → 3. Sélectionne ou uploade un CV → 4. Confirme la candidature → 5. Le système enregistre la candidature et met à jour le tableau de bord |
| **Scénario alternatif** | Si le candidat a déjà postulé → afficher un message d'avertissement |
| **Postconditions** | La candidature est enregistrée, le statut "applied" est associé |

#### UC05 — Analyser son CV par IA

| Champ | Détail |
|---|---|
| **Nom** | Analyse intelligente du CV |
| **Acteur principal** | Candidat authentifié |
| **Préconditions** | L'utilisateur a uploadé un fichier CV (PDF) |
| **Scénario principal** | 1. Le candidat va sur la page Upload CV → 2. Uploade son PDF → 3. Le texte est extrait → 4. Envoyé au LLM → 5. Résultats affichés (score ATS, forces, faiblesses, conseils) |
| **Postconditions** | Un rapport d'analyse est affiché et peut être exporté |

---

## CHAPITRE 4 : CONCEPTION DU SYSTÈME

### 4.1 Architecture générale

L'application suit une architecture **full-stack monorepo** avec séparation claire entre client et serveur :

```
┌─────────────────────────────────────────────────────────┐
│                     NAVIGATEUR CLIENT                   │
│                                                         │
│  React 18 + TypeScript + Vite                           │
│  ├── Pages (Home, Search, JobDetail, Dashboard…)        │
│  ├── Composants (BrandLogo, ChatBot, Map, Swipe…)       │
│  ├── Hooks (useMobile, useComposition, usePersistFn)    │
│  └── tRPC Client (HTTP Batch + SuperJSON)               │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTPS / tRPC
┌───────────────────────▼─────────────────────────────────┐
│                     SERVEUR EXPRESS                     │
│                                                         │
│  Node.js + Express + TypeScript                         │
│  ├── tRPC Router (auth, candidate, cv, jobs)            │
│  ├── OAuth2 Handler (Google, GitHub, Mock)              │
│  ├── LLM Integration (CV analysis, ChatBot)             │
│  └── Storage Handler (Forge/S3 ou data URL local)       │
└───────────────────────┬─────────────────────────────────┘
                        │ Drizzle ORM
┌───────────────────────▼─────────────────────────────────┐
│                    BASE DE DONNÉES                      │
│                                                         │
│  SQLite / Turso (dev)  │  MySQL (prod)                  │
│  Tables : users, candidates, jobOffers,                 │
│           applications, savedJobs, jobAlerts,           │
│           experiences, educations, skills,              │
│           searchPreferences                             │
└─────────────────────────────────────────────────────────┘
```

### 4.2 Choix technologiques

| Couche | Technologie | Justification |
|---|---|---|
| Front-End | React 18 + TypeScript | Composant réutilisables, typage fort |
| Build Tool | Vite | HMR ultra-rapide, bundle optimisé |
| Styling | Tailwind CSS + CSS custom | Productivité + design system custom |
| Routing | Wouter | Léger, API simple, similaire à React Router |
| API Client | tRPC + React Query | Typage end-to-end, cache automatique |
| Serialisation | SuperJSON | Support des types complexes (Date, Map) |
| Back-End | Node.js + Express | Écosystème riche, familier |
| ORM | Drizzle ORM | Léger, typesafe, dual SQLite/MySQL |
| Base de données | SQLite (dev) / MySQL (prod) | Portabilité locale + robustesse prod |
| Authentification | OAuth2 (Google + GitHub) | Sécurité, UX simplifiée |
| IA / LLM | API LLM via invokeLLM | Analyse CV, chatbot |
| Stockage fichiers | Forge/S3 (prod) / DataURL (dev) | Flexibilité selon environnement |
| Icônes | Lucide React | Cohérent, léger, accessible |

### 4.3 Diagramme de classes

```
┌─────────────────┐       ┌──────────────────┐
│      User        │       │    Candidate      │
│─────────────────│       │──────────────────│
│ id: number       │ 1   1 │ id: number        │
│ openId: string   │───────│ userId: number    │
│ name: string     │       │ phone: string     │
│ email: string    │       │ location: string  │
│ role: enum       │       │ bio: string       │
│ loginMethod      │       │ cvUrl: string     │
└─────────────────┘       └────────┬─────────┘
                                   │ 1
                    ───────────────┼───────────────
                   │               │               │
                  *│              *│              *│
         ┌─────────┴──┐   ┌───────┴────┐  ┌──────┴──────┐
         │ Experience  │   │ Education  │  │   Skill      │
         │────────────│   │────────────│  │─────────────│
         │ jobTitle    │   │ school     │  │ name         │
         │ company     │   │ degree     │  │ level: enum  │
         │ startDate   │   │ startDate  │  │ category     │
         │ isCurrent   │   │ endDate    │  └─────────────┘
         └────────────┘   └────────────┘

┌──────────────┐    * ┌─────────────┐ *    ┌──────────────┐
│  Candidate   │──────│ Application │──────│  JobOffer    │
└──────────────┘      │─────────────│      │──────────────│
                      │ status      │      │ title        │
                      │ appliedDate │      │ company      │
                      │ matchScore  │      │ location     │
                      └─────────────┘      │ sector       │
                                           │ contractType │
                                           │ salaryMin    │
                                           │ salaryMax    │
                                           │ source       │
                                           └──────────────┘
```

### 4.4 Diagrammes de séquence

#### Séquence : Analyse de CV par IA

```
Candidat    Front-End     Back-End (tRPC)    LLM API       Base de données
   │             │               │               │                │
   │──Upload PDF─►│               │               │                │
   │             │──cv.analyze──►│               │                │
   │             │               │──invokeLLM───►│                │
   │             │               │               │─►analyse JSON  │
   │             │               │◄──résultat JSON               │
   │             │◄──rapport ATS─│               │                │
   │◄──Affichage─│               │               │                │
```

#### Séquence : Connexion OAuth2 (Google)

```
Utilisateur   Front-End    Serveur Express    Google OAuth    Base de données
    │              │               │                │                │
    │──Clic Login──►│               │                │                │
    │              │──Redirect────►│                │                │
    │              │               │──Auth URL──────►│                │
    │◄─────────────────────────────│                │                │
    │──Google Login──────────────────────────────────►│                │
    │                              │◄─Code────────── │                │
    │                              │──Token Exchange──►│                │
    │                              │◄─Profile────────│                │
    │                              │──upsertUser──────────────────────►│
    │                              │──Set Cookie──────────────────────│
    │◄──Redirect Dashboard─────────│                                   │
```

### 4.5 Modèle de données (MCD/MLD)

**Modèle Logique de Données (MLD) :**

```sql
users(id PK, openId UNIQUE, name, email, loginMethod, role, createdAt, updatedAt, lastSignedIn)

candidates(id PK, userId FK→users, phone, location, bio, cvUrl, cvFileName, createdAt, updatedAt)

experiences(id PK, candidateId FK→candidates, jobTitle, company, description, startDate, endDate, isCurrent)

educations(id PK, candidateId FK→candidates, school, degree, fieldOfStudy, description, startDate, endDate)

skills(id PK, candidateId FK→candidates, name, level, category)

searchPreferences(id PK, candidateId FK→candidates, preferredSectors, preferredLocations, preferredContractTypes, minSalary, maxSalary, experienceLevelMin)

jobOffers(id PK, externalId UNIQUE, source, title, company, description, requirements, location, sector, contractType, experienceLevel, salaryMin, salaryMax, currency, publishedDate, expiryDate, sourceUrl, skills)

applications(id PK, candidateId FK→candidates, jobOfferId FK→jobOffers, status, appliedDate, matchingScore, matchingExplanation)

savedJobs(id PK, candidateId FK→candidates, jobOfferId FK→jobOffers, savedDate)

jobAlerts(id PK, candidateId FK→candidates, name, keywords, sectors, locations, contractTypes, minMatchingScore, isActive, notificationFrequency)
```

### 4.6 Conception de la base de données

- **Dual support :** Drizzle ORM avec deux schémas (`sqlite-schema.ts` et `schema.ts`) permettant de cibler SQLite ou MySQL sans modifier le code applicatif.
- **Migrations :** Gérées par Drizzle Kit (`drizzle.config.ts`)
- **Initialisation :** Les tables SQLite sont créées automatiquement au premier démarrage via `initSqliteTables()`

### 4.7 Maquettes et interfaces utilisateur

Les pages principales de l'application sont :

| Page | Description |
|---|---|
| **Home** | Landing page avec bannière, statistiques, offres récentes |
| **Search** | Recherche avancée avec filtres et liste d'offres paginée |
| **JobDetail** | Détail complet d'une offre avec boutons "Postuler" et "Sauvegarder" |
| **Dashboard** | Tableau de bord : candidatures, offres sauvegardées, alertes |
| **ProfileEdit** | Formulaire de modification du profil candidat |
| **CVUpload** | Upload PDF + affichage du rapport d'analyse IA |
| **Swipe** | Interface swipe façon Tinder pour les offres d'emploi |

---

## CHAPITRE 5 : RÉALISATION DU PROJET

### 5.1 Environnement matériel et logiciel

**Environnement matériel :**

| Composant | Spécification |
|---|---|
| Processeur | Intel Core i5 / AMD Ryzen 5 ou supérieur |
| RAM | 8 Go minimum |
| Stockage | 256 Go SSD |
| OS | Windows 11 / Ubuntu 22.04 |

**Environnement logiciel :**

| Outil | Version | Rôle |
|---|---|---|
| Node.js | 20.x LTS | Runtime JavaScript serveur |
| pnpm | 8.x | Gestionnaire de paquets |
| TypeScript | 5.x | Typage statique |
| Git | 2.x | Contrôle de version |
| VS Code | Latest | IDE de développement |
| SQLite | 3.x | Base de données locale |

### 5.2 Technologies utilisées

#### Front-End
- **React 18** — bibliothèque UI composant-based
- **TypeScript** — typage statique pour la fiabilité du code
- **Vite** — outil de build ultra-rapide avec Hot Module Replacement
- **Tailwind CSS** — framework CSS utilitaire
- **Wouter** — router léger pour SPA
- **tRPC Client** — appels API typés
- **React Query** — gestion du cache serveur
- **Lucide React** — bibliothèque d'icônes SVG
- **Radix UI** — composants accessibles (Dialog, Tooltip…)

#### Back-End
- **Node.js + Express** — serveur HTTP
- **tRPC Server** — définition des procédures API typées
- **SuperJSON** — sérialisation avancée (support Date, Map)
- **Drizzle ORM** — ORM léger dual SQLite/MySQL
- **Zod** — validation des schémas d'entrée

#### Base de données
- **SQLite / libSQL (Turso)** — développement local et edge
- **MySQL** — production cloud

#### API & IA
- **OAuth2** (Google, GitHub) — authentification sécurisée
- **LLM API** (`invokeLLM`) — analyse de CV et chatbot
- **Forge/S3** — stockage cloud des fichiers CV

#### Outils de développement
- **Git + GitHub** — versioning et collaboration
- **pnpm** — gestion des dépendances
- **ESLint + Prettier** — qualité et formatage du code
- **Drizzle Kit** — gestion des migrations de base de données

### 5.3 Développement du Front-End

Le Front-End est organisé selon la structure suivante :

```
client/src/
├── pages/          ← Composants de page (Home, Search, Dashboard…)
├── components/     ← Composants réutilisables (BrandLogo, ChatBot, Map…)
├── hooks/          ← Hooks personnalisés (useMobile, useComposition…)
├── contexts/       ← Contextes React (ThemeContext)
├── lib/            ← Utilitaires (trpc.ts, utils.ts)
└── const.ts        ← Constantes et helpers (getLoginUrl)
```

**Exemples de composants clés :**

- `BrandLogo.tsx` — Logo adaptatif (compact/full, interactif/statique)
- `DashboardLayout.tsx` — Layout principal avec sidebar de navigation
- `ChatBot.tsx` — Assistant IA flottant sur toutes les pages
- `AIChatBox.tsx` — Interface de conversation du chatbot
- `ErrorBoundary.tsx` — Gestion globale des erreurs de rendu

### 5.4 Développement du Back-End

Le Back-End est organisé en modules clairs :

```
server/
├── _core/          ← Infrastructure (trpc.ts, context.ts, oauth.ts, llm.ts, env.ts)
├── db.ts           ← Couche d'accès aux données (toutes les requêtes DB)
├── routers.ts      ← Définition de tous les endpoints tRPC
├── profile.ts      ← CRUD expériences, formations, compétences
├── search.ts       ← Moteur de recherche d'offres avec filtres
├── scraper.ts      ← Seeding et génération automatique d'offres
└── storage.ts      ← Upload/download de fichiers via Forge/S3
```

**Architecture tRPC :**
- `publicProcedure` → Endpoints accessibles sans authentification
- `protectedProcedure` → Requiert une session valide
- `adminProcedure` → Réservé au rôle admin

### 5.5 Gestion de la base de données

La base de données est gérée via **Drizzle ORM** avec un pattern singleton :

```typescript
// Décision automatique SQLite vs MySQL selon DATABASE_URL
if (dbUrl.startsWith("libsql://")) → Turso Cloud
if (dbUrl.endsWith(".db"))         → SQLite local
else                               → MySQL production
```

Les tables sont créées automatiquement au premier démarrage (`CREATE TABLE IF NOT EXISTS`). Les migrations sont gérées par `drizzle-kit push`.

### 5.6 Authentification et sécurité

| Mécanisme | Implémentation |
|---|---|
| OAuth2 Google | Flux authorization_code, redirect vers `/api/oauth/callback` |
| OAuth2 GitHub | Identique, fallback si Google non configuré |
| Session | Cookie HTTP-only signé avec JWT_SECRET |
| Protection CSRF | Cookie SameSite + vérification de l'état OAuth |
| Permissions | Middleware `requireUser` sur toutes les routes protégées |
| Déconnexion | Effacement du cookie avec maxAge: -1 |

### 5.7 Déploiement de l'application

**Variables d'environnement requises :**

```env
DATABASE_URL=          # libsql:// pour Turso, ou chemin .db local
JWT_SECRET=            # Secret pour signer les tokens de session
GOOGLE_CLIENT_ID=      # ID app Google OAuth
GOOGLE_CLIENT_SECRET=  # Secret app Google OAuth
GITHUB_CLIENT_ID=      # ID app GitHub OAuth (fallback)
GITHUB_CLIENT_SECRET=  # Secret app GitHub OAuth
BUILT_IN_FORGE_API_URL= # URL service Forge (stockage)
BUILT_IN_FORGE_API_KEY= # Clé API Forge
```

**Commandes de déploiement :**

```bash
pnpm install          # Installation des dépendances
pnpm run build        # Build production (Vite + TypeScript)
pnpm run start        # Démarrage du serveur de production
```

---

## CHAPITRE 6 : TESTS ET VALIDATION

### 6.1 Stratégie de tests

La stratégie de tests adoptée couvre trois niveaux :

1. **Tests unitaires** — vérification des fonctions isolées
2. **Tests fonctionnels** — validation des flux utilisateur complets
3. **Tests d'intégration** — vérification de la communication client/serveur

**Outils utilisés :**
- **Vitest** — runner de tests unitaires (configuration dans `vitest.config.ts`)
- **Tests manuels** — validation des flux UI dans le navigateur

### 6.2 Tests unitaires

```typescript
// Exemple : server/auth.logout.test.ts
describe("Auth - Logout", () => {
  it("doit effacer le cookie de session", async () => {
    // Vérification que la procédure logout efface le cookie
    // et retourne { success: true }
  });
});

// Exemple : server/search.test.ts
describe("Search - searchJobs", () => {
  it("doit retourner des résultats filtrés par secteur", async () => {
    // Vérification que le filtre sector fonctionne correctement
  });
});
```

### 6.3 Tests fonctionnels

| Cas de test | Scénario | Résultat attendu |
|---|---|---|
| TF01 | Connexion via Google OAuth | Redirection vers /dashboard, cookie créé |
| TF02 | Recherche "React" à Casablanca | Offres IT filtrées affichées |
| TF03 | Candidature sans CV | Message d'erreur approprié |
| TF04 | Double candidature | Message "Déjà postulé" |
| TF05 | Upload CV PDF | Analyse IA retournée (score ATS, recommandations) |
| TF06 | Swipe à droite | Offre sauvegardée dans les favoris |
| TF07 | Déconnexion | Session effacée, redirect vers Home |
| TF08 | Seeding admin | Offres marocaines insérées en DB |

### 6.4 Résultats obtenus

| Test | Statut |
|---|---|
| TF01 — Connexion OAuth | ✅ PASSÉ |
| TF02 — Recherche filtrée | ✅ PASSÉ |
| TF03 — Candidature sans CV | ✅ PASSÉ |
| TF04 — Double candidature | ✅ PASSÉ |
| TF05 — Analyse CV IA | ✅ PASSÉ |
| TF06 — Interface swipe | ✅ PASSÉ |
| TF07 — Déconnexion | ✅ PASSÉ |
| TF08 — Seeding admin | ✅ PASSÉ |

**Taux de réussite : 100 % des cas de test validés**

### 6.5 Corrections et améliorations

Au cours des phases de test, les points suivants ont été identifiés et corrigés :

| Problème détecté | Correction apportée |
|---|---|
| Réponse LLM parfois non-JSON | Ajout d'une valeur de repli (fallback) avec des données par défaut |
| Double insertion lors du seeding | Ajout de `onConflictDoNothing()` avec `externalId` unique |
| Perte de session après rechargement | Correction du cookie `SameSite` et `credentials: "include"` |
| Erreur de type Date en SQLite | Stockage des dates en ISO string, conversion à la lecture |

---

## CONCLUSION GÉNÉRALE

### Bilan du projet

Ce projet de fin d'études a abouti à la conception et au développement complet d'**Emploi Maroc IA**, une plateforme web intelligente dédiée au marché de l'emploi marocain. L'application est fonctionnelle, couvre l'ensemble des besoins identifiés et intègre des fonctionnalités d'intelligence artificielle innovantes.

Les objectifs fixés au départ ont été atteints :
- ✅ Plateforme full-stack fonctionnelle (React + Node.js + tRPC)
- ✅ Analyse de CV par IA avec score ATS et recommandations personnalisées
- ✅ Interface swipe moderne pour la découverte d'offres
- ✅ Authentification sécurisée via OAuth2 (Google / GitHub)
- ✅ Gestion complète du profil candidat
- ✅ Architecture duale SQLite / MySQL pour développement et production

### Difficultés rencontrées

1. **Gestion dual SQLite/MySQL** — La nécessité de maintenir deux schémas Drizzle a complexifié le code, mais a été résolue par un pattern de branchement centralisé dans `db.ts`.
2. **Réponses LLM non déterministes** — Les modèles de langage ne retournent pas toujours du JSON valide ; la mise en place de valeurs de repli robustes a été nécessaire.
3. **Sérialisation des dates SQLite** — SQLite ne supportant pas nativement le type Date, toutes les dates doivent être stockées en ISO string et converties.
4. **OAuth2 en développement local** — La mise en place du mock login local a permis de contourner la complexité OAuth pour les tests.

### Compétences acquises

Ce projet m'a permis d'acquérir et de renforcer les compétences suivantes :

**Techniques :**
- Maîtrise de l'architecture full-stack moderne (React, Node.js, TypeScript)
- Conception et implémentation d'API type-safe avec tRPC
- Intégration d'intelligence artificielle (LLM) dans une application web
- Gestion d'une base de données avec Drizzle ORM (SQLite / MySQL)
- Implémentation de flux d'authentification OAuth2 sécurisés
- Gestion de fichiers et stockage cloud (S3 via Forge)

**Transversales :**
- Gestion de projet agile (Scrum)
- Rédaction de documentation technique
- Travail en autonomie et organisation personnelle
- Communication avec les encadrants et parties prenantes

### Perspectives d'amélioration

Ce projet ouvre plusieurs pistes d'évolution :

1. **Matching IA avancé** — Algorithme de correspondance automatique CV/offre avec score de pertinence calculé par LLM
2. **Notifications en temps réel** — WebSockets pour alertes instantanées lors de nouvelles offres
3. **Application mobile native** — Développement d'une app iOS/Android avec React Native
4. **Tableau de bord recruteur** — Interface dédiée aux entreprises pour publier et gérer leurs offres
5. **Intégration LinkedIn** — Import automatique du profil candidat
6. **Analyse prédictive** — Recommandations de formation basées sur les lacunes identifiées dans le CV
7. **Support multilingue** — Interface en arabe (RTL) en plus du français
8. **Système de notation** — Avis sur les entreprises par les candidats (similaire à Glassdoor)

---

*Rapport rédigé dans le cadre du Projet de Fin d'Études — [Établissement] — Année 2025-2026*
