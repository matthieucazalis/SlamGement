import { apiJson, withUser } from "@/lib/api";
import { getProjectForUser } from "@/services/project.service";

export const GET = withUser<{ id: string }>(async ({ userId, params }) => {
  const { project, role } = await getProjectForUser(userId, params.id);
  return apiJson({
    id: project.id,
    name: project.name,
    description: project.description,
    role,
  });
});
