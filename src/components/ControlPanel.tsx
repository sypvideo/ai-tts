"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  text: string;
  selectedVoice: string;
  audioUrl: string;
  setAudioUrl: (url: string) => void;
  user: any; 
}

export default function ControlPanel({ text, selectedVoice, audioUrl, setAudioUrl, user }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 定义动态输入上限
  const maxInputLength = user ? 1500 : 300; 

  // 计算当前文本消耗
  const plainText = text.replace(/<[^>]*>/g, '').replace(/\[#(\w+)\]/g, '').replace(/\[\/#\1\]/g, '');
  const charCount = plainText.length;
  const currentCredits = user?.credits ?? 0;
  
  const isOutOfCredits = user && charCount > currentCredits;
  const isOverLimit = charCount > maxInputLength;
  
  // 只要任意一个条件不满足，就禁用生成
  const canGenerate = text.trim() && !isOutOfCredits && !isOverLimit;

  const handleGenerate = async () => {
    if (!user && charCount > 300) return alert("游客仅限 300 字，请登录解锁 1500 字额度");
    if (!user) return alert("请先登录后再进行配音");
    if (!text.trim()) return alert("请输入文案内容");
    if (isOverLimit) return alert(`单次输入不能超过 ${maxInputLength} 字`);
    if (isOutOfCredits) return alert("余额不足，请减少字数或充值");
    
    setLoading(true);
    setAudioUrl(""); 

    try {
      let finalSsml = text.trim();
      const hasTags = /\[#(\w+)\]/.test(finalSsml);

      if (hasTags) {
        finalSsml = finalSsml.replace(/\[#(\w+)\]([\s\S]*?)\[\/#\1\]/g, (match, tag, content) => {
          return `<speak effect="${tag}">${content}</speak>`;
        });
      } else if (!/^\s*<speak/i.test(finalSsml)) {
        finalSsml = `<speak>${finalSsml}</speak>`;
      }

      const response = await fetch('/api/dubbing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: finalSsml, 
          voiceId: selectedVoice,
          userId: user.id 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "合成失败");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("无法读取响应流");

      const chunks: Uint8Array[] = [];
      let receivedLength = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          receivedLength += value.length;
        }
      }

      const allChunks = new Uint8Array(receivedLength);
      let position = 0;
      for (let chunk of chunks) {
        allChunks.set(chunk, position);
        position += chunk.length;
      }

      const blob = new Blob([allChunks], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('balanceUpdated'));
      }

      router.refresh();

    } catch (error: any) {
      console.error(error);
      alert(error.message || "合成失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-auto flex flex-col items-center px-4 md:px-10 pb-6">
      
      {/* 1. 播放器与状态区域（移除了原有的字数统计和余额展示） */}
      <div className="h-[80px] w-full max-w-[600px] mb-8 flex items-center justify-center">
        {audioUrl ? (
          <div className="w-full bg-[#F9F9FB] border border-white rounded-[24px] p-4 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500 shadow-xl">
            <audio controls src={audioUrl} className="flex-1 h-10 accent-[#9C27B0]" autoPlay />
            <a href={audioUrl} download="ai_dubbing_pro.mp3" className="w-11 h-11 rounded-full bg-[#262626] text-white flex items-center justify-center hover:bg-[#9C27B0] transition-all shadow-lg active:scale-95 group">
              <svg className="w-5 h-5 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            </a>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-end gap-1.5 h-6">
              {[...Array(6)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1.5 bg-[#9C27B0] rounded-full animate-music-bar`}
                  style={{ animationDelay: `${i * 0.1}s` }} 
                />
              ))}
            </div>
            <p className="text-[11px] text-[#9C27B0] font-black tracking-[0.3em] uppercase animate-pulse">正在生成纯净音轨...</p>
          </div>
        ) : (
          <div className="text-center">
            {isOverLimit ? (
              <p className="text-[12px] text-red-400 font-bold italic tracking-widest uppercase animate-pulse">
                ⚠️ 文本长度超过 {maxInputLength} 字上限
              </p>
            ) : isOutOfCredits ? (
              <p className="text-[12px] text-red-400 font-bold italic tracking-widest uppercase">
                ⚠️ 余额不足，请充值额度
              </p>
            ) : (
              <p className="text-[12px] text-gray-300 font-medium italic tracking-widest uppercase">
                Ready to generate
              </p>
            )}
          </div>
        )}
      </div>

      {/* 2. 生成按钮 */}
      <button 
        onClick={handleGenerate} 
        disabled={loading || !canGenerate} 
        className={`
          px-24 py-5 rounded-full font-black tracking-[0.2em] text-[11px] transition-all shadow-xl
          ${!canGenerate || loading
            ? 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none' 
            : 'bg-[#262626] text-white hover:bg-[#9C27B0] hover:shadow-[#9C27B0]/30 active:scale-95'}
          ${loading ? 'animate-pulse' : ''}
        `}
      >
        <span className="flex items-center gap-2">
          {loading ? '正在同步引擎数据...' : isOverLimit ? '字数超限' : '开始生成配音'}
        </span>
      </button>

      <style jsx>{`
        @keyframes music-bar {
          0%, 100% { height: 4px; }
          50% { height: 24px; }
        }
        .animate-music-bar {
          animation: music-bar 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}