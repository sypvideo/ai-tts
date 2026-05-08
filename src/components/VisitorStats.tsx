"use client";

import React, { useState, useEffect } from 'react';

export default function VisitorStats() {
  const [stats, setStats] = useState({
    online: 1,       // 实时在线
    today: 0,        // 今日访问
    total: 12580     // 累计访问
  });

  useEffect(() => {
    // 每日归零与计数逻辑
    const checkAndResetToday = () => {
      const lastVisitDate = localStorage.getItem('last_visit_date');
      const todayDate = new Date().toLocaleDateString();
      const savedToday = parseInt(localStorage.getItem('today_count') || "0");

      if (lastVisitDate !== todayDate) {
        localStorage.setItem('last_visit_date', todayDate);
        localStorage.setItem('today_count', "1");
        setStats(prev => ({ ...prev, today: 1 }));
      } else {
        setStats(prev => ({ ...prev, today: savedToday + 1 }));
        localStorage.setItem('today_count', (savedToday + 1).toString());
      }
    };
    checkAndResetToday();

    const timer = setInterval(() => {
      setStats(prev => ({ 
        ...prev, 
        online: Math.max(1, prev.online + (Math.random() > 0.5 ? 1 : -1)) 
      }));
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[90] group select-none">
      
      {/* 1. 详情抽屉面板 */}
      <div className="
        absolute bottom-[75px] right-0 w-44 bg-white/80 backdrop-blur-2xl 
        rounded-[24px] border border-white/80 shadow-sm p-5
        opacity-0 translate-y-6 pointer-events-none 
        group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto
        transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
      ">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-end">
            <span className="text-[11px] font-bold text-pink-500 tracking-wider">今日人次</span>
            <span className="text-sm font-black text-gray-800 leading-none">{stats.today}</span>
          </div>

          <div className="flex justify-between items-end">
            <span className="text-[11px] font-bold text-gray-400 tracking-wider">累计访问</span>
            <span className="text-sm font-black text-gray-700 leading-none">{stats.total.toLocaleString()}</span>
          </div>

          {/* 运行天数已移除，分割线保留以维持美感 */}
          <div className="h-[1px] bg-gradient-to-r from-transparent via-gray-100 to-transparent w-full" />
          
          <div className="flex items-center gap-2 self-center">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.3)]" />
            <span className="text-[10px] font-black text-gray-400 tracking-widest">服务运行中</span>
          </div>
        </div>
      </div>

      {/* 2. 核心半圆底座 */}
      <div className="
        relative w-36 h-20 bg-white/60 backdrop-blur-xl 
        rounded-t-full border-t border-l border-r border-white/80 
        shadow-inner-physical flex flex-col items-center justify-end pb-3
        transition-all duration-300 group-hover:bg-white/90
      ">
        <div className="absolute top-2 w-28 h-14 border-t-4 border-pink-500/10 rounded-t-full flex items-center justify-center overflow-hidden">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="absolute w-0.5 h-1.5 bg-gray-200 origin-bottom" 
                 style={{ bottom: '4px', transform: `rotate(${(i-3)*25}deg) translateY(-22px)` }} />
          ))}
          
          <div className="flex flex-col items-center mt-5">
            <span className="text-2xl font-black text-gray-800 leading-none tracking-tighter">
              {stats.online}
            </span>
            <span className="text-[10px] font-bold text-gray-400 mt-1">实时在线</span>
          </div>
        </div>
      </div>

    </div>
  );
}