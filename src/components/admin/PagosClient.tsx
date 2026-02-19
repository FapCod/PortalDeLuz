"use client"

import { useState, useTransition } from "react"
import { Recibo, Lote, TarifaMensual } from "@/types"
import { formatCurrency, formatLoteCodigo, formatPeriodo } from "@/lib/utils"
import { marcarPagado, marcarPendiente, eliminarRecibo, editarRecibo } from "@/lib/actions/pagos"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, RotateCcw, Search, Loader2, Download, Trash2, Pencil, Save, X, MessageCircle } from "lucide-react"

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
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editConsumo, setEditConsumo] = useState("")

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

    function handleEliminar(r: ReciboConRelaciones) {
        const codigo = formatLoteCodigo(r.lote?.manzana ?? "", r.lote?.lote_numero ?? 0)
        const ok = window.confirm(
            `¿Eliminar el recibo de ${r.lote?.nombres} ${r.lote?.apellidos} (${codigo})?\nConsumo: ${r.consumo_kwh} KWH — Total: S/ ${r.total_recibo}\n\nEsta acción no se puede deshacer.`
        )
        if (!ok) return
        setLoadingId(r.id)
        startTransition(async () => {
            await eliminarRecibo(r.id)
            setLoadingId(null)
        })
    }

    function openEditConsumo(r: ReciboConRelaciones) {
        setEditingId(r.id)
        setEditConsumo(String(r.consumo_kwh))
    }

    function handleEditSave(id: number) {
        const consumo = parseFloat(editConsumo)
        if (isNaN(consumo) || consumo < 0) return
        setLoadingId(id)
        startTransition(async () => {
            await editarRecibo(id, consumo)
            setEditingId(null)
            setLoadingId(null)
        })
    }

    function handleWhatsApp(r: ReciboConRelaciones) {
        const celular = r.lote?.celular
        if (!celular) {
            window.alert("Este vecino no tiene número de celular registrado.\n\nAgrégalo en Lotes/Vecinos primero.")
            return
        }
        const nombre = r.lote?.nombres ?? ""
        const codigo = formatLoteCodigo(r.lote?.manzana ?? "", r.lote?.lote_numero ?? 0)
        const periodo = r.tarifa ? formatPeriodo(r.tarifa.periodo) : ""
        const mensaje = encodeURIComponent(
            `Hola ${nombre}, le recordamos que su recibo de luz del período ${periodo} por S/ ${r.total_recibo} está pendiente de pago. Lote: ${codigo}. \n\nUPIS Las Palmeras del Sol`
        )
        window.open(`https://wa.me/51${celular}?text=${mensaje}`, "_blank")
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
                            <th className="text-center px-4 py-3 font-medium text-gray-600">WA</th>
                            <th className="text-center px-4 py-3 font-medium text-gray-600">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={9} className="text-center py-8 text-gray-400">
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
                                    {editingId === r.id ? (
                                        <div className="flex items-center gap-1 justify-end">
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={editConsumo}
                                                onChange={(e) => setEditConsumo(e.target.value)}
                                                className="w-20 h-7 text-xs text-right"
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") handleEditSave(r.id)
                                                    if (e.key === "Escape") setEditingId(null)
                                                }}
                                            />
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleEditSave(r.id)}
                                                disabled={isPending}
                                                className="h-7 w-7 p-0 text-green-600"
                                            >
                                                <Save className="w-3 h-3" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setEditingId(null)}
                                                className="h-7 w-7 p-0 text-gray-400"
                                            >
                                                <X className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <span
                                            className="cursor-pointer hover:text-blue-600 group inline-flex items-center gap-1"
                                            onClick={() => openEditConsumo(r)}
                                            title="Clic para editar consumo"
                                        >
                                            {r.consumo_kwh} KWH
                                            <Pencil className="w-3 h-3 text-blue-400 group-hover:text-blue-600 transition-colors" />
                                        </span>
                                    )}
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
                                            variant="ghost"
                                            onClick={() => handleWhatsApp(r)}
                                            className={`h-7 w-7 p-0 ${r.lote?.celular ? "text-green-500 hover:text-green-700 hover:bg-green-50" : "text-gray-300 hover:text-gray-400"}`}
                                            title={r.lote?.celular ? `Enviar WhatsApp a ${r.lote.celular}` : "Sin celular registrado"}
                                        >
                                            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                            </svg>
                                        </Button>
                                    ) : (
                                        <span className="text-gray-200">—</span>
                                    )}
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
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleEliminar(r)}
                                        disabled={isPending && loadingId === r.id}
                                        className="gap-1 text-red-400 hover:text-red-700 hover:bg-red-50 text-xs"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
