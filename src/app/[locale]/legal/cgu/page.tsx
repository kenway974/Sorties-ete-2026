import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation",
  description: "Conditions générales d'utilisation de MoodMap.",
  robots: { index: true, follow: true },
};

export default function CGUPage() {
  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Conditions générales d&apos;utilisation</h1>
      <p className="text-sm text-gray-400">Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}</p>

      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 pt-4">1. Objet</h2>
      <p>
        MoodMap est une plateforme gratuite de découverte d&apos;activités, événements et sorties à Paris
        et en Île-de-France. Les présentes CGU régissent l&apos;utilisation du service.
      </p>

      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 pt-4">2. Accès au service</h2>
      <p>
        L&apos;accès est libre et gratuit. La consultation des activités ne nécessite pas de compte. Certaines
        fonctionnalités (favoris, collections, proposition d&apos;activités, avis) requièrent une inscription.
      </p>

      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 pt-4">3. Compte utilisateur</h2>
      <p>
        Vous êtes responsable de la confidentialité de vos identifiants et de l&apos;exactitude des informations
        fournies. Vous vous engagez à ne pas usurper l&apos;identité d&apos;un tiers.
      </p>

      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 pt-4">4. Contenus publiés par les utilisateurs</h2>
      <p>
        Vous restez responsable des contenus que vous publiez (activités proposées, avis, collections). Vous vous
        engagez à ne pas publier de contenu illicite, diffamatoire, trompeur ou contraire aux bonnes mœurs.
        Tout contenu peut être signalé et fait l&apos;objet d&apos;une modération. Nous nous réservons le droit de
        retirer tout contenu non conforme.
      </p>

      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 pt-4">5. Données des événements</h2>
      <p>
        Une partie des activités provient de sources publiques (open data Ville de Paris). Malgré nos efforts,
        MoodMap ne garantit pas l&apos;exactitude, l&apos;exhaustivité ou la disponibilité des événements. Vérifiez
        toujours les informations (date, lieu, prix) auprès de l&apos;organisateur avant de vous déplacer.
      </p>

      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 pt-4">6. Responsabilité</h2>
      <p>
        MoodMap agit en tant qu&apos;intermédiaire de découverte et ne saurait être tenu responsable du
        déroulement des événements, ni des relations entre utilisateurs et organisateurs.
      </p>

      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 pt-4">7. Propriété intellectuelle</h2>
      <p>
        En publiant un contenu, vous concédez à MoodMap une licence non exclusive d&apos;affichage de ce contenu
        sur la plateforme, dans le seul but de fournir le service.
      </p>

      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 pt-4">8. Modification des CGU</h2>
      <p>
        MoodMap peut modifier les présentes CGU à tout moment. La version applicable est celle en vigueur
        lors de votre utilisation du service.
      </p>

      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 pt-4">9. Contact</h2>
      <p>tikenspam2@gmail.com</p>
    </>
  );
}