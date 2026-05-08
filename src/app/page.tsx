"use client";

import React, { useState } from 'react';
import { DUBBING_VOICES } from '@/constants/voicesData';

// 引入核心组件
import VoiceSidebar from '@/components/VoiceSidebar';
import EditorArea from '@/components/EditorArea';
import ControlPanel from '@/components/ControlPanel';

export default function DubbingProPage() {
  const [text, setText] = useState(""); 
  const [selectedVoice, setSelectedVoice] = useState(DUBBING_VOICES[0]?.id || "");
  const [audioUrl, setAudioUrl] = useState("");

  return (
    // 去掉了 h-screen 改为 flex-1，由 layout 控制高度；增加了 pt-8 预留公告栏下方间距
    <div className="flex-1 w-full flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden font-sans">
      
      {/* 主工作台容器 (去掉了固定 max-h，改用更灵活的计算高度) */}
      <div className="flex w-full max-w-[1400px] h-[calc(100vh-180px)] min-h-[650px] bg-white shadow-[0_32px_80px_-20px_rgba(0,0,0,0.06)] rounded-[40px] overflow-hidden border border-white/60 relative z-10 transition-all duration-500">
        
        {/* 左侧：主编辑与控制区 */}
        <section className="flex-[7] flex flex-col bg-white p-8 md:px-12 md:py-10 relative overflow-hidden h-full">
          {/* 编辑区 (已包含情感胶囊和文本框) */}
          <EditorArea text={text} setText={setText} />
          
          {/* 控制面板 (已包含播放器和下载按钮) */}
          <ControlPanel 
            text={text} 
            selectedVoice={selectedVoice} 
            audioUrl={audioUrl} 
            setAudioUrl={setAudioUrl} 
          />
        </section>

        {/* 右侧：音色库侧边栏 */}
        <section className="flex-[2.8] bg-[#F9F9FB] border-l border-gray-100/50 h-full overflow-hidden">
          <VoiceSidebar 
            selectedVoice={selectedVoice} 
            onSelect={(id) => {
              setSelectedVoice(id);
              setAudioUrl(""); 
            }} 
          />
        </section>
      </div>

      {/* 背景艺术装饰：保留极简紫色光晕，增加层次感 */}
      <div className="absolute top-[10%] right-[-5%] w-[600px] h-[600px] bg-[#9C27B0]/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[5%] left-[-5%] w-[400px] h-[400px] bg-blue-100/10 rounded-full blur-[100px] -z-10" />

      {/* 全局动画补丁：仅保留必要的动画定义 */}
      <style jsx global>{`
        /* 隐藏滚动条但保留功能 */
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #9C27B0; }

        /* 统一页面切换平滑度 */
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}