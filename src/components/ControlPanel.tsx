"use client";

import React, { useState } from 'react';

interface Props {
  text: string;
  selectedVoice: string;
  audioUrl: string;
  setAudioUrl: (url: string) => void;
}

export default function ControlPanel({ text, selectedVoice, audioUrl, setAudioUrl }: Props) {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!text.trim()) return alert("请输入文案内容");
    setLoading(true);
    setAudioUrl(""); // 开始新合成时清空旧音频

    try {
      let finalSsml = text.trim();
      const hasTags = /\[#(\w+)\]/.test(finalSsml);

      if (hasTags) {
        finalSsml = finalSsml.replace(/\[#(\w+)\]([\s\S]*?)\[\/#\1\]/g, (match, tag, content) => {
          return `<speak effect="${tag}">${content}</speak>`;
        });
      } else {
        finalSsml = `<speak>${finalSsml}</speak>`;
      }

      const response = await fetch('/api/dubbing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: finalSsml, 
          voiceId: selectedVoice 
        }),
      });

      if (!response.ok) throw new Error("合成失败");

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

    } catch (error) {
      console.error(error);
      alert("合成失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 flex flex-col items-center px-4 md:px-10 pb-10">
      
      {/* 播放器 & 加载状态展示区 */}
      <div className="h-[80px] w-full max-w-[600px] mb-8 flex items-center justify-center">
        {audioUrl ? (
          /* 1. 音频播放器 - 增加 slide-up 动画 */
          <div className="w-full bg-[#F9F9FB] border border-[#F0F0F0] rounded-[24px] p-4 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500 shadow-sm">
            <audio controls src={audioUrl} className="flex-1 h-10 accent-[#9C27B0]" autoPlay />
            <a href={audioUrl} download="voice_pro.mp3" className="w-11 h-11 rounded-full bg-[#262626] text-white flex items-center justify-center hover:bg-[#9C27B0] transition-all shadow-lg active:scale-95 group">
              <svg className="w-5 h-5 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            </a>
          </div>
        ) : loading ? (
          /* 2. 加载中状态 - 跳动的声波动画 */
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-end gap-1.5 h-6">
              {[...Array(6)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1 bg-[#9C27B0] rounded-full animate-music-bar`}
                  style={{ animationDelay: `${i * 0.1}s` }} 
                />
              ))}
            </div>
            <p className="text-[11px] text-[#9C27B0] font-black tracking-[0.3em] uppercase animate-pulse">正在调教声线...</p>
          </div>
        ) : (
          /* 3. 初始空状态 */
          <p className="text-[12px] text-gray-300 font-medium italic tracking-widest">
            生成配音后，在此处试听并下载
          </p>
        )}
      </div>

      {/* 生成按钮 - 融合物理拟态与加载逻辑 */}
      <button 
        onClick={handleGenerate} 
        disabled={loading || !text} 
        className={`
          px-24 py-5 rounded-full font-black tracking-[0.2em] text-[11px] transition-all shadow-xl
          ${(loading || !text) 
            ? 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none' 
            : 'bg-[#262626] text-white hover:bg-[#9C27B0] hover:shadow-[#9C27B0]/30 active:scale-95 btn-active-push'}
          ${loading ? 'loading-pulse' : ''}
        `}
      >
        <span className="flex items-center gap-2">
          {loading && (
             <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
          )}
          {loading ? '正在同步引擎数据...' : '开始生成'}
        </span>
      </button>
    </div>
  );
}