import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Users, CreditCard, AlertCircle } from "lucide-react"
import { formatCurrency, formatPeriodo } from "@/lib/utils"
import Link from "next/link"

export const metadata = { title: "Dashboard" }

async function getStats() {
    const supabase = await createClient()

    const [lotesRes, recibosRes, tarifaRes] = await Promise.all([
        supabase.from("lotes").select("id", { count: "exact" }),
        supabase.from("recibos").select("id, estado, total_recibo", { count: "exact" }),
        supabase
            .from("tarifas_mensuales")
            .select("*")
            .eq("estado", "ABIERTO")
            .order("periodo", { ascending: false })
            .limit(1)
            .single(),
    ])

    const recibos = recibosRes.data ?? []
    const pendientes = recibos.filter((r) => r.estado === "PENDIENTE")
    const totalDeuda = pendientes.reduce((sum, r) => sum + (r.total_recibo ?? 0), 0)

    return {
        totalLotes: lotesRes.count ?? 0,
        totalRecibos: recibosRes.count ?? 0,
        recibossPendientes: pendientes.length,
        totalDeuda,
        periodoActivo: tarifaRes.data,
    }
}

export default async function DashboardPage() {
    const stats = await getStats()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Resumen del sistema — UPIS Las Palmeras del Sol
                </p>
            </div>

            {/* Período activo */}
            {stats.periodoActivo ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                    <Zap className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-medium text-blue-900">
                            Período activo:{" "}
                            <span className="font-bold">
                                {formatPeriodo(stats.periodoActivo.periodo)}
                            </span>
                        </p>
                        <p className="text-xs text-blue-600">
                            S/ {stats.periodoActivo.precio_kwh}/KWH · Alumbrado: S/{" "}
                            {stats.periodoActivo.costo_alumbrado}
                        </p>
                    </div>
                    <Badge variant="success" className="ml-auto">
                        ABIERTO
                    </Badge>
                </div>
            ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <p className="text-sm text-yellow-800">
                        No hay período activo.{" "}
                        <Link href="/admin/periodos" className="font-medium underline">
                            Crear período
                        </Link>
                    </p>
                </div>
            )}

            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Total Lotes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalLotes}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            Recibos Emitidos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalRecibos}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Pendientes de Pago
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-red-600">{stats.recibossPendientes}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            Deuda Total
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-orange-600">
                            {formatCurrency(stats.totalDeuda)}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link href="/admin/lecturas">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed hover:border-blue-300">
                        <CardContent className="p-6 text-center">
                            <Zap className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                            <p className="font-medium text-gray-900">Registrar Lectura</p>
                            <p className="text-xs text-gray-500 mt-1">Individual o importar CSV</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/admin/pagos">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed hover:border-green-300">
                        <CardContent className="p-6 text-center">
                            <CreditCard className="w-8 h-8 text-green-500 mx-auto mb-2" />
                            <p className="font-medium text-gray-900">Registrar Pago</p>
                            <p className="text-xs text-gray-500 mt-1">Marcar recibos como pagados</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/admin/periodos">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed hover:border-purple-300">
                        <CardContent className="p-6 text-center">
                            <AlertCircle className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                            <p className="font-medium text-gray-900">Gestionar Períodos</p>
                            <p className="text-xs text-gray-500 mt-1">Abrir o cerrar mes</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    )
}
