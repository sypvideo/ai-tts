import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text, voiceId } = await req.json();
    const appId = process.env.VOLCANO_APP_ID; 
    const apiKey = process.env.VOLCANO_API_KEY; 

    if (!text) return NextResponse.json({ error: "内容不能为空" }, { status: 400 });

    // 1. 核心修复：使用正则更稳健地识别 SSMLa
    // 只要开头是 <speak 标签（忽略空格和大小写），就判定为 ssml 模式
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
      return NextResponse.json({ error: errorText }, { status: response.status });
    }

    // 2. 使用 ReadableStream 实时传输，防止 Vercel 10秒超时
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
                  // 将 base64 转为二进制流
                  const binaryString = atob(json.data);
                  const bytes = new Uint8Array(binaryString.length);
                  for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                  }
                  controller.enqueue(bytes);
                }
              } catch (e) { /* 忽略心跳包 */ }
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}