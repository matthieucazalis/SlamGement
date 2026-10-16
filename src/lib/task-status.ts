export const TASK_STATUSES = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"] as const;

export type TaskStatusValue = (typeof TASK_STATUSES)[number];

export const TASK_STATUS_LABELS: Record<TaskStatusValue, string> = {
  TODO: "À faire",
  IN_PROGRESS: "En cours",
  REVIEW: "Revue",
  DONE: "Terminé",
};

export function previousStatus(
  status: TaskStatusValue,
): TaskStatusValue | null {
  const i = TASK_STATUSES.indexOf(status);
  return i > 0 ? TASK_STATUSES[i - 1] : null;
}

export function nextStatus(status: TaskStatusValue): TaskStatusValue | null {
  const i = TASK_STATUSES.indexOf(status);
  return i < TASK_STATUSES.length - 1 ? TASK_STATUSES[i + 1] : null;
}

// Les échéances sont stockées à minuit UTC (une date, sans heure).
// Une tâche est en retard si cette date est passée et qu'elle n'est pas terminée.
export function isOverdue(
  dueDate: Date | null,
  status: TaskStatusValue,
  now: Date = new Date(),
) {
  if (!dueDate || status === "DONE") return false;
  const startOfToday = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  return dueDate.getTime() < startOfToday;
}
