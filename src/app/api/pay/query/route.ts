import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function POST(req: NextRequest) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return NextResponse.json({ error: "服务器数据库配置异常" }, { status: 500 });
  }

  const sql = neon(dbUrl);

  try {
    const { outTradeNo } = await req.json();

    if (!outTradeNo) {
      return NextResponse.json({ error: "缺少商户订单号" }, { status: 400 });
    }

    // 🚀 高性能改造：直接查询本地 Neon 数据库，对齐系统最新重建表的 order_no 字段
    const existingOrders = await sql`
      SELECT status 
      FROM orders 
      WHERE order_no = ${String(outTradeNo)} 
      LIMIT 1
    `;

    // 如果找不到订单，返回等待
    if (existingOrders.length === 0) {
      return NextResponse.json({ status: 'pending', message: '订单创建中' });
    }

    const currentStatus = existingOrders[0].status;

    // 如果异步回调或者后台手动补单已经把状态改成了 success
    if (currentStatus === 'success') {
      return NextResponse.json({ 
        status: 'success', 
        message: '支付成功，额度已注入' 
      });
    }

    // 其余情况（如 pending）一律返回等待，促使前端继续轮询
    return NextResponse.json({ 
      status: 'pending', 
      message: '等待用户支付中...' 
    });

  } catch (error: any) {
    console.error("[Local Pay Query Error]:", error);
    return NextResponse.json({ error: error.message || "查询订单失败" }, { status: 500 });
  }
}