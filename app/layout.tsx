import type { Metadata } from 'next'
import { Open_Sans, Lora } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const openSans = Open_Sans({ 
  subsets: ["latin"],
  variable: '--font-open-sans'
});
const lora = Lora({ 
  subsets: ["latin"],
  variable: '--font-lora'
});

export const metadata: Metadata = {
  title: 'OliveBranch.ai - AI-Powered Workplace Conflict Resolution',
  description: 'Resolve workplace conflicts privately and fairly with our AI-powered digital mediator. De-escalate tension before it reaches HR.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${openSans.variable} ${lora.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
