// app/page.tsx
import React from 'react';
import { DUBBING_VOICES } from '@/constants/voicesData';
import { getUserProfile } from '@/app/login/actions';

// 引入客户端工作台组件
import DubbingClientWrapper from '@/components/DubbingClientWrapper';

export default async function DubbingProPage() {
  // 1. 在服务端获取用户信息（包括 credits, role 等）
  const user = await getUserProfile();

  return (
    <main className="min-h-screen bg-[#F0F2F5] flex flex-col">
      {/* 2. 将获取到的 user 数据作为初始值传递给客户端容器 */}
      {/* 注意：这里的 initialUser 会被传给下层的 EditorArea */}
      <DubbingClientWrapper 
        initialUser={user} 
        voices={DUBBING_VOICES} 
      />
    </main>
  );
}