// Jeu de démonstration : `npm run db:seed`
// Relançable à volonté : le projet de démonstration est recréé à chaque fois.
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const PASSWORD = "Demo-SlamGement-1";
const PROJECT_NAME = "SlamGement (démonstration)";
const DAY = 24 * 60 * 60 * 1000;

const daysFromNow = (n: number) => {
  const d = new Date();
  // les échéances sont stockées à minuit UTC (une date, sans heure)
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + n),
  );
};
const hoursAgo = (n: number) => new Date(Date.now() - n * 60 * 60 * 1000);

async function main() {
  // --- nettoyage d'une exécution précédente ---
  await prisma.project.deleteMany({ where: { name: PROJECT_NAME } });
  const emails = ["alice", "bruno", "chloe"].map((n) => `${n}@slamgement.test`);
  const old = await prisma.user.findMany({
    where: { email: { in: emails } },
    select: { id: true },
  });
  const oldIds = old.map((u) => u.id);
  await prisma.auditLog.deleteMany({ where: { userId: { in: oldIds } } });
  await prisma.user.deleteMany({ where: { id: { in: oldIds } } });

  // --- comptes ---
  const passwordHash = await bcrypt.hash(PASSWORD, 12);
  const [alice, bruno, chloe] = await Promise.all(
    [
      ["Alice Martin", emails[0]],
      ["Bruno Lefèvre", emails[1]],
      ["Chloé Durand", emails[2]],
    ].map(([name, email]) =>
      prisma.user.create({ data: { name, email, passwordHash } }),
    ),
  );

  // --- projet et membres ---
  const project = await prisma.project.create({
    data: {
      name: PROJECT_NAME,
      description:
        "Projet fictif pour la soutenance : décisions d'architecture et tâches de SlamGement.",
      adrCounter: 6,
      memberships: {
        create: [
          { userId: alice.id, role: "ADMIN" },
          { userId: bruno.id, role: "MEMBER" },
          { userId: chloe.id, role: "MEMBER" },
        ],
      },
    },
  });
  const projectId = project.id;

  // --- ADR ---
  const adr = (
    number: number,
    authorId: string,
    title: string,
    status: "PROPOSED" | "ACCEPTED" | "REJECTED" | "SUPERSEDED",
    context: string,
    decision: string,
    consequences: string,
    extra: { alternatives?: string; mermaidCode?: string } = {},
  ) =>
    prisma.adr.create({
      data: {
        projectId,
        number,
        authorId,
        title,
        status,
        context,
        decision,
        consequences,
        ...extra,
        createdAt: new Date(Date.now() - (14 - number) * DAY),
      },
    });

  const adr1 = await adr(
    1,
    bruno.id,
    "Stocker les sessions en base de données",
    "SUPERSEDED",
    "Il faut identifier l'utilisateur d'une requête à l'autre.",
    "Les sessions sont stockées dans une table `Session` de PostgreSQL.",
    "Une lecture en base à chaque requête ; un adaptateur Prisma pour Auth.js.",
  );
  const adr2 = await adr(
    2,
    alice.id,
    "Sessions JWT avec Auth.js",
    "ACCEPTED",
    "Le fournisseur *Credentials* d'Auth.js impose des sessions **JWT**.\n\nNotre modèle `User` porte déjà `passwordHash`.",
    "Sessions JWT signées, durée de 8 heures, aucune table de session.",
    "- Pas de lecture en base pour authentifier une requête.\n- Une session ne peut pas être révoquée avant son expiration.",
    { alternatives: "Sessions en base (voir ADR-0001) : abandonné." },
  );
  await prisma.adr.update({
    where: { id: adr1.id },
    data: { supersededById: adr2.id },
  });
  const adr3 = await adr(
    3,
    alice.id,
    "PostgreSQL comme base de données",
    "ACCEPTED",
    "Les données sont **relationnelles** : projets, membres, décisions, tâches.",
    "PostgreSQL 16, accédé avec Prisma.",
    "Une base à héberger et à sauvegarder ; migrations versionnées avec Prisma.",
    {
      alternatives: "MongoDB : voir ADR-0005.",
      mermaidCode:
        "graph TD\n  A[Navigateur] --> B[Next.js]\n  B --> C[Services]\n  C --> D[(PostgreSQL)]",
    },
  );
  const adr4 = await adr(
    4,
    chloe.id,
    "Drag and drop du Kanban avec dnd-kit",
    "PROPOSED",
    "Les cartes se déplacent aujourd'hui avec des boutons.",
    "Ajouter le glisser-déposer avec dnd-kit, boutons conservés pour l'accessibilité.",
    "Une dépendance de plus ; plus de tests d'interface à écrire.",
  );
  await adr(
    5,
    bruno.id,
    "Utiliser MongoDB",
    "REJECTED",
    "Une base documentaire simplifierait le stockage des ADR.",
    "Utiliser MongoDB pour toutes les données.",
    "Perte des contraintes d'intégrité entre projets, membres et tâches.",
  );
  await adr(
    6,
    alice.id,
    "Hébergement en conteneurs",
    "ACCEPTED",
    "Le projet doit être déployable à l'identique sur n'importe quel serveur.",
    "Image Docker de l'application et stack `docker-compose.prod.yml`.",
    "Docker devient un prérequis du serveur ; HTTPS géré par un reverse proxy.",
  );

  // --- tâches (une seule en retard) ---
  const task = (
    title: string,
    status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE",
    position: number,
    extra: {
      assigneeId?: string;
      adrId?: string;
      dueDate?: Date;
      description?: string;
    } = {},
  ) =>
    prisma.task.create({
      data: { projectId, title, status, position, ...extra },
    });

  await task("Écrire le MCD", "DONE", 0, {
    assigneeId: alice.id,
    adrId: adr3.id,
    dueDate: daysFromNow(-10),
  });
  await task("Configurer Auth.js", "REVIEW", 0, {
    assigneeId: bruno.id,
    adrId: adr2.id,
    dueDate: daysFromNow(2),
    description:
      "Fournisseur **Credentials**, sessions JWT, middleware `proxy.ts`.",
  });
  await task("Dockeriser l'application", "IN_PROGRESS", 0, {
    assigneeId: alice.id,
    dueDate: daysFromNow(5),
  });
  await task("Écrire les tests Playwright", "TODO", 0, {
    assigneeId: chloe.id,
    dueDate: daysFromNow(-3), // en retard
  });
  await task("Intégrer dnd-kit", "TODO", 1, {
    assigneeId: bruno.id,
    adrId: adr4.id,
    dueDate: daysFromNow(20),
  });
  await task("Rédiger le dossier BTS", "TODO", 2, {});

  // --- historique ---
  const log = (
    userId: string,
    action: string,
    entityType: string,
    entityId: string,
    metadata: object,
    at: Date,
  ) =>
    prisma.auditLog.create({
      data: {
        projectId,
        userId,
        action,
        entityType,
        entityId,
        metadata,
        createdAt: at,
      },
    });

  await log(
    alice.id,
    "PROJECT_CREATED",
    "Project",
    projectId,
    { name: PROJECT_NAME },
    hoursAgo(14 * 24),
  );
  await log(
    alice.id,
    "MEMBER_INVITED",
    "Invitation",
    "demo",
    { email: emails[1], role: "MEMBER" },
    hoursAgo(14 * 24 - 1),
  );
  await log(
    bruno.id,
    "MEMBER_JOINED",
    "Invitation",
    "demo",
    { role: "MEMBER" },
    hoursAgo(14 * 24 - 2),
  );
  await log(
    bruno.id,
    "ADR_CREATED",
    "Adr",
    adr1.id,
    { number: 1, title: adr1.title },
    hoursAgo(13 * 24),
  );
  await log(
    alice.id,
    "ADR_CREATED",
    "Adr",
    adr2.id,
    { number: 2, title: adr2.title },
    hoursAgo(10 * 24),
  );
  await log(
    alice.id,
    "ADR_STATUS_CHANGED",
    "Adr",
    adr2.id,
    { number: 2, from: "PROPOSED", to: "ACCEPTED" },
    hoursAgo(10 * 24 - 1),
  );
  await log(
    alice.id,
    "ADR_STATUS_CHANGED",
    "Adr",
    adr1.id,
    { number: 1, from: "ACCEPTED", to: "SUPERSEDED", supersededBy: 2 },
    hoursAgo(10 * 24 - 2),
  );
  await log(
    alice.id,
    "ADR_CREATED",
    "Adr",
    adr3.id,
    { number: 3, title: adr3.title },
    hoursAgo(9 * 24),
  );
  await log(
    chloe.id,
    "ADR_CREATED",
    "Adr",
    adr4.id,
    { number: 4, title: adr4.title },
    hoursAgo(3 * 24),
  );
  await log(
    bruno.id,
    "TASK_MOVED",
    "Task",
    "demo",
    { title: "Configurer Auth.js", from: "IN_PROGRESS", to: "REVIEW" },
    hoursAgo(5),
  );

  console.log("Jeu de démonstration créé.");
  console.log(`  Comptes : ${emails.join(", ")}`);
  console.log(`  Mot de passe : ${PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
