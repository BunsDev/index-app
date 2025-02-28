'use client'

import { WagmiConfig } from 'wagmi'

import { CacheProvider } from '@chakra-ui/next-js'
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'
import { GTMProvider } from '@elgorditosalsero/react-gtm-hook'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'

import { GlobalFonts } from '@/lib/styles/fonts'
import theme, { rainbowkitTheme } from '@/lib/styles/theme'
import { initSentryEventTracking } from '@/lib/utils/api/sentry'
import { chains, wagmiConfig } from '@/lib/utils/wagmi'

import '@rainbow-me/rainbowkit/styles.css'

initSentryEventTracking()

const rainbowKitAppInfo = {
  appName: 'Index Coop',
  learnMoreUrl: 'https://indexcoop.com',
}

export function Providers({ children }: { children: React.ReactNode }) {
  const gtmParams = {
    id: process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_CONTAINER_ID ?? '',
  }
  return (
    <CacheProvider>
      <ChakraProvider theme={theme}>
        <GlobalFonts />
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <WagmiConfig config={wagmiConfig}>
          <RainbowKitProvider
            chains={chains}
            theme={rainbowkitTheme}
            appInfo={rainbowKitAppInfo}
          >
            <GTMProvider state={gtmParams}>{children}</GTMProvider>
          </RainbowKitProvider>
        </WagmiConfig>
      </ChakraProvider>
    </CacheProvider>
  )
}
