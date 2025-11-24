import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BackingProvider } from "@/context/BackingContext";
import { Web3Provider } from "@/contexts/Web3Context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "【旅教育】子供たちに冒険を！ほぼ子どもだけで行く18きっぷ遠足長崎編",
  description: "元社会科講師が企画する5年目の「18きっぷ遠足」。今回は長崎で「食べる地理講座」と「歴史探訪」の旅教育に挑みます！ほぼ子供たちだけで行動し、自立心を育む冒険の旅。物価高騰等の課題を乗り越え、この活動を続けるため、長崎の絶品海鮮グルメをリターンにご支援をお願いします。",
  openGraph: {
    title: "【旅教育】子供たちに冒険を！ほぼ子どもだけで行く18きっぷ遠足長崎編",
    description: "元社会科講師が企画する5年目の「18きっぷ遠足」。今回は長崎で「食べる地理講座」と「歴史探訪」の旅教育に挑みます！ほぼ子供たちだけで行動し、自立心を育む冒険の旅。物価高騰等の課題を乗り越え、この活動を続けるため、長崎の絶品海鮮グルメをリターンにご支援をお願いします。",
    images: [
      {
        url: "https://i.imgur.com/JnSQQvm.jpeg",
        width: 1200,
        height: 630,
        alt: "長崎の景色を背景にした「旅教育」18きっぷ遠足の集合写真。笑顔の主催者と子供たち。タイトル文字「『旅教育』で子供たちに冒険を！ほぼ子どもたちだけで行く18きっぷ遠足を続けたい」と、車内の様子や食事風景の写真が配置されているサムネイル。",
      },
    ],
    type: "website",
    locale: "ja_JP",
    siteName: "18きっぷ遠足クラウドファンディング",
  },
  twitter: {
    card: "summary_large_image",
    title: "【旅教育】子供たちに冒険を！ほぼ子どもだけで行く18きっぷ遠足長崎編",
    description: "元社会科講師が企画する5年目の「18きっぷ遠足」。今回は長崎で「食べる地理講座」と「歴史探訪」の旅教育に挑みます！ほぼ子供たちだけで行動し、自立心を育む冒険の旅。物価高騰等の課題を乗り越え、この活動を続けるため、長崎の絶品海鮮グルメをリターンにご支援をお願いします。",
    images: ["https://i.imgur.com/JnSQQvm.jpeg"],
  },
  keywords: [
    "旅教育",
    "18きっぷ",
    "クラウドファンディング",
    "長崎",
    "子供",
    "冒険",
    "教育",
    "遠足",
    "自立心",
    "社会科",
    "地理",
    "歴史",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Web3Provider>
          <BackingProvider>
            {children}
          </BackingProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
