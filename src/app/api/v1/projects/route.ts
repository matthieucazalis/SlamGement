import { apiJson, withUser } from "@/lib/api";
import { listProjectsForUser } from "@/services/project.service";

export const GET = withUser(async ({ userId }) => {
  const memberships = await listProjectsForUser(userId);
  return apiJson({
    data: memberships.map(({ project, role }) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      role,
    })),
  });
});
