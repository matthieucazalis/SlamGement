import type { NextAuthConfig } from "next-auth";

const AUTH_PAGES = ["/login", "/register"];
const OPEN_PATHS = ["/invite"];

export const authConfig = {
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const path = nextUrl.pathname;

      // pages accessibles à tous (ex. lien d'invitation)
      if (OPEN_PATHS.some((p) => path.startsWith(p))) return true;

      // pages de connexion : inutiles si on est déjà connecté
      if (AUTH_PAGES.some((p) => path.startsWith(p))) {
        return isLoggedIn
          ? Response.redirect(new URL("/projects", nextUrl))
          : true;
      }

      // tout le reste exige une session
      return isLoggedIn;
    },
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },
} satisfies NextAuthConfig;
