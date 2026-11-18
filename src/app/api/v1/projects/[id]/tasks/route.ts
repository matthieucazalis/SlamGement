import { z } from "zod";
import { apiError, apiJson, withUser } from "@/lib/api";
import { serializeTask } from "@/lib/api-serializers";
import { listTasks } from "@/services/task.service";

const query = z.object({
  assignee: z.string().max(40).optional(),
  q: z.string().trim().max(100).optional(),
});

export const GET = withUser<{ id: string }>(
  async ({ userId, params, request }) => {
    const parsed = query.safeParse(
      Object.fromEntries(new URL(request.url).searchParams),
    );
    if (!parsed.success)
      return apiError(400, "invalid_query", "Invalid query parameters.");

    const tasks = await listTasks(userId, params.id, {
      assigneeId: parsed.data.assignee,
      search: parsed.data.q,
    });
    return apiJson({ data: tasks.map(serializeTask) });
  },
);
