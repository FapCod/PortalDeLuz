import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Formats a number as Peruvian Sol currency (S/ 0.00)
 */
export function formatCurrencyPEN(amount: number): string {
    return new Intl.NumberFormat("es-PE", {
        style: "currency",
        currency: "PEN",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount)
}

/**
 * Calculates the total receipt amount (Estimated Preview)
 * Formula: ((consumo * precioKwh) + alumbrado) rounded to 2 decimals
 */
export function calcularTotal(
    consumoKwh: number,
    precioKwh: number,
    alumbrado: number
): { totalConsumo: number; totalRecibo: number } {
    const totalConsumo = consumoKwh * precioKwh + alumbrado
    // Round to 2 decimals to match DB trigger
    const totalRecibo = Math.round(totalConsumo * 100) / 100
    return { totalConsumo, totalRecibo }
}


/**
 * Formats a lote code as "MZ A - LT 1"
 */
export function formatLoteCodigo(manzana: string, loteNumero: number): string {
    return `MZ ${manzana} - LT ${loteNumero}`
}

/**
 * Formats a period date (stored as first day of month) to "Enero 2026"
 */
export function formatPeriodo(periodo: string): string {
    const date = new Date(periodo + "T12:00:00") // avoid timezone issues
    return date.toLocaleDateString("es-PE", { month: "long", year: "numeric" })
}
