// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";

import type { NextAuthConfig } from "next-auth";
import prisma from "./app/utils/db";

const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // Add user.id to the session
      session.user.id = user.id;
      session.user.role = user.role; 
      
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
  
  debug: true,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
export const GET = handlers.GET;
export const POST = handlers.POST;
