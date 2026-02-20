import { createClient } from "@/lib/supabase/server"
import { PagosClient } from "@/components/admin/PagosClient"

export const metadata = { title: "Pagos" }

export default async function PagosPage() {
    const supabase = await createClient()

    const [recibosRes, tarifasRes] = await Promise.all([
        supabase
            .from("recibos")
            .select(`
                *,
                lote:lotes(*),
                tarifa:tarifas_mensuales(*)
            `)
            .order("created_at", { ascending: false })
            .limit(1000), // Increased limit for better filtering
        supabase
            .from("tarifas_mensuales")
            .select("*")
            .order("periodo", { ascending: false })
    ])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Pagos</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Registra los pagos y consulta el estado de cada recibo
                </p>
            </div>
            <PagosClient
                recibos={(recibosRes.data ?? []) as any}
                tarifas={tarifasRes.data ?? []}
            />
        </div>
    )
}
