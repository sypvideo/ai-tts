"use client";

import React, { useState } from 'react';
import VoiceSidebar from '@/components/VoiceSidebar';
import EditorArea from '@/components/EditorArea';
import ControlPanel from '@/components/ControlPanel';

interface Props {
  initialUser: any;
  voices: any[];
}

export default function DubbingClientWrapper({ initialUser, voices }: Props) {
  const [text, setText] = useState(""); 
  const [selectedVoice, setSelectedVoice] = useState(voices[0]?.id || "");
  const [audioUrl, setAudioUrl] = useState("");

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden font-sans">
      
      {/* 主工作台容器 */}
      <div className="flex w-full max-w-[1400px] h-[calc(100vh-180px)] min-h-[650px] bg-white shadow-[0_32px_80px_-20px_rgba(0,0,0,0.06)] rounded-[40px] overflow-hidden border border-white/60 relative z-10">
        
        {/* 左侧：主编辑与控制区 */}
        <section className="flex-[7] flex flex-col bg-white p-8 md:px-12 md:py-10 relative overflow-hidden h-full">
          {/* 编辑区：【新增】把 initialUser 传给它，用于动态字数限制 */}
          <EditorArea 
            text={text} 
            setText={setText} 
            user={initialUser} 
          />
          
          {/* 控制面板 */}
          <ControlPanel 
            text={text} 
            selectedVoice={selectedVoice} 
            audioUrl={audioUrl} 
            setAudioUrl={setAudioUrl}
            user={initialUser} 
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

      {/* 背景艺术装饰 */}
      <div className="absolute top-[10%] right-[-5%] w-[600px] h-[600px] bg-[#9C27B0]/5 rounded-full blur-[120px] -z-10" />
      
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}