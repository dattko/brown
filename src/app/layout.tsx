import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReactQueryProvider } from "./providers/react-query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Brown · 모의 포트폴리오",
  description: "KIS 모의투자 잔고/보유 종목 대시보드",
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => (
  <html
    lang="ko"
    className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
  >
    <body className="min-h-full bg-background text-foreground">
      <ReactQueryProvider>{children}</ReactQueryProvider>
    </body>
  </html>
);

export default RootLayout;
