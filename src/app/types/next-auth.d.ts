// next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string; // Add this
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string; // Add this too if needed
  }
}
