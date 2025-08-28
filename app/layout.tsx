import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/components/auth-provider'
import { Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'DevLink - Connect, Showcase, Inspire',
    template: '%s | DevLink'
  },
  description: 'The ultimate platform for developers to showcase their skills, projects, and connect with the community.',
  keywords: ['developer', 'portfolio', 'showcase', 'projects', 'programming', 'coding', 'tech'],
  authors: [{ name: 'DevLink Team' }],
  creator: 'DevLink',
  metadataBase: new URL('https://devlink.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://devlink.vercel.app',
    siteName: 'DevLink',
    title: 'DevLink - Connect, Showcase, Inspire',
    description: 'The ultimate platform for developers to showcase their skills, projects, and connect with the community.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'DevLink - Developer Showcase Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DevLink - Connect, Showcase, Inspire',
    description: 'The ultimate platform for developers to showcase their skills, projects, and connect with the community.',
    images: ['/og-image.png'],
    creator: '@devlink',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-screen bg-background font-sans antialiased")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="relative flex min-h-screen flex-col">
              <div className="flex-1">
                {children}
              </div>
            </div>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--card)',
                  color: 'var(--card-foreground)',
                  border: '1px solid var(--border)',
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}