import { Suspense } from "react"
import { ConsultaClient } from "@/components/ConsultaClient"
import { Zap } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Consulta tu Deuda — Portal de Luz",
    description: "Consulta el estado de tu deuda de luz ingresando tu código de lote o DNI.",
}

export default function ConsultaPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Header */}
            <header className="bg-white border-b shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-gray-900 leading-tight">Portal de Luz</h1>
                        <p className="text-xs text-gray-400">UPIS Las Palmeras del Sol</p>
                    </div>
                    <a
                        href="/login"
                        className="ml-auto text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        Admin →
                    </a>
                </div>
            </header>

            {/* Main */}
            <main className="max-w-4xl mx-auto px-4 py-12">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-gray-900">Consulta tu Deuda</h2>
                    <p className="text-gray-500 mt-2">
                        Ingresa tu código de lote (ej: <strong>A-1</strong>) o tu DNI para ver tu historial
                    </p>
                </div>
                <Suspense>
                    <ConsultaClient />
                </Suspense>
            </main>
        </div>
    )
}
