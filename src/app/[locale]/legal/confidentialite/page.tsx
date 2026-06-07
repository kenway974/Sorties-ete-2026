import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Comment ParisSorties collecte et protège vos données personnelles (RGPD).",
  robots: { index: true, follow: true },
};

export default function ConfidentialitePage() {
  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Politique de confidentialité</h1>
      <p className="text-sm text-gray-400">Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}</p>
      <p>
        La présente politique décrit comment <strong>ParisSorties</strong> traite vos données personnelles,
        conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés.
      </p>

      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 pt-4">1. Responsable du traitement</h2>
      <p>[À COMPLÉTER : Nom / Raison sociale] — contact : [À COMPLÉTER : email].</p>

      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 pt-4">2. Données collectées</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li><strong>Compte</strong> : adresse email, pseudo, mot de passe (chiffré), avatar et bio facultatifs.</li>
        <li><strong>Activité</strong> : favoris, inscriptions, intérêts (« J&apos;y vais »), avis, collections, activités proposées.</li>
        <li><strong>Notifications push</strong> : identifiant d&apos;abonnement technique (si vous les activez).</li>
        <li><strong>Données techniques</strong> : statistiques de fréquentation anonymisées (Vercel Analytics, sans cookie).</li>
      </ul>

      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 pt-4">3. Finalités et bases légales</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li>Fournir le service (compte, favoris, collections) — <em>exécution du contrat</em>.</li>
        <li>Vous envoyer des rappels d&apos;activités — <em>votre consentement</em> (révocable à tout moment).</li>
        <li>Améliorer le site via des statistiques anonymes — <em>intérêt légitime</em>.</li>
      </ul>

      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 pt-4">4. Durée de conservation</h2>
      <p>
        Vos données sont conservées tant que votre compte est actif. En cas de suppression de compte,
        elles sont effacées sous 30 jours, sauf obligation légale de conservation.
      </p>

      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 pt-4">5. Destinataires</h2>
      <p>
        Vos données ne sont jamais vendues. Elles sont traitées par nos sous-traitants techniques :
        <strong> Supabase</strong> (base de données / authentification, hébergement UE) et <strong>Vercel</strong> (hébergement).
      </p>

      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 pt-4">6. Vos droits</h2>
      <p>
        Vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement, de limitation, d&apos;opposition et de
        portabilité de vos données. Pour les exercer : [À COMPLÉTER : email]. Vous pouvez aussi introduire une
        réclamation auprès de la <a className="text-brand-navy dark:text-brand-gold underline" href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">CNIL</a>.
      </p>

      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 pt-4">7. Cookies</h2>
      <p>
        ParisSorties utilise uniquement des cookies <strong>strictement nécessaires</strong> au fonctionnement
        (session d&apos;authentification). La mesure d&apos;audience est réalisée sans cookie et de façon anonyme.
        Aucun cookie publicitaire ou de pistage tiers n&apos;est déposé.
      </p>
    </>
  );
}