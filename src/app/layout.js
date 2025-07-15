import './globals.css'

export const metadata = {
  title: 'PNG to SVG Converter',
  description: 'Convert PNG images to optimized SVG format with minimal vector points',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <main className="container">
          {children}
        </main>
      </body>
    </html>
  )
}