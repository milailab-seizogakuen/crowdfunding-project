import type { NextConfig } from "next";

/** @type {import("next").NextConfig} */
const nextConfig: NextConfig = {
  // TypeScript と ESLint のビルドエラーを一時的に無視
  typescript: {
    ignoreBuildErrors: true,
  },
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },

  // Turbopack を使わせない（Next.js公式の回避策）
  // experimental: {
  //   webpackBuildWorker: false,
  // },

  // Webpack利用をサーバー側でも完全に固定化
  modularizeImports: {},

  // pino と thread-stream をサーバーサイドで外部パッケージとして扱う
  serverExternalPackages: ["pino", "thread-stream"],

  // ブラウザビルドから Node.js 専用モジュールを除外
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'thread-stream': false,
        'pino-pretty': false,
        'pino': false,
      };
    }
    return config;
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.st-note.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.peatix.com',
      },
    ],
  },
};

export default nextConfig;
