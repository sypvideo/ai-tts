// @ts-ignore
import { setGlobalDispatcher, ProxyAgent } from "undici";
import NextAuth from "next-auth";
import Email from "next-auth/providers/resend"; // 确保这里是你目前使用的邮箱服务
import { neon } from '@neondatabase/serverless';

// 1. 保留开发环境代理（仅在本地开发时生效）
if (process.env.NODE_ENV === "development") {
  const dispatcher = new ProxyAgent("http://127.0.0.1:7890");
  setGlobalDispatcher(dispatcher);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // 2. 核心：只保留 Email 提供者，删掉 Google 和 GitHub
  providers: [
    Email({
      from: "no-reply@yourdomain.com", // 请确保与你的发信域名一致
    }),
  ],
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  callbacks: {
    // 3. 登录逻辑：确保所有通过邮箱验证的用户在数据库中都有记录
    async signIn({ user }) {
      if (!user.email) return false;
      const client = neon(process.env.DATABASE_URL!);
      try {
        const existingUser = await client`SELECT id FROM users WHERE email = ${user.email}`;
        if (existingUser.length === 0) {
          // 统一新用户初始化逻辑
          await client`
            INSERT INTO users (email, name, credits, role) 
            VALUES (${user.email}, ${user.email.split('@')[0]}, 1500, 'user')
          `;
          console.log("[Auth] 邮箱新用户注册并初始化积分成功");
        }
        return true;
      } catch (error) {
        console.error("[Auth] 数据库连接错误:", error);
        return true; 
      }
    },

    // 4. JWT 回调：这是数据同步的关键
    async jwt({ token, user, trigger, session }) {
      const client = neon(process.env.DATABASE_URL!);
      
      // 初次登录时记录 email
      if (user) {
        token.email = user.email;
      }

      // 只要有 email，就去数据库拉取最新的 credits、role 和 image
      if (token.email) {
        try {
          const dbUsers = await client`SELECT id, credits, role, name, image FROM users WHERE email = ${token.email}`;
          if (dbUsers && dbUsers.length > 0) {
            token.id = dbUsers[0].id;
            token.credits = dbUsers[0].credits;
            token.role = dbUsers[0].role;
            token.name = dbUsers[0].name;
            token.picture = dbUsers[0].image; // 即使是邮箱登录，也可以显示数据库存的头像
          }
        } catch (error) {
          console.error("[JWT] 数据同步失败:", error);
        }
      }

      // 响应前端 update() 调用（例如配音扣分后同步）
      if (trigger === "update" && session?.user) {
        return { ...token, ...session.user };
      }

      return token;
    },

    // 5. Session 回调：将数据通过 useSession 暴露给 Navbar
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