import type { AppProps } from 'next/app';
import Head from 'next/head';

// 手动引入 ebin-player 样式（推荐用于 Next.js）
import '@ebin-player/core/styles';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
