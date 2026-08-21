import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

if (!process.env.AUTH_SECRET) {
  // Fail loudly at startup rather than depending on next-auth's own
  // (beta, potentially-changing) fallback behavior for a missing secret.
  throw new Error("AUTH_SECRET não está definida. Configura-a nas variáveis de ambiente.");
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Palavra-passe", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.isActive) return null;

        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          groupId: user.groupId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role as "ADMIN" | "EDITOR";
        token.groupId = (user.groupId as string | null) ?? null;
        return token;
      }

      // Revalidate against the database on every request (not just at
      // sign-in) so a deactivated/deleted account, a changed role, or a
      // changed group assignment takes effect immediately instead of only
      // once the JWT expires.
      if (!token.id) return token;
      const dbUser = await prisma.user.findUnique({
        where: { id: token.id as string },
        select: { role: true, isActive: true, groupId: true },
      });
      if (!dbUser || !dbUser.isActive) {
        return null;
      }
      token.role = dbUser.role;
      token.groupId = dbUser.groupId;
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as "ADMIN" | "EDITOR";
      session.user.groupId = (token.groupId as string | null) ?? null;
      return session;
    },
  },
});
