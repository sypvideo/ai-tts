import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text, voiceId } = await req.json();
    
    // 1. 自动从根目录 .env.local 读取变量
    const appId = process.env.VOLCANO_APP_ID; 
    const apiKey = process.env.VOLCANO_API_KEY; 

    if (!text) return NextResponse.json({ error: "内容不能为空" }, { status: 400 });
    if (!appId || !apiKey) {
      console.error("环境变量缺失: 请确保 .env.local 包含 VOLCANO_APP_ID 和 VOLCANO_API_KEY");
      return NextResponse.json({ error: "服务器配置异常" }, { status: 500 });
    }

    // 2. SSML 智能识别逻辑
    const isSsml = /^\s*<speak/i.test(text);

    const requestBody = {
      app: { id: appId, cluster: "volcano_tts" },
      user: { uid: "user_pro_creator" },
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
      const errorText = await response.text();
      console.error("火山引擎返回错误:", errorText);
      return NextResponse.json({ error: errorText }, { status: response.status });
    }

    // 3. 核心流式传输恢复：使用 ReadableStream 将 Base64 实时转为二进制流
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
                  // 将返回的 Base64 实时转换为浏览器可播放的二进制数据
                  const binaryString = atob(json.data);
                  const bytes = new Uint8Array(binaryString.length);
                  for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                  }
                  controller.enqueue(bytes);
                }
              } catch (e) { 
                // 忽略非 JSON 行（如心跳包）
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