
export const metadata = {
  title: 'LegacyCore',
  description: 'Insurance management platform'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}