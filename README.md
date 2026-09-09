# Pourquoi je vote ?

Site de comparaison non partisane des 5 principaux partis aux élections générales
québécoises du **5 octobre 2026** — CAQ, PLQ, QS, PQ, PCQ. Conçu pour que
M./Mme Tout-le-monde puisse comprendre les programmes politiques sans jargon,
comparer les partis enjeu par enjeu, et faire un test de valeurs pour voir lequel
correspond le mieux à ses positions.

Projet indépendant, non affilié à un parti politique ou à un média.

## Ce que le site fait

Quatre sections, accessibles par un menu à onglets (grille 2×2 sur mobile) :

1. **Fiches** — un accordéon par parti (chef·fe, tagline, idéologie), avec le détail
   de leurs engagements sur 7 enjeux (fiscalité, logement, santé, immigration,
   environnement, éducation, avenir du Québec/national), plus un bloc
   **« Regard critique »** par parti — réserves et questions relevées par des
   journalistes/économistes, jamais une opinion du site lui-même.
2. **Comparateur** — même contenu que les fiches, mais organisé par enjeu :
   on choisit un enjeu (chip), et les 5 partis s'affichent côte à côte.
   Le regard critique est aussi sélectionnable comme un enjeu.
3. **Distinctions** — ce que chaque parti offre que les 4 autres n'offrent pas
   (badges "EXCLUSIF"), plus un encart "points communs surprenants" qui relève
   des recoupements inattendus entre partis autrement opposés.
4. **Test de valeurs** — 10 énoncés notés par l'utilisateur de -2 à +2. Chaque
   parti a un score pré-attribué par énoncé (déduit de son programme), et le
   site calcule un % de proximité par parti. Un encart en tête de section
   renvoie explicitement vers la **vraie Boussole électorale de Radio-Canada**
   (boussole.radio-canada.ca), présentée comme plus rigoureuse — ce test-ci est
   positionné comme un point de départ rapide, pas un remplacement.

## Principes éditoriaux (à respecter dans tout ajout futur)

- **Neutralité** : jamais de jugement de valeur du site sur "le meilleur parti".
  Le test de valeurs reste le seul outil qui pousse vers une conclusion, et
  encore, c'est l'utilisateur qui répond — pas le site qui tranche.
- **Regard critique ≠ opinion** : toute réserve doit être attribuable à une
  source (presse, économistes, le document officiel du parti lui-même — ex. la
  CAQ qui classe ~8 G$ de ses propres engagements comme "à venir"). On ne
  invente jamais une critique.
- **Sourcer officiellement en priorité**. Voir la section Sourcing ci-dessous
  pour l'état actuel par parti.
- **Ne jamais inventer de chiffre**. Si une donnée n'est pas confirmée par une
  source, soit on la retire, soit on note explicitement l'incertitude
  ("peu de détails rendus publics à ce jour").
- La note de bas de page (`footer` dans `App.jsx`) doit toujours refléter
  fidèlement, par parti, si la source est officielle ou de presse.

## État du sourcing par parti (au 9 septembre 2026)

| Parti | Statut | Sources officielles utilisées |
|---|---|---|
| CAQ | ✅ Officiel | Cadre financier "Avançons" (Éric Girard, 2026) — PDF fourni par l'utilisateur |
| PLQ | ✅ Officiel | plq.org/engagements |
| QS | ✅ Officiel | quebecsolidaire.net/theme/{logement, coutdelavie, environnement, financespubliques, independance} |
| PCQ | ✅ Officiel | conservateur.quebec/documents-officiels — Plateforme électorale 2026 (PDF) + Cadre financier PCQ 2026 (PDF) |
| PQ | ⏳ Presse seulement | À valider avec le « Projet national » (document officiel de 90 pages, mai 2026) et pq.org |

**Prochaine étape prioritaire : sourcer le PQ officiellement**, puis mettre à
jour la note de bas de page en conséquence (actuellement elle nomme
explicitement le PQ comme la seule source encore basée sur la presse).

## Corrections effectuées en cours de route (pour éviter de les réintroduire)

- ❌ Ancienne critique du PLQ sur un "troisième lien" — erreur d'attribution.
  Le 3e lien est un projet du **PCQ** (document officiel dédié), pas du PLQ.
  Retiré de la fiche PLQ.
- ❌ Ancien chiffre PCQ de "47 G$ de compressions sur 5 ans" — venait d'un
  article de presse et était inexact/mal caractérisé. Le vrai cadre financier
  PCQ montre un retour à l'équilibre budgétaire dès 2029-2030, avec des
  réductions de dépenses réparties sur plusieurs lignes distinctes (aides aux
  entreprises, crédits d'impôt, attrition, etc.), santé et éducation
  explicitement épargnées de compressions imposées.
- ❌ Ancien seuil QS de "70 000 immigrants/an" — non confirmé sur les pages
  officielles de QS consultées. Retiré plutôt que de risquer une invention.
- ✅ Découverte utile : la CAQ classe elle-même ~8 G$ sur 9,2 G$ nets
  d'engagements comme "à venir" (non annoncés) dans son propre cadre
  financier — c'est maintenant le regard critique CAQ, sourcé sur leur propre
  document plutôt que sur une critique de presse.
- ✅ Découverte utile : le PQ et le PCQ proposent tous deux d'abolir la TVQ
  sur les biens usagés — recoupement surprenant entre deux partis autrement
  opposés, relevé dans l'onglet Distinctions.

## Stack technique

- **Vite + React 18**, un seul composant (`src/App.jsx`) contenant toutes les
  données et la logique — pas de librairie UI externe, styles en ligne.
- Pas de backend, pas de base de données. Tout est statique.
- Build : `npm install && npm run build` → dossier `dist/`.
- Dev local : `npm run dev`.

## Déploiement (Vercel)

1. Pousser ce dossier sur un repo GitHub.
2. Sur vercel.com → "Add New… → Project" → importer le repo.
3. Vercel détecte Vite/React automatiquement, aucun réglage à changer.
4. Domaine généré automatiquement (`*.vercel.app`), domaine personnalisé
   configurable ensuite dans Project → Settings → Domains.

## Structure des fichiers

```
pourquoi-je-vote/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx        # point d'entrée React
│   ├── index.css        # reset minimal
│   └── App.jsx           # TOUT le contenu : données + composants + styles
├── README.md             # ce fichier
└── CLAUDE.md              # contexte/instructions pour Claude Code
```
