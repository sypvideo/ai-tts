"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { getUserProfile } from '@/app/login/actions';
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
}

export default function PricingPage() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  const plans: Plan[] = [
    { id: 'base', name: '基础包', credits: 20, price: 9.9, unit: 'k', color: '#9C27B0', desc: '适合个人偶尔尝试' },
    { id: 'std', name: '标准包', credits: 120, price: 39, unit: 'k', color: '#9C27B0', desc: '高性价比，自媒体首选', popular: true },
    { id: 'pro', name: '专业包', credits: 400, price: 99, unit: 'k', color: '#9C27B0', desc: '商业创作，极致成本' },
  ];

  // 获取登录用户信息
  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getUserProfile();
      if (userData) {
        setUser(userData as any);
      }
    };
    fetchUser();
  }, []);

  // 处理购买逻辑
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
          credits: plan.credits * 1000, // 将 k 转换为实际字符数
          userId: user.id
        }),
      });

      const data = await response.json();

      if (data.payUrl) {
        // 跳转到支付网关
        window.location.href = data.payUrl;
      } else {
        alert(data.error || "创建订单失败，请稍后再试");
      }
    } catch (error) {
      console.error("Purchase error:", error);
      alert("网络错误，请检查您的连接");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#F9F9FB]">
      <Navbar />
      
      <div className="pt-32 pb-20 px-8 flex flex-col items-center">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
            选择适合您的<span className="text-[#9C27B0]">创作包</span>
          </h1>
          <p className="text-gray-400 font-bold uppercase tracking-[0.4em] text-xs">
            Unleash your creativity with Pro Credits
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`relative bg-white rounded-[40px] p-10 border-2 transition-all hover:scale-[1.03] duration-300 flex flex-col ${
                plan.popular ? 'border-[#9C27B0] shadow-2xl shadow-[#9C27B0]/10' : 'border-transparent shadow-xl shadow-gray-200/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#9C27B0] text-white text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-lg z-10">
                  Most Popular
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-xl font-black text-gray-800 mb-2">{plan.name}</h3>
                <p className="text-xs text-gray-400 font-medium">{plan.desc}</p>
              </div>

              <div className="mb-10 text-center py-8 bg-[#F9F9FB] rounded-[32px]">
                <div className="flex items-baseline justify-center">
                  <span className="text-6xl font-black text-gray-900 tracking-tighter">{plan.credits}</span>
                  <span className="text-2xl font-black text-gray-900 ml-1">{plan.unit}</span>
                </div>
                <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-2 block">可用字符额度</span>
              </div>

              <div className="text-center mb-10 mt-auto">
                <span className="text-sm font-bold text-gray-400 mr-1 uppercase">Price</span>
                <span className="text-4xl font-black text-[#9C27B0]">￥{plan.price}</span>
              </div>

              <button 
                onClick={() => handlePurchase(plan)}
                disabled={loadingId !== null}
                className={`w-full py-5 rounded-[24px] font-black text-xs tracking-[0.2em] uppercase transition-all active:scale-95 flex items-center justify-center ${
                  loadingId === plan.id ? 'opacity-70 cursor-not-allowed' : ''
                } ${
                  plan.popular ? 'bg-[#9C27B0] text-white shadow-lg shadow-[#9C27B0]/20 hover:bg-[#8E24AA]' : 'bg-gray-900 text-white hover:bg-black'
                }`}
              >
                {loadingId === plan.id ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  '立即订购'
                )}
              </button>
            </div>
          ))}
        </div>

        {/* 底部补充说明 */}
        <div className="mt-20 text-center max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 mb-6">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Secure Payment Gateway</span>
          </div>
          <p className="text-gray-400 text-sm font-medium leading-relaxed">
            所有套餐均为一次性购买，字符额度永久有效。
            <br />
            完成首充后可解锁更高高级配音员权限及声音复刻优先体验权。
          </p>
        </div>
      </div>
    </main>
  );
}