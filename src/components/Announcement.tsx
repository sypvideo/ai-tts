"use client";

import React, { useState } from 'react';

export default function Announcement() {
  const [showModal, setShowModal] = useState(false);

  // 原始配置信息 - 严格保持不变
  const noticeTitle = "📢 📢 📢运行告急：一个非专业开发者的 AI 配音实验室！";
  const noticeContent = {
    title: "关于这个项目的初心",
    text: "这个网站由我独立开发并免费向所有人开放。由于我并非专业程序员，维持高质量音色所需的 Token 费用完全由个人承担。当额度耗尽时，项目可能不得不关停。如果你觉得这些音色对你有帮助，欢迎伸出援手支持服务器运行，让这份热爱能走得更远。",
    image: "/support.png" // 依然引用你的 public 文件夹下的原始图片
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 mt-4 animate-in fade-in duration-500">
      {/* 1. 公告横幅 - 3D 拟态长条 */}
      <div className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-sm rounded-2xl p-3 flex items-center justify-between group">
        <div className="flex items-center gap-3 overflow-hidden">
          {/* 呼吸灯特效 */}
          <div className="flex-shrink-0 w-2 h-2 bg-pink-500 rounded-full animate-pulse mx-1" />
          <p className="text-xs font-bold text-gray-700 truncate tracking-wide">
            {noticeTitle}
          </p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="flex-shrink-0 text-[10px] font-black text-pink-500 uppercase tracking-widest hover:bg-pink-100 transition-all duration-300 px-4 py-1.5 bg-pink-50 rounded-full active:scale-95 btn-active-push"
        >
          了解详情 / 支持运行
        </button>
      </div>

      {/* 2. 原始内容弹窗 (Modal) - 深度优化方案 */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] p-10 max-w-xl w-full relative animate-in zoom-in-95 duration-300">
            {/* 细节：去掉 shadow-physical 发光效果，改用细致边框区分 */}
            <div className="absolute inset-0 border border-white/50 rounded-[40px] shadow-sm -z-10" />

            {/* 关闭按钮 */}
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-8 right-8 w-9 h-9 flex items-center justify-center rounded-full bg-gray-50/80 hover:bg-pink-50 text-gray-400 hover:text-pink-500 transition-all active:scale-90"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-50 rounded-3xl text-pink-500 mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              
              <h3 className="text-2xl font-black text-gray-800 tracking-tighter mb-4">
                {noticeContent.title}
              </h3>
              
              <p className="text-sm text-gray-500 leading-relaxed text-justify mb-8 px-2">
                {noticeContent.text}
              </p>
              
              {/* 3. 情绪胶囊核心修改：16:9 物理拟态图片容器 */}
              <div className="relative group mx-auto w-full aspect-[16/9] bg-[#F0F2F5] rounded-[32px] border-4 border-white shadow-inner-physical p-4 flex items-center justify-center transition-all overflow-hidden">
                <img 
                  src={noticeContent.image} 
                  alt="Support" 
                  className="w-full h-full object-contain rounded-xl transform group-hover:scale-[1.03] transition-transform duration-500"
                />
                
                {/* 物理细节：增加一个极细的内凹边框线增强 3D 感 */}
                <div className="absolute inset-4 rounded-xl border border-dashed border-gray-100 -z-10" />
                
                <div className="absolute -bottom-2 -right-2 bg-black text-white text-[8px] font-bold px-3 py-1.5 rounded-lg tracking-widest uppercase shadow-xl">
                  Scan to Support
                </div>
              </div>
              
              <p className="mt-8 text-[10px] text-gray-300 font-bold tracking-[0.3em] uppercase">
                AI Dubbing Pro Lab Lab © 2026
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}