import { createClient } from "@/lib/supabase/server"
import { PeriodosClient } from "@/components/admin/PeriodosClient"
import { formatPeriodo } from "@/lib/utils"

export const metadata = { title: "Períodos Mensuales" }

export default async function PeriodosPage() {
    const supabase = await createClient()

    const { data: periodos } = await supabase
        .from("tarifas_mensuales")
        .select("*")
        .order("periodo", { ascending: false })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Períodos Mensuales</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Gestiona los meses de facturación y sus tarifas
                </p>
            </div>
            <PeriodosClient periodos={periodos ?? []} />
        </div>
    )
}
