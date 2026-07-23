"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { cn } from "@/lib/utils"

// Shared, chat-sized Markdown renderer. Used by the Assistant chat bubbles and
// the expandable spending insight so LLM output (headings, lists, bold, code,
// tables, links) renders like a normal chat instead of literal characters.
export function Markdown({
  children,
  className,
}: {
  children: string
  className?: string
}) {
  return (
    <div className={cn("break-words text-sm leading-relaxed", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ ...props }) => <p className="mb-2 last:mb-0" {...props} />,
          ul: ({ ...props }) => (
            <ul className="mb-2 list-disc space-y-1 pl-4 last:mb-0" {...props} />
          ),
          ol: ({ ...props }) => (
            <ol
              className="mb-2 list-decimal space-y-1 pl-4 last:mb-0"
              {...props}
            />
          ),
          li: ({ ...props }) => <li className="leading-relaxed" {...props} />,
          h1: ({ ...props }) => (
            <h1 className="mb-2 mt-1 text-base font-semibold" {...props} />
          ),
          h2: ({ ...props }) => (
            <h2 className="mb-2 mt-1 text-[15px] font-semibold" {...props} />
          ),
          h3: ({ ...props }) => (
            <h3 className="mb-1.5 mt-1 text-sm font-semibold" {...props} />
          ),
          strong: ({ ...props }) => (
            <strong className="font-semibold" {...props} />
          ),
          em: ({ ...props }) => <em className="italic" {...props} />,
          a: ({ ...props }) => (
            <a
              className="font-medium underline underline-offset-2 hover:opacity-80"
              target="_blank"
              rel="noreferrer"
              {...props}
            />
          ),
          blockquote: ({ ...props }) => (
            <blockquote
              className="mb-2 border-l-2 border-border pl-3 italic text-muted-foreground last:mb-0"
              {...props}
            />
          ),
          hr: ({ ...props }) => (
            <hr className="my-2 border-border" {...props} />
          ),
          code: ({ className: codeClassName, children: codeChildren, ...props }) => {
            const isBlock = /language-/.test(codeClassName ?? "")
            if (isBlock) {
              return (
                <code className={cn("font-mono", codeClassName)} {...props}>
                  {codeChildren}
                </code>
              )
            }
            return (
              <code
                className="rounded bg-black/10 px-1 py-0.5 font-mono text-[0.85em] dark:bg-white/10"
                {...props}
              >
                {codeChildren}
              </code>
            )
          },
          pre: ({ ...props }) => (
            <pre
              className="mb-2 overflow-x-auto rounded-lg bg-black/10 p-2.5 text-[0.85em] last:mb-0 dark:bg-white/10"
              {...props}
            />
          ),
          table: ({ ...props }) => (
            <div className="mb-2 overflow-x-auto last:mb-0">
              <table className="w-full border-collapse text-[0.9em]" {...props} />
            </div>
          ),
          th: ({ ...props }) => (
            <th
              className="border border-border px-2 py-1 text-left font-semibold"
              {...props}
            />
          ),
          td: ({ ...props }) => (
            <td className="border border-border px-2 py-1" {...props} />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
