-- ============================================================
-- SEED DATA - MANTENIMIENTO (Enero 2025)
-- Ejecutar DESPUÉS de SeedEnero.sql
-- ============================================================

-- 1. Insertar Lotes de Mantenimiento
-- Se marcan como 'SOLO_MANTENIMIENTO' o 'BALDIO'.

INSERT INTO lotes (manzana, lote_numero, nombres, apellidos, dni, tipo_servicio) VALUES
('A', 10, 'IRVING', 'CHIROQUE SALAZAR', NULL, 'SOLO_MANTENIMIENTO'),
('A', 11, 'GERSON', 'GOMEZ CAMACHO', NULL, 'SOLO_MANTENIMIENTO'),
('A', 17, 'CARLOS', 'GOMEZ MERINO', NULL, 'SOLO_MANTENIMIENTO'), -- Ya existe en Lista 1? ON CONFLICT lo manejará.
('A', 21, 'JORGE', 'ROSILLO PALACIOS', NULL, 'SOLO_MANTENIMIENTO'),
('A', 24, 'HOWAR', 'CONCHA SARANGO', NULL, 'SOLO_MANTENIMIENTO'),
('A', 28, 'ARACELY', 'CALLE GARCIA', NULL, 'SOLO_MANTENIMIENTO'),
('B', 16, 'AMELIA', 'TOCTO REYES', NULL, 'SOLO_MANTENIMIENTO'),
('B', 15, 'CESAR', 'NUÑES', NULL, 'SOLO_MANTENIMIENTO'),
('B', 19, 'SUSANA', 'FLORES BENITES', NULL, 'SOLO_MANTENIMIENTO'),
('B', 23, 'MARGARITA', 'MERINO', NULL, 'SOLO_MANTENIMIENTO'),
('B', 29, 'ANELI', 'CALLE GARCIA', NULL, 'SOLO_MANTENIMIENTO'),
('B', 36, 'WENDY', 'BOULENGER CORTEZ', NULL, 'SOLO_MANTENIMIENTO'),
('E', 1, 'SIN NOMBRE', 'DESCONOCIDO', NULL, 'BALDIO'), -- E-1 Vacío
('F', 5, 'WILLIAM', 'NEYRA RETO', NULL, 'SOLO_MANTENIMIENTO'),
('F', 8, 'MARIOLY', 'QUINDE JIMENEZ', NULL, 'SOLO_MANTENIMIENTO'),
('G', 16, 'MERLY', 'TICLIAHUANCA TINEO', NULL, 'SOLO_MANTENIMIENTO'),
('I', 5, 'ZENKO', 'ARTETRA', NULL, 'SOLO_MANTENIMIENTO'),
('I', 6, 'FIORELLA', 'GALECIO GUERRERO', NULL, 'SOLO_MANTENIMIENTO'),
('I', 7, 'CINTIHA', 'LLANOS CHAVEZ', NULL, 'SOLO_MANTENIMIENTO'),
('I', 11, 'MARGARITA', 'LIZANA LEONARDO', NULL, 'SOLO_MANTENIMIENTO'),
('I', 13, 'CINTHIA', 'LLANOS CHAVEZ', NULL, 'SOLO_MANTENIMIENTO'),
('I', 26, 'MARIELLA', 'PANTA ROMAN', NULL, 'SOLO_MANTENIMIENTO'),
('A', 7, 'CARLOS', 'BENITES GUERRERO', NULL, 'SOLO_MANTENIMIENTO')
ON CONFLICT (manzana, lote_numero) 
DO UPDATE SET tipo_servicio = 'SOLO_MANTENIMIENTO'; -- Si ya existía como habitado, lo cambiamos a Mantenimiento? O dejamos DO NOTHING? 
-- En este caso, la Lista 2 es explícitamente "solo pagan mantenimiento". Actualizaré el tipo.

-- 2. Insertar Recibos (Lecturas Mantenimiento)
DO $$
DECLARE
    tid BIGINT;
    lid BIGINT;
BEGIN
    SELECT id INTO tid FROM tarifas_mensuales WHERE periodo = '2025-01-01';
    
    -- Si no existe tarifa de enero, salir
    IF tid IS NULL THEN RAISE NOTICE 'No existe tarifa para 2025-01-01. Ejecuta SeedEnero.sql primero.'; RETURN; END IF;

    -- Helper para insertar (mz, lt, consumo)

    -- 1. IRVING
    SELECT id INTO lid FROM lotes WHERE manzana='A' AND lote_numero=10;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 5, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 2. GERSON
    SELECT id INTO lid FROM lotes WHERE manzana='A' AND lote_numero=11;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 5, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 3. CARLOS (A-17)
    SELECT id INTO lid FROM lotes WHERE manzana='A' AND lote_numero=17;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 5, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 4. JORGE
    SELECT id INTO lid FROM lotes WHERE manzana='A' AND lote_numero=21;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 5, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 5. HOWAR
    SELECT id INTO lid FROM lotes WHERE manzana='A' AND lote_numero=24;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 5, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 6. ARACELY
    SELECT id INTO lid FROM lotes WHERE manzana='A' AND lote_numero=28;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 5, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 7. AMELIA
    SELECT id INTO lid FROM lotes WHERE manzana='B' AND lote_numero=16;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 5, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 8. CESAR
    SELECT id INTO lid FROM lotes WHERE manzana='B' AND lote_numero=15;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 5, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 9. SUSANA
    SELECT id INTO lid FROM lotes WHERE manzana='B' AND lote_numero=19;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 5, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 10. MARGARITA
    SELECT id INTO lid FROM lotes WHERE manzana='B' AND lote_numero=23;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 5, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 11. ANELI
    SELECT id INTO lid FROM lotes WHERE manzana='B' AND lote_numero=29;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 5, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 12. WENDY
    SELECT id INTO lid FROM lotes WHERE manzana='B' AND lote_numero=36;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 5, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 13. E-1 (VACIO) -> No insertamos recibo pues no tiene monto. Solo insertamos Lote arriba.

    -- 14. WILLIAM
    SELECT id INTO lid FROM lotes WHERE manzana='F' AND lote_numero=5;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 5, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 15. MARIOLY
    SELECT id INTO lid FROM lotes WHERE manzana='F' AND lote_numero=8;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 5, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 16. MERLY
    SELECT id INTO lid FROM lotes WHERE manzana='G' AND lote_numero=16;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 5, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 17. ZENKO
    SELECT id INTO lid FROM lotes WHERE manzana='I' AND lote_numero=5;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 5, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 18. FIORELLA
    SELECT id INTO lid FROM lotes WHERE manzana='I' AND lote_numero=6;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 5, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 19. CINTIHA
    SELECT id INTO lid FROM lotes WHERE manzana='I' AND lote_numero=7;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 5, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 20. MARGARITA
    SELECT id INTO lid FROM lotes WHERE manzana='I' AND lote_numero=11;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 5, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 21. CINTHIA
    SELECT id INTO lid FROM lotes WHERE manzana='I' AND lote_numero=13;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 5, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 22. MARIELLA
    SELECT id INTO lid FROM lotes WHERE manzana='I' AND lote_numero=26;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 5, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 23. CARLOS (A-7)
    SELECT id INTO lid FROM lotes WHERE manzana='A' AND lote_numero=7;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 5, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

END $$;
