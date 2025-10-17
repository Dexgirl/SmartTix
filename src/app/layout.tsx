import './globals.css'

export const metadata = {
  title: 'SmartTix - Gasless Event Tickets',
  description: 'Revolutionary gasless event ticketing with Smart Accounts on Monad',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}