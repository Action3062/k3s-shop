import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(creds) {
        const email = String(creds?.email ?? "").toLowerCase();
        const password = String(creds?.password ?? "");
        if (!email || !password) return null;
        const user = await prisma.user.findUnique({ where: { email }, include: { customer: true } });
        if (!user?.passwordHash) return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;
        return { id: user.id, email: user.email, name: user.name ?? user.username, customerId: user.customer?.id ?? null } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) { (token as any).customerId = (user as any).customerId; (token as any).uid = (user as any).id; }
      return token;
    },
    async session({ session, token }) {
      (session as any).customerId = (token as any).customerId ?? null;
      if (session.user) (session.user as any).id = (token as any).uid ?? null;
      return session;
    },
  },
});
