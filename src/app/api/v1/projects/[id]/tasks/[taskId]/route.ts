import { z } from "zod";
import { apiError, apiJson, badBody, readJson, withUser } from "@/lib/api";
import { TASK_STATUSES } from "@/lib/task-status";
import { moveTask } from "@/services/task.service";

const body = z.object({ status: z.enum(TASK_STATUSES) });

// Déplace une carte du Kanban (ex. « À faire » → « En cours »)
export const PATCH = withUser<{ id: string; taskId: string }>(
  async ({ userId, params, request }) => {
    const raw = await readJson(request, 500);
    if (!raw.ok) return badBody(raw.reason);
    const parsed = body.safeParse(raw.data);
    if (!parsed.success) return apiError(422, "validation", "Invalid status.");

    const task = await moveTask(
      userId,
      params.id,
      params.taskId,
      parsed.data.status,
    );
    return apiJson({ id: task.id, status: task.status });
  },
);
