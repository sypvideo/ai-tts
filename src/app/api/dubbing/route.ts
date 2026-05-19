import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';

// 内存轻量级缓存：用于临时记录游客 IP 的今日消耗字数（防止羊毛党）
// 在 Vercel 生产环境中由于多实例可能会有轻微偏差，但对“短平快”独立工具来说性价比最高、免配置 Redis
const globalVisitorCache = new Map<string, { count: number; date: string }>();

export async function POST(req: NextRequest) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return NextResponse.json({ error: "服务器数据库配置异常" }, { status: 500 });
  }

  const sql = neon(dbUrl);

  try {
    const { text, voiceId } = await req.json();

    // 1. 基础校验
    if (!text || !text.trim()) {
      return NextResponse.json({ error: "内容不能为空" }, { status: 400 });
    }

    const appId = process.env.VOLCANO_APP_ID;
    const apiKey = process.env.VOLCANO_API_KEY;

    if (!appId || !apiKey) {
      console.error("[Dubbing API] 环境变量火山引擎参数缺失");
      return NextResponse.json({ error: "服务器引擎配置异常" }, { status: 500 });
    }

    // 2. 计费与字数计算：剥离 SSML 标签计算纯文本字数
    const plainText = text.replace(/<[^>]*>/g, '').replace(/\[\/?#\w+\]/g, ''); 
    const charCount = plainText.length;

    if (charCount === 0) {
      return NextResponse.json({ error: "有效文本字符数为 0" }, { status: 400 });
    }

    // 3. 安全校验：读取登录 Cookie 状态
    const cookieStore = await cookies();
    const sessionUserId = cookieStore.get('user_id')?.value;

    let userId: number | null = null;
    let isVisitor = true;

    if (sessionUserId) {
      userId = parseInt(sessionUserId);
      isVisitor = false;
    }

    // 4. 核心逻辑分流：会员扣费 VS 游客 IP 拦截
    if (isVisitor) {
      // 游客逻辑：最大限制 300 字
      if (charCount > 300) {
        return NextResponse.json({ error: "NEED_LOGIN", message: "游客单次体验上限为 300 字，请登录解锁 1500 字额度" }, { status: 401 });
      }

      // 提取游客真实 IP 
      const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
      const todayStr = new Date().toISOString().split('T')[0];
      
      const visitorData = globalVisitorCache.get(ip);
      let currentIpConsumed = 0;

      if (visitorData && visitorData.date === todayStr) {
        currentIpConsumed = visitorData.count;
      }

      if (currentIpConsumed + charCount > 300) {
        return NextResponse.json({ 
          error: "NEED_LOGIN", 
          message: `您今日的游客免登录体验额度（300字）已耗尽，请注册登录立领 1500 字新人大礼包！` 
        }, { status: 401 });
      }

      // 更新内存中的游客 IP 消耗记录
      globalVisitorCache.set(ip, {
        count: currentIpConsumed + charCount,
        date: todayStr
      });

      console.log(`[Visitor Auth] 游客 IP [${ip}] 消耗了 ${charCount} 字，今日累计：${currentIpConsumed + charCount}/300`);

    } else {
      // 已登录用户逻辑：执行数据库扣费（原子操作）
      const updateResult = await sql`
        UPDATE users 
        SET credits = credits - ${charCount}, 
            total_consumed = total_consumed + ${charCount}
        WHERE id = ${userId} AND credits >= ${charCount}
        RETURNING credits
      `;

      if (updateResult.length === 0) {
        return NextResponse.json({ error: "余额不足，请减少字数或充值" }, { status: 403 });
      }
    }

    // 5. 准备火山引擎请求
    const isSsml = /^\s*<speak/i.test(text);
    const requestBody = {
      app: { id: appId, cluster: "volcano_tts" },
      user: { uid: isVisitor ? `visitor_temp` : `user_${userId}` },
      req_params: {
        text: text,
        speaker: voiceId,
        text_type: isSsml ? "ssml" : "plain",
        audio_params: { format: "mp3", sample_rate: 24000 }
      }
    };

    let response;
    try {
      response = await fetch('https://openspeech.bytedance.com/api/v3/tts/unidirectional', {
        method: 'POST',
        headers: {
          "X-Api-Key": apiKey,
          "X-Api-Resource-Id": "seed-tts-2.0",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody),
      });
    } catch (fetchError) {
      // 容错回滚逻辑：如果底层网络请求直接炸了，且不是游客，立刻归还积分
      if (!isVisitor && userId) {
        await sql`
          UPDATE users 
          SET credits = credits + ${charCount}, 
              total_consumed = total_consumed - ${charCount}
          WHERE id = ${userId}
        `;
      }
      return NextResponse.json({ error: "连接语音引擎超时，已自动返还额度" }, { status: 504 });
    }

    if (!response.ok) {
      // 容错回滚逻辑：如果火山引擎明确返回非 200 错误，且不是游客，执行积分充正
      if (!isVisitor && userId) {
        await sql`
          UPDATE users 
          SET credits = credits + ${charCount}, 
              total_consumed = total_consumed - ${charCount}
          WHERE id = ${userId}
        `;
      }
      return NextResponse.json({ error: "语音合成引擎响应异常，已自动返还额度" }, { status: response.status });
    }

    // 6. 异步保存历史记录（不阻塞主音频流，仅限登录用户记录）
    if (!isVisitor && userId) {
      sql`
        INSERT INTO records (user_id, content, voice_id, char_count)
        VALUES (${userId}, ${plainText.substring(0, 200)}, ${voiceId}, ${charCount})
      `.catch(err => console.error("[Dubbing API] 历史记录保存失败:", err));
    }

    // 7. 核心流式传输处理
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error("无法读取语音引擎响应流");
    }

    const stream = new ReadableStream({
      async start(controller) {
        let buffer = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            let lines = buffer.split('\n');
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.trim()) continue;
              try {
                const json = JSON.parse(line);
                if (json.code === 0 && json.data) {
                  const binaryString = atob(json.data);
                  const bytes = new Uint8Array(binaryString.length);
                  for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                  }
                  controller.enqueue(bytes);
                }
              } catch (e) {
                // 忽略非标准或干扰 JSON 行
              }
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      }
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked'
      },
    });

  } catch (error: any) {
    console.error("[Dubbing API] Route 内部未捕获错误:", error);
    return NextResponse.json({ error: error.message || "未知服务器错误" }, { status: 500 });
  }
}