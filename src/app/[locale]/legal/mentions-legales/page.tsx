import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales de Hors-Piste.",
  robots: { index: true, follow: true },
};

export default function MentionsLegalesPage() {
  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Mentions légales</h1>
      <p className="text-sm text-gray-400">Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}</p>

      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 pt-4">1. Éditeur du site</h2>
      <p>
        Le site <strong>Hors-Piste</strong> est édité par :<br />
        <strong>Kenny Pignolet</strong><br />
        Entrepreneur individuel (micro-entreprise)<br />
        SIRET : 898 371 513 00034<br />
        Adresse : Rue Béatrice, 94240 L&apos;Haÿ-les-Roses, France<br />
        Email : tikenspam2@gmail.com<br />
      </p>

      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 pt-4">2. Directeur de la publication</h2>
      <p>Kenny Pignolet</p>

      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 pt-4">3. Hébergeur</h2>
      <p>
        Le site est hébergé par <strong>Vercel Inc.</strong><br />
        340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis — vercel.com<br />
        Base de données et authentification : <strong>Supabase</strong> (hébergement Union Européenne — Irlande).
      </p>

      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 pt-4">4. Propriété intellectuelle</h2>
      <p>
        La structure du site, son design et ses contenus originaux sont protégés par le droit d&apos;auteur.
        Les informations relatives aux événements proviennent notamment de la plateforme open data
        « Que faire à Paris ? » de la Ville de Paris, réutilisées sous licence ouverte (Open Database License / Licence Ouverte).
        Les marques et logos de tiers restent la propriété de leurs détenteurs respectifs.
      </p>

      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 pt-4">5. Données personnelles</h2>
      <p>
        Le traitement de vos données est décrit dans notre <a className="text-brand-navy dark:text-brand-gold underline" href="confidentialite">Politique de confidentialité</a>.
      </p>

      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 pt-4">6. Contact</h2>
      <p>Pour toute question : tikenspam2@gmail.com</p>
    </>
  );
}