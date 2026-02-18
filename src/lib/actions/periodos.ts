"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { PeriodoFormData } from "@/types"

export async function crearPeriodo(data: PeriodoFormData) {
    const supabase = await createClient()

    const { error } = await supabase.from("tarifas_mensuales").insert({
        periodo: data.periodo,
        precio_kwh: data.precio_kwh,
        costo_alumbrado: data.costo_alumbrado,
        estado: "ABIERTO",
    })

    if (error) {
        if (error.code === "23505") {
            return { error: "Ya existe un período para ese mes." }
        }
        return { error: error.message }
    }

    revalidatePath("/admin/periodos")
    revalidatePath("/admin/dashboard")
    return { success: true }
}

export async function editarPeriodo(
    id: number,
    data: { precio_kwh: number; costo_alumbrado: number }
) {
    const supabase = await createClient()

    const { error } = await supabase
        .from("tarifas_mensuales")
        .update({
            precio_kwh: data.precio_kwh,
            costo_alumbrado: data.costo_alumbrado,
        })
        .eq("id", id)

    if (error) return { error: error.message }

    // Propagar los nuevos precios a todos los recibos de este período
    const { error: errorRecibos } = await supabase
        .from("recibos")
        .update({
            precio_x_kwh: data.precio_kwh,
            alumbrado_publico: data.costo_alumbrado,
        })
        .eq("tarifa_id", id)

    if (errorRecibos) return { error: errorRecibos.message }

    revalidatePath("/admin/periodos")
    revalidatePath("/admin/lecturas")
    revalidatePath("/admin/pagos")
    revalidatePath("/admin/dashboard")
    return { success: true }
}

export async function cerrarPeriodo(id: number) {
    const supabase = await createClient()

    const { error } = await supabase
        .from("tarifas_mensuales")
        .update({ estado: "CERRADO" })
        .eq("id", id)

    if (error) return { error: error.message }

    revalidatePath("/admin/periodos")
    revalidatePath("/admin/dashboard")
    return { success: true }
}

export async function reabrirPeriodo(id: number) {
    const supabase = await createClient()

    const { error } = await supabase
        .from("tarifas_mensuales")
        .update({ estado: "ABIERTO" })
        .eq("id", id)

    if (error) return { error: error.message }

    revalidatePath("/admin/periodos")
    return { success: true }
}
