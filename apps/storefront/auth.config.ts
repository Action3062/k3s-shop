// Edge-sichere Auth-Konfiguration (KEINE Node-only Imports wie prisma/bcrypt).
// Wird von middleware.ts UND auth.ts geteilt. Credentials/Provider kommen in auth.ts dazu.
import type { NextAuthConfig } from "next-auth";

const DAY = 24 * 60 * 60;
const useSecure = process.env.NODE_ENV === "production";

export const SESSION_COOKIE = `${useSecure ? "__Secure-" : ""}authjs.session-token`;

export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt", maxAge: 30 * DAY, updateAge: DAY }, // 30 Tage, rollend
  pages: { signIn: "/login" },
  cookies: {
    sessionToken: {
      name: SESSION_COOKIE,
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: useSecure },
    },
  },
  providers: [], // in auth.ts ergänzt (Credentials braucht Node-APIs)
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.uid = (user as { id?: string }).id;
        token.customerId = (user as { customerId?: string | null }).customerId ?? null;
        token.role = (user as { role?: string }).role ?? "USER";
        token.remember = !!(user as { remember?: boolean }).remember;
      }
      return token;
    },
    session({ session, token }) {
      (session as unknown as { customerId?: string | null }).customerId = (token.customerId as string | null) ?? null;
      if (session.user) {
        (session.user as { id?: string | null }).id = (token.uid as string | null) ?? null;
        (session.user as { role?: string }).role = (token.role as string) ?? "USER";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
