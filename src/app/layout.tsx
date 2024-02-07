import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

import { Toaster } from "@/components/ui/toaster" 

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Pit Display',
  description: 'A display in the pits',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className='dark min-h-[100vh]'>
      <body className={inter.className}>
        {children}
        <Toaster/>
      </body>
    </html>
  )
}
