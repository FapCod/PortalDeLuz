import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: {
        default: "Portal de Luz — UPIS Las Palmeras del Sol",
        template: "%s | Portal de Luz",
    },
    description:
        "Sistema de gestión de consumo eléctrico para la comunidad UPIS Las Palmeras del Sol.",
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="es" suppressHydrationWarning>
            <body className={inter.className}>{children}</body>
        </html>
    )
}
