"use client"

import { useState, useTransition } from "react"
import { TarifaMensual } from "@/types"
import { formatPeriodo } from "@/lib/utils"
import { crearPeriodo, cerrarPeriodo, reabrirPeriodo, editarPeriodo } from "@/lib/actions/periodos"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Plus,
    Lock,
    Unlock,
    Loader2,
    Calendar,
    Pencil,
    X,
    CheckCircle,
    AlertCircle,
} from "lucide-react"

interface Props {
    periodos: TarifaMensual[]
}

export function PeriodosClient({ periodos }: Props) {
    const [showForm, setShowForm] = useState(false)
    const [periodo, setPeriodo] = useState("")
    const [precioKwh, setPrecioKwh] = useState("0.86")
    const [alumbrado, setAlumbrado] = useState("10.00")
    const [error, setError] = useState<string | null>(null)
    const [successMsg, setSuccessMsg] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    // Edit state
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editPrecio, setEditPrecio] = useState("")
    const [editAlumbrado, setEditAlumbrado] = useState("")
    const [editError, setEditError] = useState<string | null>(null)

    function handleCreate(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        setSuccessMsg(null)
        startTransition(async () => {
            const result = await crearPeriodo({
                periodo: periodo + "-01",
                precio_kwh: parseFloat(precioKwh),
                costo_alumbrado: parseFloat(alumbrado),
            })
            if (result.error) {
                setError(result.error)
            } else {
                setShowForm(false)
                setPeriodo("")
                setSuccessMsg("✓ Período creado correctamente.")
            }
        })
    }

    function handleCerrar(id: number) {
        startTransition(async () => {
            await cerrarPeriodo(id)
        })
    }

    function handleReabrir(id: number) {
        startTransition(async () => {
            await reabrirPeriodo(id)
        })
    }

    function openEdit(p: TarifaMensual) {
        setEditingId(p.id)
        setEditPrecio(String(p.precio_kwh))
        setEditAlumbrado(String(p.costo_alumbrado))
        setEditError(null)
        setSuccessMsg(null)
    }

    function cancelEdit() {
        setEditingId(null)
        setEditError(null)
    }

    function handleEdit(e: React.FormEvent) {
        e.preventDefault()
        if (editingId === null) return
        setEditError(null)
        startTransition(async () => {
            const result = await editarPeriodo(editingId, {
                precio_kwh: parseFloat(editPrecio),
                costo_alumbrado: parseFloat(editAlumbrado),
            })
            if (result.error) {
                setEditError(result.error)
            } else {
                setEditingId(null)
                setSuccessMsg("✓ Período actualizado correctamente.")
            }
        })
    }

    return (
        <div className="space-y-4">
            {/* Feedback */}
            {successMsg && (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    {successMsg}
                </div>
            )}

            {/* Create form */}
            {!showForm ? (
                <Button onClick={() => { setShowForm(true); setSuccessMsg(null) }} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Nuevo Período
                </Button>
            ) : (
                <Card className="border-blue-200 bg-blue-50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Crear nuevo período
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Mes y Año</label>
                                    <Input
                                        type="month"
                                        value={periodo}
                                        onChange={(e) => setPeriodo(e.target.value)}
                                        required
                                        className="bg-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Precio KWH (S/)</label>
                                    <Input
                                        type="number"
                                        step="0.0001"
                                        min="0"
                                        value={precioKwh}
                                        onChange={(e) => setPrecioKwh(e.target.value)}
                                        required
                                        className="bg-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Alumbrado Público (S/)</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={alumbrado}
                                        onChange={(e) => setAlumbrado(e.target.value)}
                                        required
                                        className="bg-white"
                                    />
                                </div>
                            </div>
                            {error && (
                                <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    {error}
                                </div>
                            )}
                            <div className="flex gap-2">
                                <Button type="submit" disabled={isPending}>
                                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Crear Período"}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Periods list */}
            <div className="space-y-3">
                {periodos.length === 0 && (
                    <p className="text-gray-500 text-sm py-8 text-center">
                        No hay períodos creados. Crea el primero.
                    </p>
                )}
                {periodos.map((p) => (
                    <Card key={p.id} className={p.estado === "ABIERTO" ? "border-green-200" : ""}>
                        <CardContent className="p-4">
                            {editingId === p.id ? (
                                /* Edit mode */
                                <form onSubmit={handleEdit} className="space-y-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <p className="font-semibold text-gray-900 capitalize">
                                            {formatPeriodo(p.periodo)}
                                        </p>
                                        <Badge variant={p.estado === "ABIERTO" ? "success" : "secondary"}>
                                            {p.estado}
                                        </Badge>
                                        <span className="text-xs text-blue-600 font-medium">— Editando</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 max-w-md">
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-gray-600">Precio KWH (S/)</label>
                                            <Input
                                                type="number"
                                                step="0.0001"
                                                min="0"
                                                value={editPrecio}
                                                onChange={(e) => setEditPrecio(e.target.value)}
                                                required
                                                className="bg-white h-8 text-sm"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-gray-600">Alumbrado (S/)</label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={editAlumbrado}
                                                onChange={(e) => setEditAlumbrado(e.target.value)}
                                                required
                                                className="bg-white h-8 text-sm"
                                            />
                                        </div>
                                    </div>
                                    {editError && (
                                        <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm">
                                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                            {editError}
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        <Button type="submit" size="sm" disabled={isPending}>
                                            {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Guardar"}
                                        </Button>
                                        <Button type="button" variant="outline" size="sm" onClick={cancelEdit}>
                                            <X className="w-3 h-3" /> Cancelar
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                /* View mode */
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-gray-900 capitalize">
                                                {formatPeriodo(p.periodo)}
                                            </p>
                                            <Badge variant={p.estado === "ABIERTO" ? "success" : "secondary"}>
                                                {p.estado}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-0.5">
                                            S/ {p.precio_kwh}/KWH · Alumbrado: S/ {p.costo_alumbrado}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openEdit(p)}
                                            className="gap-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                                        >
                                            <Pencil className="w-3 h-3" />
                                            Editar
                                        </Button>
                                        {p.estado === "ABIERTO" ? (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleCerrar(p.id)}
                                                disabled={isPending}
                                                className="gap-1 text-orange-600 border-orange-200 hover:bg-orange-50"
                                            >
                                                <Lock className="w-3 h-3" />
                                                Cerrar
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleReabrir(p.id)}
                                                disabled={isPending}
                                                className="gap-1 text-green-600 border-green-200 hover:bg-green-50"
                                            >
                                                <Unlock className="w-3 h-3" />
                                                Reabrir
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
