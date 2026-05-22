import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function POST(req: Request) {
  try {
    const { outTradeNo } = await req.json();
    const databaseUrl = process.env.DATABASE_URL;

    if (!outTradeNo || !databaseUrl) {
      return NextResponse.json({ success: false, trade_status: 'error', msg: '参数异常' });
    }

    const sql = neon(databaseUrl);
    
    // 💡 适配你的原始表单：根据 trade_no 查状态
    const results = await sql`SELECT status FROM orders WHERE trade_no = ${outTradeNo} LIMIT 1`;

    // 对齐你定义的成功状态：'success'
    if (results.length > 0 && results[0].status === 'success') {
      return NextResponse.json({
        success: true,
        trade_status: 'paid', // 让前端感知到已付
        msg: '支付已确认成功'
      });
    }

    return NextResponse.json({
      success: false,
      trade_status: 'pending',
      msg: '订单尚未支付'
    });

  } catch (error: any) {
    console.error('查单异常:', error);
    return NextResponse.json({ success: false, trade_status: 'error' }, { status: 500 });
  }
}