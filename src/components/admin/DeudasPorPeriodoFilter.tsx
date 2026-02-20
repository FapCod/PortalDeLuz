"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { formatCurrencyPEN, formatPeriodo } from "@/lib/utils"
import { Calendar, CheckCircle, AlertCircle } from "lucide-react"

interface DeudaPeriodo {
    periodo: string
    vecinos_con_deuda: number
    monto_total_deuda: number
    vecinos_pendientes: number
    vecinos_pagados: number
}

interface Props {
    initialData: DeudaPeriodo[]
}

export function DeudasPorPeriodoFilter({ initialData }: Props) {
    // Sort data by period descending to get the most recent first
    const sortedData = [...initialData].sort((a, b) =>
        new Date(b.periodo).getTime() - new Date(a.periodo).getTime()
    )

    const [selectedPeriod, setSelectedPeriod] = useState<string>(
        sortedData.length > 0 ? sortedData[0].periodo : ""
    )

    const activeData = sortedData.find((d) => d.periodo === selectedPeriod)

    if (sortedData.length === 0) {
        return (
            <div className="py-8 text-center bg-gray-50 rounded-lg border border-dashed text-gray-500">
                No se encontraron deudas pendientes en ningún período.
            </div>
        )
    }

    return (
        <Card className="shadow-sm border-l-4 border-l-red-500 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="space-y-1">
                    <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        Resumen de Deuda por Período
                    </CardTitle>
                    <CardDescription>
                        Selecciona un mes para ver el detalle de pagos pendientes
                    </CardDescription>
                </div>
                <div className="w-48">
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                        <SelectTrigger className="h-9">
                            <SelectValue placeholder="Periodo" />
                        </SelectTrigger>
                        <SelectContent>
                            {sortedData.map((d) => (
                                <SelectItem key={d.periodo} value={d.periodo}>
                                    {formatPeriodo(d.periodo)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                {activeData ? (
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 py-2">
                        <div className="space-y-1">
                            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">
                                Monto acumulado pendiente
                            </p>
                            <p className="text-4xl font-black text-gray-900 tracking-tight">
                                {formatCurrencyPEN(activeData.monto_total_deuda)}
                            </p>
                            <p className="text-xs text-gray-400">
                                Total por cobrar en {formatPeriodo(activeData.periodo)}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    <span className="text-xs font-semibold">{activeData.vecinos_pagados} Pagados</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    <span className="text-xs font-semibold">{activeData.vecinos_pendientes} Pendientes</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50 px-3 py-1 text-sm font-semibold">
                                {activeData.vecinos_con_deuda} vecinos con deuda
                            </Badge>
                        </div>
                    </div>
                ) : (
                    <div className="py-6 text-center text-gray-400 text-sm italic">
                        Selecciona un período para ver los datos
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
