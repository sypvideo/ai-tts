"use client";

import React, { useState, useRef, useEffect } from 'react';
import { DUBBING_VOICES, Voice } from '../constants/voicesData';

interface VoiceSidebarProps {
  selectedVoice: string;
  onSelect: (id: string) => void;
}

export default function VoiceSidebar({ selectedVoice, onSelect }: VoiceSidebarProps) {
  const [category, setCategory] = useState<'zh' | 'en'>('zh');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const firstVoiceOfCategory = DUBBING_VOICES.find(v => v.category === category);
    if (firstVoiceOfCategory && !DUBBING_VOICES.find(v => v.id === selectedVoice && v.category === category)) {
      onSelect(firstVoiceOfCategory.id);
    }
  }, [category, selectedVoice, onSelect]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const togglePreview = (e: React.MouseEvent, voice: Voice) => {
    e.stopPropagation();
    if (playingId === voice.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) audioRef.current.pause();
      audioRef.current = new Audio(voice.previewUrl);
      audioRef.current.play().catch(err => console.log("播放失败:", err));
      setPlayingId(voice.id);
      audioRef.current.onended = () => setPlayingId(null);
    }
  };

  const filteredVoices = DUBBING_VOICES.filter(v => v.category === category);

  return (
    <div className="w-[380px] h-full flex flex-col bg-white/40 backdrop-blur-xl border-r border-white/80 select-none">
      
      {/* 顶部：标题与语言切换 */}
      <div className="p-8 pb-4">
        <div className="flex items-center gap-3 mb-8 px-1">
          <div className="w-1.5 h-4 bg-[#9C27B0] rounded-full" />
          <h2 className="text-lg font-black text-gray-800 tracking-tight">音色资源库</h2>
        </div>

        {/* 语言切换胶囊 */}
        <div className="bg-[#F0F2F5] p-1.5 rounded-full flex relative shadow-inner-physical w-full">
          <div 
            className={`
              absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-full shadow-md 
              transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
              ${category === 'en' ? 'left-[calc(50%+3px)]' : 'left-[3px]'}
            `}
          />
          <button 
            onClick={() => setCategory('zh')}
            className={`flex-1 py-2.5 text-[11px] font-black z-10 transition-colors duration-500 ${category === 'zh' ? 'text-[#9C27B0]' : 'text-gray-400'}`}
          >
            中文音色
          </button>
          <button 
            onClick={() => setCategory('en')}
            className={`flex-1 py-2.5 text-[11px] font-black z-10 transition-colors duration-500 ${category === 'en' ? 'text-[#9C27B0]' : 'text-gray-400'}`}
          >
            English
          </button>
        </div>
      </div>

      {/* 音色列表区域 */}
      <div className="flex-1 overflow-y-auto px-6 pb-10 space-y-3 custom-scrollbar">
        {filteredVoices.map((voice) => (
          <div 
            key={voice.id}
            onClick={() => onSelect(voice.id)}
            className={`
              relative group cursor-pointer p-4 rounded-[30px] transition-all duration-300
              ${selectedVoice === voice.id 
                ? 'bg-white shadow-lg border-[#9C27B0]/20 scale-[1.02]' 
                : 'bg-white/40 hover:bg-white/60 border-transparent shadow-sm hover:scale-[1.01]'}
              border-2
            `}
          >
            <div className="flex items-center gap-4">
              {/* 头像：增强拟物感内阴影 */}
              <div className={`
                w-12 h-12 rounded-[18px] bg-gradient-to-br ${voice.color} 
                flex items-center justify-center text-white font-black text-lg
                shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),inset_0_-2px_4px_rgba(255,255,255,0.2)]
              `}>
                {voice.name[0]}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-gray-800 truncate">{voice.name}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${voice.gender === '女' ? 'bg-pink-50 text-pink-500' : 'bg-blue-50 text-blue-500'}`}>
                    {voice.gender}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 font-bold mt-1">{voice.scene} · {voice.lang}</p>
              </div>

              {/* 播放预览按钮：同步 CSS 动画 */}
              <button 
                onClick={(e) => togglePreview(e, voice)}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                  ${playingId === voice.id 
                    ? 'bg-[#9C27B0] text-white shadow-lg shadow-[#9C27B0]/20' 
                    : 'bg-[#F0F2F5] text-gray-400 hover:bg-[#9C27B0]/10 hover:text-[#9C27B0]'}
                `}
              >
                {playingId === voice.id ? (
                  <div className="flex items-end gap-[2px] h-3">
                    <div className="w-[2px] bg-white rounded-full animate-wave-1" />
                    <div className="w-[2px] bg-white rounded-full animate-wave-2" />
                    <div className="w-[2px] bg-white rounded-full animate-wave-3" />
                  </div>
                ) : (
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M8 5.14v14c0 .86.94 1.38 1.66.95l10.5-7c.66-.44.66-1.45 0-1.9l-10.5-7c-.72-.47-1.66.05-1.66.95z" />
                  </svg>
                )}
              </button>
            </div>

            {selectedVoice === voice.id && (
              <div className="absolute left-[-2px] top-1/2 -translate-y-1/2 w-1 h-8 bg-[#9C27B0] rounded-full animate-in fade-in zoom-in duration-300" />
            )}
          </div>
        ))}
      </div>

    </div>
  );
}