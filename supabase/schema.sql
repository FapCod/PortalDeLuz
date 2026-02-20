-- ============================================================
-- PORTAL DE LUZ — UPIS Las Palmeras del Sol
-- Schema SQL para Supabase (PostgreSQL)
-- ============================================================

-- 1. ENUMS
CREATE TYPE estado_lote AS ENUM ('HABITADO', 'SOLO_MANTENIMIENTO', 'BALDIO');
CREATE TYPE estado_pago AS ENUM ('PENDIENTE', 'PAGADO', 'VENCIDO');
CREATE TYPE estado_periodo AS ENUM ('ABIERTO', 'CERRADO');

-- 2. TABLA LOTES
CREATE TABLE public.lotes (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  manzana character NOT NULL,                -- 'A', 'B', 'C'...
  lote_numero integer NOT NULL,              -- 1, 2, 17...
  nombres character varying,
  apellidos character varying,
  dni character varying,
  tipo_servicio estado_lote DEFAULT 'HABITADO'::estado_lote,
  created_at timestamp with time zone DEFAULT now(),
  celular text,                              -- Contacto para avisos
  CONSTRAINT lotes_pkey PRIMARY KEY (id),
  CONSTRAINT uq_lote_manzana UNIQUE (manzana, lote_numero)
);

-- 3. TABLA TARIFAS MENSUALES
CREATE TABLE public.tarifas_mensuales (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  periodo date NOT NULL UNIQUE,
  precio_kwh numeric NOT NULL DEFAULT 0.86,
  costo_alumbrado numeric NOT NULL DEFAULT 10.00,
  estado estado_periodo DEFAULT 'ABIERTO'::estado_periodo,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tarifas_mensuales_pkey PRIMARY KEY (id)
);

-- 4. TABLA RECIBOS
CREATE TABLE public.recibos (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  lote_id bigint,
  tarifa_id bigint,
  consumo_kwh numeric NOT NULL DEFAULT 0,
  precio_x_kwh numeric NOT NULL,
  alumbrado_publico numeric NOT NULL,
  total_consumo numeric,               -- Monto antes de redondeo (con 2 decimales)
  estado estado_pago DEFAULT 'PENDIENTE'::estado_pago,
  fecha_pago timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  total_recibo numeric,                -- Monto final calculado
  CONSTRAINT recibos_pkey PRIMARY KEY (id),
  CONSTRAINT recibos_tarifa_id_fkey FOREIGN KEY (tarifa_id) REFERENCES public.tarifas_mensuales(id) ON DELETE RESTRICT,
  CONSTRAINT recibos_lote_id_fkey FOREIGN KEY (lote_id) REFERENCES public.lotes(id) ON DELETE RESTRICT,
  CONSTRAINT uq_lote_tarifa UNIQUE (lote_id, tarifa_id)
);

-- 5. TRIGGER DE CÁLCULO AUTOMÁTICO
CREATE OR REPLACE FUNCTION fn_calcular_recibo()
RETURNS TRIGGER AS $$
BEGIN
    -- Realizamos el cálculo matemático y aplicamos el redondeo financiero a 2 decimales
    NEW.total_consumo := ROUND(((NEW.consumo_kwh * NEW.precio_x_kwh) + NEW.alumbrado_publico), 2);
    NEW.total_recibo := NEW.total_consumo;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_calcular_recibo_biu
BEFORE INSERT OR UPDATE ON public.recibos
FOR EACH ROW
EXECUTE FUNCTION fn_calcular_recibo();

-- 6. ÍNDICES
CREATE INDEX idx_recibos_lote_id ON recibos(lote_id);
CREATE INDEX idx_recibos_tarifa_id ON recibos(tarifa_id);
CREATE INDEX idx_recibos_estado ON recibos(estado);
CREATE INDEX idx_lotes_dni ON lotes(dni);

-- 7. SEGURIDAD (RLS)
ALTER TABLE lotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarifas_mensuales ENABLE ROW LEVEL SECURITY;
ALTER TABLE recibos ENABLE ROW LEVEL SECURITY;

-- Políticas de Acceso Público
CREATE POLICY "Lectura pública de lotes" ON lotes FOR SELECT USING (true);
CREATE POLICY "Lectura pública de tarifas" ON tarifas_mensuales FOR SELECT USING (true);
CREATE POLICY "Lectura pública de recibos" ON recibos FOR SELECT USING (true);

-- Políticas de Administrador (Autenticado)
CREATE POLICY "Admin CRUD lotes" ON lotes TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin CRUD tarifas" ON tarifas_mensuales TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin CRUD recibos" ON recibos TO authenticated USING (true) WITH CHECK (true);

-- 8. EVENT TRIGGER: RLS AUTO-ENABLE (Solo para Superusers)
-- Este trigger asegura que cualquier tabla nueva en el schema 'public' tenga RLS habilitado.
/*
CREATE OR REPLACE FUNCTION public.fn_rls_auto_enable()
RETURNS event_trigger
LANGUAGE plpgsql
AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     END IF;
  END LOOP;
END;
$$;

CREATE EVENT TRIGGER tr_rls_auto_enable
ON ddl_command_end
WHEN TAG IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
EXECUTE FUNCTION public.fn_rls_auto_enable();
*/
