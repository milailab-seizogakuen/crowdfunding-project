import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { polygon } from '@reown/appkit/networks'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [polygon],
})

export const config = wagmiAdapter.wagmiConfig

