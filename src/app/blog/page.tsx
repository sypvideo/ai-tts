import React from 'react';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default async function BlogListPage({ searchParams }: { searchParams: { category?: string, page?: string } }) {
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

  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // 分页逻辑
  const postsPerPage = 5;
  const currentPage = Number((await searchParams).page) || 1;
  const category = (await searchParams).category || '全部';
  
  const filteredPosts = category === '全部' ? posts : posts.filter(p => p.category === category);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const paginatedPosts = filteredPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

  const categories = ['全部', '配音技巧', '软件测评', '行业资讯'];

  return (
    <main className="min-h-screen bg-bg">
      <Navbar />
      <div className="max-w-4xl mx-auto pt-32 pb-20 px-4">
        <h1 className="text-4xl font-black text-dark mb-8">内容中心</h1>
        
        <div className="flex gap-2 mb-12 flex-wrap">
          {categories.map(cat => (
            <Link key={cat} href={`/blog?category=${cat}`} className={`px-6 py-2 rounded-full text-sm font-bold ${category === cat ? 'bg-dark text-white' : 'bg-white text-gray-500'}`}>
              {cat}
            </Link>
          ))}
        </div>

        <div className="grid gap-6">
          {paginatedPosts.map(post => (
            <div key={post.slug} className="bg-white p-8 rounded-2xl border border-gray-100 flex justify-between items-center">
              <div>
                <span className="text-primary text-xs font-black uppercase">{post.category}</span>
                <h2 className="text-xl font-black text-dark mt-2">{post.title}</h2>
                <p className="text-gray-400 text-xs mt-1">{post.date}</p>
              </div>
              <Link href={`/blog/${post.slug}`} className="bg-gray-100 px-6 py-2 rounded-lg font-bold text-sm hover:bg-primary hover:text-white transition-colors">详情 →</Link>
            </div>
          ))}
        </div>

        {/* 分页导航 */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            {Array.from({ length: totalPages }).map((_, i) => (
              <Link key={i} href={`/blog?page=${i + 1}${category !== '全部' ? `&category=${category}` : ''}`} 
                    className={`px-4 py-2 rounded-lg font-bold ${currentPage === i + 1 ? 'bg-dark text-white' : 'bg-white text-gray-500'}`}>
                {i + 1}
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}