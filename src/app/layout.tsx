import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Modular Synth",
  description: "Created with v0",
  openGraph: { images: [{ url: "/cover.png" }] },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
