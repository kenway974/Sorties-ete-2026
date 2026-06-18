"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownProps {
  children: string;
  className?: string;
}

/**
 * Renders user/imported activity descriptions as Markdown with consistent,
 * readable typography. Safe by default (react-markdown doesn't use
 * dangerouslySetInnerHTML and we don't enable rehype-raw).
 */
export default function Markdown({ children, className = "" }: MarkdownProps) {
  return (
    <div className={`text-gray-700 dark:text-gray-300 leading-relaxed space-y-3 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="leading-relaxed">{children}</p>,
          h1: ({ children }) => <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-4">{children}</h2>,
          h2: ({ children }) => <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-4">{children}</h3>,
          h3: ({ children }) => <h4 className="text-base font-semibold text-gray-900 dark:text-white mt-3">{children}</h4>,
          strong: ({ children }) => <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => <ul className="list-disc pl-5 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-navy dark:text-brand-gold font-medium underline underline-offset-2 hover:opacity-80"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-brand-gold/60 pl-4 italic text-gray-600 dark:text-gray-400">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="border-gray-200 dark:border-gray-700" />,
          code: ({ children }) => (
            <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-sm font-mono">{children}</code>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
