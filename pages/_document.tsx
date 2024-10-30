// pages/_document.js
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/bew.png" />
        <meta name="theme-color" content="#000000" />
          <meta name="description" content="Made by dux? what is this?" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="Xodium" />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Lilita+One&family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap"
          />
          <link rel="manifest" href="/manifest.json" />

        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
