import { marked } from 'marked';

export default function MarkdownRenderer({ content }: { content: string }) {
  // 使用 marked 解析 Markdown 为 HTML 字符串
  const htmlContent = marked.parse(content) as string;

  return (
    <div 
      className="prose prose-stone prose-lg max-w-none text-gray-700 leading-relaxed"
      dangerouslySetInnerHTML={{ __html: htmlContent }} 
    />
  );
}