// auth.ts
import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import { neon } from '@neondatabase/serverless'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub, Google],
  callbacks: {
    async signIn({ user }) {
      const email = user.email;
      if (!email) return false;

      const client = neon(process.env.DATABASE_URL!);
      
      try {
        // 检查用户是否已存在
        const existingUser = await client`SELECT id FROM users WHERE email = ${email}`;

        if (existingUser.length === 0) {
          // 新社交用户：创建账号并初始化积分
          await client`
            INSERT INTO users (email, name, credits, role) 
            VALUES (${email}, ${user.name || 'AI用户'}, 1500, 'user')
          `;
        }
        return true;
      } catch (error) {
        console.error("社交登录数据库操作失败:", error);
        return false;
      }
    }
  }
})