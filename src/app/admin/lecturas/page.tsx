import { createClient } from "@/lib/supabase/server"
import { LecturasClient } from "@/components/admin/LecturasClient"

export const metadata = { title: "Lecturas" }

export default async function LecturasPage() {
    const supabase = await createClient()

    const [lotesRes, tarifasRes] = await Promise.all([
        supabase.from("lotes").select("*").order("manzana").order("lote_numero"),
        supabase
            .from("tarifas_mensuales")
            .select("*")
            .eq("estado", "ABIERTO")
            .order("periodo", { ascending: false }),
    ])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Registro de Lecturas</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Ingresa lecturas individuales o importa desde CSV
                </p>
            </div>
            <LecturasClient
                lotes={lotesRes.data ?? []}
                tarifasAbiertas={tarifasRes.data ?? []}
            />
        </div>
    )
}
