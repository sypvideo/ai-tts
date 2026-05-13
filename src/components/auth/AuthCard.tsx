'use client';
import { motion } from 'framer-motion';

export default function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5] p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md p-8 rounded-[40px] bg-[#F0F2F5]"
        style={{
          boxShadow: '20px 20px 60px #bebebe, -20px -20px 60px #ffffff',
        }}
      >
        {/* 磨砂玻璃装饰 */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>

        <div className="relative backdrop-blur-sm bg-white/30 rounded-[30px] p-6 border border-white/20">
          {children}
        </div>
      </motion.div>
    </div>
  );
}