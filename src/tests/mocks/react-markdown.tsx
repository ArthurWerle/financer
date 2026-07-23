import * as React from 'react'

// Jest stub for the ESM-only `react-markdown`. next/jest does not transform
// node_modules, so importing the real package (and its large ESM dependency
// tree) throws in the jsdom test environment. Tests only assert on rendered
// text, so rendering the raw markdown string is sufficient.
export default function ReactMarkdown({
  children,
}: {
  children?: React.ReactNode
  [key: string]: unknown
}) {
  return <>{children}</>
}
