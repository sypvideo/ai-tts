"use client";

import React, { useState, useRef, useMemo } from 'react';
import { EMOTION_EFFECTS } from '../constants/voicesData';

interface Props {
  text: string;
  setText: (val: string) => void;
}

const EMOJI_MAP: Record<string, string> = {
  happy: '😊', sad: '😔', angry: '😤', surprise: '😮', fear: '😨'
};

export default function EditorArea({ text, setText }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const MAX_LIMIT = 300;

  // 计算纯文本长度（排除 [#标签]）
  const pureTextLength = useMemo(() => text.replace(/\[#\/?\w+\]/g, '').length, [text]);

  const handleInsertTag = (tagKey: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // 触发紫色闪烁效果
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 400);

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = text.substring(start, end);
    
    // 使用你原始的方括号格式
    const openTag = `[#${tagKey}]`;
    const closeTag = `[/#${tagKey}]`; 
    const replacement = `${openTag}${selectedText}${closeTag}`;
    
    const newText = text.substring(0, start) + replacement + text.substring(end);
    setText(newText);

    // 重新定位光标
    setTimeout(() => {
      textarea.focus();
      const newPos = selectedText ? start + replacement.length : start + openTag.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      
      {/* 1. 原始情感胶囊区 */}
      <div className="flex gap-3 mb-10 bg-[#F5F5F7] p-2 rounded-full w-fit mx-auto border border-gray-100/50 shadow-inner overflow-x-auto no-scrollbar">
        {Object.entries(EMOTION_EFFECTS).map(([key, label]) => (
          <button 
            key={key} 
            onClick={() => handleInsertTag(key)} 
            className="emotion-btn px-6 py-2.5 rounded-full text-[13px] font-bold flex items-center gap-2 bg-white border border-[#F0F0F0] shadow-sm hover:border-[#9C27B0] hover:text-[#9C27B0] transition-all duration-300 active:scale-95"
          >
            <span className="text-base">{EMOJI_MAP[key] || '🎭'}</span>
            {label}
          </button>
        ))}
      </div>

      {/* 2. 带闪烁效果的输入框 */}
      <div className="flex-1 px-4 md:px-10 relative overflow-hidden flex flex-col">
        <div className={`flex-1 rounded-[36px] border-2 transition-all duration-300 overflow-hidden ${isFlashing ? 'border-[#9C27B0] shadow-[0_0_15px_rgba(156,39,176,0.2)]' : 'border-transparent'}`}>
          <textarea 
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-full resize-none text-[16px] font-medium leading-[1.6] focus:outline-none placeholder-gray-200 text-[#262626] bg-[#F9F9FB] rounded-[34px] p-10 transition-all focus:bg-white"
            placeholder="请输入文案内容，拖选文字后点击上方标签可添加情感深度..."
          />
        </div>

        {/* 3. 原始风格字数统计 */}
        <div className="mt-6 w-full max-w-lg mx-auto">
          <div className="flex justify-between items-end mb-2 px-1">
            <span className="text-[10px] text-gray-400 font-black tracking-widest uppercase">内容字数</span>
            <span className={`text-[11px] font-black ${pureTextLength > MAX_LIMIT ? 'text-rose-500' : 'text-gray-400'}`}>
              {pureTextLength} / {MAX_LIMIT} 字
            </span>
          </div>
          <div className="w-full h-[6px] bg-[#F5F5F7] rounded-full overflow-hidden shadow-inner">
            <div 
              className={`h-full transition-all duration-500 ${pureTextLength > MAX_LIMIT ? 'bg-rose-500' : 'bg-[#9C27B0]'}`} 
              style={{ width: `${Math.min((pureTextLength / MAX_LIMIT) * 100, 100)}%` }} 
            />
          </div>
        </div>
      </div>

      {/* 注入 CSS 动画补丁 */}
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .emotion-btn {
          background: linear-gradient(145deg, #ffffff, #f9f9fb);
        }
        .emotion-btn:hover {
          transform: translateY(-2px);
          box-shadow: 6px 6px 16px rgba(156, 39, 176, 0.08);
        }
      `}</style>
    </div>
  );
}