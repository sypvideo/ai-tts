import React from 'react';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Metadata } from 'next';

// 1. 自动生成 SEO 元数据（搜索引擎名片）
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = await params;
  const filePath = path.join(process.cwd(), 'posts', `${slug}.md`);
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);
  
  return {
    title: `${data.title} | AI 配音助手 Pro`,
    description: content.substring(0, 150).replace(/[#*`]/g, ''), // 清除 Markdown 符号，提取纯文本摘要
  };
}

async function getPost(slug: string) {
  const filePath = path.join(process.cwd(), 'posts', `${slug}.md`);
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);
  return { title: data.title, date: data.date, content };
}

function getAllPosts() {
  const postsDir = path.join(process.cwd(), 'posts');
  return fs.readdirSync(postsDir).map(filename => ({
    slug: filename.replace('.md', ''),
    title: matter(fs.readFileSync(path.join(postsDir, filename), 'utf-8')).data.title
  }));
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const post = await getPost(slug);
  const allPosts = getAllPosts();
  const currentIndex = allPosts.findIndex(p => p.slug === slug);
  const prevPost = allPosts[currentIndex - 1];
  const nextPost = allPosts[currentIndex + 1];

  const htmlContent = marked.parse(post.content) as string;

  return (
    <main className="min-h-screen bg-bg">
      <Navbar />
      <article className="max-w-3xl mx-auto pt-32 pb-20 px-4">
        <Link href="/blog" className="text-gray-500 hover:text-primary font-bold mb-8 block">← 返回内容中心</Link>

        <header className="mb-12 border-b border-gray-100 pb-8">
          <p className="text-primary font-black text-sm mb-4">{post.date}</p>
          <h1 className="text-4xl font-black text-dark">{post.title}</h1>
        </header>

        <div className="prose prose-stone prose-lg max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: htmlContent }} />

        <div className="my-16 p-8 bg-dark rounded-2xl text-center">
          <h3 className="text-white text-2xl font-black mb-4">准备好打造你的爆款配音了吗？</h3>
          <Link href="/" className="inline-block bg-primary text-white px-8 py-4 rounded-full font-black hover:scale-105 transition-transform shadow-lg">
            立即前往首页，粘贴文案开始体验 →
          </Link>
        </div>

        <div className="flex justify-between border-t pt-8">
          {prevPost ? <Link href={`/blog/${prevPost.slug}`} className="text-sm font-bold text-gray-500 hover:text-primary">← {prevPost.title}</Link> : <div />}
          {nextPost ? <Link href={`/blog/${nextPost.slug}`} className="text-sm font-bold text-gray-500 hover:text-primary">{nextPost.title} →</Link> : <div />}
        </div>
      </article>
    </main>
  );
}