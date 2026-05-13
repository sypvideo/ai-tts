import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function POST(req: NextRequest) {
  try {
    const { text, voiceId, userId } = await req.json();

    // 1. 基础校验
    if (!text) return NextResponse.json({ error: "内容不能为空" }, { status: 400 });
    if (!userId) return NextResponse.json({ error: "请先登录" }, { status: 401 });

    const appId = process.env.VOLCANO_APP_ID;
    const apiKey = process.env.VOLCANO_API_KEY;
    const dbUrl = process.env.DATABASE_URL;

    if (!appId || !apiKey || !dbUrl) {
      console.error("环境变量缺失，请检查 .env.local");
      return NextResponse.json({ error: "服务器配置异常" }, { status: 500 });
    }

    // 2. 计费逻辑：剥离 SSML 标签计算纯文本字数
    const plainText = text.replace(/<[^>]*>/g, ''); 
    const charCount = plainText.length;

    const sql = neon(dbUrl);

    // 3. 执行数据库扣费（原子操作）
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

    // 4. 准备火山引擎请求
    const isSsml = /^\s*<speak/i.test(text);
    const requestBody = {
      app: { id: appId, cluster: "volcano_tts" },
      user: { uid: `user_${userId}` },
      req_params: {
        text: text,
        speaker: voiceId,
        text_type: isSsml ? "ssml" : "plain",
        audio_params: { format: "mp3", sample_rate: 24000 }
      }
    };

    const response = await fetch('https://openspeech.bytedance.com/api/v3/tts/unidirectional', {
      method: 'POST',
      headers: {
        "X-Api-Key": apiKey,
        "X-Api-Resource-Id": "seed-tts-2.0",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      // 如果火山引擎报错，理论上应该返还积分（此处为简化逻辑，建议后续增加冲正逻辑）
      const errorText = await response.text();
      return NextResponse.json({ error: "语音合成引擎响应异常" }, { status: response.status });
    }

    // 5. 异步保存历史记录（不阻塞音频流）
    sql`
      INSERT INTO records (user_id, content, voice_id, char_count)
      VALUES (${userId}, ${plainText.substring(0, 200)}, ${voiceId}, ${charCount})
    `.catch(err => console.error("记录保存失败:", err));

    // 6. 核心流式传输：Base64 实时转二进制
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        let buffer = "";
        try {
          while (true) {
            const { done, value } = await reader!.read();
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
                // 忽略非 JSON 行
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
    console.error("API Route 内部错误:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}