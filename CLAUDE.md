# CLAUDE.md — contexte pour Claude Code

Ce fichier donne le contexte nécessaire pour continuer le travail sur ce projet
dans Claude Code. Lis aussi `README.md` pour la description fonctionnelle
complète. Ce fichier-ci est plus opérationnel : comment travailler dans ce
repo, quelles règles respecter, où sont les pièges.

## C'est quoi, en une phrase

Un site React statique (une seule page, un seul fichier `src/App.jsx`) qui
compare les programmes des 5 partis aux élections québécoises du 5 octobre
2026, avec un test de valeurs. Construit via Claude (claude.ai) avant d'être
repris ici pour la suite (déploiement Vercel, ajustements).

## Où sont les données

Tout est dans `src/App.jsx`, en haut du fichier :

- `PARTIES` — tableau de 5 objets (un par parti). Chaque parti a `themes`
  (7 enjeux) et `critique` (un paragraphe de regard critique sourcé).
- `THEME_LABELS` — les libellés d'affichage des 7 enjeux.
- `QUESTIONS` — les 10 questions du test de valeurs, chacune avec un score
  -2..+2 par parti (`scores: { caq, plq, qs, pq, pcq }`).
- `CHOICES` — les 5 choix de réponse du quiz (Fortement en désaccord → Fortement d'accord).
- `EXCLUSIVE_OFFERS` — les mesures exclusives par parti pour l'onglet Distinctions.
- `SHARED_SURPRISES` — recoupements inattendus entre partis, affichés sous les distinctions.

Il n'y a pas de fichier de données séparé (JSON, CMS, API) — tout est en dur
dans le composant. Si le projet grossit, envisager d'extraire `PARTIES` etc.
dans des fichiers séparés (`src/data/parties.js`), mais ce n'est pas fait à
ce jour.

## Règles à respecter pour toute modification de contenu

1. **Ne jamais ajouter de fait, chiffre ou promesse sans source vérifiable.**
   Si une info ne peut pas être confirmée (site officiel, document PDF
   officiel, ou à défaut un article de presse identifiable), ne pas l'ajouter
   — ou la marquer explicitement comme non confirmée dans le texte
   ("peu de détails rendus publics à ce jour").
2. **Le champ `critique` doit toujours être attribuable** — à la presse, à des
   économistes/experts nommés en général, ou (meilleur cas) au document
   officiel du parti lui-même qui se contredit ou reste vague. Ne jamais y
   mettre une opinion du site.
3. **Le footer (`<footer>` dans `App()`) doit rester exact** sur le statut de
   sourcing par parti (officiel vs presse). Le mettre à jour à chaque fois
   qu'un parti passe d'un statut à l'autre. Voir tableau dans README.md.
4. **Le test de valeurs (`QUESTIONS`) n'est PAS la Boussole électorale
   officielle** de Radio-Canada (boussole.radio-canada.ca, faite par des
   politologues + Vox Pop Labs). Le site le dit explicitement à deux endroits
   (début du test + écran de résultats) — ne pas retirer ce disclaimer ni
   présenter le test comme équivalent en rigueur.
5. **Toujours reconstruire et tester le build avant de considérer une tâche
   terminée** : `npm install && npm run build`. Le projet doit compiler sans
   erreur (Vite/React, pas de dépendances manquantes).

## Travail restant identifié

- **Sourcer le PQ officiellement.** Le parti a un document de plateforme
  complet appelé le « Projet national » (90 pages, publié mai 2026,
  probablement sur pq.org ou déposé à la Bibliothèque de l'Assemblée
  nationale — voir la méthode qui a fonctionné pour trouver le cadre
  financier CAQ : bibliotheque.assnat.qc.ca/DepotNumerique_v2, ou demander à
  l'utilisateur le PDF directement). Une fois trouvé, appliquer la même
  méthode que pour les 4 autres partis : extraire les positions par enjeu,
  mettre à jour `PARTIES.find(p => p.id === "pq")`, corriger le `critique` du
  PQ avec des réserves sourcées sur le document lui-même si possible (comme ça
  a été fait pour la CAQ avec ses "engagements à venir"), et mettre à jour le
  footer pour que les 5 partis soient marqués "officiel".
- Une fois les 5 partis officiellement sourcés, envisager une relecture
  complète du fichier pour vérifier la cohérence des scores du quiz
  (`QUESTIONS[].scores`) à la lumière des données finales.
- Déploiement Vercel — voir README.md, section Déploiement. Pas encore fait
  au moment de la rédaction de ce fichier ; l'utilisateur prévoit le faire
  lui-même ou via Claude Code.

## Pièges déjà rencontrés (ne pas répéter)

- Une critique de presse peut être mal attribuée au mauvais parti — toujours
  vérifier contre le document officiel avant de garder une critique glanée
  dans un article qui compare plusieurs partis à la fois.
- Un chiffre de presse peut être une approximation ou une déformation du vrai
  chiffre officiel (ex. "47 G$ de compressions" du PCQ, qui était inexact —
  voir README.md pour le détail). Quand un document officiel devient
  disponible, il prime toujours sur un chiffre de presse antérieur, même si
  ce chiffre de presse a déjà été utilisé dans le site.
- Ne pas halluciner un chiffre précis (ex. seuil d'immigration) juste parce
  qu'il "sonne plausible" ou qu'il apparaît dans un article vaguement lié —
  vérifier qu'il est bien sur la page/le document source avant de l'inclure.

## Commandes utiles

```bash
npm install       # installer les dépendances
npm run dev       # serveur de dev local
npm run build     # build de production → dist/
npm run preview   # prévisualiser le build de production
```
