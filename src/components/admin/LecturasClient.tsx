"use client"

import { useState, useTransition, useCallback } from "react"
import { Lote, TarifaMensual } from "@/types"
import { calcularTotal, formatCurrency, formatLoteCodigo, formatPeriodo } from "@/lib/utils"
import { guardarLectura, importarLecturas } from "@/lib/actions/lecturas"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Search,
    Zap,
    Upload,
    CheckCircle,
    AlertCircle,
    Loader2,
    FileText,
    X,
} from "lucide-react"
import Papa from "papaparse"

interface Props {
    lotes: Lote[]
    tarifasAbiertas: TarifaMensual[]
}

export function LecturasClient({ lotes, tarifasAbiertas }: Props) {
    const [activeTab, setActiveTab] = useState<"individual" | "csv">("individual")

    // Individual form state
    const [search, setSearch] = useState("")
    const [selectedLote, setSelectedLote] = useState<Lote | null>(null)
    const [selectedTarifa, setSelectedTarifa] = useState<TarifaMensual | null>(
        tarifasAbiertas[0] ?? null
    )
    const [consumo, setConsumo] = useState("")
    const [successMsg, setSuccessMsg] = useState<string | null>(null)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    // CSV state
    const [csvRows, setCsvRows] = useState<
        { lote_id: number; nombre: string; codigo: string; consumo_kwh: number; total: number }[]
    >([])
    const [csvError, setCsvError] = useState<string | null>(null)
    const [csvSuccess, setCsvSuccess] = useState<string | null>(null)

    const filteredLotes = lotes.filter((l) => {
        const q = search.toLowerCase()
        const nombre = `${l.nombres} ${l.apellidos}`.toLowerCase()
        const codigo = `${l.manzana}${l.lote_numero}`.toLowerCase()
        return nombre.includes(q) || codigo.includes(q)
    })

    const preview = selectedTarifa && consumo
        ? calcularTotal(parseFloat(consumo) || 0, selectedTarifa.precio_kwh, selectedTarifa.costo_alumbrado)
        : null

    function handleSelectLote(lote: Lote) {
        setSelectedLote(lote)
        setSearch(`${lote.nombres} ${lote.apellidos} — ${formatLoteCodigo(lote.manzana, lote.lote_numero)}`)
        setSuccessMsg(null)
        setErrorMsg(null)
    }

    function handleSave() {
        if (!selectedLote || !selectedTarifa || !consumo) return
        setErrorMsg(null)
        setSuccessMsg(null)
        startTransition(async () => {
            const result = await guardarLectura({
                lote_id: selectedLote.id,
                tarifa_id: selectedTarifa.id,
                consumo_kwh: parseFloat(consumo),
            })
            if (result.error) {
                setErrorMsg(result.error)
            } else {
                setSuccessMsg(`✓ Lectura guardada para ${selectedLote.nombres} ${selectedLote.apellidos}`)
                setSelectedLote(null)
                setSearch("")
                setConsumo("")
            }
        })
    }

    function handleCSVUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file || !selectedTarifa) return
        setCsvError(null)
        setCsvSuccess(null)

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const rows: typeof csvRows = []
                const errors: string[] = []

                results.data.forEach((row: any, i: number) => {
                    const mz = (row.mz || row.MZ || "").toString().trim().toUpperCase()
                    const lt = parseInt(row.lt || row.LT || "0")
                    const consumoKwh = parseFloat(row.consumo_kwh || row["CONSUMO EN KWH"] || "0")

                    const lote = lotes.find(
                        (l) => l.manzana.toUpperCase() === mz && l.lote_numero === lt
                    )

                    if (!lote) {
                        errors.push(`Fila ${i + 2}: No se encontró lote MZ ${mz} LT ${lt}`)
                        return
                    }

                    const { totalRecibo } = calcularTotal(consumoKwh, selectedTarifa.precio_kwh, selectedTarifa.costo_alumbrado)
                    rows.push({
                        lote_id: lote.id,
                        nombre: `${lote.nombres} ${lote.apellidos}`,
                        codigo: formatLoteCodigo(lote.manzana, lote.lote_numero),
                        consumo_kwh: consumoKwh,
                        total: totalRecibo,
                    })
                })

                if (errors.length > 0) {
                    setCsvError(errors.join("\n"))
                }
                setCsvRows(rows)
            },
            error: () => setCsvError("Error al leer el archivo CSV."),
        })
    }

    function handleCSVImport() {
        if (!selectedTarifa || csvRows.length === 0) return
        setCsvError(null)
        startTransition(async () => {
            const result = await importarLecturas(
                selectedTarifa.id,
                csvRows.map((r) => ({ lote_id: r.lote_id, consumo_kwh: r.consumo_kwh }))
            )
            if (result.error) {
                setCsvError(result.error)
            } else {
                setCsvSuccess(`✓ ${result.count} lecturas importadas correctamente.`)
                setCsvRows([])
            }
        })
    }

    if (tarifasAbiertas.length === 0) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="font-medium text-yellow-800">No hay períodos abiertos</p>
                <p className="text-sm text-yellow-600 mt-1">
                    Ve a <a href="/admin/periodos" className="underline">Períodos</a> y crea uno nuevo.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Tarifa selector */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm font-medium text-gray-700">Período activo:</span>
                        {tarifasAbiertas.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setSelectedTarifa(t)}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${selectedTarifa?.id === t.id
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                            >
                                {formatPeriodo(t.periodo)}
                            </button>
                        ))}
                        {selectedTarifa && (
                            <span className="text-xs text-gray-400 ml-2">
                                S/ {selectedTarifa.precio_kwh}/KWH · Alumbrado S/ {selectedTarifa.costo_alumbrado}
                            </span>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <div className="flex gap-2 border-b">
                <button
                    onClick={() => setActiveTab("individual")}
                    className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors cursor-pointer ${activeTab === "individual"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <Zap className="w-4 h-4 inline mr-1.5" />
                    Lectura Individual
                </button>
                <button
                    onClick={() => setActiveTab("csv")}
                    className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors cursor-pointer ${activeTab === "csv"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <Upload className="w-4 h-4 inline mr-1.5" />
                    Importar CSV
                </button>
            </div>

            {/* Individual Tab */}
            {activeTab === "individual" && (
                <div className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Buscar por nombre o código (ej: A1, Emer...)"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value)
                                if (selectedLote) setSelectedLote(null)
                            }}
                            className="pl-9"
                        />
                    </div>

                    {/* Dropdown results */}
                    {search && !selectedLote && filteredLotes.length > 0 && (
                        <Card className="shadow-lg">
                            <CardContent className="p-2">
                                <div className="max-h-48 overflow-y-auto space-y-1">
                                    {filteredLotes.slice(0, 8).map((lote) => (
                                        <button
                                            key={lote.id}
                                            onClick={() => handleSelectLote(lote)}
                                            className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                                        >
                                            <p className="text-sm font-medium text-gray-900">
                                                {lote.nombres} {lote.apellidos}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {formatLoteCodigo(lote.manzana, lote.lote_numero)} ·{" "}
                                                <span className={lote.tipo_servicio === "HABITADO" ? "text-green-600" : "text-orange-500"}>
                                                    {lote.tipo_servicio === "HABITADO" ? "Habitado" : "Solo Mantenimiento"}
                                                </span>
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Lectura Card */}
                    {selectedLote && selectedTarifa && (
                        <Card className="border-blue-200">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-base">
                                            {selectedLote.nombres} {selectedLote.apellidos}
                                        </CardTitle>
                                        <p className="text-sm text-gray-500 mt-0.5">
                                            {formatLoteCodigo(selectedLote.manzana, selectedLote.lote_numero)}
                                        </p>
                                    </div>
                                    <Badge variant={selectedLote.tipo_servicio === "HABITADO" ? "info" : "warning"}>
                                        {selectedLote.tipo_servicio === "HABITADO" ? "Habitado" : "Solo Mant."}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">
                                        Consumo en KWH
                                    </label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="Ej: 105.5"
                                        value={consumo}
                                        onChange={(e) => setConsumo(e.target.value)}
                                        autoFocus
                                    />
                                </div>

                                {/* Real-time preview */}
                                {preview && consumo && (
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-2 border">
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>Consumo × Precio KWH</span>
                                            <span>
                                                {parseFloat(consumo).toFixed(2)} × S/ {selectedTarifa.precio_kwh}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>Alumbrado Público</span>
                                            <span>+ S/ {selectedTarifa.costo_alumbrado}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-400">
                                            <span>Subtotal</span>
                                            <span>S/ {preview.totalConsumo.toFixed(3)}</span>
                                        </div>
                                        <div className="border-t pt-2 flex justify-between font-bold text-gray-900">
                                            <span>Total Recibo (redondeado)</span>
                                            <span className="text-blue-600 text-lg">
                                                S/ {preview.totalRecibo}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleSave}
                                        disabled={isPending || !consumo}
                                        className="flex-1"
                                    >
                                        {isPending ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            "Guardar Lectura"
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setSelectedLote(null)
                                            setSearch("")
                                            setConsumo("")
                                        }}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {successMsg && (
                        <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm">
                            <CheckCircle className="w-4 h-4 flex-shrink-0" />
                            {successMsg}
                        </div>
                    )}
                    {errorMsg && (
                        <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {errorMsg}
                        </div>
                    )}
                </div>
            )}

            {/* CSV Tab */}
            {activeTab === "csv" && (
                <div className="space-y-4">
                    {/* Format guide */}
                    <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-4">
                            <p className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Formato esperado del CSV:
                            </p>
                            <code className="text-xs bg-white rounded px-3 py-2 block text-gray-700 font-mono">
                                mz,lt,consumo_kwh<br />
                                A,1,105<br />
                                A,2,5<br />
                                A,17,78.7
                            </code>
                            <p className="text-xs text-blue-600 mt-2">
                                El precio KWH y alumbrado se toman del período seleccionado arriba.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Upload */}
                    <div>
                        <label
                            htmlFor="csv-upload"
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                        >
                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600">
                                <span className="font-medium text-blue-600">Haz clic para subir</span> o arrastra tu CSV
                            </p>
                            <p className="text-xs text-gray-400 mt-1">Solo archivos .csv</p>
                            <input
                                id="csv-upload"
                                type="file"
                                accept=".csv"
                                className="hidden"
                                onChange={handleCSVUpload}
                            />
                        </label>
                    </div>

                    {/* Preview table */}
                    {csvRows.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-700">
                                    Vista previa — {csvRows.length} lecturas
                                </p>
                                <Button
                                    onClick={handleCSVImport}
                                    disabled={isPending}
                                    className="gap-2"
                                >
                                    {isPending ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <CheckCircle className="w-4 h-4" />
                                            Confirmar Importación
                                        </>
                                    )}
                                </Button>
                            </div>
                            <div className="overflow-x-auto rounded-lg border">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="text-left px-4 py-2 font-medium text-gray-600">Lote</th>
                                            <th className="text-left px-4 py-2 font-medium text-gray-600">Propietario</th>
                                            <th className="text-right px-4 py-2 font-medium text-gray-600">Consumo KWH</th>
                                            <th className="text-right px-4 py-2 font-medium text-gray-600">Total S/</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {csvRows.map((row, i) => (
                                            <tr key={i} className="hover:bg-gray-50">
                                                <td className="px-4 py-2 font-mono text-xs text-gray-600">{row.codigo}</td>
                                                <td className="px-4 py-2 text-gray-900">{row.nombre}</td>
                                                <td className="px-4 py-2 text-right text-gray-700">{row.consumo_kwh}</td>
                                                <td className="px-4 py-2 text-right font-semibold text-blue-700">
                                                    S/ {row.total}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {csvError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 whitespace-pre-line">
                            <AlertCircle className="w-4 h-4 inline mr-1" />
                            {csvError}
                        </div>
                    )}
                    {csvSuccess && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
                            <CheckCircle className="w-4 h-4 inline mr-1" />
                            {csvSuccess}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
