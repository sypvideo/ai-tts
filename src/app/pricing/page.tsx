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
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  const [showQrModal, setShowQrModal] = useState(false);
  const [currentQrUrl, setCurrentQrUrl] = useState('');
  const [currentOrderNo, setCurrentOrderNo] = useState('');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const plans: Plan[] = [
    { id: 'base', name: '基础包', credits: 2, price: 9.9, originalPrice: 19, discountTag: '立省9.1元', unit: '万字', color: '#9C27B0', desc: '适合个人偶尔尝试、学生课堂汇报' },
    { id: 'std', name: '标准包', credits: 10, price: 39, originalPrice: 79, discountTag: '直降40元', unit: '万字', color: '#9C27B0', desc: '高性价比，自媒体博主首选套餐', popular: true },
    { id: 'pro', name: '专业包', credits: 25, price: 99, originalPrice: 199, discountTag: '低至5折', unit: '万字', color: '#9C27B0', desc: '商业创作，自媒体矩阵极致成本' },
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

  const startPolling = (outTradeNo: string) => {
    stopPolling();
    timerRef.current = setInterval(async () => {
      try {
        const res = await fetch('/api/pay/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ outTradeNo })
        });
        const data = await res.json();
        
        // 💡 完美闭环：一旦本地数据库状态变为 success，立刻收回弹窗
        if (data.status === 'success') {
          stopPolling();
          setShowQrModal(false);
          setCurrentQrUrl('');
          setCurrentOrderNo('');
          alert("🎉 充值成功！您的字符算力额度已实时到账。");
          router.refresh();
          // 如果你本地有全局状态管理用户额度，可以在这里调用刷新
        }
      } catch (err) {
        console.error("轮询查单失败:", err);
      }
    }, 2500); // 2.5秒高频轮询
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          amount: plan.price,
          userId: user.id
        }),
      });

      const data = await response.json();

      if (data.success && data.qrcode) {
        setCurrentQrUrl(data.qrcode);
        setCurrentOrderNo(data.outTradeNo);
        setShowQrModal(true);
        startPolling(data.outTradeNo); // 开启轮询
      } else {
        alert(`【下单失败提示】:\n${data.error || '后端未返回有效错误信息'}`);
      }
    } catch (error: any) {
      console.error("Purchase error:", error);
      alert(`网络请求失败: ${error.message || error}`);
    } finally {
      loadingId === plan.id && setLoadingId(null);
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
      
      <div className="pt-36 pb-20 px-4 md:px-8 flex flex-col items-center relative z-10">
        
        <div className="text-center mb-16 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
            选择适合您的<span className="text-[#9C27B0]">创作包</span>
          </h1>
          <div className="inline-block mt-2 px-6 py-2 bg-gradient-to-r from-red-500/10 via-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-full animate-pulse shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]">
            <span className="text-xs md:text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-[#9C27B0] tracking-widest">
              🔥 限时特惠活动中 · 算力额度永久有效不清零 🔥
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full px-2">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`relative bg-[#F0F2F5] rounded-[40px] p-8 md:p-10 flex flex-col transition-all duration-500 hover:-translate-y-2 group ${
                plan.popular 
                  ? 'border-2 border-[#9C27B0]/40 shadow-[20px_20px_45px_#bebebe,-20px_-20px_45px_#ffffff]' 
                  : 'border border-transparent shadow-[15px_15px_30px_#bebebe,-15px_-15px_30px_#ffffff]'
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
                <p className="text-xs text-gray-400 font-medium">{plan.desc}</p>
              </div>

              <div className="mb-8 text-center py-6 bg-[#F0F2F5] rounded-[28px] shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff]">
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-black text-gray-800 tracking-tighter">{plan.credits}</span>
                  <span className="text-lg font-black text-gray-600 ml-1">{plan.unit}</span>
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
                  <span className="text-4xl font-black text-[#9C27B0] tracking-tight">￥{plan.price}</span>
                </div>
              </div>

              <button 
                onClick={() => handlePurchase(plan)}
                disabled={loadingId !== null}
                className={`w-full h-14 rounded-2xl font-black text-xs tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center shadow-[5px_5px_10px_#bebebe,-5px_-5px_10px_#ffffff] ${
                  loadingId === plan.id ? 'opacity-70 cursor-not-allowed shadow-none' : ''
                } ${
                  plan.popular 
                    ? 'bg-[#262626] text-white hover:bg-[#9C27B0] hover:shadow-[5px_5px_15px_rgba(156,39,176,0.3)]' 
                    : 'bg-[#F0F2F5] text-gray-700 hover:text-[#9C27B0] active:shadow-[inset_2px_2px_5px_#bebebe,inset_-2px_-2px_5px_#ffffff]'
                }`}
              >
                {loadingId === plan.id ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-[10px] font-bold">正在安全连接收银台...</span>
                  </div>
                ) : (
                  '立即订购'
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#F0F2F5] rounded-full shadow-[inset_2px_2px_5px_#bebebe,inset_-2px_-2px_5px_#ffffff] mb-6">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-black text-gray-400 tracking-widest">官方安全加密直连</span>
          </div>
          <p className="text-gray-400 text-xs md:text-sm font-medium leading-relaxed shadow-sm p-2">
            所有套餐均为一次性购买，字符额度永久有效。
            <br />
            完成首充后可解锁更高高级配音员权限及声音复刻优先体验权。
          </p>
        </div>
      </div>

      {/* 触觉触感 3D 拟物扫码收银台弹窗 */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-[#F0F2F5] rounded-[40px] p-8 max-w-sm w-full mx-4 text-center border border-purple-500/20 shadow-[25px_25px_50px_#bebebe,-25px_-25px_50px_#ffffff] relative">
            
            <button 
              onClick={handleCloseModal}
              className="absolute top-5 right-6 w-8 h-8 rounded-full bg-[#F0F2F5] text-gray-400 hover:text-[#9C27B0] flex items-center justify-center font-bold shadow-[3px_3px_6px_#bebebe,-3px_-3px_6px_#ffffff] active:shadow-[inset_1px_1px_3px_#bebebe] transition-all text-xs"
            >
              ✕
            </button>

            <h3 className="text-lg font-black text-gray-800 mb-1 mt-2">扫码安全支付</h3>
            <p className="text-[10px] text-gray-400 font-medium mb-6">单号: {currentOrderNo}</p>

            <div className="bg-[#F0F2F5] p-5 rounded-[32px] inline-block shadow-[inset_5px_5px_10px_#bebebe,inset_-5px_-5px_10px_#ffffff] mb-6">
              {currentQrUrl ? (
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentQrUrl)}`}
                  alt="收银台二维码"
                  className="w-48 h-48 rounded-2xl bg-white p-2 border border-purple-500/10 shadow-sm"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-xs text-red-500">二维码加载失败</div>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="w-2 h-2 bg-[#9C27B0] rounded-full animate-ping"></span>
              <p className="text-xs font-black text-gray-700 tracking-wider">请使用支付宝/微信完成付款</p>
            </div>
            <p className="text-[10px] text-gray-400 font-medium">支付完成后系统将在3秒内自动为您充值到账</p>
          </div>
        </div>
      )}
    </main>
  );
}