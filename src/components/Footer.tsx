"use client";

import React, { useState } from 'react';

export default function Footer() {
  // 💡 商业化运营配置中心（在这里修改您的真实 QQ 号）
  const QQ_NUMBER = "2457379514"; 
  const LEGAL_REPO_URL = "https://github.com/sypvideo/ai-dubbing-legal"; 
  
  const [copied, setCopied] = useState(false);

  // 一键复制 QQ 功能
  const handleCopyQQ = async () => {
    try {
      await navigator.clipboard.writeText(QQ_NUMBER);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = QQ_NUMBER;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <footer className="w-full bg-[#F0F2F5] text-gray-600 text-xs py-14 border-t border-gray-200/80 mt-16 relative z-10 select-none">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* 板块 1：产品定位与大厂信任背书 */}
        <div className="flex flex-col gap-3">
          <h4 className="text-gray-600 font-black text-sm tracking-wide">
            AI配音助手Pro
          </h4>
          <p className="leading-relaxed text-gray-600 font-medium">
            专为视频解说、自媒体矩阵及短视频创作打造的高表现力文字转语音（TTS）效率工具。
          </p>
          <div className="mt-2 pt-2 border-t border-gray-200/50 text-[11px] flex flex-col gap-1 text-gray-600 font-medium">
            <p>Cloud Service: <span className="font-semibold">Vercel</span></p>
            <p>TTS Technology: <span className="font-semibold">Volcengine (火山引擎)</span></p>
          </div>
        </div>
        
        {/* 板块 2：商业化合规与用户信任 */}
        <div className="flex flex-col gap-3">
          <h4 className="text-gray-600 font-black text-sm tracking-wide">法律与合规</h4>
          <ul className="flex flex-col gap-2.5 text-gray-600 font-semibold">
            <li>
              <a 
                href={`${LEGAL_REPO_URL}#-%E7%AC%AC%E4%B8%80%E9%83%A8%E5%88%86%E7%94%A8%E6%88%B7%E6%9C%8D%E5%8A%A1%E5%8D%8F%E8%AE%AE-terms-of-service`} 
                target="_blank" rel="noreferrer" className="hover:underline underline-offset-4 transition-all"
              >
                用户服务协议 (Terms)
              </a>
            </li>
            <li>
              <a 
                href={`${LEGAL_REPO_URL}#-%E7%AC%AC%E4%BA%8C%E9%83%A8%E5%88%86%E9%9A%90%E7%A7%81%E6%94%BF%E7%AD%96-privacy-policy`} 
                target="_blank" rel="noreferrer" className="hover:underline underline-offset-4 transition-all"
              >
                隐私政策 (Privacy Policy)
              </a>
            </li>
            <li>
              <a 
                href={`${LEGAL_REPO_URL}#-%E7%AC%AC%E4%B8%89%E9%83%A8%E5%88%86%E9%10%A0%E6%AC%BE%E6%94%BF%E7%AD%96%E4%B8%8E%E5%85%8D%E8%B4%A3%E5%A3%B0%E6%98%8E-refund-policy`} 
                target="_blank" rel="noreferrer" className="hover:underline underline-offset-4 transition-all"
              >
                退款政策与免责声明
              </a>
            </li>
          </ul>
        </div>

        {/* 板块 3：售后与客户服务出口 (带 QQ 在线闪烁标志) */}
        <div className="flex flex-col gap-3">
          <h4 className="text-gray-600 font-black text-sm tracking-wide">售后与帮助</h4>
          <ul className="flex flex-col gap-2 text-gray-600 font-medium">
            <li className="text-gray-600 text-[11px] leading-relaxed">
              遇到充值未到账、线路异常等问题？请联系客服协助：
            </li>
            <li className="mt-1">
              <div 
                onClick={handleCopyQQ}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F0F2F5] border border-gray-300 rounded-xl font-black tracking-wide cursor-pointer transition-all hover:scale-[1.02] shadow-[3px_3px_6px_#bebebe,-3px_-3px_6px_#ffffff] active:shadow-[inset_2px_2px_4px_#bebebe,inset_-2px_-2px_4px_#ffffff]"
              >
                {/* QQ 经典闪烁绿点 */}
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span>QQ客服：{QQ_NUMBER}</span>
                <span className="text-[10px] bg-gray-200/60 px-1.5 py-0.5 rounded-md font-bold scale-90">
                  {copied ? "已复制" : "点击复制"}
                </span>
              </div>
            </li>
            <li className="text-[10px] text-gray-600/80 italic pt-1">
              ⏱️ 工作日 10:00 - 17:30 在线响应
            </li>
          </ul>
        </div>

        {/* 板块 4：创作者流量入口 */}
        <div className="flex flex-col gap-3">
          <h4 className="text-gray-600 font-black text-sm tracking-wide">创作者生态</h4>
          <p className="text-[11px] text-gray-600 leading-normal">
            面向短剧解说团队、MCN 机构、小说推文矩阵提供极致算力支持。
          </p>
          <div 
            onClick={handleCopyQQ}
            className="w-full mt-1 p-3 bg-[#F0F2F5] border border-gray-300 rounded-2xl cursor-pointer hover:border-gray-400 transition-all shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_5px_#bebebe]"
          >
            <p className="font-black text-xs tracking-wider mb-0.5">🚀 申请大客户特惠通道</p>
            <p className="text-[10px] font-medium opacity-80">百万字以上打包采购 / 商业授权 / 商务合作</p>
          </div>
        </div>

      </div>

      {/* 底部纯平版权栏 + 无缝整合不蒜子统计 */}
      <div className="max-w-6xl mx-auto px-6 mt-12 pt-6 border-t border-gray-200/40 text-center text-[10px] font-bold tracking-widest flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} AI配音助手Pro (aidubbing.top). All rights reserved.</p>
        
        {/* 📊 不蒜子客流数据展示 */}
        <div className="flex items-center gap-4 font-medium tracking-normal opacity-80">
          <span id="busuanzi_container_site_pv" className="hidden">
            本站总访问量 <span id="busuanzi_value_site_pv" className="font-black">--</span> 次
          </span>
          <span id="busuanzi_container_site_uv" className="hidden">
            访客数 <span id="busuanzi_value_site_uv" className="font-black">--</span> 人
          </span>
        </div>
      </div>
    </footer>
  );
}