"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export interface LoteFormData {
    manzana: string
    lote_numero: number
    nombres: string
    apellidos: string
    dni: string
    tipo_servicio: "HABITADO" | "SOLO_MANTENIMIENTO" | "BALDIO"
}

export async function crearLote(data: LoteFormData) {
    const supabase = await createClient()

    const { error } = await supabase.from("lotes").insert({
        manzana: data.manzana.toUpperCase().trim(),
        lote_numero: data.lote_numero,
        nombres: data.nombres.trim().toUpperCase(),
        apellidos: data.apellidos.trim().toUpperCase(),
        dni: data.dni.trim() || null,
        tipo_servicio: data.tipo_servicio,
    })

    if (error) {
        if (error.code === "23505") {
            return { error: "Ya existe un lote con esa Manzana y Número." }
        }
        return { error: error.message }
    }

    revalidatePath("/admin/lotes")
    revalidatePath("/admin/lecturas")
    revalidatePath("/admin/dashboard")
    return { success: true }
}

export async function actualizarLote(id: number, data: LoteFormData) {
    const supabase = await createClient()

    const { error } = await supabase
        .from("lotes")
        .update({
            manzana: data.manzana.toUpperCase().trim(),
            lote_numero: data.lote_numero,
            nombres: data.nombres.trim().toUpperCase(),
            apellidos: data.apellidos.trim().toUpperCase(),
            dni: data.dni.trim() || null,
            tipo_servicio: data.tipo_servicio,
        })
        .eq("id", id)

    if (error) {
        if (error.code === "23505") {
            return { error: "Ya existe un lote con esa Manzana y Número." }
        }
        return { error: error.message }
    }

    revalidatePath("/admin/lotes")
    revalidatePath("/admin/lecturas")
    return { success: true }
}
