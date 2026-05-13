"use client";
import { useState, useCallback, useRef } from 'react';

export function useDubbing() {
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  
  // 使用 Ref 追踪音频 URL，方便释放内存
  const urlRef = useRef<string | null>(null);

  const generate = useCallback(async (inputText: string, voiceId: string) => {
    if (!inputText || loading) return;

    setLoading(true);
    try {
      // 【核心改造】：将自定义标签转换为火山引擎支持的 SSML
      const hasTags = /\[#(\w+)\]/.test(inputText);
      
      let processedText = inputText;
      if (hasTags) {
        // 将 [#emotion] 转换为 SSML 标签
        const innerContent = inputText.replace(/\[#(\w+)\]([\s\S]*?)\[\/#\1\]/g, (match, tag, content) => {
          return `<style name="${tag}">${content}</style>`;
        });
        processedText = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="zh-CN">${innerContent}</speak>`;
      }

      const response = await fetch('/api/dubbing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: processedText, 
          voiceId 
        }),
      });

      if (!response.ok) throw new Error('合成失败');

      // 处理二进制流
      const blob = await response.blob();
      
      // 释放之前的旧 URL 内存
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      return url;
    } catch (error) {
      console.error("Dubbing Error:", error);
    } finally {
      setLoading(false);
    }
  }, [loading, audioUrl]);

  // 注意这里：之前你漏掉了这个返回对象和最外层的大括号
  return {
    generate,
    loading,
    audioUrl,
    progress
  };
} 