"use client"

import { useState, useTransition } from "react"
import { createClient } from "@/lib/supabase/client"
import { TarifaMensual, Lote, Recibo } from "@/types"
import { formatPeriodo } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { FileSpreadsheet, Loader2, AlertCircle, Download } from "lucide-react"
import * as XLSX from "xlsx"

interface Props {
    tarifas: TarifaMensual[]
}

type ReciboConLote = Recibo & { lotes: Lote }

export function ReportesClient({ tarifas }: Props) {
    const [selectedTarifaId, setSelectedTarifaId] = useState<string>("")
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    const selectedTarifa = tarifas.find(t => t.id.toString() === selectedTarifaId)

    const handleDownload = () => {
        if (!selectedTarifaId || !selectedTarifa) return
        setError(null)

        startTransition(async () => {
            const { data, error: fetchError } = await supabase
                .from("recibos")
                .select("*, lotes(*)")
                .eq("tarifa_id", selectedTarifaId)

            if (fetchError) {
                setError("Ocurrió un error al obtener los datos de Supabase.")
                return
            }

            if (!data || data.length === 0) {
                setError("No hay recibos registrados para este período.")
                return
            }

            const recibos = data as unknown as ReciboConLote[]

            // Transform data for Excel
            const excelData = recibos.map(r => ({
                "Manzana": r.lotes.manzana,
                "N° Lote": r.lotes.lote_numero,
                "Vecino": `${r.lotes.nombres} ${r.lotes.apellidos}`,
                "DNI": r.lotes.dni || "—",
                "Consumo (kWh)": r.consumo_kwh,
                "Total a Cobrar (S/)": r.total_recibo,
                "Estado": r.estado
            }))

            // Generate Excel
            const ws = XLSX.utils.json_to_sheet(excelData)
            const wb = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(wb, ws, "Recibos")

            const date = new Date(selectedTarifa.periodo)
            const mes = date.toLocaleDateString("es-PE", { month: "long" })
            const anio = date.getFullYear()
            const fileName = `Reporte_PortalLuz_${mes}_${anio}.xlsx`

            XLSX.writeFile(wb, fileName)
        })
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5 text-green-600" />
                        Reportes por Período
                    </CardTitle>
                    <CardDescription>
                        Selecciona un mes para generar el reporte detallado en formato Excel (.xlsx)
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Seleccionar Período
                        </label>
                        <Select onValueChange={setSelectedTarifaId} value={selectedTarifaId}>
                            <SelectTrigger className="w-full h-11">
                                <SelectValue placeholder="Busca un período (ej. Enero 2026)" />
                            </SelectTrigger>
                            <SelectContent>
                                {tarifas.map((t) => (
                                    <SelectItem key={t.id} value={t.id.toString()}>
                                        {formatPeriodo(t.periodo)} {t.estado === 'ABIERTO' ? '(Actual)' : ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        onClick={handleDownload}
                        className="w-full h-11 gap-2 bg-green-600 hover:bg-green-700 text-white"
                        disabled={!selectedTarifaId || isPending}
                    >
                        {isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Download className="w-4 h-4" />
                        )}
                        Descargar Excel
                    </Button>

                    {error && (
                        <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-1">Información</h4>
                <p className="text-xs text-blue-700">
                    El archivo generado incluirá todos los recibos emitidos para el período seleccionado,
                    incluyendo el consumo en kWh, el monto total calculado y el estado actual del pago.
                </p>
            </div>
        </div>
    )
}
