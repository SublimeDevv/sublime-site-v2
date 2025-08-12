import NextAuth, { AuthError } from "next-auth";
import db from "./lib/db";
import bcrypt from "bcrypt";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";

class CustomError extends AuthError {
  constructor(message: string) {
    super(message);
    this.message = message;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password", placeholder: "*****" },
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const userFound = await db.user.findFirst({
          where: {
            email: credentials.email,
          },
          include: {
            userRoles: {
              include: {
                role: true,
              },
            },
          },
        });

        if (!userFound) throw new CustomError("Credenciales inválidas");
        const matchPassword = await bcrypt.compare(
          credentials.password,
          userFound.passwordHash
        );
        
        if (!matchPassword) throw new CustomError("Credenciales inválidas");

        return {
          id: userFound.id,
          name: userFound.userName,
          email: userFound.email,
          role: userFound.userRoles[0].role.name,
        };
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/login",
  },
});
