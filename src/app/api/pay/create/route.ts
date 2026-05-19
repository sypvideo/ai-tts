import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

function generateSign(params: Record<string, any>, key: string): string {
  const sortedKeys = Object.keys(params)
    .filter(
      k =>
        k !== 'sign' &&
        k !== 'sign_type' &&
        params[k] !== '' &&
        params[k] !== null &&
        params[k] !== undefined
    )
    .sort();

  const signStr = sortedKeys
    .map(k => `${k}=${params[k]}`)
    .join('&');

  return crypto
    .createHash('md5')
    .update(signStr + key)
    .digest('hex');
}

export async function POST(req: NextRequest) {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    return NextResponse.json(
      { error: '服务器数据库配置异常' },
      { status: 500 }
    );
  }

  const sql = neon(dbUrl);

  try {
    const { planId, amount, userId } = await req.json();

    if (!planId || !amount || !userId) {
      return NextResponse.json(
        { error: '缺少核心订单参数' },
        { status: 400 }
      );
    }

    const pid = process.env.MZ_PAY_PID;
    const payKey = process.env.MZ_PAY_KEY;

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      'http://localhost:3000';

    const siteName = (
      process.env.MZ_PAY_SITENAME ||
      'AI配音助手Pro'
    ).replace(/[\s]/g, '');

    if (!pid || !payKey) {
      return NextResponse.json(
        { error: '服务器支付网关配置异常' },
        { status: 500 }
      );
    }

    // 套餐配置
    let creditsToMin = 20000;
    let planName = '基础包';

    if (planId === 'std') {
      creditsToMin = 100000;
      planName = '标准包';
    } else if (planId === 'pro') {
      creditsToMin = 250000;
      planName = '专业包';
    }

    // 商户订单号
    const outTradeNo = `PAY${Date.now()}${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    // 保存本地订单
    await sql`
      INSERT INTO orders (
        user_id,
        plan_id,
        credits,
        amount,
        status,
        order_no
      )
      VALUES (
        ${String(userId)},
        ${planId},
        ${creditsToMin},
        ${amount},
        'pending',
        ${outTradeNo}
      )
    `;

    // 支付参数
    const payParams: Record<string, any> = {
      pid: parseInt(pid),
      type: 'alipay',
      out_trade_no: outTradeNo,
      notify_url: `${siteUrl}/api/pay/notify`,
      return_url: `${siteUrl}/pricing`,
      name: planName,
      money: Number(amount).toFixed(2),
      sitename: siteName
    };

    // 签名
    payParams.sign = generateSign(payParams, payKey);
    payParams.sign_type = 'MD5';

    // 表单请求
    const formDataBody = new URLSearchParams();

    Object.keys(payParams).forEach(key => {
      formDataBody.append(
        key,
        String(payParams[key])
      );
    });

    // 请求支付网关
    const mapiResponse = await fetch(
      'https://mzf.jzmohe.com/mapi.php',
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/x-www-form-urlencoded'
        },
        body: formDataBody.toString()
      }
    );

    const responseText =
      await mapiResponse.text();

    console.log(
      '[MAPI Real Debug]:',
      responseText
    );

    let mapiData: any;

    try {
      mapiData = JSON.parse(responseText);
    } catch (e) {
      return NextResponse.json(
        {
          error: `网关非标准JSON: ${responseText}`
        },
        { status: 500 }
      );
    }

    // 支付创建成功
    if (
      mapiData &&
      (mapiData.code == 1 ||
        mapiData.code == '1')
    ) {
      const finalQr =
        mapiData.qrcode ||
        mapiData.code_url;

      if (!finalQr) {
        return NextResponse.json(
          {
            error:
              '支付通道获取成功，但未解析出二维码链接'
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        qrcode: finalQr,
        outTradeNo
      });
    }

    return NextResponse.json(
      {
        error:
          mapiData.msg ||
          `网关拒绝 (状态码: ${mapiData.code})`
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error(
      '[Pay Create Error]:',
      error
    );

    return NextResponse.json(
      {
        error:
          error.message ||
          '创建支付订单失败'
      },
      { status: 500 }
    );
  }
}