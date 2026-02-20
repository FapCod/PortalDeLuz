"use client"

import { useState, useTransition } from "react"
import { createClient } from "@/lib/supabase/client"
import { Lote, Recibo, TarifaMensual } from "@/types"
import { formatCurrencyPEN, formatLoteCodigo, formatPeriodo } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Loader2, AlertCircle } from "lucide-react"

type ReciboPublico = Recibo & { tarifa: TarifaMensual }
type LoteConRecibos = Lote & { recibos: ReciboPublico[] }

export function ConsultaClient() {
    const [query, setQuery] = useState("")
    const [lotes, setLotes] = useState<LoteConRecibos[]>([])
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()
    const supabase = createClient()

    async function handleSearch(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        setLotes([])

        const q = query.trim().toUpperCase()
        if (!q) return

        startTransition(async () => {
            // Pattern 1: "A2", "A-2", "A 2", "A - 2" etc.
            const simpleMatch = q.match(/^([A-Z])\s*-?\s*(\d+)$/)
            // Pattern 2: "MZ I LT 6", "MZ I - LT 6", "MZI LT6" etc.
            const mzLtMatch = q.match(/^MZ\.?\s*([A-Z])\s*[-]?\s*LT\.?\s*(\d+)$/)
            // Pattern 3: "LT6", "LT 6", "LT-6" (lote only, searches all manzanas)
            const ltOnlyMatch = q.match(/^LT\.?\s*-?\s*(\d+)$/)

            let lotesData: Lote[] = []

            if (simpleMatch) {
                const mz = simpleMatch[1]
                const lt = parseInt(simpleMatch[2])
                const { data } = await supabase
                    .from("lotes")
                    .select("*")
                    .eq("manzana", mz)
                    .eq("lote_numero", lt)
                lotesData = data ?? []
            } else if (mzLtMatch) {
                const mz = mzLtMatch[1]
                const lt = parseInt(mzLtMatch[2])
                const { data } = await supabase
                    .from("lotes")
                    .select("*")
                    .eq("manzana", mz)
                    .eq("lote_numero", lt)
                lotesData = data ?? []
            } else if (ltOnlyMatch) {
                const lt = parseInt(ltOnlyMatch[1])
                const { data } = await supabase
                    .from("lotes")
                    .select("*")
                    .eq("lote_numero", lt)
                lotesData = data ?? []
            } else {
                // DNI search — puede devolver múltiples lotes
                const { data } = await supabase
                    .from("lotes")
                    .select("*")
                    .eq("dni", q)
                lotesData = data ?? []
            }

            if (lotesData.length === 0) {
                setError("No se encontró ningún lote con ese código o DNI.")
                return
            }

            // Fetch recibos for all found lotes
            const loteIds = lotesData.map((l) => l.id)
            const { data: recibosData } = await supabase
                .from("recibos")
                .select("*, tarifa:tarifas_mensuales(*)")
                .in("lote_id", loteIds)
                .order("created_at", { ascending: false })

            const recibos = (recibosData as ReciboPublico[]) ?? []

            // Group recibos by lote_id
            const lotesConRecibos: LoteConRecibos[] = lotesData.map((lote) => ({
                ...lote,
                recibos: recibos.filter((r) => r.lote_id === lote.id),
            }))

            setLotes(lotesConRecibos)
        })
    }


    const totalDeudaGlobal = lotes.reduce(
        (sum, l) =>
            sum +
            l.recibos
                .filter((r) => r.estado === "PENDIENTE")
                .reduce((s, r) => s + r.total_recibo, 0),
        0
    )

    return (
        <div className="space-y-6">
            {/* Search form */}
            <Card className="shadow-lg border-0">
                <CardContent className="p-6">
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Ej: A-1, MZ I LT 6, LT 6 o DNI"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="pl-9 h-12 text-base"
                            />
                        </div>
                        <Button type="submit" disabled={isPending} className="h-12 px-6">
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Consultar"}
                        </Button>
                    </form>
                    <p className="text-xs text-gray-400 mt-3">
                        Formatos válidos: <strong>A-1</strong>, <strong>A 2</strong>, <strong>MZ I LT 6</strong>, <strong>LT 6</strong> o tu <strong>DNI</strong>
                    </p>
                </CardContent>
            </Card>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {/* Results — one card per lote */}
            {lotes.length > 0 && (
                <div className="space-y-6">
                    {/* Global summary if multiple lotes */}
                    {lotes.length > 1 && (
                        <div className="flex items-center justify-between bg-gray-50 border rounded-lg px-4 py-3">
                            <p className="text-sm text-gray-600">
                                Se encontraron <span className="font-bold">{lotes.length} lotes</span> para este DNI
                            </p>
                            {totalDeudaGlobal > 0 && (
                                <p className="text-sm font-bold text-red-600">
                                    Deuda total: {formatCurrencyPEN(totalDeudaGlobal)}
                                </p>
                            )}

                        </div>
                    )}

                    {lotes.map((lote) => {
                        const pendientes = lote.recibos.filter((r) => r.estado === "PENDIENTE")
                        const deudaLote = pendientes.reduce((s, r) => s + r.total_recibo, 0)
                        const mesesPendientes = pendientes.length

                        return (
                            <div key={lote.id} className="space-y-4">
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
                                        {deudaLote > 0 && (
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500">Deuda pendiente</p>
                                                <p className="text-2xl font-bold text-red-600">{formatCurrencyPEN(deudaLote)}</p>
                                            </div>
                                        )}

                                        {deudaLote === 0 && lote.recibos.length > 0 && (
                                            <Badge variant="success" className="text-sm px-3 py-1">
                                                ✓ Al día
                                            </Badge>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Status message */}
                                {deudaLote === 0 && lote.recibos.length > 0 && (
                                    <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
                                        <span className="text-2xl">🎉</span>
                                        <div>
                                            <p className="font-semibold text-green-800">¡Felicidades, {lote.nombres}!</p>
                                            <p className="text-sm text-green-700">Todos tus recibos están al día. ¡Gracias por ser un vecino responsable!</p>
                                        </div>
                                    </div>
                                )}
                                {mesesPendientes === 1 && (
                                    <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex-wrap">
                                        <span className="text-2xl">⚠️</span>
                                        <div className="flex-1">
                                            <p className="font-semibold text-yellow-800">Tienes 1 mes pendiente de pago</p>
                                            <p className="text-sm text-yellow-700">Por favor regulariza tu pago lo antes posible para evitar inconvenientes.</p>
                                        </div>
                                        <a
                                            href={`https://wa.me/51921248292?text=${encodeURIComponent(`Hola, soy ${lote.nombres} ${lote.apellidos} del lote ${formatLoteCodigo(lote.manzana, lote.lote_numero)}. Quisiera coordinar el pago de mi recibo pendiente de ${formatCurrencyPEN(deudaLote)}.`)}`}

                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shrink-0"
                                        >
                                            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                            </svg>
                                            Contactar responsable
                                        </a>
                                    </div>
                                )}
                                {mesesPendientes >= 2 && (
                                    <div className="flex items-center gap-3 bg-red-50 border border-red-300 rounded-lg p-4 flex-wrap">
                                        <span className="text-2xl">🚨</span>
                                        <div className="flex-1">
                                            <p className="font-bold text-red-800">¡Atención! Tienes {mesesPendientes} meses pendientes de pago</p>
                                            <p className="text-sm text-red-700">De no regularizar su deuda, se procederá con el <strong>corte del servicio eléctrico</strong>. Acérquese a la directiva para realizar su pago.</p>
                                        </div>
                                        <a
                                            href={`https://wa.me/51921248292?text=${encodeURIComponent(`URGENTE: Soy ${lote.nombres} ${lote.apellidos} del lote ${formatLoteCodigo(lote.manzana, lote.lote_numero)}. Tengo ${mesesPendientes} meses pendientes por ${formatCurrencyPEN(deudaLote)}. Necesito coordinar mi pago urgentemente.`)}`}

                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors animate-pulse shrink-0"
                                        >
                                            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                            </svg>
                                            ¡Contactar URGENTE!
                                        </a>
                                    </div>
                                )}

                                {/* Recibos table */}
                                {lote.recibos.length > 0 ? (
                                    <div className="space-y-3">
                                        <p className="text-sm font-medium text-gray-700">
                                            Historial de recibos ({lote.recibos.length})
                                        </p>
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
                                                    {lote.recibos.map((r) => (
                                                        <tr key={r.id} className="hover:bg-gray-50">
                                                            <td className="px-4 py-3 text-gray-900 capitalize">
                                                                {r.tarifa ? formatPeriodo(r.tarifa.periodo) : "—"}
                                                            </td>
                                                            <td className="px-4 py-3 text-right text-gray-600">
                                                                {r.consumo_kwh} KWH
                                                            </td>
                                                            <td className="px-4 py-3 text-right font-semibold text-gray-900">
                                                                {formatCurrencyPEN(r.total_recibo)}
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
                                    <p className="text-center text-gray-500 py-4">No hay recibos registrados para este lote.</p>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
