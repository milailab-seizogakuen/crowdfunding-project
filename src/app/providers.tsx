'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { createAppKit } from '@reown/appkit/react'
import { polygon } from '@reown/appkit/networks'
import { wagmiAdapter, config } from '@/lib/wagmiConfig'

const queryClient = new QueryClient()
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!

createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [polygon],
  metadata: {
    name: 'NEXT RAIL',
    description: 'クラウドファンディング',
    url: 'https://nextrail.uzuraya-kitakita.work',
    icons: []
  }
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

