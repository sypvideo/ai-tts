import { neon } from '@neondatabase/serverless';

export async function POST(req: Request) {
  const sql = neon(process.env.DATABASE_URL!);
  
  // 1. 获取支付平台发来的参数（不同平台参数名不同，通常有 pid, out_trade_no, sign 等）
  const data = await req.json(); 

  // --- 这里必须有一步：验证签名 (验证这封信确实是支付平台发的) ---

  const { orderId, tradeNo, userId, creditsToAdd } = data;

  try {
    // 2. 检查订单是否已经是成功状态，防止重复加钱
    const order = await sql`SELECT status FROM orders WHERE id = ${orderId}`;
    if (order[0]?.status === 'succeeded') {
        return new Response("already_processed");
    }

    // 3. 执行“加钱”动作：更新订单状态 + 增加用户余额
    // 使用原生 SQL 确保原子性
    await sql.transaction(async (tx) => {
      // 更新订单
      await tx`
        UPDATE orders 
        SET status = 'succeeded', trade_no = ${tradeNo} 
        WHERE id = ${orderId}
      `;

      // 给用户增加余额
      await tx`
        UPDATE users 
        SET credits = credits + ${creditsToAdd} 
        WHERE id = ${userId}
      `;
    });

    return new Response("success"); // 必须返回支付平台要求的成功标识
  } catch (error) {
    console.error("支付回调处理失败:", error);
    return new Response("error", { status: 500 });
  }
}