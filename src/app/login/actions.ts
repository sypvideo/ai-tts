'use server';

import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';
import { Resend } from 'resend';

const DATABASE_URL = process.env.DATABASE_URL || '';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';

const resend = new Resend(RESEND_API_KEY);

/**
 * 1. 发送验证码逻辑
 */
export async function sendVerificationCode(email: string) {
  if (!DATABASE_URL || !RESEND_API_KEY) {
    return { error: '服务器配置丢失（DATABASE_URL 或 RESEND_API_KEY）' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return { error: '请输入有效的邮箱地址' };
  }

  const client = neon(DATABASE_URL);
  
  // 生成 6 位随机验证码
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 分钟有效

  try {
    // 检查用户是否存在，不存在则先创建（实现“登录即注册”）
    const users = await client`SELECT id FROM users WHERE email = ${email}`;
    
    if (users.length === 0) {
      await client`
        INSERT INTO users (email, name, credits, v_code, v_code_expires) 
        VALUES (${email}, '新用户', 1500, ${code}, ${expires})
      `;
    } else {
      await client`
        UPDATE users 
        SET v_code = ${code}, v_code_expires = ${expires} 
        WHERE email = ${email}
      `;
    }

    // 发送邮件
    await resend.emails.send({
      from: 'AI Dubbing Pro <auth@aidubbing.top>', // 验证域名后可更换
      to: email,
      subject: '【AI配音助手Pro】您的登录验证码',
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #9C27B0;">验证码登录</h2>
          <p>您好，您的登录验证码为：</p>
          <div style="background: #f4f4f4; padding: 10px; font-size: 24px; font-weight: bold; letter-spacing: 5px; text-align: center;">
            ${code}
          </div>
          <p style="color: #666; font-size: 12px;">验证码 5 分钟内有效。若非本人操作，请忽略此邮件。</p>
        </div>
      `
    });

    return { success: true };
  } catch (e: any) {
    console.error('发送验证码失败:', e);
    return { error: '发送失败：' + e.message };
  }
}

/**
 * 2. 核心认证逻辑：处理验证码校验
 */
export async function handleAuth(formData: FormData) {
  const email = formData.get('email') as string;
  const code = formData.get('code') as string; // 前端传来的验证码

  if (!DATABASE_URL) return { error: '数据库配置丢失' };
  if (!code) return { error: '请输入验证码' };

  const client = neon(DATABASE_URL);

  try {
    // 查询用户信息
    const users = await client`
      SELECT id, v_code, v_code_expires FROM users WHERE email = ${email}
    `;
    const user = users[0] as any;

    if (!user) return { error: '用户记录不存在，请重新获取验证码' };
    
    // 校验验证码一致性
    if (user.v_code !== code) {
      return { error: '验证码错误' };
    }

    // 校验是否过期
    if (new Date() > new Date(user.v_code_expires)) {
      return { error: '验证码已过期，请重新获取' };
    }

    // 登录成功：设置会话
    const cookieStore = await cookies();
    cookieStore.set('user_id', user.id.toString(), { 
      httpOnly: true, 
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7 // 7 天有效
    });

    // 登录后清除验证码，防止二次使用
    await client`UPDATE users SET v_code = NULL, v_code_expires = NULL WHERE id = ${user.id}`;

    return { success: true };
  } catch (e: any) {
    console.error('认证失败:', e.message);
    return { error: '登录失败：' + e.message };
  }
}

/**
 * 获取用户信息 (保持不变)
 */
export async function getSessionUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('user_id')?.value;
  if (!userId) return null;

  try {
    const client = neon(DATABASE_URL);
    const users = await client`SELECT id, email, name, credits, role FROM users WHERE id = ${parseInt(userId)}`;
    return users[0] || null;
  } catch (error) {
    return null;
  }
}

/**
 * 退出登录 (保持不变)
 */
export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('user_id');
}

/**
 * 获取完整 Profile (保持不变)
 */
export async function getUserProfile() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('user_id')?.value;
  if (!userId) return null;

  try {
    const client = neon(DATABASE_URL);
    const results = await client`
      SELECT id, email, name, credits, role 
      FROM users 
      WHERE id = ${parseInt(userId)}
    `;
    return results[0] || null;
  } catch (error) {
    return null;
  }
}