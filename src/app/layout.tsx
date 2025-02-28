import './globals.css'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { Providers } from './providers'

// For images just place the appropriate image file in this folder.
// https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image#image-files-jpg-png-gif
export const metadata = {
  manifest: 'https://app.indexcoop.com/manifest.json',
  themeColor: '#000000',
  title: 'Index App | Buy & Sell Our Tokens',
  description:
    'Use the Index Coop Trading App to buy and sell our sector, leveraged and yield generating tokens.',
  type: 'website',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en'>
      <body>
        <Providers>{children}</Providers>
      </body>
      <Script src='https://tag.safary.io/stag.js' async />
    </html>
  )
}
