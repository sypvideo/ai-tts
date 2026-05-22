import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { neon } from '@neondatabase/serverless';

function generateHupijiaoSign(params: Record<string, any>, secret: string) {
  const sortedKeys = Object.keys(params).sort();
  const pairs: string[] = [];
  for (const key of sortedKeys) {
    if (key !== 'hash' && params[key] !== '' && params[key] !== null && params[key] !== undefined) {
      pairs.push(`${key}=${params[key]}`);
    }
  }
  return crypto.createHash('md5').update(pairs.join('&') + secret, 'utf8').digest('hex');
}

export async function POST(req: Request) {
  try {
    const { planId, amount, userId } = await req.json();

    const appid = process.env.HUPIJIAO_APPID;
    const secret = process.env.HUPIJIAO_SECRET;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const databaseUrl = process.env.DATABASE_URL;

    if (!appid || !secret || !databaseUrl) {
      return NextResponse.json({ success: false, error: '商户配置或数据库凭证缺失' }, { status: 500 });
    }

    // 根据不同的套餐 ID，为原始表的 credits 字段匹配对应的算力值 (万字)
    let creditsCount = 20000; // base 2万字
    if (planId === 'std') creditsCount = 100000; // std 10万字
    if (planId === 'pro') creditsCount = 250000; // pro 25万字

    const title = `AI配音助手Pro-${planId === 'base' ? '基础' : planId === 'std' ? '标准' : '专业'}包`;
    const outTradeNo = `XH${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const params: Record<string, any> = {
      version: '1.1',
      appid: appid,
      trade_order_id: outTradeNo,
      total_fee: amount.toString(),
      title: title,
      time: Math.floor(Date.now() / 1000).toString(),
      notify_url: `${siteUrl}/api/pay/notify`,
      return_url: `${siteUrl}/pricing`,
      nonce_str: crypto.randomBytes(16).toString('hex'),
    };

    params.hash = generateHupijiaoSign(params, secret);

    const response = await fetch('https://api.xunhupay.com/payment/do.html', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(params).toString(),
    });

    const data = await response.json();

    if (data && data.errcode === 0) {
      const sql = neon(databaseUrl);
      
      // 💡 适配你的原始表单：不插入 id (让其自增)，单号对齐 trade_no，增加传入 credits
      await sql`
        INSERT INTO orders (user_id, trade_no, plan_id, amount, credits, status) 
        VALUES (${userId}, ${outTradeNo}, ${planId}, ${Number(amount)}, ${creditsCount}, 'pending')
      `;

      return NextResponse.json({
        success: true,
        url: data.url,                 
        url_qrcode: data.url_qrcode,   
        outTradeNo: outTradeNo
      });
    } else {
      return NextResponse.json({ success: false, error: data.errmsg || '微信支付网关下单失败' });
    }

  } catch (error: any) {
    console.error('下单接口系统异常:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}