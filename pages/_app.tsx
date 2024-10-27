import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      <title>Xodium</title>
        <link href="https://fonts.googleapis.com/css2?family=Handjet:wght@100..900&family=Lilita+One&display=swap" rel="stylesheet" />
      </Head>
      <Component {...pageProps} />
    </>
  );
  return <Component {...pageProps} />;
}
