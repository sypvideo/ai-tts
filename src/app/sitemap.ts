import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const postsDir = path.join(process.cwd(), 'posts');
  const filenames = fs.readdirSync(postsDir);

  // 获取所有文章的路径
  const posts = filenames.map((filename) => {
    const slug = filename.replace('.md', '');
    return {
      url: `https://aidubbing.top/blog/${slug}`, // 请替换为你真实的线上域名
      lastModified: new Date(),
    };
  });

  // 返回网站地图索引
  return [
    {
      url: 'https://aidubbing.top',
      lastModified: new Date(),
    },
    {
      url: 'https://aidubbing.top/blog',
      lastModified: new Date(),
    },
    ...posts,
  ];
}