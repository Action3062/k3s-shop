import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { authConfig } from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      // "remember" steuert "Angemeldet bleiben" (siehe login-Action: Cookie-Downgrade)
      credentials: { email: {}, password: {}, remember: {} },
      async authorize(creds) {
        const email = String(creds?.email ?? "").toLowerCase();
        const password = String(creds?.password ?? "");
        const remember = String(creds?.remember ?? "") === "true";
        if (!email || !password) return null;
        const user = await prisma.user.findUnique({ where: { email }, include: { customer: true } });
        if (!user?.passwordHash) return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? user.username,
          customerId: user.customer?.id ?? null,
          role: user.role,
          remember,
        } as { id: string; email: string; name: string; customerId: string | null; role: string; remember: boolean };
      },
    }),
  ],
});
