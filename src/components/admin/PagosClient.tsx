"use client"

import { useState, useTransition } from "react"
import { Recibo, Lote, TarifaMensual } from "@/types"
import { formatCurrencyPEN, formatLoteCodigo, formatPeriodo } from "@/lib/utils"
import { marcarPagado, marcarPendiente, eliminarRecibo, editarRecibo, eliminarRecibosMantenimiento } from "@/lib/actions/pagos"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, RotateCcw, Search, Loader2, Trash2, Pencil, Save, X, MessageCircle, AlertTriangle } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

type ReciboConRelaciones = Recibo & { lote: Lote; tarifa: TarifaMensual }

interface Props {
    recibos: ReciboConRelaciones[]
    tarifas: TarifaMensual[]
}

const estadoBadge = {
    PENDIENTE: "warning" as const,
    PAGADO: "success" as const,
    VENCIDO: "destructive" as const,
}

export function PagosClient({ recibos, tarifas }: Props) {
    const [search, setSearch] = useState("")
    const [filtroEstado, setFiltroEstado] = useState<"TODOS" | "PENDIENTE" | "PAGADO">("TODOS")
    const [filtroTipo, setFiltroTipo] = useState<"TODOS" | "HABITADO" | "SOLO_MANTENIMIENTO">("TODOS")
    const [isPending, startTransition] = useTransition()
    const [loadingId, setLoadingId] = useState<number | null>(null)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editConsumo, setEditConsumo] = useState("")
    const [page, setPage] = useState(1)

    // Filter to most recent or open period by default
    const initialPeriod = tarifas.find(t => t.estado === "ABIERTO")?.id.toString() || tarifas[0]?.id.toString() || "TODOS"
    const [selectedPeriod, setSelectedPeriod] = useState<string>(initialPeriod)

    const [showBulkWA, setShowBulkWA] = useState(false)
    const [bulkIndex, setBulkIndex] = useState(0)
    const PER_PAGE = 15

    const filtered = recibos.filter((r) => {
        const q = search.toLowerCase()
        const nombre = `${r.lote?.nombres} ${r.lote?.apellidos}`.toLowerCase()
        const codigo = formatLoteCodigo(r.lote?.manzana ?? "", r.lote?.lote_numero ?? 0).toLowerCase()
        const matchSearch = !q || nombre.includes(q) || codigo.includes(q)
        const matchEstado = filtroEstado === "TODOS" || r.estado === filtroEstado
        const matchTipo = filtroTipo === "TODOS" || r.lote?.tipo_servicio === filtroTipo
        const matchPeriodo = selectedPeriod === "TODOS" || r.tarifa_id.toString() === selectedPeriod
        return matchSearch && matchEstado && matchTipo && matchPeriodo
    })

    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
    const safePage = Math.min(page, totalPages)
    const paginated = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)

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
            toast.warning("Número no registrado", {
                description: "Este vecino no tiene un número de celular registrado. Agrégalo en Lotes/Vecinos primero.",
            })
            return
        }
        const nombre = r.lote?.nombres ?? ""
        const codigo = formatLoteCodigo(r.lote?.manzana ?? "", r.lote?.lote_numero ?? 0)
        const periodo = r.tarifa ? formatPeriodo(r.tarifa.periodo) : ""
        const portalUrl = `${process.env.NEXT_PUBLIC_URL ?? "https://portal-de-luz.vercel.app"}/consulta`
        const mensaje = encodeURIComponent(
            `Hola ${nombre}, le recordamos que su recibo de luz del período ${periodo} por ${formatCurrencyPEN(r.total_recibo)} está pendiente de pago. Lote: ${codigo}. \n\nConsulte su recibo aquí:\n${portalUrl}\n\nUPIS Las Palmeras del Sol`
        )

        window.open(`https://wa.me/51${celular}?text=${mensaje}`, "_blank")
    }

    const pendienteCount = recibos.filter((r) => r.estado === "PENDIENTE").length
    const pagadoCount = recibos.filter((r) => r.estado === "PAGADO").length

    // Pending recibos with celular for bulk WA (deduplicated by celular+period)
    const pendientesConCelular = recibos.filter(
        (r) => r.estado === "PENDIENTE" && r.lote?.celular
    )

    function openBulkWA() {
        setBulkIndex(0)
        setShowBulkWA(true)
    }

    function sendBulkNext() {
        if (bulkIndex >= pendientesConCelular.length) return
        const r = pendientesConCelular[bulkIndex]
        const celular = r.lote?.celular ?? ""
        const nombre = r.lote?.nombres ?? ""
        const codigo = formatLoteCodigo(r.lote?.manzana ?? "", r.lote?.lote_numero ?? 0)
        const periodo = r.tarifa ? formatPeriodo(r.tarifa.periodo) : ""
        const portalUrl = `${process.env.NEXT_PUBLIC_URL ?? "https://portal-de-luz.vercel.app"}/consulta`
        const mensaje = encodeURIComponent(
            `Hola ${nombre}, le recordamos que su recibo de luz del período ${periodo} por ${formatCurrencyPEN(r.total_recibo)} está pendiente de pago. Lote: ${codigo}. \n\nConsulte su recibo aquí:\n${portalUrl}\n\nUPIS Las Palmeras del Sol`
        )

        window.open(`https://wa.me/51${celular}?text=${mensaje}`, "_blank")
        setBulkIndex(bulkIndex + 1)
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
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={selectedPeriod === "TODOS" || isPending || (() => {
                                const currentTarifaId = parseInt(selectedPeriod)
                                return !recibos.some(r => r.tarifa_id === currentTarifaId && r.lote?.tipo_servicio === "SOLO_MANTENIMIENTO")
                            })()}
                            className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50 text-xs"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Eliminar Mant.
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                                ¿Eliminar mantenimientos de {(() => {
                                    const t = tarifas.find(t => t.id.toString() === selectedPeriod)
                                    return t ? formatPeriodo(t.periodo) : ""
                                })()}?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Estás a punto de eliminar masivamente todos los recibos de tipo "**Solo Mantenimiento**" correspondientes al período de <span className="font-bold text-gray-900 capitalize">{(() => {
                                    const t = tarifas.find(t => t.id.toString() === selectedPeriod)
                                    return t ? formatPeriodo(t.periodo) : ""
                                })()}</span>.
                                <br /><br />
                                <span className="font-semibold text-red-600">Esta acción no se puede deshacer.</span>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => {
                                    const tarifaId = parseInt(selectedPeriod)
                                    if (isNaN(tarifaId)) return
                                    startTransition(async () => {
                                        const result = await eliminarRecibosMantenimiento(tarifaId)
                                        if (result.error) {
                                            toast.error("Error al eliminar", {
                                                description: result.error
                                            })
                                        }
                                    })
                                }}
                                className="bg-red-500 hover:bg-red-600"
                            >
                                Sí, eliminar mantenimientos
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <div className="flex-1" />
                <Button
                    variant="outline"
                    size="sm"
                    onClick={openBulkWA}
                    disabled={pendientesConCelular.length === 0}
                    className="gap-1.5 text-green-600 border-green-200 hover:bg-green-50 text-xs"
                >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Cobrar masivo ({pendientesConCelular.length})
                </Button>
            </div>

            {/* Search and Period Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Buscar por nombre o código de lote..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                        className="pl-9"
                    />
                </div>
                <div className="w-full sm:w-64">
                    <Select
                        value={selectedPeriod}
                        onValueChange={(val) => { setSelectedPeriod(val); setPage(1) }}
                    >
                        <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Filtrar por período" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="TODOS">Todos los períodos</SelectItem>
                            {tarifas.map((t) => (
                                <SelectItem key={t.id} value={t.id.toString()}>
                                    <div className="flex items-center gap-2">
                                        <span className="capitalize">{formatPeriodo(t.periodo)}</span>
                                        {t.estado === "ABIERTO" && (
                                            <Badge variant="success" className="h-4 px-1 text-[10px]">Abierto</Badge>
                                        )}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Bulk WhatsApp Panel */}
            {showBulkWA && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-green-800 flex items-center gap-2">
                            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-green-600">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            Cobro masivo por WhatsApp
                        </h3>
                        <Button variant="ghost" size="sm" onClick={() => setShowBulkWA(false)} className="text-gray-500">
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    {pendientesConCelular.length === 0 ? (
                        <p className="text-sm text-gray-600">No hay recibos pendientes con celular registrado.</p>
                    ) : bulkIndex >= pendientesConCelular.length ? (
                        <div className="text-center py-3">
                            <p className="text-green-700 font-medium">✅ Se enviaron los {pendientesConCelular.length} mensajes.</p>
                            <Button variant="outline" size="sm" className="mt-2" onClick={() => setBulkIndex(0)}>
                                Reiniciar
                            </Button>
                        </div>
                    ) : (
                        <>
                            <p className="text-sm text-gray-600">
                                {bulkIndex} de {pendientesConCelular.length} enviados — Siguiente:
                            </p>
                            <div className="bg-white rounded-md border p-3 flex items-center justify-between gap-3">
                                <div className="text-sm">
                                    <span className="font-mono text-xs text-gray-500">
                                        {formatLoteCodigo(pendientesConCelular[bulkIndex].lote?.manzana ?? "", pendientesConCelular[bulkIndex].lote?.lote_numero ?? 0)}
                                    </span>
                                    {" "}
                                    <span className="font-medium">
                                        {pendientesConCelular[bulkIndex].lote?.nombres} {pendientesConCelular[bulkIndex].lote?.apellidos}
                                    </span>
                                    {" — "}
                                    <span className="text-gray-600">
                                        {formatCurrencyPEN(pendientesConCelular[bulkIndex].total_recibo)}
                                    </span>

                                    {" — "}
                                    <span className="font-mono text-xs text-green-600">
                                        {pendientesConCelular[bulkIndex].lote?.celular}
                                    </span>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={sendBulkNext}
                                    className="gap-1 bg-green-600 hover:bg-green-700 text-white shrink-0"
                                >
                                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                    Enviar y Siguiente →
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            )}

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
                        {paginated.map((r) => (
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
                                    {formatCurrencyPEN(r.total_recibo)}
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
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
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
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>¿Confirmar recepción del pago?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Por favor, confirma que has recibido el monto total de **{formatCurrencyPEN(r.total_recibo)}** por parte de **{r.lote?.nombres} {r.lote?.apellidos}** correspondiente al período de **{r.tarifa ? formatPeriodo(r.tarifa.periodo) : "—"}**.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handlePagar(r.id)}
                                                        className="bg-green-600 hover:bg-green-700 text-white"
                                                    >
                                                        Sí, registrar pago
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
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
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                disabled={isPending && loadingId === r.id}
                                                className="gap-1 text-red-400 hover:text-red-700 hover:bg-red-50 text-xs"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                    ¿Eliminar el recibo de {r.lote?.nombres} {r.lote?.apellidos}?
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Consumo: <span className="font-bold text-gray-900">{r.consumo_kwh} KWH</span> — Total: <span className="font-bold text-gray-900">{formatCurrencyPEN(r.total_recibo)}</span>.
                                                    <br /><br />
                                                    Esta acción no se puede deshacer.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleEliminar(r)}
                                                    className="bg-red-500 hover:bg-red-600"
                                                >
                                                    Eliminar Recibo
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                    <p className="text-xs text-gray-500">
                        Mostrando {(safePage - 1) * PER_PAGE + 1}–{Math.min(safePage * PER_PAGE, filtered.length)} de {filtered.length}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={safePage <= 1}
                            onClick={() => setPage(safePage - 1)}
                            className="text-xs h-8"
                        >
                            ← Anterior
                        </Button>
                        <span className="text-xs text-gray-600">
                            {safePage} / {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={safePage >= totalPages}
                            onClick={() => setPage(safePage + 1)}
                            className="text-xs h-8"
                        >
                            Siguiente →
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
