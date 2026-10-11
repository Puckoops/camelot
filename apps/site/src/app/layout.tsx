import "@puckoops/camelot/styles.css";
import "./globals.css";
import { themeScriptFor } from "@puckoops/camelot/helpers";
import type { Metadata } from "next";
import { Instrument_Sans, Instrument_Serif } from "next/font/google";
import localFont from "next/font/local";
import { InlineScript } from "@/components/InlineScript";
import { Providers } from "./providers";

const sans = Instrument_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--pk-sans", display: "swap" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--pk-serif", display: "swap" });
const mono = localFont({ src: "./fonts/GeistMono-Variable.woff2", weight: "100 900", variable: "--pk-mono", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Camelot", template: "%s · Camelot" },
  description: "Camelot, the Puckoops design system: tokens, type and React components, with an MCP server for AI coding assistants.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GB" data-theme="light" className={`${sans.variable} ${serif.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <InlineScript html={themeScriptFor("light")} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
