// ============================================
// src/app/layout.tsx
// ============================================
import './globals.css'
import 'react-notion-x/src/styles.css'
import 'prismjs/themes/prism-tomorrow.css'
import 'rc-dropdown/assets/index.css'
import 'katex/dist/katex.min.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <Header />
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
      <Footer />
    </html>
  )
}
