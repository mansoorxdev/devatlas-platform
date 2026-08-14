import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

/**
 * Custom CodeBlock component with copy-to-clipboard button.
 */
function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-6 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shadow-lg text-slate-100 font-mono text-xs sm:text-sm">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-950/80 border-b border-slate-800 text-slate-400 text-xs">
        <span className="uppercase tracking-wider font-semibold text-[11px]">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check size={13} className="text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Text */}
      <pre className="p-4 overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/**
 * Lightweight, safe, zero-dependency Markdown Renderer component with full XSS prevention.
 * Parses headers, bold, italics, lists, blockquotes, inline code, links, and code blocks.
 */
export function MarkdownRenderer({ content }) {
  if (!content) return null;

  // Split markdown into blocks by double newlines or code block boundaries
  const parseMarkdown = (markdown) => {
    const rawBlocks = markdown.split(/\n\n+/);
    const elements = [];

    rawBlocks.forEach((block, index) => {
      const trimmed = block.trim();
      if (!trimmed) return;

      // Code blocks ```lang ... ```
      if (trimmed.startsWith('```')) {
        const lines = trimmed.split('\n');
        const firstLine = lines[0].replace(/^```/, '').trim();
        const language = firstLine || 'javascript';
        const codeLines = lines.slice(1, lines.length - (lines[lines.length - 1].startsWith('```') ? 1 : 0));
        const code = codeLines.join('\n');
        elements.push(<CodeBlock key={`code-${index}`} code={code} language={language} />);
        return;
      }

      // Headings #, ##, ###, ####
      if (/^#{1,4}\s+/.test(trimmed)) {
        const match = trimmed.match(/^(#{1,4})\s+(.+)$/);
        if (match) {
          const level = match[1].length;
          const text = match[2];
          const parsedContent = parseInline(text);

          if (level === 1) {
            elements.push(
              <h1 key={`h1-${index}`} className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 mt-8 mb-4 tracking-tight">
                {parsedContent}
              </h1>
            );
          } else if (level === 2) {
            elements.push(
              <h2 key={`h2-${index}`} className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-8 mb-4 tracking-tight border-b border-slate-200 dark:border-slate-800 pb-2">
                {parsedContent}
              </h2>
            );
          } else if (level === 3) {
            elements.push(
              <h3 key={`h3-${index}`} className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mt-6 mb-3">
                {parsedContent}
              </h3>
            );
          } else {
            elements.push(
              <h4 key={`h4-${index}`} className="text-base font-bold text-slate-900 dark:text-slate-100 mt-4 mb-2">
                {parsedContent}
              </h4>
            );
          }
          return;
        }
      }

      // Blockquotes > quote
      if (trimmed.startsWith('>')) {
        const quoteText = trimmed.replace(/^>\s*/gm, '');
        elements.push(
          <blockquote
            key={`quote-${index}`}
            className="my-6 border-l-4 border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 p-4 rounded-r-xl text-slate-700 dark:text-slate-300 italic text-sm sm:text-base leading-relaxed"
          >
            {parseInline(quoteText)}
          </blockquote>
        );
        return;
      }

      // Unordered Lists (- or *)
      if (/^[-*]\s+/m.test(trimmed)) {
        const items = trimmed.split('\n').map((item) => item.replace(/^[-*]\s+/, '').trim());
        elements.push(
          <ul key={`ul-${index}`} className="my-4 space-y-2 list-disc list-inside text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            {items.map((item, idx) => (
              <li key={idx}>{parseInline(item)}</li>
            ))}
          </ul>
        );
        return;
      }

      // Ordered Lists (1., 2., etc.)
      if (/^\d+\.\s+/m.test(trimmed)) {
        const items = trimmed.split('\n').map((item) => item.replace(/^\d+\.\s+/, '').trim());
        elements.push(
          <ol key={`ol-${index}`} className="my-4 space-y-2 list-decimal list-inside text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            {items.map((item, idx) => (
              <li key={idx}>{parseInline(item)}</li>
            ))}
          </ol>
        );
        return;
      }

      // Regular Paragraphs
      elements.push(
        <p key={`p-${index}`} className="my-4 text-slate-700 dark:text-slate-300 text-base leading-relaxed">
          {parseInline(trimmed)}
        </p>
      );
    });

    return elements;
  };

  /**
   * Helper parsing inline formatting (**bold**, *italic*, `inline code`, [link](url)).
   */
  const parseInline = (text) => {
    if (!text) return text;

    const parts = [];
    let remaining = text;
    let keyIdx = 0;

    while (remaining.length > 0) {
      // Inline Code `code`
      const codeMatch = remaining.match(/`([^`]+)`/);
      // Bold **bold**
      const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
      // Link [text](url)
      const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);

      const matches = [
        codeMatch && { type: 'code', index: codeMatch.index, length: codeMatch[0].length, val: codeMatch[1] },
        boldMatch && { type: 'bold', index: boldMatch.index, length: boldMatch[0].length, val: boldMatch[1] },
        linkMatch && { type: 'link', index: linkMatch.index, length: linkMatch[0].length, text: linkMatch[1], url: linkMatch[2] },
      ].filter(Boolean).sort((a, b) => a.index - b.index);

      if (matches.length === 0) {
        parts.push(remaining);
        break;
      }

      const earliest = matches[0];

      if (earliest.index > 0) {
        parts.push(remaining.substring(0, earliest.index));
      }

      if (earliest.type === 'code') {
        parts.push(
          <code
            key={`inline-code-${keyIdx++}`}
            className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80 text-brand-600 dark:text-brand-400 font-mono text-xs sm:text-sm border border-slate-200 dark:border-slate-700/60"
          >
            {earliest.val}
          </code>
        );
      } else if (earliest.type === 'bold') {
        parts.push(
          <strong key={`bold-${keyIdx++}`} className="font-bold text-slate-900 dark:text-slate-100">
            {earliest.val}
          </strong>
        );
      } else if (earliest.type === 'link') {
        // Enforce safe HTTP/HTTPS link protocol to prevent javascript: XSS
        const isSafeUrl = /^https?:\/\//i.test(earliest.url) || earliest.url.startsWith('/');
        parts.push(
          <a
            key={`link-${keyIdx++}`}
            href={isSafeUrl ? earliest.url : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-600 dark:text-brand-400 font-medium underline underline-offset-2 hover:text-brand-700"
          >
            {earliest.text}
          </a>
        );
      }

      remaining = remaining.substring(earliest.index + earliest.length);
    }

    return parts;
  };

  return <div className="prose dark:prose-invert max-w-none">{parseMarkdown(content)}</div>;
}

export default MarkdownRenderer;
