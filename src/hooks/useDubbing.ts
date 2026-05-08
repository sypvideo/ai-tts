"use client";
import { useState, useCallback, useRef } from 'react';

export function useDubbing() {
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  
  // 使用 Ref 追踪音频 URL，方便释放内存
  const urlRef = useRef<string | null>(null);

  // src/hooks/useDubbing.ts

// ... 省略之前的状态定义

const generate = useCallback(async (inputText: string, voiceId: string) => {
  if (!inputText || loading) return;

  setLoading(true);
  try {
    // 【核心改造】：将自定义标签转换为火山引擎支持的 SSML
    // 检查是否包含自定义情感标签
    const hasTags = /\[#(\w+)\]/.test(inputText);
    
    let processedText = inputText;
    if (hasTags) {
      // 1. 将内容包装在 <speak> 标签内
      // 2. 将 [#emotion] 转换为豆包支持的标签（此处根据火山 2.0 文档适配，一般是 <emotion> 或 <style>）
      // 假设火山引擎的语法是 <speak><style name="happy">内容</style></speak>
      const innerContent = inputText.replace(/\[#(\w+)\]([\s\S]*?)\[\/#\1\]/g, (match, tag, content) => {
        return `<style name="${tag}">${content}</style>`;
      });
      processedText = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="zh-CN">${innerContent}</speak>`;
    }

    const response = await fetch('/api/dubbing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        text: processedText, // 这里发送封装好的文本
        voiceId 
      }),
    });

    if (!response.ok) throw new Error('合成失败');

    // 处理二进制流
    const blob = await response.blob();
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