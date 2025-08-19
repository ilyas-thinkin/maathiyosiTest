import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { supabase } from "../../../components/lib/supabaseClient";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    // Add Supabase user ID to session.user
    async session({ session, token }: { session: any; token: any }) {
      if (session.user?.email) {
        const { data: userData, error } = await supabase
          .from("auth.users")
          .select("id")
          .eq("email", session.user.email)
          .single();

        if (userData) {
          session.user.id = userData.id; // add Supabase user ID
        }
      }
      return session;
    },
    // Optional: Include user ID in JWT for client access
    async jwt({
      token,
      user,
      account,
      profile,
      trigger,
      isNewUser,
      session,
    }: {
      token: any;
      user?: { email?: string | null };
      account?: any;
      profile?: any;
      trigger?: "signIn" | "signUp" | "update";
      isNewUser?: boolean;
      session?: any;
    }) {
      const userEmail = user?.email ?? undefined;
      if (userEmail) {
        const { data: userData } = await supabase
          .from("auth.users")
          .select("id")
          .eq("email", userEmail)
          .single();
        if (userData) token.id = userData.id;
      }
      return token;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
