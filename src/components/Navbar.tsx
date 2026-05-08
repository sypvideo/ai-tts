"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';


export default function Navbar() {
  const pathname = usePathname();

  const menuItems = [
    { name: '文字转语音', path: '/', emoji: '🎙️' },
    { name: '声音复刻', path: '/clone', emoji: '🧬', disabled: true },
    { name: '更新日志', path: '/changelog', emoji: '🚀' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 bg-white/70 backdrop-blur-xl border-b border-white/50 z-[100] px-8 flex items-center justify-between">
      
      {/* 左侧：Logo */}
      <Link href="/" className="flex items-center gap-3 cursor-pointer group">
        <div className="w-10 h-10 bg-gradient-to-br from-[#9C27B0] to-[#7B1FA2] rounded-xl shadow-lg flex items-center justify-center text-white font-black transform group-hover:rotate-12 transition-all duration-300">
          AI
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl font-black text-gray-800 tracking-tight leading-none flex items-baseline">
            AI配音助手<span className="text-[#9C27B0] ml-0.5 italic text-2xl">PRO</span>
          </h1>
          <span className="text-[9px] text-gray-400 font-bold tracking-[0.2em] uppercase mt-1">
            Professional Studio
          </span>
        </div>
      </Link>

      {/* 中间：导航菜单 (同步 EditorArea 胶囊风格) */}
      <div className="hidden md:flex items-center bg-[#F5F5F7] p-2 rounded-full border border-gray-100/50 shadow-inner overflow-hidden">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          
          const content = (
            <div 
              className={`
                px-6 py-2.5 rounded-full text-[13px] font-bold flex items-center gap-2 transition-all duration-300 relative group
                ${isActive 
                  ? 'bg-white text-[#9C27B0] shadow-[0_4px_12px_rgba(156,39,176,0.1)] border-[#F0F0F0] scale-[1.02]' 
                  : 'text-gray-500 hover:text-gray-800 hover:bg-white/60 border-transparent'}
                ${item.disabled ? 'opacity-40 grayscale cursor-not-allowed' : 'cursor-pointer active:scale-95'}
                border
              `}
              style={{
                background: isActive ? 'linear-gradient(145deg, #ffffff, #f9f9fb)' : 'transparent'
              }}
            >
              <span className={`text-base transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 opacity-70'}`}>
                {item.emoji}
              </span>
              {item.name}

              {/* 禁用态微型 Tip */}
              {item.disabled && (
                <span className="absolute -top-1 -right-2 bg-gray-200 text-[8px] px-1 rounded text-gray-500 scale-75 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  开发中
                </span>
              )}

              {/* 选中态底部高光 */}
              {isActive && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#9C27B0] rounded-full" />
              )}
            </div>
          );

          return item.disabled ? (
            <div key={item.name} className="mx-0.5">{content}</div>
          ) : (
            <Link href={item.path} key={item.name} className="mx-0.5">
              {content}
            </Link>
          );
        })}
      </div>

      {/* 右侧：个人中心 */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-xs font-bold text-gray-800 tracking-wide">商业授权用户</span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-[#9C27B0] rounded-full animate-pulse" />
            <span className="text-[10px] text-gray-400 font-medium tracking-wider">权益已激活</span>
          </div>
        </div>
        
        <div className="group relative">
          <div className="w-11 h-11 rounded-full border-2 border-white shadow-physical bg-gray-100 p-0.5 cursor-pointer active:scale-95 transition-all overflow-hidden">
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-purple-50 to-white flex items-center justify-center text-gray-300 group-hover:text-[#9C27B0] transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}