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

    const queryResponse = await fetch('https://mzf.jzmohe.com/api/findorder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        order_no: outTradeNo,
        type: '1' 
      }).toString()
    });

    const queryData = await queryResponse.json();

    // 适配 Demo 的 data 节点数据
    if (queryData && (queryData.code == 200 || queryData.code == "200") && queryData.data) {
      // 提取真实的平台订单状态，兼容外层和内层包裹
      const platformOrder = queryData.data.data || queryData.data;
      
      // 它的已支付状态通常为 1、"1" 或 "TRADE_SUCCESS"
      const isPaid = platformOrder.status == 1 || platformOrder.status == "1" || platformOrder.trade_status === 'TRADE_SUCCESS';

      if (isPaid) {
        const existingOrders = await sql`SELECT * FROM orders WHERE trade_no = ${outTradeNo} LIMIT 1`;
        
        if (existingOrders.length > 0 && existingOrders[0].status !== 'success') {
          const order = existingOrders[0];
          
          await sql`UPDATE orders SET status = 'success', updated_at = NOW() WHERE trade_no = ${outTradeNo}`;
          await sql`UPDATE users SET credits = COALESCE(credits, 0) + ${Number(order.credits)} WHERE id = ${String(order.user_id)}`;
          
          return NextResponse.json({ status: 'success', message: '支付成功' });
        }
        return NextResponse.json({ status: 'success', message: '订单已处理' });
      }
    }

    return NextResponse.json({ status: 'pending', message: '等待用户支付中' });

  } catch (error: any) {
    console.error("[Pay Query Error]:", error);
    return NextResponse.json({ error: error.message || "查询订单失败" }, { status: 500 });
  }
}