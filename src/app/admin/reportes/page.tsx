import { createClient } from "@/lib/supabase/server"
import { ReportesClient } from "@/components/admin/ReportesClient"

export const metadata = { title: "Reportes Mensuales" }

export default async function ReportesPage() {
    const supabase = await createClient()

    const { data: tarifas } = await supabase
        .from("tarifas_mensuales")
        .select("*")
        .order("periodo", { ascending: false })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Generación de documentos Excel para la administración.
                </p>
            </div>

            <ReportesClient tarifas={tarifas ?? []} />
        </div>
    )
}
