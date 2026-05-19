'use server';

import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';
import { Resend } from 'resend';
import { UserSession, ActionResult } from '@/types/auth';

const DATABASE_URL = process.env.DATABASE_URL || '';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';

const resend = new Resend(RESEND_API_KEY);

// 提取公用 Neon 客户端创建逻辑，方便全局管理
const getDbClient = () => neon(DATABASE_URL);

/**
 * 1. 发送验证码逻辑
 */
export async function sendVerificationCode(email: string): Promise<ActionResult> {
  if (!DATABASE_URL || !RESEND_API_KEY) {
    return { success: false, error: '服务器核心配置丢失' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return { success: false, error: '请输入有效的邮箱地址' };
  }

  const client = getDbClient();
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 5 * 60 * 1000); // 5分钟有效

  try {
    const users = await client`SELECT id FROM users WHERE email = ${email}`;
    
    if (users.length === 0) {
      // 注册逻辑：后续如果需要调整注册送多少积分，改这里即可
      await client`
        INSERT INTO users (email, name, credits, role, v_code, v_code_expires) 
        VALUES (${email}, ${email.split('@')[0]}, 1500, 'user', ${code}, ${expires})
      `;
    } else {
      await client`
        UPDATE users 
        SET v_code = ${code}, v_code_expires = ${expires} 
        WHERE email = ${email}
      `;
    }

    // 调用 Resend 发送邮件
    await resend.emails.send({
      from: 'AI Dubbing Pro <auth@aidubbing.top>',
      to: email,
      subject: '【AI配音助手Pro】您的登录验证码',
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 450px; margin: 0 auto;">
          <h2 style="color: #9C27B0; text-align: center;">验证码登录</h2>
          <p>您好，您的登录验证码为：</p>
          <div style="background: #f4f4f4; padding: 15px; font-size: 26px; font-weight: bold; letter-spacing: 6px; text-align: center; color: #333; border-radius: 8px;">
            ${code}
          </div>
          <p style="color: #999; font-size: 12px; margin-top: 20px; text-align: center;">验证码 5 分钟内有效。若非本人操作，请忽略此邮件。</p>
        </div>
      `
    });

    return { success: true };
  } catch (e: any) {
    console.error('[Auth Action] 发送验证码失败:', e);
    return { success: false, error: '邮件发送失败，请稍后再试' };
  }
}

/**
 * 2. 核心认证逻辑：处理验证码校验
 */
export async function handleAuth(formData: FormData): Promise<ActionResult> {
  const email = formData.get('email') as string;
  const code = formData.get('code') as string;

  if (!DATABASE_URL) return { success: false, error: '数据库配置丢失' };
  if (!email || !code) return { success: false, error: '参数不完整' };

  const client = getDbClient();

  try {
    const users = await client`
      SELECT id, v_code, v_code_expires FROM users WHERE email = ${email}
    `;
    const user = users[0];

    if (!user) return { success: false, error: '用户记录不存在，请重新获取验证码' };
    if (user.v_code !== code) return { success: false, error: '验证码错误' };
    
    if (new Date() > new Date(user.v_code_expires)) {
      return { success: false, error: '验证码已过期，请重新获取' };
    }

    // 统一配置 Cookie 存储
    const cookieStore = await cookies();
    cookieStore.set('user_id', user.id.toString(), { 
      httpOnly: true, 
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7天有效
    });

    // 成功后擦除验证码，确保单次有效，增加安全性
    await client`UPDATE users SET v_code = NULL, v_code_expires = NULL WHERE id = ${user.id}`;

    return { success: true };
  } catch (e: any) {
    console.error('[Auth Action] 认证失败:', e);
    return { success: false, error: '登录失败，系统异常' };
  }
}

/**
 * 3. 统一的数据获取函数（已剔除不存在的 image 字段）
 */
export async function getSessionUser(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get('user_id')?.value;
  if (!userId) return null;

  try {
    const client = getDbClient();
    // 核心修复：移除数据库中不存在的 image 字段
    const users = await client`
      SELECT id, email, name, credits, role 
      FROM users 
      WHERE id = ${parseInt(userId)}
    `;
    
    if (users.length === 0) return null;
    
    return {
      id: users[0].id,
      email: users[0].email,
      name: users[0].name,
      credits: users[0].credits,
      role: users[0].role
    };
  } catch (error) {
    console.error('[Auth Action] 获取Session用户失败:', error);
    return null;
  }
}

/**
 * 4. 退出登录
 */
export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('user_id');
}