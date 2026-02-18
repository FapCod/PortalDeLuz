import { createClient } from "@/lib/supabase/server"
import { LotesClient } from "@/components/admin/LotesClient"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Gestión de Lotes" }

export default async function LotesPage() {
    const supabase = await createClient()

    const { data: lotes } = await supabase
        .from("lotes")
        .select("*")
        .order("manzana")
        .order("lote_numero")

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Lotes</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Directorio de vecinos y propiedades — UPIS Las Palmeras del Sol
                </p>
            </div>
            <LotesClient lotes={lotes ?? []} />
        </div>
    )
}
