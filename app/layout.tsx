import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Card Counter',
  description: '하트/다이아/클로버/스페이드 카드 카운터',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  )
}


