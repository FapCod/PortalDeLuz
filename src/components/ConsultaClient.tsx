"use client"

import { useState, useTransition } from "react"
import { createClient } from "@/lib/supabase/client"
import { Lote, Recibo, TarifaMensual } from "@/types"
import { formatLoteCodigo, formatPeriodo } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Download, Loader2, AlertCircle } from "lucide-react"

type ReciboPublico = Recibo & { tarifa: TarifaMensual }

export function ConsultaClient() {
    const [query, setQuery] = useState("")
    const [lote, setLote] = useState<Lote | null>(null)
    const [recibos, setRecibos] = useState<ReciboPublico[]>([])
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()
    const supabase = createClient()

    async function handleSearch(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        setLote(null)
        setRecibos([])

        const q = query.trim().toUpperCase()
        if (!q) return

        startTransition(async () => {
            // Parse "A-1" or "A1" format
            const loteMatch = q.match(/^([A-Z])[- ]?(\d+)$/)

            let loteData: Lote | null = null

            if (loteMatch) {
                const mz = loteMatch[1]
                const lt = parseInt(loteMatch[2])
                const { data } = await supabase
                    .from("lotes")
                    .select("*")
                    .eq("manzana", mz)
                    .eq("lote_numero", lt)
                    .single()
                loteData = data
            } else {
                // Try DNI search
                const { data } = await supabase
                    .from("lotes")
                    .select("*")
                    .eq("dni", q)
                    .single()
                loteData = data
            }

            if (!loteData) {
                setError("No se encontró ningún lote con ese código o DNI.")
                return
            }

            setLote(loteData)

            const { data: recibosData } = await supabase
                .from("recibos")
                .select("*, tarifa:tarifas_mensuales(*)")
                .eq("lote_id", loteData.id)
                .order("created_at", { ascending: false })

            setRecibos((recibosData as ReciboPublico[]) ?? [])
        })
    }

    function handleDownloadCSV() {
        if (!lote || recibos.length === 0) return
        const rows = [
            ["Período", "Consumo KWH", "Precio KWH", "Alumbrado", "Total", "Estado"],
            ...recibos.map((r) => [
                formatPeriodo(r.tarifa?.periodo ?? ""),
                r.consumo_kwh,
                r.precio_x_kwh,
                r.alumbrado_publico,
                r.total_recibo,
                r.estado,
            ]),
        ]
        const csv = rows.map((r) => r.join(",")).join("\n")
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `recibos-${lote.manzana}${lote.lote_numero}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    const totalDeuda = recibos
        .filter((r) => r.estado === "PENDIENTE")
        .reduce((sum, r) => sum + r.total_recibo, 0)

    return (
        <div className="space-y-6">
            {/* Search form */}
            <Card className="shadow-lg border-0">
                <CardContent className="p-6">
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Ej: A-1 o tu DNI (12345678)"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="pl-9 h-12 text-base"
                            />
                        </div>
                        <Button type="submit" disabled={isPending} className="h-12 px-6">
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Consultar"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {/* Results */}
            {lote && (
                <div className="space-y-4">
                    {/* Lote info */}
                    <Card className="border-blue-200 bg-blue-50">
                        <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
                            <div>
                                <p className="font-bold text-gray-900 text-lg">
                                    {lote.nombres} {lote.apellidos}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {formatLoteCodigo(lote.manzana, lote.lote_numero)}
                                </p>
                            </div>
                            {totalDeuda > 0 && (
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">Deuda pendiente</p>
                                    <p className="text-2xl font-bold text-red-600">S/ {totalDeuda}</p>
                                </div>
                            )}
                            {totalDeuda === 0 && recibos.length > 0 && (
                                <Badge variant="success" className="text-sm px-3 py-1">
                                    ✓ Al día
                                </Badge>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recibos table */}
                    {recibos.length > 0 ? (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-700">
                                    Historial de recibos ({recibos.length})
                                </p>
                                <Button variant="outline" size="sm" onClick={handleDownloadCSV} className="gap-2">
                                    <Download className="w-3 h-3" />
                                    Descargar CSV
                                </Button>
                            </div>
                            <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Período</th>
                                            <th className="text-right px-4 py-3 font-medium text-gray-600">Consumo</th>
                                            <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
                                            <th className="text-center px-4 py-3 font-medium text-gray-600">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {recibos.map((r) => (
                                            <tr key={r.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-gray-900 capitalize">
                                                    {r.tarifa ? formatPeriodo(r.tarifa.periodo) : "—"}
                                                </td>
                                                <td className="px-4 py-3 text-right text-gray-600">
                                                    {r.consumo_kwh} KWH
                                                </td>
                                                <td className="px-4 py-3 text-right font-semibold text-gray-900">
                                                    S/ {r.total_recibo}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <Badge
                                                        variant={
                                                            r.estado === "PAGADO"
                                                                ? "success"
                                                                : r.estado === "PENDIENTE"
                                                                    ? "warning"
                                                                    : "destructive"
                                                        }
                                                    >
                                                        {r.estado}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-8">No hay recibos registrados aún.</p>
                    )}
                </div>
            )}
        </div>
    )
}
