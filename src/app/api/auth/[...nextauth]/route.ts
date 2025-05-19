/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/api/auth/[...nextauth].ts
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { Pool } from 'pg';
import type { NextAuthOptions } from "next-auth";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function findUserByEmail(email: string) {
    try {
        const result = await pool.query('SELECT * FROM admin WHERE admin_email = $1', [email]);
        return result.rows[0]; // Return the user object or undefined if not found
    } catch (error) {
        console.error("Error finding user:", error);
        return null;
    }
}

// async function comparePasswords(password: string, hash: string) {
//     return await bcrypt.compare(password, hash);
// }

const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password are required");
                }

                try {
                    const userFromDb = await findUserByEmail(credentials.email);

                    if (!userFromDb) {
                        throw new Error("User not found");
                    }

                    if (userFromDb.admin_password !== credentials.password) {
                         throw new Error("Incorrect password");
                    }

                    const user = {
                        id: userFromDb.admin_id,
                        email: userFromDb.admin_email,
                        name: `${userFromDb.admin_first_name} ${userFromDb.admin_last_name}`, // Combine first and last names
                        // ... any other user properties
                    };
                    console.log("Authorize User:", user); //CHECKPOINT
                    return user;
                } catch (error) {
                    console.error("Authentication Error:", error);
                    throw new Error("Authentication failed. Please try again.");
                }
            },
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET!,
    callbacks: {
        async session({ session, token }: { session: any; token: any; }) {
            console.log("Session Callback, Token:", token); //CHECKPOINT
            if (session?.user) {
                session.user.id = token.id;
                session.user.uid = token.id;
                session.user.email = token.email;
                session.user.name = token.name;
            }
            console.log("Session Callback, Session:", session); //CHECKPOINT
            return session;
        },
        async jwt({ token, user }: { token: any; user: any; }) {
             console.log("JWT Callback, Token:", token, "User:", user); //CHECKPOINT
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
            }
            console.log("JWT Callback, Returned Token:", token); //CHECKPOINT
            return token;
        },
    },
    pages: {
        signIn: '/login',
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };