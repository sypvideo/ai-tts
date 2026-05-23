import NextAuth from "next-auth";
import Email from "next-auth/providers/resend";
import { neon } from '@neondatabase/serverless';

// 💡 彻底删除了所有的 undici 和 ProxyAgent 逻辑。
// 在 Vercel 生产环境下，Next.js 会自动处理请求，不需要手动代理。

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Email({
      from: "no-reply@yourdomain.com",
    }),
  ],
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      const client = neon(process.env.DATABASE_URL!);
      try {
        const existingUser = await client`SELECT id FROM users WHERE email = ${user.email}`;
        if (existingUser.length === 0) {
          await client`
            INSERT INTO users (email, name, credits, role) 
            VALUES (${user.email}, ${user.email.split('@')[0]}, 1500, 'user')
          `;
        }
        return true;
      } catch (error) {
        console.error("[Auth] 数据库连接错误:", error);
        return true; 
      }
    },

    async jwt({ token, user, trigger, session }) {
      const client = neon(process.env.DATABASE_URL!);
      if (user) token.email = user.email;
      if (token.email) {
        try {
          const dbUsers = await client`SELECT id, credits, role, name, image FROM users WHERE email = ${token.email}`;
          if (dbUsers && dbUsers.length > 0) {
            token.id = dbUsers[0].id;
            token.credits = dbUsers[0].credits;
            token.role = dbUsers[0].role;
            token.name = dbUsers[0].name;
            token.picture = dbUsers[0].image;
          }
        } catch (error) {
          console.error("[JWT] 数据同步失败:", error);
        }
      }
      if (trigger === "update" && session?.user) return { ...token, ...session.user };
      return token;
    },

    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id;
        session.user.credits = token.credits;
        session.user.role = token.role;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.image = token.picture; 
      }
      return session;
    }
  }
});