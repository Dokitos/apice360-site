import type { DefaultSession } from "next-auth";

type UserRole = "ADMIN" | "EDITOR";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      groupId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
    groupId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    groupId: string | null;
  }
}
