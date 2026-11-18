import type { NextAuthConfig } from "next-auth";

const AUTH_PAGES = ["/login", "/register"];
const OPEN_PATHS = [
  "/invite",
  "/forgot-password",
  "/reset-password",
  "/legal",
  // l'API répond elle-même 401 en JSON (pas de redirection vers /login)
  "/api/v1",
  "/api-docs",
];

export const authConfig = {
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const path = nextUrl.pathname;

      // page vitrine : accessible à tous (les boutons s'adaptent à la session)
      if (path === "/") return true;

      // pages accessibles à tous (ex. lien d'invitation)
      if (OPEN_PATHS.some((p) => path === p || path.startsWith(`${p}/`)))
        return true;

      // pages de connexion : inutiles si on est déjà connecté
      if (AUTH_PAGES.some((p) => path === p || path.startsWith(`${p}/`))) {
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
