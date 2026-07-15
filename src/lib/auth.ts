import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./prisma";
import { redis } from "./redis";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const username = (credentials.username as string).toLowerCase();
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({
          where: { username },
        });

        if (!user) return null;

        const isValid = await compare(password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          username: user.username,
          role: user.role,
          area: user.area,
          permissions: user.permissions as Record<string, boolean>,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // FIRST LOGIN — generate a new session token, overwriting any previous one
        const sessionToken = crypto.randomUUID();
        await redis.set(`session:${user.id}`, sessionToken);

        token.id = user.id;
        token.username = (user as { username?: string }).username;
        token.role = (user as { role?: string }).role;
        token.area = (user as { area?: string[] }).area;
        token.permissions = (user as { permissions?: Record<string, boolean> }).permissions;
        token.sessionToken = sessionToken;
      } else if (token.id) {
        // SUBSEQUENT REQUESTS — verify this session is still the active one
        const storedToken = await redis.get(`session:${token.id}`);
        if (storedToken !== token.sessionToken) {
          // Another device has logged in — invalidate this token
          // Returning null forces Auth.js to clear the session cookie
          return null;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
        session.user.area = token.area as string[];
        session.user.permissions = token.permissions as Record<string, boolean>;
      } else {
        // Token is null/invalid — clear the user from session
        // This forces useSession() to return { data: null, status: "unauthenticated" }
        session.user = undefined as unknown as typeof session.user;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  events: {
    async signOut(message) {
      // Clean up session when user explicitly signs out
      if ("token" in message && message.token?.id) {
        await redis.del(`session:${message.token.id}`);
      }
    },
  },
});