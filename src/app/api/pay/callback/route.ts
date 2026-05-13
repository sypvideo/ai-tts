import { neon } from '@neondatabase/serverless';

export async function POST(req: Request) {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.error("数据库连接字符串缺失");
    return new Response("server_config_error", { status: 500 });
  }

  const sql = neon(dbUrl);
  
  try {
    // 1. 获取支付平台参数
    const data = await req.json(); 
    const { orderId, tradeNo, userId, creditsToAdd } = data;

    // --- 注意：此处后续应添加签名验证逻辑 ---

    // 2. 检查订单是否已经是成功状态，防止重复充值
    const order = await sql`SELECT status FROM orders WHERE id = ${orderId}`;
    if (order[0]?.status === 'succeeded') {
        return new Response("already_processed");
    }

    // 3. 执行“加钱”动作：更新订单状态 + 增加用户余额
    // 修正点：使用数组模式替代 async 回调，解决 TypeScript 类型错误
    await sql.transaction([
      sql`
        UPDATE orders 
        SET status = 'succeeded', trade_no = ${tradeNo} 
        WHERE id = ${orderId}
      `,
      sql`
        UPDATE users 
        SET credits = credits + ${creditsToAdd} 
        WHERE id = ${userId}
      `
    ]);

    return new Response("success"); 
  } catch (error: any) {
    console.error("支付回调处理失败:", error);
    return new Response(error.message || "error", { status: 500 });
  }
}