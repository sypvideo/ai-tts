import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { neon } from '@neondatabase/serverless';

// 虎皮椒官方回调安全验签算法
function verifyHupijiaoNotifySign(params: Record<string, any>, secret: string) {
  const { hash, ...rest } = params;
  const sortedKeys = Object.keys(rest).sort();
  const pairs: string[] = [];
  for (const key of sortedKeys) {
    if (rest[key] !== '' && rest[key] !== null && rest[key] !== undefined) {
      pairs.push(`${key}=${rest[key]}`);
    }
  }
  const stringA = pairs.join('&');
  return crypto.createHash('md5').update(stringA + secret, 'utf8').digest('hex') === hash;
}

export async function POST(req: Request) {
  try {
    // 1. 解析虎皮椒发送过来的表单数据
    const formData = await req.formData();
    const data: Record<string, any> = {};
    formData.forEach((value, key) => { data[key] = value; });

    const secret = process.env.HUPIJIAO_SECRET || '';
    const databaseUrl = process.env.DATABASE_URL || '';

    // 2. 严格安全验证：校验签名是否由虎皮椒官方生成，防止被黑客恶意白嫖算力
    if (!verifyHupijiaoNotifySign(data, secret)) {
      console.error('❌ 支付回调验签失败，疑似伪造请求');
      return new Response('sign error', { status: 400 });
    }

    // 3. 检查微信扣款状态：OD 代表用户已经成功支付
    if (data.status === 'OD') {
      const outTradeNo = data.trade_order_id; // 对应的商户长单号
      const apiTradeNo = data.open_order_id;  // 虎皮椒平台的官方流水号
      const sql = neon(databaseUrl);

      // 4. 去 Neon 检索该订单（适配新表结构，关联查询 trade_no）
      const existingOrders = await sql`SELECT * FROM orders WHERE trade_no = ${outTradeNo} LIMIT 1`;
      if (existingOrders.length === 0) {
        console.error(`❌ 未找到商户单号为 ${outTradeNo} 的本地订单`);
        return new Response('order not found', { status: 200 });
      }
      
      const order = existingOrders[0];

      // 5. 幂等性控制：只有在订单是待支付（pending）状态下，才下发额度，防止网络重复通知导致多次加额度
      if (order.status === 'pending') {
        
        // A. 更新订单表状态：将状态改为你的原始表声明的 'success'，并记入对账用的 api_trade_no
        await sql`
          UPDATE orders 
          SET status = 'success', 
              api_trade_no = ${apiTradeNo},
              updated_at = NOW() 
          WHERE trade_no = ${outTradeNo}
        `;
        
        // B. 智能下发额度：无需硬编码，直接读取你在创建订单时已经精准算好并存入表中的 order.credits
        const creditToBuffer = Number(order.credits);

        // C. 为用户增加算力资产（假设你的用户表叫 users，算力额度字段叫 credits）
        await sql`
          UPDATE users 
          SET credits = credits + ${creditToBuffer} 
          WHERE id = ${order.user_id}
        `;
        
        console.log(`🎉 【支付大闭环完成】用户 ${order.user_id} 充值成功，已存入 ${creditToBuffer} 字符算力。`);
      }

      // 6. 必须向虎皮椒网关返回纯文本 success 告诉它我们处理好了，否则它会不间断重复通知
      return new Response('success', { status: 200 });
    }

    return new Response('status not OD', { status: 200 });

  } catch (err: any) {
    console.error('🚨 回调处理接口系统异常:', err);
    return new Response('error', { status: 500 });
  }
}