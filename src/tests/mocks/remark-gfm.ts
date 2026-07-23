// Jest stub for the ESM-only `remark-gfm` plugin. The react-markdown stub
// ignores plugins, so this just needs to be a no-op default export that Jest
// can load without transforming the real ESM package.
export default function remarkGfm() {}
