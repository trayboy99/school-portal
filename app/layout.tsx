import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "School Portal",
  description: "Complete school management system",
    generator: 'v0.dev'
}

export default function RootLayout({
\
