# Rapport du projet Emploi Maroc IA

## 1. Introduction
Ce projet est une application web destinée à faciliter la recherche d’emploi au Maroc en combinant :
- une interface moderne React + Tailwind,
- un back-end tRPC/Express,
- une base de données Drizzle,
- des fonctionnalités d’IA pour le matching et l’analyse de CV.

## 2. Contexte général du projet
L’application vise à centraliser les offres d’emploi marocaines et à proposer un parcours plus intelligent pour le candidat :
- recherche multi-sources,
- recommandations IA,
- suivi personnalisé,
- analyse de CV,
- interface responsive.

## 3. Objectif du projet
Créer une plateforme d’emploi augmentée par l’IA qui aide l’utilisateur à :
- trouver rapidement des offres compatibles,
- optimiser son CV pour le marché marocain,
- recevoir des alertes pertinentes,
- naviguer via un tableau de bord personnalisé.

## 4. Description de l’existant
Le projet utilise une structure semi-template moderne :
- frontend : `client/src/`
- backend : `server/`
- base de données : `drizzle/`
- shared : `shared/`
- auth + infrastructure : `server/_core/`

Fichiers clés :
- `client/src/pages/Home.tsx`
- `client/src/pages/Search.tsx`
- `client/src/pages/CVUpload.tsx`
- `server/routers.ts`
- `server/db.ts`
- `drizzle/schema.ts`

## 5. Besoins fonctionnels
### 5.1 Recherche d’emploi
- page `Search`
- filtres : secteur, type de contrat, localisation, niveau d’expérience
- affichage des offres avec contrat, salaire, entreprise, secteur

### 5.2 Matching IA avancé
- interface `Home` met en avant un score IA et un matching de compétences
- l’application propose des offres jugées les plus pertinentes

### 5.3 Analyse de CV
- page `CVUpload`
- upload de CV
- analyse IA avec prompt spécialisé marché marocain
- génération de score ATS, force/faiblesse, sections manquantes, conseils

### 5.4 Authentification et profil
- login via OAuth (Google / Manus)
- `useAuth()` pour contrôler accès aux pages protégées
- redirection vers login si non connecté

### 5.5 Tableau de bord et profil utilisateur
- pages présentes dans le projet : `Dashboard.tsx`, `ProfileEdit.tsx`
- gestion de profil, CV stocké, et fonctionnalités personnalisées

## 6. Besoins techniques
### 6.1 Stack technique
- React 19
- Tailwind CSS 4
- Express 4
- tRPC 11
- Drizzle ORM
- Vite

### 6.2 Base de données
- `DATABASE_URL` configuré pour Turso / libSQL
- modèle de données dans `drizzle/schema.ts`
- migrations dans `drizzle/migrations/`

### 6.3 Authentification
- variables : `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `JWT_SECRET`
- callback OAuth via `GOOGLE_CALLBACK_URL`
- `server/_core` gère le contexte et les sessions

### 6.4 IA et traitement
- utilisation d’un assistant IA (`puter.js`) dans `CVUpload`
- prompt GPT-4o-mini pour analyser CV et renvoyer du JSON structuré
- traitement front-end du résultat pour afficher score, recommandations et insights

### 6.5 API & routes
- tRPC sous `/api/trpc`
- procédures backend définies dans `server/routers.ts`
- front-end consomme `trpc.jobs.search`, `trpc.candidate.getProfile`, `trpc.jobs.createAlert`, etc.

## 7. Conception et modélisation
### 7.1 Architecture front-end
- pages principales : `Home`, `Search`, `CVUpload`, `Dashboard`, `ProfileEdit`, `JobDetail`, `Swipe`
- composants réutilisables dans `client/src/components/ui`
- navigation gérée via `wouter`

### 7.2 Composants clés
- `BrandLogo`, `ThemeToggle`
- cartes d’offre métier
- système de filtre et menu déroulant
- zone de drag & drop pour CV

### 7.3 Modélisation des données
- jobs / offres
- candidates / profils
- alerts / alertes de job
- analyses de CV et score ATS

## 8. Implémentation
### 8.1 Front-end
- page d’accueil riche en CTA et en pilotage vers recherche/cv/dashboard
- recherche d’emploi avec affichage card-based et filtres
- upload CV avec barre de progression et affichage des résultats d’analyse

### 8.2 Back-end
- tRPC pour l’API typée
- procédures publiques / protégées
- interaction avec la base de données via `server/db.ts`

### 8.3 Intégration IA
- prompt spécifique dans `CVUpload.tsx`
- analyse produite en JSON brut et convertie en tableau visible
- fallback en cas d’erreur pour garder une expérience utilisateur fluide

## 9. Tests et résultats
- configuration de tests avec `vitest`
- ex. fichier `server/auth.logout.test.ts`
- bonnes pratiques attendues :
  - tests d’API tRPC
  - tests unitaires de logique métier
  - tests de comportement des pages clés

## 10. Conclusion
Ce projet est un prototype solide d’une plateforme d’emploi augmentée par IA pour le Maroc. Il combine :
- une interface utilisateur moderne,
- une recherche d’offres enrichie,
- un assistant d’analyse de CV,
- une architecture tRPC/Drizzle bien structurée.

Recommandation : compléter le contenu métier (migrations, endpoints de job réels, matching plus profond) et renforcer les tests pour passer du prototype à une application prête à être déployée.
