import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL 未定义，请检查 .env.local 或 Vercel 控制台');
}

// 创建全局唯一的 SQL 执行器
export const sql = neon(process.env.DATABASE_URL);