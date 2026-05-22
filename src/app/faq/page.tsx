"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';

type TabType = 'quota' | 'pay';

interface FAQItem {
  q: string;
  a: string;
}

export default function FAQPage() {
  const [activeTab, setActiveTab] = useState<TabType>('quota');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqData: Record<TabType, FAQItem[]> = {
    quota: [
      { 
        q: "为什么我输入的字数没超过 1500 字，系统提示无法继续输入？", 
        a: "如果您目前处于【未登录（游客）】状态，文字编辑器面板限制单次最高输入为 300 字。您只需点击页面顶部的“登录”（完全免费），登录成功后编辑器将自动升级到 1500 字上限，同时总额度也会免费提到 1500 字。" 
      },
      { 
        q: "免费的 300 字（游客）和 1500 字（登录用户）额度，每天会刷新重置吗？", 
        a: "不会。由于 AI 语音合成需要消耗高昂的云端算力， 300 字与 1500 字均为一次性免费体验额度，用完即止，不会按天恢复。额度耗尽后，您可以通过购买极简充值加油包继续合成。" 
      },
      { 
        q: "登录之后，我之前的游客额度会消失吗？", 
        a: "不会。登录后，系统会自动将您从游客状态升级为正式用户，您的总免费额度将直接覆盖并提升至 1500 字，且单次合成上限从 300 字解锁至 1500 字。" 
      }
    ],
    pay: [
      { 
        q: "字数额度是怎么扣除的？标点符号和空格算字数吗？", 
        a: "我们的计费系统只统计纯汉字、英文字母和数字。文本中的空格、标点符号、英文符号等一律免费，完全不计入扣费范围。" 
      },
      { 
        q: "如果合成到一半报错或者网络断开，会扣我的额度吗？", 
        a: "不会。系统只有在底层大模型成功生成音频并返回下载链接时，才会执行扣费。如果因为接口超时、系统维护等导致合成报错，您的额度不会受到任何损失。" 
      },
      { 
        q: "充值购买的套餐字数会过期吗？可以申请退款吗？", 
        a: "所有付费购买的字数加油包均永久有效，不清零、不过期。由于语音合成属于虚拟数字商品，一经充值成功额度到账，概不接受任何形式的退款申请。建议您充值前充分利用免费额度进行测试。" 
      },
      { 
        q: "生成的音频有版权吗？我可以发布到抖音、小红书商用吗？", 
        a: "本平台仅作为技术工具提供方，转换出来的音频版权 100% 归您个人所有。您可以自由地将其剪辑到短视频中，并发布到抖音、快手、小红书等平台进行商业变现，无需向我们支付额外授权费。" 
      }
    ]
  };

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setOpenIndex(null); 
  };

  return (
    <main className="min-h-screen bg-[#F0F2F5] relative overflow-hidden select-none">
      <Navbar />

      <div className="max-w-6xl mx-auto pt-28 pb-20 px-4 md:px-8 relative z-10">
        <div className="text-gray-400 text-xs mb-8 tracking-wider font-medium">
          <a href="/" className="hover:text-[#9C27B0] transition-colors">首页</a> 
          <span className="mx-2">/</span> 
          <span className="text-gray-600">常见问题解答</span>
        </div>

        <div className="mb-10">
          <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight">
            帮助与<span className="text-[#9C27B0]">服务中心</span>
          </h1>
          <p className="text-xs text-gray-400 font-bold tracking-widest mt-2 uppercase">FAQ & SUPPORT CENTER</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* 左侧菜单 */}
          <div className="w-full md:w-1/4 sticky top-28">
            <div className="bg-[#F0F2F5] rounded-[28px] p-4 shadow-[12px_12px_25px_#bebebe,-12px_-12px_25px_#ffffff]">
              <h2 className="text-sm font-black text-gray-800 px-3 pt-2 pb-4 border-b border-gray-300/40 tracking-wider">
                分类目录
              </h2>
              <div className="flex flex-col space-y-3 mt-4">
                <button 
                  onClick={() => handleTabChange('quota')}
                  className={`group flex justify-between items-center text-left text-xs h-12 px-5 rounded-2xl transition-all ${
                    activeTab === 'quota' 
                      ? 'bg-[#262626] text-white font-black shadow-[4px_4px_10px_rgba(0,0,0,0.15)]' 
                      : 'text-gray-600 font-bold bg-[#F0F2F5] shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] hover:text-[#9C27B0] active:shadow-[inset_2px_2px_5px_#bebebe]'
                  }`}
                >
                  <span>额度与登录问题</span>
                  <span className={`text-xs transition-transform duration-300 ${activeTab === 'quota' ? 'text-pink-400 translate-x-1' : 'text-gray-400 group-hover:text-[#9C27B0]'}`}>→</span>
                </button>
                
                <button 
                  onClick={() => handleTabChange('pay')}
                  className={`group flex justify-between items-center text-left text-xs h-12 px-5 rounded-2xl transition-all ${
                    activeTab === 'pay' 
                      ? 'bg-[#262626] text-white font-black shadow-[4px_4px_10px_rgba(0,0,0,0.15)]' 
                      : 'text-gray-600 font-bold bg-[#F0F2F5] shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] hover:text-[#9C27B0] active:shadow-[inset_2px_2px_5px_#bebebe]'
                  }`}
                >
                  <span>充值与使用问题</span>
                  <span className={`text-xs transition-transform duration-300 ${activeTab === 'pay' ? 'text-pink-400 translate-x-1' : 'text-gray-400 group-hover:text-[#9C27B0]'}`}>→</span>
                </button>
              </div>
            </div>
          </div>

          {/* 右侧折叠面板 */}
          <div className="w-full md:w-3/4 flex flex-col space-y-6">
            <div className="px-5 py-2 bg-white/50 border border-purple-500/10 rounded-full w-fit shadow-[2px_2px_5px_#bebebe]">
              <h3 className="text-xs font-black text-[#9C27B0] tracking-wider">
                📌 {activeTab === 'quota' ? '额度与登录相关问题说明' : '充值与使用相关问题说明'}
              </h3>
            </div>
            
            <div className="space-y-5">
              {faqData[activeTab].map((item, index) => {
                const isCurrentOpen = openIndex === index;
                return (
                  <div 
                    key={index} 
                    className={`bg-[#F0F2F5] rounded-[24px] overflow-hidden transition-all duration-300 border border-transparent ${
                      isCurrentOpen 
                        ? 'shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff]' 
                        : 'shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff]'
                    }`}
                  >
                    <button
                      onClick={() => handleToggle(index)}
                      className="w-full flex justify-between items-center text-left p-5 md:p-6 transition-colors group"
                    >
                      <div className="flex items-start space-x-4 pr-4">
                        <span className={`w-6 h-6 flex items-center justify-center rounded-xl text-xs font-black shrink-0 transition-colors shadow-[2px_2px_5px_#bebebe,-2px_-2px_5px_#ffffff] ${
                          isCurrentOpen ? 'bg-[#9C27B0] text-white' : 'bg-white text-[#9C27B0]'
                        }`}>
                          Q
                        </span>
                        <span className="text-gray-800 font-black text-xs md:text-sm leading-relaxed pt-0.5 group-hover:text-[#9C27B0] transition-colors">
                          {item.q}
                        </span>
                      </div>
                      <span className={`w-6 h-6 flex items-center justify-center rounded-full bg-[#F0F2F5] text-gray-400 font-black text-xs shrink-0 shadow-[2px_2px_5px_#bebebe,-2px_-2px_5px_#ffffff] transition-transform duration-300 ${
                        isCurrentOpen ? 'rotate-180 text-[#9C27B0] shadow-[inset_1px_1px_3px_#bebebe]' : ''
                      }`}>
                        {isCurrentOpen ? '−' : '+'}
                      </span>
                    </button>

                    <div className={`grid transition-all duration-300 ease-in-out ${isCurrentOpen ? 'grid-rows-[1fr] opacity-100 border-t border-gray-300/20 bg-white/20' : 'grid-rows-[0fr] opacity-0'}`}>
                      <div className="overflow-hidden">
                        <div className="p-5 md:p-6 pl-14 md:pl-16 text-gray-600 text-xs leading-relaxed flex items-start space-x-3">
                          <span className="text-pink-600 font-black text-xs shrink-0">A:</span>
                          <span className="font-medium tracking-wide">{item.a}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="bg-[#F0F2F5] rounded-[24px] p-5 text-xs text-gray-400 font-bold leading-relaxed shadow-[inset_3px_3px_6px_#bebebe,inset_-3px_-3px_6px_#ffffff] border border-dashed border-purple-500/20 flex items-center gap-3">
              <span className="text-base shrink-0 animate-bounce">💡</span>
              <p>
                如遇特殊报错、充值未及时到账等异常情况，请复制您的 <span className="text-[#9C27B0] underline decoration-wavy">用户 ID</span> 并联系页尾客服微信，我们将于 24 小时内为您人工快速处理。
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}