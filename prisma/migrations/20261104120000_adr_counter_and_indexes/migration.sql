-- Compteur d'ADR par projet : un numéro d'ADR n'est jamais réattribué,
-- même si le dernier ADR a été supprimé (les fichiers .md exportés et les
-- liens des dépôts Git continuent de pointer vers le bon ADR).
ALTER TABLE "Project" ADD COLUMN "adrCounter" INTEGER NOT NULL DEFAULT 0;

UPDATE "Project" p
SET "adrCounter" = COALESCE(
  (SELECT MAX(a."number") FROM "Adr" a WHERE a."projectId" = p."id"),
  0
);

-- Index sur les clés étrangères les plus filtrées
CREATE INDEX "Invitation_projectId_idx" ON "Invitation"("projectId");
CREATE INDEX "Task_adrId_idx" ON "Task"("adrId");
CREATE INDEX "Task_assigneeId_idx" ON "Task"("assigneeId");
