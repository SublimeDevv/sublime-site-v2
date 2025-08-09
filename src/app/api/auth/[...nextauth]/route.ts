import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import db from '@/lib/db'
import bcrypt from 'bcrypt'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password", placeholder: "*****" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const userFound = await db.user.findFirst({
            where: {
                email: credentials.email
            }
        })

        if (!userFound) throw new Error('Invalid credentials')

        const matchPassword = await bcrypt.compare(credentials.password, userFound.passwordHash)

        if (!matchPassword) throw new Error('Invalid credentials')

        return {
            id: userFound.id,
            name: userFound.userName,
            email: userFound.email,
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };