export const metadata = { title: "Hors ligne" };

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-bold">Tu es hors ligne</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        SlamGement a besoin d&apos;une connexion pour afficher tes projets.
        Aucune donnée n&apos;est conservée sur cet appareil.
      </p>
      {/* Lien classique voulu : on veut une vraie navigation, pas une
          transition côté client, qui échouerait sans réseau. */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a href="/projects" className="underline">
        Réessayer
      </a>
    </main>
  );
}
