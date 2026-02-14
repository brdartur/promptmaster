import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = "" }) => {
  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        components={{
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match && !String(children).includes('\n');
            return isInline ? (
              <code className="bg-gray-800 text-pink-400 px-1 py-0.5 rounded text-sm font-mono" {...props}>
                {children}
              </code>
            ) : (
              <div className="relative group">
                <code className="block bg-gray-900 text-gray-200 p-4 rounded-lg text-sm font-mono overflow-x-auto my-2 border border-gray-700" {...props}>
                  {children}
                </code>
              </div>
            );
          },
          p({ children }) {
             return <p className="mb-4 text-gray-300 leading-relaxed">{children}</p>
          },
          strong({ children }) {
             return <strong className="font-bold text-white">{children}</strong>
          },
          ul({ children }) {
            return <ul className="list-disc pl-5 mb-4 space-y-1 text-gray-300">{children}</ul>
          },
          ol({ children }) {
            return <ol className="list-decimal pl-5 mb-4 space-y-1 text-gray-300">{children}</ol>
          },
          h1({children}) {
             return <h1 className="text-2xl font-bold text-white mb-4">{children}</h1>
          },
          h2({children}) {
            return <h2 className="text-xl font-bold text-indigo-400 mb-3 mt-6">{children}</h2>
         },
         h3({children}) {
            return <h3 className="text-lg font-bold text-white mb-2 mt-4">{children}</h3>
         },
         blockquote({ children }) {
            return <blockquote className="border-l-4 border-indigo-500 pl-4 italic text-gray-400 my-4 bg-gray-800/50 py-2 pr-2 rounded-r">{children}</blockquote>
         }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
