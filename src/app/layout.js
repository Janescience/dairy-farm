import './globals.css'

export const metadata = {
  title: 'Dairy Farm',
  description: 'A dairy farm management application',
  manifest: '/manifest.json',
  icons: {
    icon: '/images/logo.png',
    apple: '/images/logo.png',
    shortcut: '/images/logo.png',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-white text-black">
        {children}
      </body>
    </html>
  )
}