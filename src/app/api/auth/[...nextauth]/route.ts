import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma"; // 1. GANTI IMPORT NYA JADI SEPERTI INI


export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "email@xapiens.id" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // 1. Cek apakah email dan password diisi
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // 2. Cari user di database pgAdmin berdasarkan email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        // Jika user tidak ditemukan
        if (!user) {
          return null;
        }

        // 3. Cek kecocokan password (sementara kita pakai perbandingan teks biasa sesuai data pgAdmin)
        if (user.password !== credentials.password) {
          return null;
        }

        // 4. Jika sukses, kembalikan data user beserta ROLE-nya
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role, // Penting untuk sistem Role-Based Access Control (RBAC) nanti
        };
      }
    })
  ],
  callbacks: {
    // Menyisipkan role ke dalam token JWT
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role; // <-- Tambahkan (user as any) di sini
        token.id = (user as any).id;     // <-- Tambahkan di sini juga agar aman
      }
      return token;
    },
    // Menyisipkan role dari token ke dalam session agar bisa dibaca di frontend
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/login', // Mengarahkan NextAuth untuk memakai halaman login buatanmu sendiri
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };