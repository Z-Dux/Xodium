import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/bew.png" />
        <meta name="theme-color" content="#000000" />
        <meta name="description" content="Made by dux? what is this?" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Xodium" />
        <title>Xodium</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Handjet:wght@100..900&family=Lilita+One&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
  return <Component {...pageProps} />;
}
