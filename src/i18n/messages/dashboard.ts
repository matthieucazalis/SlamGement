import type { DeepStrings } from "./types";

const fr = {
  title: "Tableau de bord",
  statAdrs: "Décisions (ADR)",
  statMembers: "Membres",
  statTasks: "Tâches",
  statOverdue: "Tâches en retard",
  adrByStatus: "ADR par statut",
  noAdr: "Aucun ADR pour l'instant.",
  tasksByColumn: "Tâches par colonne",
  noTasks: "Aucune tâche pour l'instant.",
  percent: "{percent} %",
  withoutTaskTitle: "Décisions acceptées sans tâche liée",
  withoutTaskHelp:
    "Ces décisions sont acceptées, mais leur mise en œuvre n'est peut-être pas planifiée.",
  allPlanned: "Toutes les décisions acceptées ont une tâche liée.",
  recent: "Activité récente",
  fullHistory: "Tout l'historique",
  noActivity: "Aucune activité.",
};

const en: DeepStrings<typeof fr> = {
  title: "Dashboard",
  statAdrs: "Decisions (ADR)",
  statMembers: "Members",
  statTasks: "Tasks",
  statOverdue: "Overdue tasks",
  adrByStatus: "ADRs by status",
  noAdr: "No ADR yet.",
  tasksByColumn: "Tasks by column",
  noTasks: "No task yet.",
  percent: "{percent}%",
  withoutTaskTitle: "Accepted decisions without a linked task",
  withoutTaskHelp:
    "These decisions are accepted, but their implementation may not be planned yet.",
  allPlanned: "Every accepted decision has a linked task.",
  recent: "Recent activity",
  fullHistory: "Full history",
  noActivity: "No activity.",
};

const de: DeepStrings<typeof fr> = {
  title: "Dashboard",
  statAdrs: "Entscheidungen (ADR)",
  statMembers: "Mitglieder",
  statTasks: "Aufgaben",
  statOverdue: "Überfällige Aufgaben",
  adrByStatus: "ADRs nach Status",
  noAdr: "Noch kein ADR.",
  tasksByColumn: "Aufgaben nach Spalte",
  noTasks: "Noch keine Aufgabe.",
  percent: "{percent} %",
  withoutTaskTitle: "Akzeptierte Entscheidungen ohne verknüpfte Aufgabe",
  withoutTaskHelp:
    "Diese Entscheidungen sind akzeptiert, ihre Umsetzung ist aber möglicherweise noch nicht geplant.",
  allPlanned: "Jede akzeptierte Entscheidung hat eine verknüpfte Aufgabe.",
  recent: "Letzte Aktivitäten",
  fullHistory: "Gesamter Verlauf",
  noActivity: "Keine Aktivität.",
};

export const dashboard = { fr, en, de };
