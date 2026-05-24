import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI 配音助手 Pro - 免费的文字转语音工具",
  description: "基于 Seed-TTS 2.0 的商业级配音平台，支持情感标签。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F5F5F7] text-gray-900 overflow-x-hidden">
        {/* 1. 顶部全屏悬浮导航栏 */}
        <Navbar />

        {/* 2. 主内容容器 */}
        <div className="pt-20 flex flex-col min-h-screen relative z-10 justify-between">
          
          <div className="flex flex-col flex-1">
            {/* 页面主体内容 */}
            <main className="flex-1 flex flex-col">
              {children}
            </main>
          </div>

          {/* 3. 挂载融合了统计功能的页尾 */}
          <Footer />
        </div>

        {/* 4. 统计脚本 - 放在全局最底部静默运行 */}
        <Script 
          src="https://stats.buqiuren.com/script.js" 
          strategy="afterInteractive" 
        />

        <Script 
          src="https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js" 
          strategy="afterInteractive" 
        />
      </body>
    </html>
  );
}