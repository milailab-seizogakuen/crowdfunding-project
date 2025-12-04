'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { createAppKit } from '@reown/appkit/react'
import { polygon } from '@reown/appkit/networks'
import { config } from '@/lib/wagmiConfig'

const queryClient = new QueryClient()

// MetaMask SDK を完全除去してブラウザウォレット直接接続を使用
createAppKit({
  adapters: [],
  networks: [polygon],
  // ブラウザのインジェクトウォレット（MetaMask等）を直接使用
  enableInjectedWallets: true,
  // WalletConnect SDK経由を完全に切断
  features: {
    analytics: false,
  },
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
