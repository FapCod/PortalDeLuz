"use client"

import { useState, useTransition, useRef } from "react"
import { Lote, EstadoLote } from "@/types"
import { formatLoteCodigo } from "@/lib/utils"
import { crearLote, actualizarLote, eliminarLote, LoteFormData } from "@/lib/actions/lotes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Plus,
    Search,
    Pencil,
    CheckCircle,
    AlertCircle,
    Loader2,
    X,
    Users,
    Trash2,
    Phone,
} from "lucide-react"

interface Props {
    lotes: Lote[]
}

const TIPO_OPTIONS: { value: EstadoLote; label: string }[] = [
    { value: "HABITADO", label: "Habitado" },
    { value: "SOLO_MANTENIMIENTO", label: "Solo Mantenimiento" },
    { value: "BALDIO", label: "Baldío" },
]

const tipoVariant: Record<EstadoLote, "success" | "warning" | "secondary"> = {
    HABITADO: "success",
    SOLO_MANTENIMIENTO: "warning",
    BALDIO: "secondary",
}

const EMPTY_FORM: LoteFormData = {
    manzana: "",
    lote_numero: 0,
    nombres: "",
    apellidos: "",
    dni: "",
    celular: "",
    tipo_servicio: "HABITADO",
}

export function LotesClient({ lotes }: Props) {
    const [search, setSearch] = useState("")
    const [filtroTipo, setFiltroTipo] = useState<"TODOS" | EstadoLote>("TODOS")
    const [showForm, setShowForm] = useState(false)
    const [editingLote, setEditingLote] = useState<Lote | null>(null)
    const [form, setForm] = useState<LoteFormData>(EMPTY_FORM)
    const [successMsg, setSuccessMsg] = useState<string | null>(null)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()
    const formRef = useRef<HTMLDivElement>(null)

    const filtered = lotes.filter((l) => {
        const q = search.toLowerCase()
        const nombre = `${l.nombres} ${l.apellidos}`.toLowerCase()
        const codigo = `${l.manzana}${l.lote_numero}`.toLowerCase()
        const dni = (l.dni ?? "").toLowerCase()
        const matchSearch = !q || nombre.includes(q) || codigo.includes(q) || dni.includes(q)
        const matchTipo = filtroTipo === "TODOS" || l.tipo_servicio === filtroTipo
        return matchSearch && matchTipo
    })

    const habitadoCount = lotes.filter((l) => l.tipo_servicio === "HABITADO").length
    const mantenimientoCount = lotes.filter((l) => l.tipo_servicio === "SOLO_MANTENIMIENTO").length
    const baldioCount = lotes.filter((l) => l.tipo_servicio === "BALDIO").length

    function openCreate() {
        setEditingLote(null)
        setForm(EMPTY_FORM)
        setSuccessMsg(null)
        setErrorMsg(null)
        setShowForm(true)
    }

    function openEdit(lote: Lote) {
        setEditingLote(lote)
        setForm({
            manzana: lote.manzana,
            lote_numero: lote.lote_numero,
            nombres: lote.nombres ?? "",
            apellidos: lote.apellidos ?? "",
            dni: lote.dni ?? "",
            celular: lote.celular ?? "",
            tipo_servicio: lote.tipo_servicio,
        })
        setSuccessMsg(null)
        setErrorMsg(null)
        setShowForm(true)
        // Wait for React to render the form, then scroll
        setTimeout(() => {
            requestAnimationFrame(() => {
                formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
            })
        }, 150)
    }

    function handleEliminar(lote: Lote) {
        const codigo = formatLoteCodigo(lote.manzana, lote.lote_numero)
        const ok = window.confirm(
            `¿Estás seguro de eliminar el lote ${codigo} (${lote.nombres} ${lote.apellidos})?\n\nSe eliminarán también TODOS sus recibos. Esta acción no se puede deshacer.`
        )
        if (!ok) return
        setSuccessMsg(null)
        startTransition(async () => {
            const result = await eliminarLote(lote.id)
            if (result.error) {
                setErrorMsg(result.error)
            } else {
                setSuccessMsg(`✓ Lote ${codigo} eliminado.`)
            }
        })
    }

    function closeForm() {
        setShowForm(false)
        setEditingLote(null)
        setForm(EMPTY_FORM)
        setErrorMsg(null)
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setErrorMsg(null)
        setSuccessMsg(null)

        startTransition(async () => {
            const result = editingLote
                ? await actualizarLote(editingLote.id, form)
                : await crearLote(form)

            if (result.error) {
                setErrorMsg(result.error)
            } else {
                setSuccessMsg(
                    editingLote
                        ? `✓ Lote ${form.manzana.toUpperCase()}-${form.lote_numero} actualizado.`
                        : `✓ Lote ${form.manzana.toUpperCase()}-${form.lote_numero} creado correctamente.`
                )
                closeForm()
            }
        })
    }

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Buscar por nombre, código (A1) o DNI..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Button onClick={openCreate} className="gap-2 shrink-0">
                    <Plus className="w-4 h-4" />
                    Nuevo Lote
                </Button>
            </div>

            {/* Type filter pills */}
            <div className="flex gap-2 flex-wrap">
                <button
                    onClick={() => setFiltroTipo("TODOS")}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${filtroTipo === "TODOS" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                >
                    Todos ({lotes.length})
                </button>
                <button
                    onClick={() => setFiltroTipo("HABITADO")}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${filtroTipo === "HABITADO" ? "bg-green-600 text-white" : "bg-green-50 text-green-700 hover:bg-green-100"}`}
                >
                    Habitados ({habitadoCount})
                </button>
                <button
                    onClick={() => setFiltroTipo("SOLO_MANTENIMIENTO")}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${filtroTipo === "SOLO_MANTENIMIENTO" ? "bg-yellow-500 text-white" : "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"}`}
                >
                    Solo Mant. ({mantenimientoCount})
                </button>
                <button
                    onClick={() => setFiltroTipo("BALDIO")}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${filtroTipo === "BALDIO" ? "bg-gray-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                >
                    Baldíos ({baldioCount})
                </button>
            </div>

            {/* Feedback messages */}
            {successMsg && (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    {successMsg}
                </div>
            )}

            {/* Create / Edit Form */}
            {showForm && (
                <Card ref={formRef} className="border-blue-200 bg-blue-50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            {editingLote ? "Editar Lote" : "Nuevo Lote"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Row 1: Manzana + Lote + Tipo */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">
                                        Manzana <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        placeholder="Ej: A"
                                        maxLength={2}
                                        value={form.manzana}
                                        onChange={(e) =>
                                            setForm({ ...form, manzana: e.target.value })
                                        }
                                        required
                                        className="bg-white uppercase"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">
                                        N° Lote <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="number"
                                        min={1}
                                        placeholder="Ej: 1"
                                        value={form.lote_numero || ""}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                lote_numero: parseInt(e.target.value) || 0,
                                            })
                                        }
                                        required
                                        className="bg-white"
                                    />
                                </div>
                                <div className="space-y-1 col-span-2 sm:col-span-1">
                                    <label className="text-sm font-medium text-gray-700">
                                        Tipo de Servicio
                                    </label>
                                    <select
                                        value={form.tipo_servicio}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                tipo_servicio: e.target.value as EstadoLote,
                                            })
                                        }
                                        className="w-full h-10 rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    >
                                        {TIPO_OPTIONS.map((o) => (
                                            <option key={o.value} value={o.value}>
                                                {o.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Row 2: Nombres + Apellidos */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">
                                        Nombres <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        placeholder="Ej: EMER DAVID"
                                        value={form.nombres}
                                        onChange={(e) =>
                                            setForm({ ...form, nombres: e.target.value })
                                        }
                                        required
                                        className="bg-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">
                                        Apellidos <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        placeholder="Ej: DE LA CRUZ CORDOVA"
                                        value={form.apellidos}
                                        onChange={(e) =>
                                            setForm({ ...form, apellidos: e.target.value })
                                        }
                                        required
                                        className="bg-white"
                                    />
                                </div>
                            </div>

                            {/* Row 3: DNI + Celular */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">
                                        DNI
                                        <span className="text-gray-400 font-normal ml-1">(consulta pública)</span>
                                    </label>
                                    <Input
                                        placeholder="Ej: 12345678"
                                        maxLength={8}
                                        value={form.dni}
                                        onChange={(e) =>
                                            setForm({ ...form, dni: e.target.value.replace(/\D/g, "") })
                                        }
                                        className="bg-white font-mono"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">
                                        <Phone className="w-3 h-3 inline mr-1" />
                                        Celular
                                        <span className="text-gray-400 font-normal ml-1">(para WhatsApp)</span>
                                    </label>
                                    <Input
                                        placeholder="Ej: 964972584"
                                        maxLength={9}
                                        value={form.celular}
                                        onChange={(e) =>
                                            setForm({ ...form, celular: e.target.value.replace(/\D/g, "") })
                                        }
                                        className="bg-white font-mono"
                                    />
                                </div>
                            </div>

                            {errorMsg && (
                                <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    {errorMsg}
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Button type="submit" disabled={isPending}>
                                    {isPending ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : editingLote ? (
                                        "Guardar Cambios"
                                    ) : (
                                        "Crear Lote"
                                    )}
                                </Button>
                                <Button type="button" variant="outline" onClick={closeForm}>
                                    <X className="w-4 h-4" />
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Stats */}
            <p className="text-sm text-gray-500">
                {filtered.length} de {lotes.length} lotes
            </p>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="text-left px-4 py-3 font-medium text-gray-600">Código</th>
                            <th className="text-left px-4 py-3 font-medium text-gray-600">Propietario</th>
                            <th className="text-left px-4 py-3 font-medium text-gray-600">DNI</th>
                            <th className="text-left px-4 py-3 font-medium text-gray-600">Celular</th>
                            <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
                            <th className="text-center px-4 py-3 font-medium text-gray-600">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={6} className="text-center py-10 text-gray-400">
                                    {search
                                        ? "No se encontraron lotes con ese criterio."
                                        : "No hay lotes registrados. Crea el primero."}
                                </td>
                            </tr>
                        )}
                        {filtered.map((lote) => (
                            <tr key={lote.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-700">
                                    {formatLoteCodigo(lote.manzana, lote.lote_numero)}
                                </td>
                                <td className="px-4 py-3 text-gray-900">
                                    {lote.nombres} {lote.apellidos}
                                </td>
                                <td className="px-4 py-3 font-mono text-gray-600">
                                    {lote.dni ?? (
                                        <span className="text-gray-300 italic">—</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 font-mono text-gray-600 text-xs">
                                    {lote.celular ?? (
                                        <span className="text-gray-300 italic">—</span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <Badge variant={tipoVariant[lote.tipo_servicio]}>
                                        {lote.tipo_servicio === "HABITADO"
                                            ? "Habitado"
                                            : lote.tipo_servicio === "SOLO_MANTENIMIENTO"
                                                ? "Solo Mant."
                                                : "Baldío"}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <div className="flex justify-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openEdit(lote)}
                                            className="gap-1 text-gray-500 hover:text-gray-900"
                                        >
                                            <Pencil className="w-3 h-3" />
                                            Editar
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEliminar(lote)}
                                            disabled={isPending}
                                            className="gap-1 text-red-400 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
