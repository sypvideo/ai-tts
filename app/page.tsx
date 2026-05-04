"use client";
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { DUBBING_VOICES, EMOTION_EFFECTS } from './voices'; 

const EMOJI_MAP: Record<string, string> = {
  happy: '😊', sad: '😔', angry: '😤', surprise: '😮', fear: '😨'
};

export default function DubbingPro() {
  const [text, setText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState(DUBBING_VOICES[0].id);
  const [filter, setFilter] = useState<'zh' | 'en'>('zh');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);
  const [streamProgress, setStreamProgress] = useState(0); 
  const [isFlashing, setIsFlashing] = useState(false); // 编辑器闪烁状态

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const resultAudioRef = useRef<HTMLAudioElement | null>(null); 
  const MAX_LIMIT = 300;

  const pureTextLength = useMemo(() => text.replace(/\[#\/?\w+\]/g, '').length, [text]);

  const handleInsertTag = (tagKey: string) => {
    const textarea = textAreaRef.current;
    if (!textarea) return;
    
    // 触发边框闪烁反馈
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 400);

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = text.substring(start, end);
    const openTag = `[#${tagKey}]`;
    const closeTag = `[/#${tagKey}]`; 
    const replacement = `${openTag}${selectedText}${closeTag}`;
    const newText = text.substring(0, start) + replacement + text.substring(end);
    
    setText(newText);
    setTimeout(() => {
      textarea.focus();
      const newPos = selectedText ? start + replacement.length : start + openTag.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  useEffect(() => {
    if (audioUrl && resultAudioRef.current) resultAudioRef.current.play().catch(() => {});
    return () => { if (audioUrl) URL.revokeObjectURL(audioUrl); };
  }, [audioUrl]);

  const filteredVoices = useMemo(() => DUBBING_VOICES.filter(v => v.category === filter), [filter]);

  const togglePreview = (e: React.MouseEvent, voice: any) => {
    e.stopPropagation();
    if (playingPreview === voice.id) {
      previewAudioRef.current?.pause();
      setPlayingPreview(null);
    } else {
      if (previewAudioRef.current) {
        previewAudioRef.current.src = voice.previewUrl;
        previewAudioRef.current.play();
        setPlayingPreview(voice.id);
        previewAudioRef.current.onended = () => setPlayingPreview(null);
      }
    }
  };

  const handleGenerate = async () => {
    if (!text || loading || pureTextLength > MAX_LIMIT) return;
    setLoading(true);
    setStreamProgress(0);

    try {
      const hasTags = /\[#(\w+)\]/.test(text.trim());
      let finalSsml = hasTags 
        ? text.trim().replace(/\[#(\w+)\]([\s\S]*?)\[\/#\1\]/g, (match, tag, content) => {
            const effect = EMOTION_EFFECTS[tag] || 'heartbeat_intimacy';
            return `<speak effect="${effect}">${content}</speak>`;
          })
        : `<speak>${text.trim()}</speak>`;

      const response = await fetch('/api/dubbing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: finalSsml, voiceId: selectedVoice }),
      });

      if (!response.ok) throw new Error("合成失败");
      const reader = response.body?.getReader();
      if (!reader) throw new Error("无法读取响应流");

      const chunks: Uint8Array[] = [];
      let receivedLength = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        receivedLength += value.length;
        setStreamProgress(receivedLength);
      }
      const allChunks = new Uint8Array(receivedLength);
      let position = 0;
      for (let chunk of chunks) { allChunks.set(chunk, position); position += chunk.length; }
      const blob = new Blob([allChunks], { type: 'audio/mpeg' });
      if (audioUrl) URL.revokeObjectURL(audioUrl); 
      setAudioUrl(URL.createObjectURL(blob));
    } catch (e) { alert("生成失败，请稍后重试"); } finally { setLoading(false); }
  };

  return (
    <main className="h-screen w-full bg-[#F5F5F7] flex justify-center items-center overflow-hidden p-4 md:p-10 font-sans relative">
      <style jsx global>{`
        /* 情绪按钮：触感反馈 */
        .emotion-btn {
          background: linear-gradient(145deg, #ffffff, #f9f9fb);
          border: 1px solid #F0F0F0;
          box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.03), inset 0 1px 1px rgba(255, 255, 255, 1);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .emotion-btn:hover {
          border-color: #9C27B0;
          color: #9C27B0;
          transform: translateY(-2px);
          box-shadow: 6px 6px 16px rgba(156, 39, 176, 0.08);
        }
        .emotion-btn:active {
          transform: scale(0.92);
          box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.05);
        }

        /* 标签插入边框闪烁 */
        @keyframes flash-purple {
          0% { border-color: transparent; box-shadow: 0 0 0 0 rgba(156, 39, 176, 0); }
          50% { border-color: #9C27B0; box-shadow: 0 0 15px rgba(156, 39, 176, 0.2); }
          100% { border-color: transparent; box-shadow: 0 0 0 0 rgba(156, 39, 176, 0); }
        }
        .border-flash { animation: flash-purple 0.4s ease-out; }

        /* 音色卡片高级动画 */
        .voice-card { transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .voice-card:hover:not(.active) { transform: translateY(-6px); box-shadow: 0 20px 40px -12px rgba(156, 39, 176, 0.15); }
        .voice-card.active { border: 2px solid #9C27B0; background: white; }
      `}</style>

      <audio ref={previewAudioRef} className="hidden" />
      
      {/* 顶部导航 */}
      <nav className="absolute top-6 left-10 flex items-center gap-3 z-20">
        <div className="w-8 h-8 bg-[#262626] rounded-lg flex items-center justify-center shadow-lg">
          <span className="text-white font-black text-lg italic">A</span>
        </div>
        <span className="text-[#262626] font-black text-xl tracking-tighter">AI 配音助手 <span className="text-[#9C27B0]">PRO</span></span>
      </nav>

      {/* 主容器 */}
      <div className="flex w-full max-w-[1400px] h-full max-h-[880px] bg-white shadow-[0_32px_80px_-20px_rgba(0,0,0,0.06)] rounded-[40px] overflow-hidden border border-white/60 relative z-10">
        
        {/* 左侧：工作台 */}
        <section className="flex-[7] flex flex-col bg-white p-8 md:p-12 relative overflow-hidden h-full">
          
          {/* 触感工具栏 */}
          <div className="flex gap-3 mb-10 bg-[#F5F5F7] p-2 rounded-full w-fit mx-auto border border-gray-100/50 shadow-inner">
            {Object.entries(EMOTION_EFFECTS).map(([key, label]) => (
              <button 
                key={key} 
                onClick={() => handleInsertTag(key)} 
                className="emotion-btn px-6 py-2.5 rounded-full text-[13px] font-bold flex items-center gap-2"
              >
                <span className="text-base">{EMOJI_MAP[key] || '🎭'}</span>
                {label}
              </button>
            ))}
          </div>

          {/* 编辑器 */}
          <div className="flex-1 px-4 md:px-10 relative overflow-hidden">
            <div className={`w-full h-full rounded-[36px] border-2 transition-all duration-300 ${isFlashing ? 'border-flash' : 'border-transparent'}`}>
              <textarea 
                ref={textAreaRef}
                value={text}
                readOnly={loading}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-full resize-none text-[16px] font-medium leading-[1.6] focus:outline-none placeholder-gray-200 text-[#262626] bg-[#F9F9FB] rounded-[34px] p-10 transition-all focus:bg-white"
                placeholder="请输入文案内容，拖选文字后点击上方标签可添加情感深度..."
              />
            </div>
          </div>

          {/* 底部控制 */}
          <div className="mt-8 flex flex-col items-center px-4 md:px-10">
            <div className="w-full max-w-lg mb-6">
              <div className="flex justify-between items-end mb-2 px-1">
                <span className="text-[10px] text-gray-400 font-black tracking-widest uppercase">内容字数</span>
                <span className={`text-[11px] font-black ${pureTextLength > MAX_LIMIT ? 'text-rose-500' : 'text-gray-400'}`}>
                  {pureTextLength} / {MAX_LIMIT} 字
                </span>
              </div>
              <div className="w-full h-[6px] bg-[#F5F5F7] rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${pureTextLength > MAX_LIMIT ? 'bg-rose-500' : 'bg-[#9C27B0]'}`} 
                  style={{ width: `${Math.min((pureTextLength / MAX_LIMIT) * 100, 100)}%` }} 
                />
              </div>
            </div>

            <div className="h-[80px] w-full max-w-[550px] mb-8 flex items-center justify-center">
              {audioUrl ? (
                <div className="w-full bg-[#F9F9FB] border border-[#F0F0F0] rounded-[24px] p-4 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2 shadow-sm">
                  <audio ref={resultAudioRef} controls src={audioUrl} className="flex-1 h-10 accent-[#9C27B0]" />
                  <button onClick={() => { const a = document.createElement('a'); a.href = audioUrl; a.download = 'voice_pro.mp3'; a.click(); }} className="w-11 h-11 rounded-full bg-[#262626] text-white flex items-center justify-center hover:bg-[#9C27B0] transition-colors shadow-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  </button>
                </div>
              ) : (
                <p className="text-[12px] text-gray-300 font-medium italic">配音完成后，在此处试听并下载</p>
              )}
            </div>

            <button 
              onClick={handleGenerate} 
              disabled={pureTextLength > MAX_LIMIT || loading || pureTextLength === 0} 
              className={`px-24 py-5 rounded-full font-black tracking-[0.2em] text-[11px] transition-all shadow-xl active:scale-95
                ${(pureTextLength > MAX_LIMIT || loading || pureTextLength === 0) 
                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
                  : 'bg-[#262626] text-white hover:bg-[#9C27B0] hover:shadow-[#9C27B0]/20'}`}
            >
              {loading ? '正在合成...' : '生成配音'}
            </button>
          </div>
        </section>

        {/* 右侧：音色库 */}
        <section className="flex-[2.8] flex flex-col bg-[#F9F9FB] p-8 border-l border-gray-100/50 h-full overflow-hidden">
          <div className="mb-8">
            <h3 className="text-[10px] font-black text-gray-400 tracking-[0.4em] uppercase mb-6">音色资源库</h3>
            <div className="flex bg-white/60 p-1.5 rounded-full border border-gray-100 shadow-sm">
              <button onClick={() => setFilter('zh')} className={`flex-1 py-3 text-[13px] font-black rounded-full transition-all ${filter === 'zh' ? 'bg-white text-[#9C27B0] shadow-md' : 'text-gray-400'}`}>中文</button>
              <button onClick={() => setFilter('en')} className={`flex-1 py-3 text-[13px] font-black rounded-full transition-all ${filter === 'en' ? 'bg-white text-[#9C27B0] shadow-md' : 'text-gray-400'}`}>英文</button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar overflow-x-hidden pb-10">
            {filteredVoices.map((v) => {
              const isActive = selectedVoice === v.id;
              const isPlaying = playingPreview === v.id;
              const isFemale = v.gender === 'female' || v.gender === '女';
              
              return (
                <div 
                  key={v.id} 
                  onClick={() => !loading && setSelectedVoice(v.id)} 
                  className={`voice-card group relative flex items-center p-4 rounded-[28px] border-2 cursor-pointer ${isActive ? 'active' : 'border-transparent hover:bg-white/40'}`}
                >
                  <div className="relative mr-4 flex-shrink-0">
                    {/* 品牌紫双层脉冲波纹 */}
                    {isPlaying && (
                      <div className="absolute inset-0">
                        <div className="absolute inset-0 rounded-[22px] bg-gradient-to-r from-[#9C27B0]/30 to-transparent animate-ping" />
                        <div className="absolute inset-0 rounded-[22px] bg-gradient-to-r from-[#9C27B0]/20 to-transparent animate-pulse" />
                      </div>
                    )}
                    
                    <div className={`w-14 h-14 rounded-[22px] flex items-center justify-center text-white font-bold text-lg bg-gradient-to-br ${v.color} shadow-lg transition-transform z-10 relative ${isActive ? 'scale-110 rotate-1' : ''}`}>
                      {v.name.charAt(0)}
                    </div>

                    <button 
                      onClick={(e) => togglePreview(e, v)} 
                      className={`absolute inset-0 flex items-center justify-center rounded-[22px] transition-all z-20 ${isPlaying ? 'bg-black/30' : 'bg-black/10 opacity-0 group-hover:opacity-100'}`}
                    >
                      {isPlaying ? (
                        <div className="flex gap-1 h-3 items-end">
                          <div className="w-1 bg-white animate-bounce h-2" />
                          <div className="w-1 bg-white animate-bounce h-3 delay-75" />
                        </div>
                      ) : (
                        <svg className="w-6 h-6 text-white fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      )}
                    </button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`font-black text-[14px] truncate ${isActive ? 'text-[#9C27B0]' : 'text-[#262626]'}`}>{v.name}</p>
                      {/* 重塑的性别标识 */}
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-[6px] text-[10px] font-black uppercase border transition-colors
                        ${isFemale ? 'bg-rose-50 text-rose-400 border-rose-100' : 'bg-blue-50 text-blue-400 border-blue-100'}`}>
                        <span>{isFemale ? '♀' : '♂'}</span>
                        <span>{isFemale ? '女' : '男'}</span>
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold tracking-tight opacity-70 italic">{v.scene}</span>
                  </div>

                  {isActive && <div className="w-2 h-2 bg-[#9C27B0] rounded-full mr-2" />}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}