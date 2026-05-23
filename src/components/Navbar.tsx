"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
// 核心优化：改用重构后统一的 getSessionUser 替代已废弃的 getUserProfile
import { getSessionUser, logout } from '@/app/login/actions';
import { UserSession } from '@/types/auth';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  
  // 核心优化：明确定义状态类型，告别弱类型 any
  const [user, setUser] = useState<UserSession | null>(null);

  // 封装获取用户信息的逻辑
  const fetchUser = useCallback(async () => {
    const userData = await getSessionUser();
    if (userData) {
      setUser(userData);
    }
  }, []);

  // 页面加载逻辑与事件监听
  useEffect(() => {
    fetchUser();

    const handleBalanceUpdate = () => {
      console.log("检测到余额变动，正在同步导航栏...");
      fetchUser();
    };

    // 💡 这里的原有事件监听在 push 上线后，会被 pricing 页面完美触发！
    window.addEventListener('balanceUpdated', handleBalanceUpdate);
    const timer = setInterval(fetchUser, 60000); 

    return () => {
      window.removeEventListener('balanceUpdated', handleBalanceUpdate);
      clearInterval(timer);
    };
  }, [fetchUser]);

  const handleLogout = async () => {
    if (confirm("确定要退出登录吗？")) {
      await logout();
      setUser(null);
      window.location.reload(); 
    }
  };

  // 菜单项配置
  const menuItems = [
    { name: '文字转语音', path: '/', emoji: '🎙️' },
    { name: '声音复刻', path: '/clone', emoji: '🧬', disabled: true }, 
    { name: '更新日志', path: '/changelog', emoji: '🚀' },
    { name: '定价模式', path: '/pricing', emoji: '💎' },
    { name: '博客', path: '/blog', emoji: '📝' },
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

      {/* 中间：导航菜单 */}
      <div className="hidden lg:flex items-center bg-[#F5F5F7] p-1.5 rounded-full border border-gray-100/50 shadow-inner overflow-hidden">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          const content = (
            <div className={`
              px-5 py-2 rounded-full text-[13px] font-bold flex items-center gap-2 transition-all duration-300 relative group
              ${isActive 
                ? 'bg-white text-[#9C27B0] shadow-[0_4px_12px_rgba(156,39,176,0.1)] border-[#F0F0F0] scale-[1.02]' 
                : 'text-gray-500 hover:text-gray-800 hover:bg-white/60 border-transparent'}
              ${item.disabled ? 'opacity-40 grayscale cursor-not-allowed' : 'cursor-pointer active:scale-95'}
              border
            `} style={{ background: isActive ? 'linear-gradient(145deg, #ffffff, #f9f9fb)' : 'transparent' }}>
              <span className={`text-base transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 opacity-70'}`}>
                {item.emoji}
              </span>
              {item.name}
            </div>
          );

          return item.disabled ? (
            <div key={item.name} className="mx-0.5">{content}</div>
          ) : (
            <Link href={item.path} key={item.name} className="mx-0.5">{content}</Link>
          );
        })}
      </div>

      {/* 右侧：用户信息与操作区 */}
      <div className="flex items-center gap-3">
        {user ? (
          <div className="flex items-center bg-white/50 p-1.5 pr-3 rounded-full border border-white/60 shadow-sm group/user">
            
            {/* 💡 余额显示胶囊：这里的数字现在会在支付成功的那一秒，直接在前端无刷闪变刷新！ */}
            <div 
              onClick={() => router.push('/pricing')}
              className="flex items-center bg-[#F5F5F7] rounded-full px-4 py-2 border border-gray-100 shadow-inner gap-3 mr-1 group/credit cursor-pointer hover:bg-white hover:shadow-md transition-all active:scale-95"
            >
               <div className="flex flex-col">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter leading-none group-hover/credit:text-[#9C27B0]">剩余额度</span>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-sm font-black text-gray-800 tracking-tight">
                      {user.credits?.toLocaleString() ?? 0}
                    </span>
                    <span className="text-[9px] font-bold text-gray-400">字符</span>
                  </div>
               </div>
               <div className="w-5 h-5 bg-[#9C27B0]/10 rounded-full flex items-center justify-center text-[#9C27B0] group-hover/credit:bg-[#9C27B0] group-hover/credit:text-white transition-all shadow-sm">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
               </div>
            </div>

            {/* 用户身份展示 */}
            <div className="flex items-center gap-3 px-2">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[11px] font-bold text-gray-800 leading-tight">
                  {user.name || '核心创作者'}
                </span>
                <span className="text-[9px] text-[#9C27B0] font-black uppercase tracking-wider italic opacity-70">
                  {user.role === 'vip' ? 'Pro Member' : 'Standard'}
                </span>
              </div>
              <div className="w-9 h-9 rounded-full border-2 border-white shadow-md bg-gradient-to-tr from-[#9C27B0] to-purple-400 flex items-center justify-center text-white text-xs font-black">
                {(user.name || user.email).charAt(0).toUpperCase()}
              </div>
            </div>

            <div className="w-[1px] h-6 bg-gray-200 mx-1" />

            <button 
              onClick={handleLogout}
              className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all active:scale-90 group/btn"
              title="退出登录"
            >
              <svg className="w-5 h-5 transform group-hover/btn:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        ) : (
          <Link href="/login" className="flex items-center gap-4 bg-white/50 p-1.5 pr-2 rounded-full border border-white/60 shadow-sm hover:shadow-md transition-all group">
             <span className="ml-4 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] group-hover:text-[#9C27B0] transition-colors">登录探索更多</span>
             <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-300 group-hover:bg-[#9C27B0] group-hover:text-white transition-all shadow-inner">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
             </div>
          </Link>
        )}
      </div>
    </nav>
  );
}