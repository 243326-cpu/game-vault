import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'GameVault - Ultimate Gaming Leaderboard',
  description: 'Track scores, compete with friends, and climb the leaderboard on GameVault - the ultimate gaming ranking platform.',
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

export const viewport: Viewport = {
  themeColor: '#0a0a0f',
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try{
              var t = localStorage.getItem('gamevault_theme');
              if(t) document.documentElement.setAttribute('data-theme', t);
              else {
                var prefers = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', prefers);
              }
              window.toggleTheme = function(){
                try{
                  var current = document.documentElement.getAttribute('data-theme');
                  var next = current === 'light' ? 'dark' : 'light';
                  document.documentElement.setAttribute('data-theme', next);
                  localStorage.setItem('gamevault_theme', next);
                }catch(e){}
              }
            }catch(e){}
          })();
        `}} />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
