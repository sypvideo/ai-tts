"use client";

import React from 'react';

export default function UserDropdown() {
  return (
    <div className="absolute top-14 right-0 w-64 bg-white/80 backdrop-blur-xl rounded-[32px] shadow-2xl border border-white p-6 animate-in fade-in zoom-in-95 duration-200 z-50">
      {/* 用户基本信息 */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#9C27B0] to-pink-500 p-1 shadow-lg mb-3">
          <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-gray-100">
             {/* 这里的图片可以换成用户头像 */}
             <div className="w-full h-full flex items-center justify-center text-xl font-bold text-[#9C27B0]">A</div>
          </div>
        </div>
        <h3 className="font-black text-[#262626] text-sm tracking-wide">极客开发者</h3>
        <span className="text-[10px] px-3 py-1 bg-[#9C27B0]/10 text-[#9C27B0] rounded-full font-bold mt-2 border border-[#9C27B0]/20">
          商业授权用户
        </span>
      </div>

      {/* 资产统计 - 拟物化进度条 */}
      <div className="bg-[#F9F9FB] rounded-2xl p-4 shadow-inner-physical mb-6">
        <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase mb-2">
          <span>剩余时长</span>
          <span className="text-[#9C27B0]">85%</span>
        </div>
        <div className="w-full h-1.5 bg-white rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#9C27B0] to-pink-400 w-[85%] rounded-full" />
        </div>
        <p className="text-[9px] text-gray-300 mt-2 italic text-center">有效期至：2027-05-01</p>
      </div>

      {/* 功能列表 */}
      <div className="space-y-1">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-[12px] font-bold text-gray-600 hover:bg-white hover:text-[#9C27B0] hover:shadow-sm rounded-2xl transition-all group">
          <svg className="w-4 h-4 opacity-50 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2.5" strokeLinecap="round"/></svg>
          历史记录
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 text-[12px] font-bold text-gray-600 hover:bg-white hover:text-[#9C27B0] hover:shadow-sm rounded-2xl transition-all group">
          <svg className="w-4 h-4 opacity-50 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeWidth="2.5"/></svg>
          账号设置
        </button>
        <hr className="my-2 border-gray-100" />
        <button className="w-full flex items-center gap-3 px-4 py-3 text-[12px] font-bold text-rose-500 hover:bg-rose-50 rounded-2xl transition-all">
          退出登录
        </button>
      </div>
    </div>
  );
}