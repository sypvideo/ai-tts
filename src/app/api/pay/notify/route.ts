import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

// MD5 验签
function verifySign(
  params: Record<string, string>,
  key: string,
  incomingSign: string
): boolean {
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

  const localSign = crypto
    .createHash('md5')
    .update(signStr + key)
    .digest('hex');

  return (
    localSign.toLowerCase() ===
    incomingSign.toLowerCase()
  );
}

// 核心处理函数
async function handle(req: NextRequest) {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    return new NextResponse('fail_db_config', {
      status: 500
    });
  }

  const sql = neon(dbUrl);

  try {
    // 同时兼容 GET 和 POST
    let searchParams: URLSearchParams;

    if (req.method === 'GET') {
      searchParams = new URL(req.url).searchParams;
    } else {
      const rawBody = await req.text();
      searchParams = new URLSearchParams(rawBody);
    }

    const trade_no =
      searchParams.get('trade_no') || '';

    const out_trade_no =
      searchParams.get('out_trade_no') || '';

    const money =
      searchParams.get('money') || '';

    const trade_status =
      searchParams.get('trade_status') || '';

    const sign =
      searchParams.get('sign') || '';

    // 基础参数校验
    if (
      !out_trade_no ||
      !money ||
      !trade_status ||
      !sign
    ) {
      console.error(
        '[Notify] 缺少必要参数'
      );

      return new NextResponse(
        'fail_params_missing',
        {
          status: 400
        }
      );
    }

    // 重新组装参数用于验签
    const payParams: Record<string, string> =
      {};

    searchParams.forEach((value, key) => {
      payParams[key] = value;
    });

    const payKey = process.env.MZ_PAY_KEY;

    if (!payKey) {
      console.error(
        '[Notify] 支付密钥未配置'
      );

      return new NextResponse(
        'fail_server_config',
        {
          status: 500
        }
      );
    }

    // 验签
    const isSignValid = verifySign(
      payParams,
      payKey,
      sign
    );

    if (!isSignValid) {
      console.error(
        `[Notify] 签名验证失败: ${out_trade_no}`
      );

      return new NextResponse(
        'fail_sign_error',
        {
          status: 400
        }
      );
    }

    // 判断支付状态
    if (trade_status !== 'TRADE_SUCCESS') {
      return new NextResponse('success');
    }

    // 查询本地订单
    const existingOrders = await sql`
      SELECT * FROM orders
      WHERE order_no = ${out_trade_no}
      LIMIT 1
    `;

    if (existingOrders.length === 0) {
      console.error(
        `[Notify] 找不到订单: ${out_trade_no}`
      );

      return new NextResponse(
        'fail_order_not_found',
        {
          status: 404
        }
      );
    }

    const order = existingOrders[0];

    // 防止重复到账
    if (order.status === 'success') {
      console.log(
        `[Notify] 重复通知: ${out_trade_no}`
      );

      return new NextResponse('success');
    }

    // 金额校验
    const localAmount = Number(
      order.amount
    ).toFixed(2);

    const incomingMoney =
      Number(money).toFixed(2);

    if (localAmount !== incomingMoney) {
      console.error(
        `[Notify] 金额不一致: 本地 ${localAmount} / 实际 ${incomingMoney}`
      );

      return new NextResponse(
        'fail_money_mismatch',
        {
          status: 400
        }
      );
    }

    // 更新订单状态
    await sql`
      UPDATE orders
      SET
        status = 'success',
        trade_no = ${trade_no},
        updated_at = NOW()
      WHERE order_no = ${out_trade_no}
    `;

    // 增加用户额度
    await sql`
      UPDATE users
      SET credits =
        COALESCE(credits, 0) + ${Number(
          order.credits
        )}
      WHERE id = ${String(order.user_id)}
    `;

    console.log(
      `[Notify] 用户 ${order.user_id} 充值成功 +${order.credits}`
    );

    // 易支付必须返回 success
    return new NextResponse('success');
  } catch (error: any) {
    console.error(
      '[Notify Error]:',
      error
    );

    return new NextResponse(
      'fail_exception',
      {
        status: 500
      }
    );
  }
}

// 兼容 GET
export async function GET(req: NextRequest) {
  return handle(req);
}

// 兼容 POST
export async function POST(req: NextRequest) {
  return handle(req);
}