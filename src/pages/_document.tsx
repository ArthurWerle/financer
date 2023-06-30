import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className='bg-gray-300 text-gray-500 max-w-[1000px] m-auto px-10'>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
