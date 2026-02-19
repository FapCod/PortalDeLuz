"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function marcarPagado(reciboId: number) {
    const supabase = await createClient()

    const { error } = await supabase
        .from("recibos")
        .update({ estado: "PAGADO", fecha_pago: new Date().toISOString() })
        .eq("id", reciboId)

    if (error) return { error: error.message }

    revalidatePath("/admin/pagos")
    revalidatePath("/admin/dashboard")
    return { success: true }
}

export async function marcarPendiente(reciboId: number) {
    const supabase = await createClient()

    const { error } = await supabase
        .from("recibos")
        .update({ estado: "PENDIENTE", fecha_pago: null })
        .eq("id", reciboId)

    if (error) return { error: error.message }

    revalidatePath("/admin/pagos")
    revalidatePath("/admin/dashboard")
    return { success: true }
}

export async function editarRecibo(reciboId: number, consumoKwh: number) {
    const supabase = await createClient()

    const { error } = await supabase
        .from("recibos")
        .update({ consumo_kwh: consumoKwh })
        .eq("id", reciboId)

    if (error) return { error: error.message }

    revalidatePath("/admin/pagos")
    revalidatePath("/admin/lecturas")
    revalidatePath("/admin/dashboard")
    return { success: true }
}

export async function eliminarRecibo(reciboId: number) {
    const supabase = await createClient()

    const { error } = await supabase
        .from("recibos")
        .delete()
        .eq("id", reciboId)

    if (error) return { error: error.message }

    revalidatePath("/admin/pagos")
    revalidatePath("/admin/lecturas")
    revalidatePath("/admin/dashboard")
    return { success: true }
}

export async function eliminarRecibosMantenimiento(tarifaId: number) {
    const supabase = await createClient()

    // Find all recibos for this period that belong to SOLO_MANTENIMIENTO lotes
    const { data: recibos, error: fetchError } = await supabase
        .from("recibos")
        .select("id, lote:lotes!inner(tipo_servicio)")
        .eq("tarifa_id", tarifaId)
        .eq("lote.tipo_servicio", "SOLO_MANTENIMIENTO")

    if (fetchError) return { error: fetchError.message }
    if (!recibos || recibos.length === 0) return { error: "No se encontraron recibos de mantenimiento para este período." }

    const ids = recibos.map((r: { id: number }) => r.id)

    const { error } = await supabase
        .from("recibos")
        .delete()
        .in("id", ids)

    if (error) return { error: error.message }

    revalidatePath("/admin/pagos")
    revalidatePath("/admin/lecturas")
    revalidatePath("/admin/dashboard")
    return { success: true, count: ids.length }
}
