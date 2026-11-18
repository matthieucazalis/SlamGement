import { apiJson, withUser } from "@/lib/api";
import { getUserById } from "@/services/user.service";

export const GET = withUser(async ({ userId }) => {
  const user = await getUserById(userId);
  return apiJson({
    id: user?.id,
    name: user?.name,
    email: user?.email,
    avatar: user?.avatar ?? null,
    createdAt: user?.createdAt,
  });
});
