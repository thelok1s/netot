import type { AppProps } from "next/app";
import Head from "next/head";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/react";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div style={{ userSelect: "none" }}>
        <Head>
          <title>neTOT</title>
          <meta
            name="description"
            content="Безопасники решают теорию (электро)связи по своему"
          />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <Analytics />
        <Component {...pageProps} />
      </div>
    </ThemeProvider>
  );
}
