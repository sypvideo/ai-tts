"use client";

import React, { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import { getSessionUser } from '@/app/login/actions';
import { useRouter } from 'next/navigation';

interface Plan {
  id: string;
  name: string;
  credits: number;
  price: number;
  unit: string;
  color: string;
  desc: string;
  popular?: boolean;
  originalPrice: number;
  discountTag: string;
}

export default function PricingPage() {
  // 💡 给 user 显式声明其包含的属性类型，防止 TS 严格检查报错
  const [user, setUser] = useState<{ id: string; email: string; credits: number } | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  const [showQrModal, setShowQrModal] = useState(false);
  const [currentQrUrl, setCurrentQrUrl] = useState('');
  const [currentOrderNo, setCurrentOrderNo] = useState('');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const plans: Plan[] = [
    { id: 'base', name: '基础包', credits: 2, price: 0.01, originalPrice: 19, discountTag: '立省9.1元', unit: '万字', color: '#9C27B0', desc: '适合个人偶尔尝试、学生课堂汇报' },
    { id: 'std', name: '标准包', credits: 10, price: 0.01, originalPrice: 79, discountTag: '直降40元', unit: '万字', color: '#9C27B0', desc: '高性价比，自媒体博主首选套餐', popular: true },
    { id: 'pro', name: '专业包', credits: 25, price: 0.01, originalPrice: 199, discountTag: '低至5折', unit: '万字', color: '#9C27B0', desc: '商业创作，自媒体矩阵极致成本' },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getSessionUser();
      if (userData) {
        setUser(userData as any);
      }
    };
    fetchUser();
    return () => stopPolling();
  }, []);

  // 💡 核心修复：轮询机制传入当前购买的 buyCredits，成功后实现前端动态累加
  const startPolling = (outTradeNo: string, buyCredits: number) => {
    stopPolling();
    timerRef.current = setInterval(async () => {
      try {
        const res = await fetch('/api/pay/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ outTradeNo })
        });
        const data = await res.json();
        
        console.log("查单轮询中，当前 Neon 数据库返回状态:", data);

        if (data && data.success === true && data.trade_status === 'paid') {
          stopPolling();
          setShowQrModal(false);
          setCurrentQrUrl('');
          setCurrentOrderNo('');
          
          // 💡 极简无刷更新核心：在这里直接修改当前组件的 user state 状态，页面额度秒级闪变
          setUser((prevUser) => {
            if (!prevUser) return null;
            const oldCredits = Number(prevUser.credits) || 0;
            return {
              ...prevUser,
              credits: oldCredits + buyCredits // 原有额度 + 本次购买发放的额度
            };
          });

          alert("🎉 充值成功！您的字符算力额度已实时到账。");
          
          // 顺便让 Next.js 刷新后台 Server Component 的数据缓存
          router.refresh();
        }
      } catch (err) {
        console.error("轮询查单失败:", err);
      }
    }, 2500);
  };

  const stopPolling = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handlePurchase = async (plan: Plan) => {
    if (!user) {
      alert("请先登录后再进行充值");
      router.push('/login');
      return;
    }

    setLoadingId(plan.id);

    try {
      const response = await fetch('/api/pay/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          amount: plan.price,
          userId: user.id
        }),
      });

      const data = await response.json();

      if (data && data.success === true) {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // 💡 换算本次购买对应的数据库实际额度单位 (对齐你 Neon 表里写入的真实个位数)
        let buyCredits = 20000; // 基础包 2万字
        if (plan.id === 'std') buyCredits = 100000; // 标准包 10万字
        if (plan.id === 'pro') buyCredits = 250000; // 专业包 25万字

        if (isMobile && data.url) {
          window.location.href = data.url;
        } else {
          // 越级直连：不再走中转页二维码，直接拿底层真实的 data.url 生成收款码
          setCurrentQrUrl(data.url); 
          setCurrentOrderNo(data.outTradeNo);
          setShowQrModal(true);
          
          // 将计算好的额度一同送入轮询监控器
          startPolling(data.outTradeNo, buyCredits); 
        }
      } else {
        alert(`【下单失败提示】:\n${data.error || '网关响应未知异常'}`);
      }
    } catch (error: any) {
      console.error("Purchase error:", error);
      alert(`网络请求失败: ${error.message || error}`);
    } finally {
      setLoadingId(null);
    }
  };

  const handleCloseModal = () => {
    stopPolling();
    setShowQrModal(false);
  };

  return (
    <main className="min-h-screen bg-[#F0F2F5] relative overflow-hidden">
      <Navbar />
      
      <div className="pt-28 pb-20 px-4 md:px-8 flex flex-col items-center relative z-10">
        
        {/* 💡 额度实时管理反馈面板（如果你右上角导航也有，这里可以作为一个直观的测试锚点） */}
        {user && (
          <div className="mb-6 px-6 py-2 bg-white/80 backdrop-blur border border-purple-500/10 rounded-2xl shadow-[4px_4px_10px_#bebebe] flex items-center gap-3">
            <span className="text-xs font-bold text-gray-500">当前账户可用算力:</span>
            <span className="text-sm font-black text-[#9C27B0] bg-[#9C27B0]/5 px-3 py-1 rounded-full animate-bounce">
              {user.credits.toLocaleString()} 字符
            </span>
          </div>
        )}

        <div className="text-center mb-10 md:mb-16 max-w-2xl px-2">
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight leading-tight">
            选择适合您的<span className="text-[#9C27B0]">创作包</span>
          </h1>
          <div className="inline-block mt-2 px-4 py-1.5 md:px-6 md:py-2 bg-gradient-to-r from-red-500/10 via-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-full animate-pulse shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]">
            <span className="text-[10px] md:text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-[#9C27B0] tracking-widest block">
              🔥 限时特惠活动中 · 算力额度永久有效不清零 🔥
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full px-2">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`relative bg-[#F0F2F5] rounded-[32px] md:rounded-[40px] p-6 md:p-10 flex flex-col transition-all duration-500 md:hover:-translate-y-2 group ${
                plan.popular 
                  ? 'border-2 border-[#9C27B0]/40 shadow-[15px_15px_35px_#bebebe,-15px_-15px_35px_#ffffff]' 
                  : 'border border-transparent shadow-[12px_12px_25px_#bebebe,-12px_-12px_25px_#ffffff]'
              }`}
            >
              <span className={`absolute top-5 right-6 px-3 py-1 rounded-full text-[10px] font-black tracking-wider shadow-[2px_2px_5px_#bebebe,-2px_-2px_5px_#ffffff] ${
                plan.popular ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white' : 'bg-white text-[#9C27B0]'
              }`}>
                {plan.discountTag}
              </span>

              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#9C27B0] text-white text-[10px] font-black px-6 py-1.5 rounded-full tracking-widest shadow-[4px_4px_10px_rgba(156,39,176,0.3)] z-10">
                  爆款推荐
                </div>
              )}
              
              <div className="mb-6 mt-2">
                <h3 className="text-xl font-black text-gray-800 mb-1.5">{plan.name}</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">{plan.desc}</p>
              </div>

              <div className="mb-8 text-center py-5 md:py-6 bg-[#F0F2F5] rounded-[24px] md:rounded-[28px] shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff]">
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl md:text-5xl font-black text-gray-800 tracking-tighter">{plan.credits}</span>
                  <span className="text-base md:text-lg font-black text-gray-600 ml-1">{plan.unit}</span>
                </div>
                <span className="text-[10px] text-gray-400 font-bold tracking-widest mt-1.5 block">可用字符算力额度</span>
              </div>

              <div className="text-center mb-8 mt-auto flex flex-col items-center justify-center gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 font-bold">原价</span>
                  <span className="text-xs text-gray-400 line-through font-medium">￥{plan.originalPrice}</span>
                </div>
                <div className="flex items-baseline justify-center">
                  <span className="text-xs font-black text-[#9C27B0] mr-0.5">活动价</span>
                  <span className="text-3xl md:text-4xl font-black text-[#9C27B0] tracking-tight">￥{plan.price}</span>
                </div>
              </div>

              <button 
                onClick={() => handlePurchase(plan)}
                disabled={loadingId !== null}
                className={`w-full h-14 rounded-2xl font-black text-xs tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center shadow-[5px_5px_10px_#bebebe,-5px_-5px_10px_#ffffff] ${
                  loadingId === plan.id ? 'opacity-70 cursor-not-allowed shadow-none' : ''
                } ${
                  plan.popular 
                    ? 'bg-[#262626] text-white md:hover:bg-[#9C27B0] md:hover:shadow-[5px_5px_15px_rgba(156,39,176,0.3)]' 
                    : 'bg-[#F0F2F5] text-gray-700 md:hover:text-[#9C27B0] active:shadow-[inset_2px_2px_5px_#bebebe,inset_-2px_-2px_5px_#ffffff]'
                }`}
              >
                {loadingId === plan.id ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-[10px] font-bold tracking-normal">正在建立微信支付直连...</span>
                  </div>
                ) : (
                  '立即订购'
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 md:mt-16 text-center max-w-2xl px-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#F0F2F5] rounded-full shadow-[inset_2px_2px_5px_#bebebe,inset_-2px_-2px_5px_#ffffff] mb-4">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-black text-gray-400 tracking-widest">微信官方安全加密直连</span>
          </div>
          <p className="text-gray-400 text-xs md:text-sm font-medium leading-relaxed p-2">
            所有套餐均为一次性购买，字符额度永久有效。
            <br />
            完成首充后可解锁更高级别配音员权限及声音复刻优先体验权。
          </p>
        </div>
      </div>

      {/* 扫码收银台弹窗 */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[200] p-4">
          <div className="bg-[#F0F2F5] rounded-[32px] md:rounded-[40px] p-6 md:p-8 max-w-[92%] sm:max-w-sm w-full text-center border border-purple-500/20 shadow-[25px_25px_50px_#bebebe,-25px_-25px_50px_#ffffff] relative animate-in fade-in zoom-in-95 duration-200">
            
            <button 
              onClick={handleCloseModal}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F0F2F5] text-gray-400 hover:text-[#9C27B0] flex items-center justify-center font-bold shadow-[3px_3px_6px_#bebebe,-3px_-3px_6px_#ffffff] active:shadow-[inset_1px_1px_3px_#bebebe] transition-all text-xs"
            >
              ✕
            </button>

            <h3 className="text-base md:text-lg font-black text-gray-800 mb-1 mt-2">微信安全支付</h3>
            <p className="text-[9px] md:text-[10px] text-gray-400 font-medium mb-4 md:mb-6 truncate px-2">单号: {currentOrderNo}</p>

            <div className="bg-[#F0F2F5] p-4 md:p-5 rounded-[24px] md:rounded-[32px] inline-block shadow-[inset_5px_5px_10px_#bebebe,inset_-5px_-5px_10px_#ffffff] mb-4 md:mb-6">
              {currentQrUrl ? (
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentQrUrl)}`}
                  alt="微信支付二维码"
                  className="w-40 h-40 md:w-48 md:h-48 rounded-2xl bg-white p-2 border border-purple-500/10 shadow-sm"
                />
              ) : (
                <div className="w-40 h-40 md:w-48 md:h-48 flex items-center justify-center text-xs text-red-500">二维码加载失败</div>
              )}
            </div>

            <div className="flex flex-col items-center justify-center gap-1 mb-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                <p className="text-xs font-black text-gray-700 tracking-wider">微信官方安全收银台</p>
              </div>
              <p className="text-[10px] text-purple-600 font-bold bg-purple-500/5 border border-purple-500/10 px-3 py-1 rounded-full mt-1">
                💡 扫码后请在手机上点击【立即支付】即可
              </p>
            </div>
            <p className="text-[10px] text-gray-400 font-medium leading-tight">支付完成后系统将在3秒内自动充值到账</p>
          </div>
        </div>
      )}
    </main>
  );
}