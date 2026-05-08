"use client";

import React from 'react';
import Link from 'next/link';

export default function ChangelogPage() {
  const updates = [
    {
      date: "2026.05.01",
      version: "版本 2.1.0 稳定版",
      title: "AI配音助手正式上线",
      // 核心功能：纯中文硬核介绍
      features: [
        { label: "音色矩阵", value: "28款超逼真商业音色", desc: "精选影视解说、情感电台、广告配音等全场景音色" },
        { label: "情感注入", value: "可情绪化控制的逼真配音", desc: "通过简单标签即可让声音具备喜怒哀乐等情感起伏" },
        { label: "响应速度", value: "毫秒级实时语音合成", desc: "采用先进流式技术，长篇文案无需等待即可试听" },
        { label: "专业输出", value: "商业级高保真音频", desc: "提供 24kHz 高采样率音频采样，满足专业剪辑需求" }
      ]
    }
  ];

  return (
    <div className="flex-1 bg-[#F5F5F7] py-16 px-4 md:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* 纯中式极简标题 */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-2">
             <div className="w-12 h-[2px] bg-[#9C27B0]" />
             <span className="text-[10px] font-black text-[#9C27B0] uppercase tracking-[0.3em]">迭代历程</span>
          </div>
          <h2 className="text-5xl font-black text-gray-900 tracking-tighter">
            产品<span className="text-[#9C27B0]">进化论</span>
          </h2>
        </div>

        {/* 时间轴逻辑 */}
        <div className="relative border-l-2 border-gray-200 ml-4 md:ml-0 md:border-none">
          
          {updates.map((item, index) => (
            <div key={index} className="relative mb-24 md:flex items-start">
              
              {/* 日期显示 */}
              <div className="hidden md:block w-40 shrink-0 pt-2 text-right pr-12">
                <span className="text-sm font-black text-gray-400 tracking-tighter">{item.date}</span>
              </div>

              {/* 物理圆点 */}
              <div className="absolute -left-[9px] md:left-40 md:-ml-[9px] top-3 w-4 h-4 bg-[#9C27B0] rounded-full shadow-[0_0_15px_rgba(156,39,176,0.4)] z-10 border-4 border-white" />

              {/* 内容卡片 */}
              <div className="pl-8 md:pl-12 flex-1">
                <div className="bg-white rounded-[40px] p-10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.04)] border border-white/60 relative overflow-hidden group">
                  
                  {/* 背景版本号装饰 */}
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                    <span className="text-8xl font-black">2.1</span>
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                      <span className="px-3 py-1 bg-[#9C27B0] text-white text-[10px] font-black rounded-full tracking-widest">
                        重要更新
                      </span>
                      <h3 className="text-2xl font-black text-gray-800 tracking-tight">{item.title}</h3>
                    </div>

                    {/* 功能方块网格 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                      {item.features.map((feat, i) => (
                        <div key={i} className="p-5 rounded-[24px] bg-[#F9F9FB] border border-gray-100 hover:border-[#9C27B0]/30 transition-all duration-300">
                          <div className="text-[10px] font-black text-gray-400 tracking-wider mb-1">{feat.label}</div>
                          <div className="text-lg font-bold text-gray-800 mb-1">{feat.value}</div>
                          <div className="text-xs text-gray-500 font-medium leading-relaxed">{feat.desc}</div>
                        </div>
                      ))}
                    </div>

                    {/* 底部跳转按钮 */}
                    <Link 
                      href="/" 
                      className="inline-flex items-center gap-2 text-sm font-black text-[#9C27B0] group-hover:gap-4 transition-all"
                    >
                      立即开启逼真配音之旅
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          ))}

        </div>
      </div>
    </div>
  );
}