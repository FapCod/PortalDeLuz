// Database types matching the Supabase schema

export type EstadoLote = "HABITADO" | "SOLO_MANTENIMIENTO" | "BALDIO"
export type EstadoPago = "PENDIENTE" | "PAGADO" | "VENCIDO"
export type EstadoPeriodo = "ABIERTO" | "CERRADO"

export interface Lote {
    id: number
    manzana: string
    lote_numero: number
    nombres: string | null
    apellidos: string | null
    dni: string | null
    celular: string | null
    tipo_servicio: EstadoLote
    created_at: string
}

export interface TarifaMensual {
    id: number
    periodo: string // ISO date string: "2026-01-01"
    precio_kwh: number
    costo_alumbrado: number
    estado: EstadoPeriodo
    created_at: string
}

export interface Recibo {
    id: number
    lote_id: number
    tarifa_id: number
    consumo_kwh: number
    precio_x_kwh: number
    alumbrado_publico: number
    total_consumo: number
    total_recibo: number
    estado: EstadoPago
    fecha_pago: string | null
    created_at: string
    // Joined fields
    lote?: Lote
    tarifa?: TarifaMensual
}

// Form types
export interface LecturaFormData {
    lote_id: number
    tarifa_id: number
    consumo_kwh: number
}

export interface PeriodoFormData {
    periodo: string
    precio_kwh: number
    costo_alumbrado: number
}

// CSV import row type
export interface CSVRow {
    id?: string
    nombres: string
    apellidos: string
    mz: string
    lt: string
    consumo_kwh: string
}

// Public lookup result
export interface ConsultaResult {
    lote: Lote
    recibos: (Recibo & { tarifa: TarifaMensual })[]
}
