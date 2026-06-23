import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { createServerSupabase } from "./supabase-server";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub, Google],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async signIn({ user }) {
      // Upsert user profile into Supabase on first sign-in
      try {
        const supabase = createServerSupabase();
        await supabase.from("users").upsert(
          {
            id: user.id,
            email: user.email,
            name: user.name,
            avatar_url: user.image,
          },
          { onConflict: "id", ignoreDuplicates: true }
        );
      } catch {
        // Non-fatal: profile sync failure shouldn't block login
      }
      return true;
    },
  },
  pages: {
    signIn: "/login",
  },
});
