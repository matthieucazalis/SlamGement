import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { normalizeIp } from "./rate-limit";
import { loginSchema } from "./validators/auth";
import {
  isLoginBlocked,
  registerLoginFailure,
  resetLoginAttempts,
} from "@/services/rate-limit.service";
import { verifyCredentials } from "@/services/user.service";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  providers: [
    Credentials({
      async authorize(credentials, request) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const ip = normalizeIp(request?.headers?.get("x-forwarded-for"));
        if (await isLoginBlocked(email, ip)) return null;

        const user = await verifyCredentials(email, password);
        if (!user) {
          await registerLoginFailure(email, ip);
          return null;
        }

        await resetLoginAttempts(email);
        return user;
      },
    }),
  ],
});
