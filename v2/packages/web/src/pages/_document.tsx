import { ColorModeScript } from '@chakra-ui/react';
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="ja">
      <Head />
      <body>
        <ColorModeScript initialColorMode="system" />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}