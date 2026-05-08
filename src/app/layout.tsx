import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import Navbar from "../components/Navbar";
import Announcement from "../components/Announcement";
import VisitorStats from "../components/VisitorStats";
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
  title: "AI 配音助手 Pro - 专业短剧剧本配音工具",
  description: "基于 Seed-TTS 2.0 的商业级配音平台，支持情感标签注入与 3D 拟态 UI。",
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
        {/* 1. 顶部全屏悬浮导航栏 (已支持紫色视觉与路由跳转) */}
        <Navbar />

        {/* 2. 主内容容器：pt-20 避开导航栏高度 */}
        <div className="pt-20 flex flex-col min-h-screen relative z-10">
          
          {/* 3. 运行公告栏 - 仅在必要时展示，或全局保持统一提醒 */}
          <Announcement />

          {/* 4. 页面主体内容 */}
          <main className="flex-1 flex flex-col">
            {children}
          </main>
        </div>

        {/* 5. 访客统计挂件 - 右下角低调运行 */}
        <VisitorStats />

        {/* 6. 统计脚本 */}
        <Script 
          src="https://stats.buqiuren.com/script.js" 
          strategy="afterInteractive" 
        />
      </body>
    </html>
  );
}