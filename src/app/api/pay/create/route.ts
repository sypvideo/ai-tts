import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function POST(req: Request) {
  try {
    const { planId, amount, credits, userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "用户未登录" }, { status: 401 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    // 1. 插入订单到数据库，返回订单 ID
    const rows = await sql`
      INSERT INTO orders (user_id, plan_id, credits, amount, status)
      VALUES (${userId}, ${planId}, ${credits}, ${amount}, 'pending')
      RETURNING id
    `;
    
    const orderId = rows[0].id;

    // 2. 这里对接支付跳转逻辑 (以易支付/通用接口为例)
    // 实际开发中你需要把这里的 URL 替换为你支付渠道的跳转地址
    const payUrl = `https://your-pay-gateway.com/pay?orderId=${orderId}&amount=${amount}`;

    return NextResponse.json({ payUrl });
  } catch (error) {
    console.error("创建订单失败:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}