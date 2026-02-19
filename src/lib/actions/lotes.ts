"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export interface LoteFormData {
    manzana: string
    lote_numero: number
    nombres: string
    apellidos: string
    dni: string
    celular: string
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
        celular: data.celular.trim() || null,
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
            celular: data.celular.trim() || null,
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

export async function eliminarLote(id: number) {
    const supabase = await createClient()

    // Primero eliminar recibos asociados
    const { error: errorRecibos } = await supabase
        .from("recibos")
        .delete()
        .eq("lote_id", id)

    if (errorRecibos) return { error: "No se pudo eliminar: " + errorRecibos.message }

    // Luego eliminar el lote
    const { error } = await supabase
        .from("lotes")
        .delete()
        .eq("id", id)

    if (error) return { error: "No se pudo eliminar: " + error.message }

    revalidatePath("/admin/lotes")
    revalidatePath("/admin/lecturas")
    revalidatePath("/admin/pagos")
    revalidatePath("/admin/dashboard")
    return { success: true }
}
