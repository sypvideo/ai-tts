'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { handleAuth, sendVerificationCode } from './actions'; 
// 引入 Auth.js 提供的客户端方法
import { signIn } from "next-auth/react";

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null); // 社交登录状态
  const [countdown, setCountdown] = useState(0); 
  const [message, setMessage] = useState({ type: '', content: '' });

  // 倒计时核心逻辑
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // 发送验证码处理
  const handleGetCode = async () => {
    if (!email || countdown > 0) return;
    setLoading(true);
    setMessage({ type: '', content: '' });
    
    try {
      const result = await sendVerificationCode(email);
      if (result.error) {
        setMessage({ type: 'error', content: result.error });
      } else {
        setCountdown(60);
        setMessage({ type: 'success', content: '验证码已发送，请查收邮件' });
      }
    } catch (err) {
      setMessage({ type: 'error', content: '网络异常，请稍后再试' });
    } finally {
      setLoading(false);
    }
  };

  // 社交登录处理函数
  const handleSocialSignIn = async (provider: 'github' | 'google') => {
    setSocialLoading(provider);
    try {
      // callbackUrl 确保登录后跳转回主页
      await signIn(provider, { callbackUrl: '/' });
    } catch (error) {
      setMessage({ type: 'error', content: '社交登录启动失败' });
      setSocialLoading(null);
    }
  };

  // 邮箱登录/注册提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    
    setLoading(true);
    setMessage({ type: '', content: '' });

    const formData = new FormData();
    formData.append('email', email);
    formData.append('code', code);
    formData.append('name', name || '新用户');

    try {
      const result = await handleAuth(formData);
      if (result.error) {
        setMessage({ type: 'error', content: result.error });
      } else {
        setMessage({ type: 'success', content: '登录成功！正在进入系统...' });
        setTimeout(() => { window.location.href = '/'; }, 1000);
      }
    } catch (error) {
      setMessage({ type: 'error', content: '系统遇到意外，请稍后再试' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F0F2F5] overflow-hidden relative">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-200 rounded-full blur-[100px] opacity-60 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-200 rounded-full blur-[100px] opacity-60 animate-pulse" />

      <motion.div layout className="relative z-10 w-full max-w-[450px] p-1">
        <div 
          className="bg-[#F0F2F5] rounded-[50px] p-10 transition-all duration-500"
          style={{ boxShadow: '20px 20px 60px #bebebe, -20px -20px 60px #ffffff' }}
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              AI 配音助手 Pro
            </h1>
            <p className="text-gray-400 mt-2 text-[10px] font-bold uppercase tracking-[0.2em]">
              安全验证登录
            </p>
          </div>

          {/* 原有邮箱登录表单 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-gray-400 ml-4 tracking-widest">电子邮箱地址</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="请输入您的邮箱"
                className="w-full h-14 bg-[#F0F2F5] rounded-2xl px-6 outline-none shadow-[inset_6px_6px_12px_#bebebe,inset_-6px_-6px_12px_#ffffff] focus:shadow-[inset_4px_4px_8px_#9c27b033,inset_-4px_-4px_8px_#ffffff] text-gray-600 text-sm transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-gray-400 ml-4 tracking-widest">验证码</label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="6位数字验证码"
                  className="w-full h-14 bg-[#F0F2F5] rounded-2xl px-6 outline-none shadow-[inset_6px_6px_12px_#bebebe,inset_-6px_-6px_12px_#ffffff] focus:shadow-[inset_4px_4px_8px_#9c27b033,inset_-4px_-4px_8px_#ffffff] text-gray-600 font-bold tracking-[0.3em] text-sm"
                />
                <button
                  type="button"
                  onClick={handleGetCode}
                  disabled={countdown > 0 || !email || loading}
                  className={`absolute right-2 h-10 px-4 rounded-xl text-[10px] font-bold transition-all shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#bebebe,inset_-2px_-2px_4px_#ffffff] ${
                    countdown > 0 ? 'text-gray-300 cursor-not-allowed' : 'text-[#9C27B0]'
                  }`}
                >
                  {countdown > 0 ? `${countdown}s 后重发` : '获取验证码'}
                </button>
              </div>
            </div>

            {message.content && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className={`text-center text-xs font-medium ${message.type === 'error' ? 'text-red-400' : 'text-green-500'}`}
              >
                {message.content}
              </motion.p>
            )}

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading || !code}
              type="submit"
              className="w-full h-14 bg-[#F0F2F5] rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] text-[#9C27B0] shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] disabled:opacity-50 transition-all"
            >
              {loading ? '正在验证...' : '立即登录 / 注册'}
            </motion.button>
          </form>

          {/* 新增社交登录区域 */}
          <div className="mt-10 space-y-6">
            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-gray-200"></div>
              <span className="bg-[#F0F2F5] px-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest absolute">
                或者通过以下方式登录
              </span>
            </div>

            <div className="flex gap-6">
              {/* GitHub 登录按钮 */}
              <button
                type="button"
                disabled={!!socialLoading}
                onClick={() => handleSocialSignIn('github')}
                className="flex-1 h-14 bg-[#F0F2F5] rounded-2xl flex items-center justify-center shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] hover:text-[#9C27B0] transition-all"
              >
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {socialLoading === 'github' ? '跳转中...' : 'GitHub'}
                </span>
              </button>

              {/* Google 登录按钮 */}
              <button
                type="button"
                disabled={!!socialLoading}
                onClick={() => handleSocialSignIn('google')}
                className="flex-1 h-14 bg-[#F0F2F5] rounded-2xl flex items-center justify-center shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] hover:text-[#9C27B0] transition-all"
              >
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {socialLoading === 'google' ? '跳转中...' : 'Google'}
                </span>
              </button>
            </div>
          </div>

          <div className="mt-8 text-center space-y-2">
             <p className="text-[10px] text-gray-400 font-medium">
               登录即代表您同意我们的《服务条款》
             </p>
             <p className="text-[10px] text-purple-400/80 font-bold">
               新用户首次登录立赠 1500 算力积分
             </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}