import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      role: string;
      area: string[];
      permissions: Record<string, boolean>;
    } & DefaultSession["user"];
  }

  interface User {
    username?: string;
    role?: string;
    area?: string[];
    permissions?: Record<string, boolean>;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    role: string;
    area: string[];
    permissions: Record<string, boolean>;
  }
}