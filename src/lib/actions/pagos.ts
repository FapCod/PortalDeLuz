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
