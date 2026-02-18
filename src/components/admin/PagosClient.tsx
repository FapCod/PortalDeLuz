"use client"

import { useState, useTransition } from "react"
import { Recibo, Lote, TarifaMensual } from "@/types"
import { formatCurrency, formatLoteCodigo, formatPeriodo } from "@/lib/utils"
import { marcarPagado, marcarPendiente } from "@/lib/actions/pagos"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, RotateCcw, Search, Loader2, Download } from "lucide-react"

type ReciboConRelaciones = Recibo & { lote: Lote; tarifa: TarifaMensual }

interface Props {
    recibos: ReciboConRelaciones[]
}

const estadoBadge = {
    PENDIENTE: "warning" as const,
    PAGADO: "success" as const,
    VENCIDO: "destructive" as const,
}

export function PagosClient({ recibos }: Props) {
    const [search, setSearch] = useState("")
    const [filtroEstado, setFiltroEstado] = useState<"TODOS" | "PENDIENTE" | "PAGADO">("TODOS")
    const [filtroTipo, setFiltroTipo] = useState<"TODOS" | "HABITADO" | "SOLO_MANTENIMIENTO">("TODOS")
    const [isPending, startTransition] = useTransition()
    const [loadingId, setLoadingId] = useState<number | null>(null)

    const filtered = recibos.filter((r) => {
        const q = search.toLowerCase()
        const nombre = `${r.lote?.nombres} ${r.lote?.apellidos}`.toLowerCase()
        const codigo = formatLoteCodigo(r.lote?.manzana ?? "", r.lote?.lote_numero ?? 0).toLowerCase()
        const matchSearch = !q || nombre.includes(q) || codigo.includes(q)
        const matchEstado = filtroEstado === "TODOS" || r.estado === filtroEstado
        const matchTipo = filtroTipo === "TODOS" || r.lote?.tipo_servicio === filtroTipo
        return matchSearch && matchEstado && matchTipo
    })

    function handlePagar(id: number) {
        setLoadingId(id)
        startTransition(async () => {
            await marcarPagado(id)
            setLoadingId(null)
        })
    }

    function handleRevertir(id: number) {
        setLoadingId(id)
        startTransition(async () => {
            await marcarPendiente(id)
            setLoadingId(null)
        })
    }

    const pendienteCount = recibos.filter((r) => r.estado === "PENDIENTE").length
    const pagadoCount = recibos.filter((r) => r.estado === "PAGADO").length

    function handleExportCSV() {
        const rows = [
            ["Lote", "Propietario", "DNI", "Período", "Consumo KWH", "Precio KWH", "Alumbrado", "Total S/", "Estado", "Fecha Pago"],
            ...filtered.map((r) => [
                r.lote ? formatLoteCodigo(r.lote.manzana, r.lote.lote_numero) : "",
                r.lote ? `${r.lote.nombres} ${r.lote.apellidos}` : "",
                r.lote?.dni ?? "",
                r.tarifa ? formatPeriodo(r.tarifa.periodo) : "",
                r.consumo_kwh,
                r.precio_x_kwh,
                r.alumbrado_publico,
                r.total_recibo,
                r.estado,
                r.fecha_pago ? new Date(r.fecha_pago).toLocaleDateString("es-PE") : "",
            ]),
        ]
        const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n")
        const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        const periodo = filtered[0]?.tarifa ? formatPeriodo(filtered[0].tarifa.periodo) : "reporte"
        a.download = `recibos-${periodo.replace(/\s/g, "-")}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="space-y-4">
            {/* Stats */}
            <div className="flex gap-3 flex-wrap items-center">
                <button
                    onClick={() => setFiltroEstado("TODOS")}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${filtroEstado === "TODOS" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                >
                    Todos ({recibos.length})
                </button>
                <button
                    onClick={() => setFiltroEstado("PENDIENTE")}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${filtroEstado === "PENDIENTE" ? "bg-yellow-500 text-white" : "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                        }`}
                >
                    Pendientes ({pendienteCount})
                </button>
                <button
                    onClick={() => setFiltroEstado("PAGADO")}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${filtroEstado === "PAGADO" ? "bg-green-600 text-white" : "bg-green-50 text-green-700 hover:bg-green-100"
                        }`}
                >
                    Pagados ({pagadoCount})
                </button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportCSV}
                    disabled={filtered.length === 0}
                    className="ml-auto gap-2"
                >
                    <Download className="w-3.5 h-3.5" />
                    Exportar CSV ({filtered.length})
                </Button>
            </div>

            {/* Tipo filter */}
            <div className="flex gap-2 flex-wrap">
                <button
                    onClick={() => setFiltroTipo("TODOS")}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${filtroTipo === "TODOS" ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                    Todos los tipos
                </button>
                <button
                    onClick={() => setFiltroTipo("HABITADO")}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${filtroTipo === "HABITADO" ? "bg-green-600 text-white" : "bg-green-50 text-green-700 hover:bg-green-100"}`}
                >
                    Habitados
                </button>
                <button
                    onClick={() => setFiltroTipo("SOLO_MANTENIMIENTO")}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${filtroTipo === "SOLO_MANTENIMIENTO" ? "bg-yellow-500 text-white" : "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"}`}
                >
                    Solo Mant.
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                    placeholder="Buscar por nombre o código de lote..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border bg-white">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="text-left px-4 py-3 font-medium text-gray-600">Lote</th>
                            <th className="text-left px-4 py-3 font-medium text-gray-600">Propietario</th>
                            <th className="text-left px-4 py-3 font-medium text-gray-600">Período</th>
                            <th className="text-right px-4 py-3 font-medium text-gray-600">Consumo</th>
                            <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
                            <th className="text-center px-4 py-3 font-medium text-gray-600">Estado</th>
                            <th className="text-center px-4 py-3 font-medium text-gray-600">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={7} className="text-center py-8 text-gray-400">
                                    No se encontraron recibos
                                </td>
                            </tr>
                        )}
                        {filtered.map((r) => (
                            <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 font-mono text-xs text-gray-600">
                                    {r.lote ? formatLoteCodigo(r.lote.manzana, r.lote.lote_numero) : "—"}
                                </td>
                                <td className="px-4 py-3 text-gray-900">
                                    {r.lote ? `${r.lote.nombres} ${r.lote.apellidos}` : "—"}
                                </td>
                                <td className="px-4 py-3 text-gray-600 capitalize">
                                    {r.tarifa ? formatPeriodo(r.tarifa.periodo) : "—"}
                                </td>
                                <td className="px-4 py-3 text-right text-gray-700">
                                    {r.consumo_kwh} KWH
                                </td>
                                <td className="px-4 py-3 text-right font-semibold text-gray-900">
                                    S/ {r.total_recibo}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <Badge variant={estadoBadge[r.estado] ?? "outline"}>
                                        {r.estado}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {r.estado === "PENDIENTE" ? (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handlePagar(r.id)}
                                            disabled={isPending && loadingId === r.id}
                                            className="gap-1 text-green-600 border-green-200 hover:bg-green-50 text-xs"
                                        >
                                            {isPending && loadingId === r.id ? (
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                            ) : (
                                                <CheckCircle className="w-3 h-3" />
                                            )}
                                            Pagado
                                        </Button>
                                    ) : r.estado === "PAGADO" ? (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleRevertir(r.id)}
                                            disabled={isPending && loadingId === r.id}
                                            className="gap-1 text-gray-400 text-xs"
                                        >
                                            {isPending && loadingId === r.id ? (
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                            ) : (
                                                <RotateCcw className="w-3 h-3" />
                                            )}
                                            Revertir
                                        </Button>
                                    ) : null}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
