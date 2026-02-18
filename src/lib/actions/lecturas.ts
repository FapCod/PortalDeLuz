"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { LecturaFormData } from "@/types"

export async function guardarLectura(data: LecturaFormData) {
    const supabase = await createClient()

    // Get tarifa details to snapshot prices
    const { data: tarifa, error: tarifaError } = await supabase
        .from("tarifas_mensuales")
        .select("precio_kwh, costo_alumbrado, estado")
        .eq("id", data.tarifa_id)
        .single()

    if (tarifaError || !tarifa) {
        return { error: "Período no encontrado." }
    }

    if (tarifa.estado !== "ABIERTO") {
        return { error: "No se puede agregar lecturas a un período cerrado." }
    }

    // Check for duplicate
    const { data: existing } = await supabase
        .from("recibos")
        .select("id")
        .eq("lote_id", data.lote_id)
        .eq("tarifa_id", data.tarifa_id)
        .single()

    if (existing) {
        return { error: "Ya existe un recibo para este lote en el período seleccionado." }
    }

    const { error } = await supabase.from("recibos").insert({
        lote_id: data.lote_id,
        tarifa_id: data.tarifa_id,
        consumo_kwh: data.consumo_kwh,
        precio_x_kwh: tarifa.precio_kwh,
        alumbrado_publico: tarifa.costo_alumbrado,
    })

    if (error) return { error: error.message }

    revalidatePath("/admin/lecturas")
    revalidatePath("/admin/pagos")
    revalidatePath("/admin/dashboard")
    return { success: true }
}

export async function importarLecturas(
    tarifaId: number,
    lecturas: { lote_id: number; consumo_kwh: number }[]
) {
    const supabase = await createClient()

    // Get tarifa
    const { data: tarifa, error: tarifaError } = await supabase
        .from("tarifas_mensuales")
        .select("precio_kwh, costo_alumbrado, estado")
        .eq("id", tarifaId)
        .single()

    if (tarifaError || !tarifa) return { error: "Período no encontrado." }
    if (tarifa.estado !== "ABIERTO") return { error: "El período está cerrado." }

    const rows = lecturas.map((l) => ({
        lote_id: l.lote_id,
        tarifa_id: tarifaId,
        consumo_kwh: l.consumo_kwh,
        precio_x_kwh: tarifa.precio_kwh,
        alumbrado_publico: tarifa.costo_alumbrado,
    }))

    // Upsert to handle re-imports gracefully
    const { error } = await supabase
        .from("recibos")
        .upsert(rows, { onConflict: "lote_id,tarifa_id", ignoreDuplicates: false })

    if (error) return { error: error.message }

    revalidatePath("/admin/lecturas")
    revalidatePath("/admin/pagos")
    revalidatePath("/admin/dashboard")
    return { success: true, count: rows.length }
}
