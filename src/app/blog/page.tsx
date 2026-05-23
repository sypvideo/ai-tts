import React from 'react';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default async function BlogListPage({ searchParams }: { searchParams: { category?: string } }) {
  const postsDir = path.join(process.cwd(), 'posts');
  const filenames = fs.readdirSync(postsDir);

  let posts = filenames.map((filename) => {
    const filePath = path.join(postsDir, filename);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(fileContent);
    return {
      slug: filename.replace('.md', ''),
      title: data.title,
      date: data.date,
      category: data.category || '未分类',
    };
  });

  // 按日期降序排列（最新的文章在最上面）
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const category = (await searchParams).category || '全部';
  const filteredPosts = category === '全部' ? posts : posts.filter(p => p.category === category);

  const categories = ['全部', '配音技巧', '软件测评', '行业资讯'];

  return (
    <main className="min-h-screen bg-bg">
      <Navbar />
      <div className="max-w-4xl mx-auto pt-32 pb-20 px-4">
        <h1 className="text-4xl font-black text-dark mb-8">内容中心</h1>
        
        <div className="flex gap-2 mb-12">
          {categories.map(cat => (
            <Link 
              key={cat}
              href={`/blog?category=${cat}`}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${category === cat ? 'bg-dark text-white' : 'bg-white text-gray-500 hover:bg-gray-200'}`}
            >
              {cat}
            </Link>
          ))}
        </div>

        <div className="grid gap-6">
          {filteredPosts.map(post => (
            <div key={post.slug} className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow flex justify-between items-center">
              <div>
                <div className="flex gap-4 mb-2">
                  <span className="text-primary text-xs font-black uppercase">{post.category}</span>
                  <span className="text-gray-400 text-xs font-mono">{post.date}</span>
                </div>
                <h2 className="text-xl font-black text-dark">{post.title}</h2>
              </div>
              
              {/* 详情按钮 */}
              <Link 
                href={`/blog/${post.slug}`} 
                className="bg-gray-100 text-dark px-6 py-2 rounded-lg font-bold text-sm hover:bg-primary hover:text-white transition-colors"
              >
                详情 →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}