import React, { useState, useMemo, useEffect } from "react";

/* Point de bascule mobile → bureau. En dessous : mise en page mobile
   d'origine (colonne unique). Au-dessus : mise en page bureau élargie. */
const WIDE_BP = 768;

function useIsWide(bp = WIDE_BP) {
  const read = () => (typeof window !== "undefined" ? window.innerWidth >= bp : false);
  const [wide, setWide] = useState(read);
  useEffect(() => {
    const onResize = () => setWide(read());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return wide;
}

/* Normalise pour la recherche : minuscules, sans accents. */
const norm = (s) =>
  (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/* Met en évidence le terme recherché dans un texte. */
function highlight(text, term) {
  const t = (term || "").trim();
  if (!t) return text;
  const esc = t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.split(new RegExp(`(${esc})`, "ig")).map((part, i) =>
    part.toLowerCase() === t.toLowerCase() ? (
      <mark key={i} style={{ background: "#FDECC8", color: "inherit", padding: "0 1px", borderRadius: 2 }}>
        {part}
      </mark>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
}

/* ---------------------------------------------------------
   DONNÉES — Élections générales québécoises, 5 octobre 2026
   Résumés en langage simple, compilés depuis les sites
   officiels des partis et la couverture de presse électorale
   (Le Devoir, Radio-Canada, CBC/CTV, Noovo, La Presse).
   Portrait arrêté au 8 septembre 2026 — les plateformes
   complètes ne sont pas toutes finalisées.
--------------------------------------------------------- */

const PARTIES = [
  {
    id: "caq",
    name: "Coalition avenir Québec",
    short: "CAQ",
    leader: "Christine Fréchette",
    color: "#0F4C81",
    tagline: "Le parti sortant, qui mise sur la continuité et le portefeuille des familles.",
    ideologie: "Centre droit, nationaliste et autonomiste — un Québec fort dans la fédération canadienne.",
    themes: {
      fiscalite: "Son cadre financier (bâti avec le simulateur du ministère des Finances, dont les hypothèses ont été validées par la Vérificatrice générale) chiffre l'impact net de ses engagements électoraux à 9,2 G$ sur 5 ans (9,7 G$ en incluant le service de la dette). Vise un retour à l'équilibre budgétaire en 2029-2030 et une dette nette ramenée de 38,1 % à 36,4 % du PIB d'ici 2030-2031. Prévoit aussi 180 G$ au Plan québécois des infrastructures, dont 75 % pour l'entretien du réseau existant. Propose par ailleurs 1000 $ dans un régime d'épargne-études pour chaque nouveau-né et un remboursement pouvant atteindre 1310 $ des frais de garde scolaire.",
      logement: "Mise sur une construction plus rapide et moins de règles administratives, avec plus d'aide fiscale pour les premiers acheteurs.",
      sante: "Garde Santé Québec en place, mais utiliserait davantage le privé (payé par l'État) pour les chirurgies et examens quand les délais sont longs. Prévoit des investissements en soins à domicile et un plan pour mieux loger les aînés.",
      immigration: "Poursuit la ligne des dernières années : seuils d'immigration réduits par rapport aux niveaux historiques.",
      environnement: "A envisagé la relance du gaz de schiste sans position ferme; priorité affichée à l'économie et à l'énergie.",
      education: "Plus de places en garderie et allègement des dépenses scolaires des familles (fournitures, activités).",
      national: "Fédéraliste autonomiste : plus de pouvoirs pour le Québec sans sortir du Canada.",
    },
    critique: "Selon son propre cadre financier, la vaste majorité de l'espace budgétaire réservé aux engagements électoraux — environ 8 G$ sur les 9,2 G$ nets prévus sur 5 ans — est classée comme « engagements à venir », c'est-à-dire des mesures non encore annoncées ni détaillées. Le retour à l'équilibre budgétaire dépend aussi de 4,4 G$ de transferts fédéraux additionnels anticipés par la CAQ (renouvellement d'ententes en santé, remboursements liés aux demandeurs d'asile) qui ne sont pas garantis par Ottawa à ce jour.",
  },
  {
    id: "plq",
    name: "Parti libéral du Québec",
    short: "PLQ",
    leader: "Charles Milliard",
    color: "#C8102E",
    tagline: "Se présente comme l'équipe économique, portée sur la construction et les PME.",
    ideologie: "Centre à centre droit, fédéraliste, libéralisme économique.",
    themes: {
      fiscalite: "Baisse graduelle de l'impôt des PME de 11,5 % à 10 %, exemption de base au Fonds des services de santé (FSS) pour les PME, et congé temporaire de cotisations au FSS pour les entreprises touchées par les tarifs américains. Rembourse 36 % de la TVQ sur l'achat d'un logement neuf (jusqu'à 10 000 $, ou jusqu'à 30 000 $ pour un plex).",
      logement: "Cible, à terme, 100 000 logements construits par année, dont la moitié en préfabriqué. Ajoute 40 000 unités abordables ou sociales au parc locatif, avec l'objectif de porter le logement hors marché à 20 % d'ici 2050. Permet aux investisseurs de reporter l'impôt sur les gains en capital (jusqu'à 1 M$) s'ils réinvestissent dans la construction de logements.",
      sante: "Priorité à une plateforme de télésanté universelle et sans rendez-vous, pour donner un accès rapide à un professionnel de la santé et désengorger les urgences.",
      immigration: "Veut impliquer les régions dans la définition de leur capacité d'accueil en immigration, et accélérer la francisation (délai d'attente ramené à six semaines, budgets de francisation augmentés de 138 M$ sur 4 ans).",
      environnement: "Aucune mesure environnementale détaillée sur la page officielle de ses engagements à ce jour.",
      education: "États généraux sur l'éducation, priorité nationale à la lecture (livre offert à chaque élève du primaire, stratégie de lecture inscrite à la Charte de la langue française), modernisation de l'aide financière aux études — 380 M$ d'investissements additionnels annoncés en éducation.",
      national: "Fédéraliste : veut « reprendre la place du Québec à la table canadienne » et conclure des ententes de commerce et de réciprocité avec l'Ontario. Pas de section dédiée à la question constitutionnelle sur la page officielle des engagements.",
    },
    critique: "Des observateurs, dont Radio-Canada, ont mis en doute la faisabilité de la cible de 100 000 logements par année, jugée ambitieuse par rapport au rythme actuel de construction au Québec. Contrairement aux quatre autres partis, le PLQ n'a pas publié à ce jour de volet environnemental détaillé dans ses engagements officiels.",
  },
  {
    id: "qs",
    name: "Québec solidaire",
    short: "QS",
    leader: "Ruba Ghazal & Sol Zanetti",
    color: "#FF7A00",
    tagline: "Mise sur le logement social, les services publics et la redistribution de la richesse.",
    ideologie: "Gauche, social-démocrate, souverainiste et écologiste.",
    themes: {
      fiscalite: "Propose de taxer les actifs des ultra-riches (25 M$ et plus) pour aller chercher 5 G$ par année pour les services publics. Veut aussi créer un réseau d'une quinzaine d'épiceries publiques sans but lucratif et plafonner les marges d'épicerie à 2 %, pour une économie visée de 2500 $/an par ménage sur le panier d'épicerie.",
      logement: "Plan en 7 chantiers : geler les loyers à l'inflation pendant un an puis réformer le calcul des hausses permises, imposer 100 % (plutôt que 50 %) du gain en capital sur la vente d'immeubles locatifs, viser 20 % de logement hors marché d'ici 2050, et offrir un prêt pouvant atteindre 50 000 $ pour la mise de fonds des premiers acheteurs. Prévoit aussi des amendes plus élevées et un pouvoir d'expropriation contre les propriétaires abusifs récidivistes.",
      sante: "Propose de revenir au modèle CLSC avec 400 nouveaux points d'accès à la première ligne partout au Québec, plutôt qu'une nouvelle réforme de structures. Veut aussi rendre la contraception et les produits d'hygiène menstruelle gratuits.",
      immigration: "Rétablirait intégralement le Programme de l'expérience québécoise (PEQ) et créerait un PEQ-Régions pour faciliter la résidence permanente des immigrants qui travaillent en région, abolirait les permis de travail fermés, et miserait sur une politique de francisation en milieu de travail avec cours rémunérés.",
      environnement: "Priorité au transport collectif : 23 G$ sur 10 ans pour réparer et développer le réseau (métro de Montréal, tramway de Québec et de Gatineau, prolongement de la ligne orange à Laval, projet structurant dans l'Est de Montréal).",
      education: "S'engage à réduire le décrochage scolaire de 50 % dans un premier mandat : embauche de 1500 employés de soutien et 500 professionnels de plus, protection du budget des écoles, et création d'un réseau commun en éducation pour mettre fin au système à trois vitesses.",
      national: "Souverainiste : mettrait en place une assemblée constituante co-construite avec les Premiers Peuples pour mener au projet d'indépendance, avec réforme du mode de scrutin et référendums d'initiative populaire.",
    },
    critique: "QS indique lui-même, sur la page officielle de ses engagements, que son cadre financier complet est « à venir », ce qui rend difficile d'évaluer dès maintenant le coût total de l'ensemble de ses promesses (logement, épiceries publiques, transport collectif, réseau commun en éducation). Le financement annoncé — 5 G$/an d'une taxe sur les grandes fortunes — devra à lui seul couvrir plusieurs engagements coûteux.",
  },
  {
    id: "pq",
    name: "Parti québécois",
    short: "PQ",
    leader: "Paul St-Pierre Plamondon",
    color: "#1B98D5",
    tagline: "Fait de l'indépendance du Québec sa promesse phare, appuyée sur un « Livre bleu » de 551 pages.",
    ideologie: "Centre gauche à attrape-tout, souverainiste et nationaliste.",
    themes: {
      fiscalite: "Promet d'abolir la TVQ sur les biens usagés (autos, meubles, électroménagers, articles de sport, jouets, vêtements) dès le lendemain d'une élection — « des milliers de dollars par an » d'économie pour une famille selon le parti, une mesure qu'il chiffre lui-même à un maximum de 700 M$ par année (source : presse). N'a pas publié de cadre financier provincial complet; son argumentaire budgétaire porte surtout sur les finances d'un Québec indépendant (revenus fédéraux prélevés au Québec estimés par le parti à 82,3 G$/an, économies de dédoublements de 8,8 G$/an).",
      logement: "Priorité affichée à la baisse des coûts de construction et du fardeau réglementaire; peu de mesures détaillées publiées à ce jour.",
      sante: "S'oppose à la centralisation opérée par Santé Québec et privilégie une gestion décentralisée vers les régions ainsi qu'un réinvestissement dans les CLSC; peu de mesures chiffrées à ce jour (source : presse).",
      immigration: "Plan d'immigration officiel : environ 35 000 résidents permanents par an, et une baisse de l'immigration temporaire à 250 000–300 000 personnes sur un mandat (réduction d'au moins 50 %), dont environ 40 000 au Programme des travailleurs étrangers temporaires et environ 50 000 étudiants étrangers. Exige un français de niveau intermédiaire à l'entrée, remplacerait les permis de travail fermés par des permis régionaux et sectoriels, et accueillerait les demandeurs d'asile au prorata du poids démographique du Québec (22 %) jusqu'à l'indépendance. Veut aussi étendre la loi 101 au cégep (source : presse).",
      environnement: "Peu de mesures détaillées rendues publiques à ce jour.",
      education: "Peu de mesures scolaires chiffrées à ce jour; l'accent est mis sur le renforcement du français à l'école (source : presse).",
      national: "Promet un référendum sur l'indépendance dans un premier mandat, mais s'engage à ne pas le tenir tant que Donald Trump est président des États-Unis — donc pas avant janvier 2029 (source : presse). Son « Livre bleu sur l'indépendance » (551 pages, juillet 2026) détaille le processus d'accession : constitution provisoire, commission itinérante de consultation (1 à 2 ans), puis, 2 à 4 ans après l'indépendance effective, une assemblée constituante chargée de rédiger la constitution définitive. Le parti présente ce document comme une « première version » à compléter « avec les moyens de l'État » s'il est élu.",
    },
    critique: "Contrairement aux quatre autres partis, le PQ n'a pas publié de plateforme électorale unique ni de cadre financier provincial détaillé. Son « Livre bleu » porte uniquement sur l'indépendance et se décrit lui-même comme une « première version » appelée à être complétée plus tard; sur des pans entiers de l'action gouvernementale courante (santé, logement, éducation), les engagements restent peu détaillés. La promesse d'un référendum dans un premier mandat soulève par ailleurs, selon des économistes et des gens d'affaires cités dans la presse, des questions sur l'effet d'une période d'incertitude constitutionnelle sur l'investissement.",
    sourceNote: "Le PQ n'a pas publié de plateforme unique ni de cadre financier détaillé. Ce résumé combine plusieurs pages de son site (indépendance, immigration); les enjeux qu'il n'a pas encore détaillés (santé, logement, éducation, environnement) s'appuient sur la couverture de presse et sont signalés comme tels.",
    sources: [
      { label: "Section « Indépendance » — pq.org", url: "https://pq.org/independance/" },
      { label: "« Livre bleu sur l'indépendance » (PDF, juillet 2026)", url: "https://pq.org/wp-content/uploads/2026/07/PQ_Livre-bleu-pages.pdf" },
      { label: "Plan d'immigration — pq.org", url: "https://pq.org/independance/plan-immigration/" },
    ],
  },
  {
    id: "pcq",
    name: "Parti conservateur du Québec",
    short: "PCQ",
    leader: "Éric Duhaime",
    color: "#7A3B9C",
    tagline: "Priorité à la baisse d'impôt, à la déréglementation et à l'autonomie du Québec dans le Canada.",
    ideologie: "Droite, fédéraliste-autonomiste, libéralisme économique et conservatisme.",
    themes: {
      fiscalite: "Vise une baisse totale de 11 166 $ d'impôts et de taxes par ménage moyen sur un premier mandat : hausse du montant qu'on peut gagner sans payer d'impôt (de 18 952 $ à 35 242 $ d'ici 2030), retrait du marché du carbone (SPEDE), suspension de 5 mois de la taxe sur l'essence, et abolition de la TVQ sur les biens usagés. L'impôt des sociétés passerait de 11,5 % à 4,7 % d'ici 2030-2031. Selon son propre cadre financier, ces baisses seraient financées par la fin des subventions aux entreprises, l'abolition du Fonds du développement économique, une réduction de la fonction publique par attrition et une révision des programmes gouvernementaux, avec un retour à l'équilibre budgétaire visé dès 2029-2030.",
      logement: "Déréglementation de la construction résidentielle (Code du bâtiment, mobilité de la main-d'œuvre), accès facilité aux terrains, priorité aux maisons unifamiliales. Préfère bonifier l'Allocation-logement pour les locataires à faible revenu plutôt que de faire construire des HLM par l'État, jugés trop coûteux (plus de 450 000 $/unité en moyenne).",
      sante: "Garderait un régime universel, mais permettrait l'assurance privée duplicative (comme dans plusieurs pays de l'OCDE) et un principe où « l'argent suit le patient » : si le réseau public ne peut traiter dans un délai raisonnable, le patient pourrait se faire soigner ailleurs avec sa carte d'assurance maladie, sans frais. Promet aussi 300 à 500 admissions de plus par année en médecine, plus de super-infirmières (IPS) et un plan de soins à domicile.",
      immigration: "Veut régionaliser l'immigration : chaque région établirait ses propres besoins et capacités d'accueil avec les municipalités et les employeurs, via des tables régionales décisionnelles ayant un pouvoir réel sur ce dossier.",
      environnement: "Propose d'abroger la loi de 2022 qui interdit l'exploration et l'exploitation d'hydrocarbures, pour développer le gaz de schiste du bassin de l'Utica; se retire aussi du marché du carbone (SPEDE).",
      education: "Peu de mesures détaillées rendues publiques à ce jour, au-delà d'une révision du mandat des centres de services scolaires évoquée dans le cadre financier.",
      national: "Fédéraliste-autonomiste, pas indépendantiste : veut plus de pouvoirs pour le Québec dans le Canada (« Destination autonomie ») et, à l'intérieur du Québec, transférer des pouvoirs vers 17 tables régionales décisionnelles.",
    },
    critique: "Le cadre financier du PCQ (basé sur le simulateur officiel du ministère des Finances) affiche un retour à l'équilibre budgétaire, mais une bonne partie des revenus additionnels reposent sur des effets économiques projetés plutôt que des chiffres déjà observés : 13,7 G$ attendus d'une libéralisation réglementaire, en extrapolant au Québec les résultats d'une étude allemande de l'institut ifo; des gains du commerce interprovincial qui dépendent de la réciprocité d'autres provinces; et des revenus du gaz de schiste conditionnels à l'abrogation d'une loi qui interdit actuellement l'exploitation, avec des hypothèses géologiques optimistes sur le taux de récupération des puits.",
  },
];

const THEME_LABELS = {
  fiscalite: "Impôts et finances publiques",
  logement: "Logement",
  sante: "Santé",
  immigration: "Immigration",
  environnement: "Environnement et énergie",
  education: "Éducation",
  national: "Avenir du Québec",
};

/* ---------------------------------------------------------
   TEST DE VALEURS
   Chaque question porte sur un enjeu. Chaque parti reçoit
   une position de -2 (en désaccord) à +2 (en accord) avec
   l'énoncé, déduite de son programme. L'utilisateur répond
   sur la même échelle; on calcule ensuite la proximité.
--------------------------------------------------------- */

const QUESTIONS = [
  {
    text: "Le gouvernement devrait laisser plus de place au secteur privé dans l'économie, plutôt que d'intervenir davantage.",
    scores: { caq: 1, plq: 2, qs: -2, pq: 0, pcq: 2 },
  },
  {
    text: "Je préfère des baisses d'impôt, même si cela veut dire moins d'argent pour les services publics.",
    scores: { caq: 0, plq: 1, qs: -2, pq: 1, pcq: 2 },
  },
  {
    text: "Le système de santé devrait faire davantage appel au privé pour réduire les délais d'attente.",
    scores: { caq: 1, plq: 0, qs: -2, pq: -1, pcq: 2 },
  },
  {
    text: "Le gouvernement devrait mieux encadrer les loyers et le marché du logement pour protéger les locataires.",
    scores: { caq: -1, plq: -1, qs: 2, pq: -1, pcq: -2 },
  },
  {
    text: "Le Québec devrait accueillir plus d'immigrants qu'actuellement.",
    scores: { caq: -1, plq: 0, qs: 2, pq: -1, pcq: -1 },
  },
  {
    text: "La protection de l'environnement devrait passer avant le développement économique et énergétique.",
    scores: { caq: 0, plq: 0, qs: 2, pq: 0, pcq: -2 },
  },
  {
    text: "Le Québec devrait devenir un pays indépendant.",
    scores: { caq: -1, plq: -2, qs: 2, pq: 2, pcq: -2 },
  },
  {
    text: "L'État devrait réduire la taille de la fonction publique et éliminer des postes.",
    scores: { caq: 1, plq: 0, qs: -2, pq: 0, pcq: 2 },
  },
  {
    text: "Les grandes fortunes et les plus riches devraient payer davantage d'impôts.",
    scores: { caq: -1, plq: -1, qs: 2, pq: 0, pcq: -2 },
  },
  {
    text: "Le mode de scrutin et nos institutions démocratiques devraient être réformés en profondeur.",
    scores: { caq: -1, plq: -1, qs: 2, pq: 0, pcq: -1 },
  },
];

const CHOICES = [
  { label: "Fortement en désaccord", value: -2 },
  { label: "En désaccord", value: -1 },
  { label: "Neutre", value: 0 },
  { label: "D'accord", value: 1 },
  { label: "Fortement d'accord", value: 2 },
];

/* ---------------------------------------------------------
   CE QUI DISTINGUE CHAQUE PARTI
   Mesures qu'un seul parti propose, à notre connaissance,
   parmi les cinq — pour repérer d'un coup d'œil ce qui les
   différencie vraiment, au-delà des grandes lignes communes.
--------------------------------------------------------- */

const EXCLUSIVE_OFFERS = {
  caq: [
    "1000 $ versés dans un régime d'épargne-études pour chaque nouveau-né",
    "Maintient la structure Santé Québec, alors que le PQ veut l'abolir et le PCQ la critique vivement",
  ],
  plq: [
    "Télésanté publique universelle et sans rendez-vous",
    "Report d'impôt sur les gains en capital (jusqu'à 1 M$) pour qui réinvestit dans la construction de logements",
    "Cible la plus élevée des cinq partis : 100 000 logements construits par année",
  ],
  qs: [
    "Réseau d'épiceries publiques à but non lucratif pour faire baisser le prix du panier d'épicerie",
    "Contrôle des loyers (gel à l'inflation, puis réforme du calcul des hausses)",
    "Assemblée constituante co-construite avec les Premiers Peuples",
    "Contraception et produits d'hygiène menstruelle gratuits",
  ],
  pq: [
    "Seul parti à promettre un référendum sur l'indépendance dans un premier mandat (mais pas avant 2029, tant que Donald Trump est président)",
    "« Livre bleu sur l'indépendance » : 551 pages sur les mécanismes d'un Québec souverain, le document le plus étoffé sur la question",
  ],
  pcq: [
    "Assurance privée duplicative en santé, avec le principe où « l'argent suit le patient »",
    "Seul parti à vouloir abroger la loi qui interdit l'exploration du gaz de schiste",
    "Seul parti à vouloir retirer le Québec du marché du carbone (SPEDE)",
    "17 tables régionales avec un pouvoir réel sur l'immigration, les ressources naturelles et le développement économique",
  ],
};

const SHARED_SURPRISES = [
  "Le PQ et le PCQ proposent tous les deux d'abolir la TVQ sur les biens usagés (autos, meubles, électroménagers) — deux partis autrement très différents, même idée.",
  "Le PLQ et le PCQ veulent tous les deux impliquer davantage les régions dans les décisions sur l'immigration, chacun avec son propre mécanisme.",
];

/* --------------------------------------------------------- */

function Tag({ children, color }) {
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 12.5,
        fontWeight: 600,
        color,
        border: `1px solid ${color}55`,
        background: `${color}14`,
        borderRadius: 4,
        padding: "3px 8px",
        letterSpacing: 0.2,
      }}
    >
      {children}
    </span>
  );
}

function PartyCard({ party, expanded, onToggle, wide }) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: 3,
        borderLeft: `4px solid ${party.color}`,
        boxShadow: "0 1px 2px rgba(27,34,48,0.08)",
        marginBottom: 14,
        overflow: "hidden",
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          textAlign: "left",
          background: "none",
          border: "none",
          padding: "16px 16px 14px",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontFamily: "Georgia, serif", fontSize: 19, color: "#1B2230", fontWeight: 700 }}>
            {party.name}
          </span>
          <span style={{ fontSize: 20, color: "#8A8578", transform: expanded ? "rotate(180deg)" : "none", transition: "transform .2s" }}>
            ⌄
          </span>
        </div>
        <div style={{ fontSize: 13.5, color: "#5B5648" }}>
          Chef·fe : {party.leader}
        </div>
        <div style={{ fontSize: 14.5, color: "#3A3A34", lineHeight: 1.5, marginTop: 2 }}>
          {party.tagline}
        </div>
        <div style={{ marginTop: 4 }}>
          <Tag color={party.color}>{party.ideologie}</Tag>
        </div>
      </button>

      {expanded && (
        <div style={{ padding: wide ? "4px 22px 22px" : "4px 16px 18px", borderTop: "1px solid #EFEDE3" }}>
          <div
            style={{
              display: wide ? "grid" : "block",
              gridTemplateColumns: wide ? "1fr 1fr" : undefined,
              columnGap: 26,
            }}
          >
            {Object.entries(THEME_LABELS).map(([key, label]) => (
              <div key={key} style={{ padding: "12px 0", borderBottom: "1px solid #F1EFE6" }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: party.color, marginBottom: 4 }}>
                  {label}
                </div>
                <div style={{ fontSize: 14.5, color: "#3A3A34", lineHeight: 1.55 }}>
                  {party.themes[key]}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 6, padding: "13px 14px", background: "#FBF9F3", borderRadius: 3, border: "1px solid #EFEDE3" }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "#5B5648", marginBottom: 5, display: "flex", alignItems: "center", gap: 6 }}>
              <span>⚖</span> Regard critique — réalisme et questions soulevées
            </div>
            <div style={{ fontSize: 14, color: "#3A3A34", lineHeight: 1.55 }}>
              {party.critique}
            </div>
          </div>

          {party.sources && (
            <div style={{ marginTop: 10, padding: "12px 14px", background: "#FFFFFF", borderRadius: 3, border: "1px dashed #D9D5C7" }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "#5B5648", marginBottom: 5, display: "flex", alignItems: "center", gap: 6 }}>
                <span>🔗</span> Sources (site du parti)
              </div>
              {party.sourceNote && (
                <div style={{ fontSize: 13, color: "#5B5648", lineHeight: 1.5, marginBottom: 8 }}>
                  {party.sourceNote}
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {party.sources.map((s, i) => (
                  <a
                    key={i}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 13.5, color: "#2F6B52", fontWeight: 600, textDecoration: "none", lineHeight: 1.4 }}
                  >
                    ↗ {s.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FichesView() {
  const [openId, setOpenId] = useState(null);
  const wide = useIsWide();
  return (
    <div style={{ maxWidth: wide ? 900 : undefined }}>
      <p style={{ fontSize: 14.5, color: "#5B5648", lineHeight: 1.6, margin: "4px 0 18px" }}>
        {wide ? "Cliquez" : "Touchez"} un parti pour voir ses engagements, enjeu par enjeu, résumés en langage simple.
      </p>
      {PARTIES.map((p) => (
        <PartyCard
          key={p.id}
          party={p}
          wide={wide}
          expanded={openId === p.id}
          onToggle={() => setOpenId(openId === p.id ? null : p.id)}
        />
      ))}
    </div>
  );
}

function CompareView() {
  const themeKeys = [...Object.keys(THEME_LABELS), "critique"];
  const [theme, setTheme] = useState(themeKeys[0]);
  const wide = useIsWide();

  return (
    <div>
      <p style={{ fontSize: 14.5, color: "#5B5648", lineHeight: 1.6, margin: "4px 0 14px" }}>
        Choisissez un enjeu pour voir, côte à côte, ce que propose chaque parti.
      </p>
      <div
        style={{
          display: "flex",
          flexWrap: wide ? "wrap" : "nowrap",
          gap: 8,
          overflowX: wide ? "visible" : "auto",
          paddingBottom: 6,
          marginBottom: 16,
        }}
      >
        {themeKeys.map((k) => (
          <button
            key={k}
            onClick={() => setTheme(k)}
            style={{
              flex: "0 0 auto",
              padding: "8px 13px",
              borderRadius: 20,
              border: theme === k ? "1px solid #2F6B52" : "1px solid #D9D5C7",
              background: theme === k ? "#2F6B52" : "#FFFFFF",
              color: theme === k ? "#FFFFFF" : "#3A3A34",
              fontSize: 13.5,
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {k === "critique" ? "⚖ Regard critique" : THEME_LABELS[k]}
          </button>
        ))}
      </div>

      <div
        style={{
          display: wide ? "grid" : "block",
          gridTemplateColumns: wide ? "repeat(auto-fit, minmax(185px, 1fr))" : undefined,
          gap: wide ? 12 : 0,
          alignItems: "stretch",
        }}
      >
        {PARTIES.map((p) => (
          <div
            key={p.id}
            style={{
              background: theme === "critique" ? "#FBF9F3" : "#FFFFFF",
              borderTop: wide ? `4px solid ${p.color}` : "none",
              borderLeft: wide ? "1px solid #EFEDE3" : `4px solid ${p.color}`,
              borderRight: wide ? "1px solid #EFEDE3" : "none",
              borderBottom: wide ? "1px solid #EFEDE3" : "none",
              borderRadius: 3,
              boxShadow: "0 1px 2px rgba(27,34,48,0.08)",
              padding: "13px 15px",
              marginBottom: wide ? 0 : 10,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: 6,
                marginBottom: 6,
                paddingBottom: 6,
                borderBottom: "1px solid #EFEDE3",
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 15, color: p.color }}>{p.short}</span>
              <span style={{ fontSize: 11.5, color: "#8A8578", textAlign: "right" }}>{p.name}</span>
            </div>
            <div style={{ fontSize: wide ? 13.5 : 14.5, color: "#3A3A34", lineHeight: 1.55 }}>
              {theme === "critique" ? p.critique : p.themes[theme]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuizView() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(Array(QUESTIONS.length).fill(null));
  const [done, setDone] = useState(false);
  const wide = useIsWide();

  // Le test se lit mieux en colonne étroite, même sur grand écran.
  const shell = { maxWidth: 620, margin: wide ? "0 auto" : undefined };

  const results = useMemo(() => {
    if (!done) return [];
    const totals = {};
    PARTIES.forEach((p) => (totals[p.id] = 0));
    QUESTIONS.forEach((q, i) => {
      const userVal = answers[i] ?? 0;
      PARTIES.forEach((p) => {
        const diff = Math.abs(userVal - q.scores[p.id]);
        totals[p.id] += 4 - diff; // 0..4 per question
      });
    });
    const max = QUESTIONS.length * 4;
    return PARTIES
      .map((p) => ({ ...p, pct: Math.round((totals[p.id] / max) * 100) }))
      .sort((a, b) => b.pct - a.pct);
  }, [done, answers]);

  const choose = (value) => {
    const next = [...answers];
    next[step] = value;
    setAnswers(next);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setDone(true);
    }
  };

  const restart = () => {
    setAnswers(Array(QUESTIONS.length).fill(null));
    setStep(0);
    setDone(false);
  };

  if (done) {
    const top = results[0];
    return (
      <div style={shell}>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: 21, color: "#1B2230", margin: "6px 0 4px" }}>
          Vos résultats
        </h2>
        <p style={{ fontSize: 14, color: "#5B5648", marginBottom: 18, lineHeight: 1.55 }}>
          D'après vos réponses, voici le degré de correspondance avec chaque parti. Ceci est un outil de
          réflexion rapide, construit à partir de mes propres estimations des positions des partis — pas
          une recommandation de vote, ni un outil aussi rigoureux que la{" "}
          <a href="https://boussole.radio-canada.ca/" target="_blank" rel="noopener noreferrer" style={{ color: "#2F6B52" }}>
            Boussole électorale officielle
          </a>.
        </p>
        {results.map((p, i) => (
          <div key={p.id} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14.5, marginBottom: 5 }}>
              <span style={{ fontWeight: 700, color: "#1B2230" }}>
                {i === 0 ? "🏆 " : ""}
                {p.name}
              </span>
              <span style={{ fontWeight: 700, color: p.color }}>{p.pct}%</span>
            </div>
            <div style={{ height: 10, background: "#EFEDE3", borderRadius: 5, overflow: "hidden" }}>
              <div
                style={{
                  width: `${p.pct}%`,
                  height: "100%",
                  background: p.color,
                  borderRadius: 5,
                  transition: "width .5s ease",
                }}
              />
            </div>
          </div>
        ))}
        <div
          style={{
            marginTop: 20,
            padding: "14px 15px",
            background: "#FFFFFF",
            borderLeft: `4px solid ${top.color}`,
            borderRadius: 3,
            boxShadow: "0 1px 2px rgba(27,34,48,0.08)",
          }}
        >
          <div style={{ fontSize: 13, color: "#8A8578", marginBottom: 3 }}>Votre plus forte correspondance</div>
          <div style={{ fontWeight: 700, fontSize: 16, color: "#1B2230", marginBottom: 4 }}>{top.name}</div>
          <div style={{ fontSize: 14, color: "#3A3A34", lineHeight: 1.5 }}>{top.tagline}</div>
        </div>
        <button
          onClick={restart}
          style={{
            marginTop: 18,
            width: "100%",
            padding: "12px",
            background: "#1B2230",
            color: "#FFFFFF",
            border: "none",
            borderRadius: 3,
            fontSize: 14.5,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Refaire le test
        </button>
      </div>
    );
  }

  return (
    <div style={shell}>
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #D9D5C7",
          borderRadius: 4,
          padding: "15px 16px",
          marginBottom: 18,
        }}
      >
        <div style={{ fontSize: 12.5, fontWeight: 700, color: "#5B5648", marginBottom: 6 }}>
          Outil officiel
        </div>
        <p style={{ fontSize: 14, color: "#3A3A34", lineHeight: 1.55, margin: "0 0 10px" }}>
          La <strong>Boussole électorale</strong> de Radio-Canada, conçue par des politologues et
          Vox Pop Labs, est un outil plus rigoureux et plus détaillé (dizaines de questions, positions
          confirmées en partie par les partis eux-mêmes).
        </p>
        <a
          href="https://boussole.radio-canada.ca/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            padding: "10px 16px",
            background: "#1B2230",
            color: "#FFFFFF",
            borderRadius: 3,
            fontSize: 13.5,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Faire la vraie Boussole électorale ↗
        </a>
      </div>

      <div style={{ fontSize: 12.5, fontWeight: 700, color: "#8A8578", marginBottom: 4, letterSpacing: 0.3 }}>
        OU — LE TEST RAPIDE DE POURQUOI JE VOTE
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, marginTop: 8 }}>
        <div style={{ flex: 1, height: 6, background: "#EFEDE3", borderRadius: 3, overflow: "hidden" }}>
          <div
            style={{
              width: `${(step / QUESTIONS.length) * 100}%`,
              height: "100%",
              background: "#2F6B52",
              transition: "width .3s ease",
            }}
          />
        </div>
        <span style={{ fontSize: 12.5, color: "#8A8578", whiteSpace: "nowrap" }}>
          {step + 1} / {QUESTIONS.length}
        </span>
      </div>

      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 4,
          padding: "20px 17px",
          boxShadow: "0 1px 2px rgba(27,34,48,0.08)",
          marginBottom: 16,
        }}
      >
        <p style={{ fontFamily: "Georgia, serif", fontSize: 18, lineHeight: 1.45, color: "#1B2230", margin: 0 }}>
          {QUESTIONS[step].text}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {CHOICES.map((c) => (
          <button
            key={c.value}
            onClick={() => choose(c.value)}
            style={{
              padding: "13px 15px",
              textAlign: "left",
              background: "#FFFFFF",
              border: "1px solid #D9D5C7",
              borderRadius: 3,
              fontSize: 14.5,
              color: "#1B2230",
              cursor: "pointer",
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {step > 0 && (
        <button
          onClick={() => setStep(step - 1)}
          style={{
            marginTop: 14,
            background: "none",
            border: "none",
            color: "#8A8578",
            fontSize: 13.5,
            cursor: "pointer",
            padding: 0,
          }}
        >
          ← Question précédente
        </button>
      )}
    </div>
  );
}

function DistinctionsView() {
  const wide = useIsWide();
  return (
    <div>
      <p style={{ fontSize: 14.5, color: "#5B5648", lineHeight: 1.6, margin: "4px 0 18px" }}>
        Ce que chaque parti propose que les quatre autres n'offrent pas — pour voir d'un coup d'œil ce
        qui les distingue vraiment, au-delà des grandes lignes communes.
      </p>

      <div
        style={{
          display: wide ? "grid" : "block",
          gridTemplateColumns: wide ? "1fr 1fr" : undefined,
          gap: wide ? 14 : 0,
          alignItems: "start",
        }}
      >
      {PARTIES.map((p) => (
        <div
          key={p.id}
          style={{
            background: "#FFFFFF",
            borderRadius: 4,
            boxShadow: "0 1px 2px rgba(27,34,48,0.08)",
            marginBottom: wide ? 0 : 14,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: p.color,
              padding: "10px 15px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ color: "#FFFFFF", fontWeight: 700, fontSize: 15 }}>{p.short}</span>
            <span style={{ color: "#FFFFFFcc", fontSize: 12.5 }}>{p.name}</span>
          </div>
          <div style={{ padding: "13px 15px" }}>
            {EXCLUSIVE_OFFERS[p.id].map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 9,
                  alignItems: "flex-start",
                  padding: "8px 0",
                  borderBottom: i < EXCLUSIVE_OFFERS[p.id].length - 1 ? "1px solid #F1EFE6" : "none",
                }}
              >
                <span
                  style={{
                    flex: "0 0 auto",
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: p.color,
                    border: `1px solid ${p.color}55`,
                    background: `${p.color}14`,
                    borderRadius: 3,
                    padding: "2px 6px",
                    marginTop: 1,
                    letterSpacing: 0.2,
                    whiteSpace: "nowrap",
                  }}
                >
                  EXCLUSIF
                </span>
                <span style={{ fontSize: 14, color: "#3A3A34", lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
      </div>

      <div
        style={{
          marginTop: 18,
          padding: "14px 15px",
          background: "#FBF9F3",
          borderRadius: 3,
          border: "1px solid #EFEDE3",
        }}
      >
        <div style={{ fontSize: 12.5, fontWeight: 700, color: "#5B5648", marginBottom: 8 }}>
          ✨ Points communs surprenants
        </div>
        {SHARED_SURPRISES.map((s, i) => (
          <p key={i} style={{ fontSize: 14, color: "#3A3A34", lineHeight: 1.55, margin: i === 0 ? "0 0 8px" : 0 }}>
            {s}
          </p>
        ))}
      </div>
    </div>
  );
}

function SearchView({ query, onClear }) {
  const wide = useIsWide();
  const q = norm(query);

  const results = PARTIES.map((p) => {
    const hits = [];
    Object.entries(THEME_LABELS).forEach(([key, label]) => {
      if (norm(label).includes(q) || norm(p.themes[key]).includes(q)) {
        hits.push({ label, text: p.themes[key] });
      }
    });
    const critiqueHit =
      norm(p.critique).includes(q) || norm(p.tagline).includes(q) || norm(p.ideologie).includes(q);
    return { p, hits, critiqueHit };
  });
  const totalHits = results.reduce((n, r) => n + r.hits.length + (r.critiqueHit ? 1 : 0), 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, margin: "2px 0 16px" }}>
        <p style={{ fontSize: 14.5, color: "#5B5648", lineHeight: 1.55, margin: 0 }}>
          {totalHits > 0 ? (
            <>Ce que dit chaque parti sur <strong style={{ color: "#1B2230" }}>«&nbsp;{query.trim()}&nbsp;»</strong>.</>
          ) : (
            <>Aucun parti ne mentionne <strong style={{ color: "#1B2230" }}>«&nbsp;{query.trim()}&nbsp;»</strong> dans les résumés du site.</>
          )}
        </p>
        <button
          onClick={onClear}
          style={{ flex: "0 0 auto", background: "none", border: "none", color: "#2F6B52", fontSize: 13.5, fontWeight: 600, cursor: "pointer", padding: 0 }}
        >
          ✕ effacer
        </button>
      </div>

      <div
        style={{
          display: wide ? "grid" : "block",
          gridTemplateColumns: wide ? "1fr 1fr" : undefined,
          gap: wide ? 14 : 0,
          alignItems: "start",
        }}
      >
        {results.map(({ p, hits, critiqueHit }) => {
          const empty = hits.length === 0 && !critiqueHit;
          return (
            <div
              key={p.id}
              style={{
                background: "#FFFFFF",
                borderLeft: `4px solid ${p.color}`,
                borderRadius: 3,
                boxShadow: "0 1px 2px rgba(27,34,48,0.08)",
                padding: "13px 15px",
                marginBottom: wide ? 0 : 10,
                opacity: empty ? 0.72 : 1,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: 6,
                  marginBottom: empty ? 0 : 8,
                  paddingBottom: 6,
                  borderBottom: "1px solid #EFEDE3",
                }}
              >
                <span style={{ fontWeight: 700, fontSize: 15, color: p.color }}>{p.short}</span>
                <span style={{ fontSize: 11.5, color: "#8A8578", textAlign: "right" }}>{p.name}</span>
              </div>

              {empty ? (
                <div style={{ fontSize: 14, color: "#8A8578", fontStyle: "italic" }}>
                  Aucun résultat pour {p.name}.
                </div>
              ) : (
                <>
                  {hits.map((h, i) => (
                    <div
                      key={i}
                      style={{ padding: "9px 0", borderBottom: i < hits.length - 1 || critiqueHit ? "1px solid #F1EFE6" : "none" }}
                    >
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: p.color, marginBottom: 3 }}>{h.label}</div>
                      <div style={{ fontSize: 14, color: "#3A3A34", lineHeight: 1.55 }}>{highlight(h.text, query)}</div>
                    </div>
                  ))}
                  {critiqueHit && (
                    <div style={{ padding: "9px 0" }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: "#5B5648", marginBottom: 3 }}>⚖ Regard critique</div>
                      <div style={{ fontSize: 14, color: "#3A3A34", lineHeight: 1.55 }}>{highlight(p.critique, query)}</div>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("fiches");
  const [query, setQuery] = useState("");
  const wide = useIsWide();
  const searching = query.trim().length >= 2;

  const TABS = [
    { id: "fiches", label: "Fiches" },
    { id: "comparer", label: "Comparateur" },
    { id: "distinctions", label: "Distinctions" },
    { id: "quiz", label: "Test de valeurs" },
  ];

  return (
    <div style={{ background: "#EFEDE3", minHeight: "100%", fontFamily: "-apple-system, 'Segoe UI', sans-serif" }}>
      <div
        style={{
          maxWidth: wide ? 1080 : 480,
          margin: "0 auto",
          padding: wide ? "36px 40px 64px" : "22px 16px 40px",
        }}
      >
        <header style={{ marginBottom: wide ? 26 : 20 }}>
          <div style={{ fontSize: 12.5, color: "#2F6B52", fontWeight: 700, letterSpacing: 0.3 }}>
            Élections générales — 5 octobre 2026
          </div>
          <h1
            style={{
              fontFamily: "Georgia, serif",
              fontSize: wide ? 40 : 30,
              color: "#1B2230",
              margin: "4px 0 6px",
              lineHeight: 1.1,
            }}
          >
            Pourquoi je vote&nbsp;?
          </h1>
          <p style={{ fontSize: 14.5, color: "#5B5648", lineHeight: 1.55, margin: 0, maxWidth: 620 }}>
            Les programmes des cinq principaux partis québécois, sans jargon. Comparez leurs engagements
            et découvrez celui qui correspond le mieux à vos valeurs.
          </p>
        </header>

        <nav
          style={{
            display: wide ? "flex" : "grid",
            gridTemplateColumns: wide ? undefined : "1fr 1fr",
            gap: 4,
            background: "#FFFFFF",
            borderRadius: 4,
            padding: 4,
            marginBottom: wide ? 26 : 20,
            boxShadow: "0 1px 2px rgba(27,34,48,0.08)",
          }}
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: wide ? "0 0 auto" : undefined,
                padding: wide ? "10px 20px" : "9px 4px",
                border: "none",
                borderRadius: 3,
                background: tab === t.id ? "#1B2230" : "transparent",
                color: tab === t.id ? "#FFFFFF" : "#5B5648",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div style={{ position: "relative", marginBottom: wide ? 26 : 20 }}>
          <span
            style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: "#8A8578", pointerEvents: "none" }}
            aria-hidden="true"
          >
            ⌕
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un enjeu ou un mot-clé (logement, gaz de schiste, impôt…)"
            aria-label="Rechercher un enjeu ou un mot-clé"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "11px 14px 11px 34px",
              fontSize: 14.5,
              fontFamily: "inherit",
              color: "#1B2230",
              background: "#FFFFFF",
              border: `1px solid ${searching ? "#2F6B52" : "#D9D5C7"}`,
              borderRadius: 4,
              boxShadow: "0 1px 2px rgba(27,34,48,0.08)",
              outline: "none",
            }}
          />
        </div>

        {searching ? (
          <SearchView query={query} onClear={() => setQuery("")} />
        ) : (
          <>
            {tab === "fiches" && <FichesView />}
            {tab === "comparer" && <CompareView />}
            {tab === "distinctions" && <DistinctionsView />}
            {tab === "quiz" && <QuizView />}
          </>
        )}

        <footer style={{ marginTop: 30, paddingTop: 16, borderTop: "1px solid #D9D5C7" }}>
          <p style={{ fontSize: 12, color: "#8A8578", lineHeight: 1.6, margin: 0, maxWidth: 720 }}>
            Résumés non partisans, à jour au 9 septembre 2026. Pour la CAQ, le PCQ, le PLQ et QS,
            compilés directement à partir des documents officiels des partis (cadre financier,
            plateforme, pages d'engagements). Pour le PQ, l'indépendance et l'immigration sont tirées
            de son site officiel (« Livre bleu », plan d'immigration, liens dans sa fiche); faute de
            plateforme détaillée ou de cadre financier publiés, les autres enjeux s'appuient sur la
            couverture de presse (Le Devoir, Radio-Canada, La Presse) et sont signalés comme tels.
            Le « regard critique » reflète des questions et réserves relevées par des journalistes,
            économistes et experts cités dans la presse, ou par les documents officiels des partis
            eux-mêmes — pas une opinion de cet outil. Les plateformes complètes ne sont pas toutes
            finalisées et peuvent évoluer avant le scrutin du 5 octobre. Le test de valeurs est un
            outil de réflexion personnelle, pas une recommandation de vote.
          </p>
        </footer>
      </div>
    </div>
  );
}
