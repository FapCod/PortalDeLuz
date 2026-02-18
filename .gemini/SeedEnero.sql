-- ============================================================
-- SEED DATA - ENERO (Asumido 2025)
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. Insertar Tarifa de Enero (si no existe)
INSERT INTO tarifas_mensuales (periodo, precio_kwh, costo_alumbrado, estado)
VALUES ('2025-01-01', 0.86, 10.00, 'ABIERTO')
ON CONFLICT (periodo) DO NOTHING;

-- 2. Insertar Lotes (ON CONFLICT DO NOTHING para evitar duplicados)
-- Se han asignado números de lote ficticios (>1000) o Manzana 'Z' para casos sin datos en la lista original.

INSERT INTO lotes (manzana, lote_numero, nombres, apellidos, dni, tipo_servicio) VALUES
('A', 1, 'EMER DAVID', 'DE LA CRUZ CORDOVA', NULL, 'HABITADO'),
('A', 2, 'CARLOS', 'BENITES GUERRERO', NULL, 'HABITADO'),
('A', 17, 'CARLOS', 'GOMEZ MERINO', NULL, 'HABITADO'),
('A', 18, 'DAVID', 'GUARDIA MEZA', NULL, 'HABITADO'),
('A', 26, 'CARLOS', 'CORREA ECA', NULL, 'HABITADO'),
('A', 29, 'KARINA', 'ORTIZ CARMEN', NULL, 'HABITADO'),
('A', 30, 'AYDE', 'VILLASECA CARMEN', NULL, 'HABITADO'),
('A', 34, 'GABRIELA', 'CORDOVA CORDOVA', NULL, 'HABITADO'),
('A', 35, 'LUIS', 'HONORES MACHARE', NULL, 'HABITADO'),
('A', 38, 'FELIX', 'FLORES BENITES', NULL, 'HABITADO'),
('A', 33, 'JEAN PIERRE', 'VILCHEZ MENDOZA', NULL, 'HABITADO'),
('A', 40, 'WILLY', 'FLORES SAAVEDRA', NULL, 'HABITADO'),
('A', 41, 'KAREN', 'CORDOVA CASTILLO', NULL, 'HABITADO'),
('A', 44, 'ALEXIS', 'SANTA CRUZ TICLIAHUANCA', NULL, 'HABITADO'),
('B', 2, 'ROSA ELIDA', 'ATO PALADINES', NULL, 'HABITADO'),
('B', 3, 'ROBIN', 'DIAZ VELASQUEZ', NULL, 'HABITADO'),
('B', 6, 'MARI', 'HUAMAN SALVADOR', NULL, 'HABITADO'),
('A', 31, 'MARIBEL VANIA', '', NULL, 'HABITADO'), -- Apellido vacio en origen
('B', 12, 'RENZO', 'MENESES', NULL, 'HABITADO'),
('B', 13, 'DIANA', 'MARTINES ZABARBURU', NULL, 'HABITADO'),
('B', 30, 'ANAIS', 'ROMERO MIJA', NULL, 'HABITADO'),
('B', 31, 'NANCY', 'DIOSES ZARATE', NULL, 'HABITADO'),
('B', 35, 'OMAR', 'GARCIA GUERRERO', NULL, 'HABITADO'),
('B', 37, 'DENISSE', 'FREYRRE NUNJAR', NULL, 'HABITADO'),
('C', 1, 'FRANCISCO', 'MERINO LLACSAHUANGA', NULL, 'HABITADO'),
('C', 2, 'ELMER', 'SALVADOR FLORES', NULL, 'HABITADO'),
('C', 3, 'JORGE', 'SILVA SEMANCHE', NULL, 'HABITADO'),
('C', 11, 'CARLOS', 'JUARES SANDOVAL', NULL, 'HABITADO'),
('D', 1, 'ANNER', 'FARFAN MERINO', NULL, 'HABITADO'),
('D', 2, 'KAREN', 'OBLITAS ARENAS', NULL, 'HABITADO'),
('D', 3, 'JENIFER', 'DOMINGUEZ', NULL, 'HABITADO'),
('D', 5, 'CARMEN', 'AREVALO YARLEQUE', NULL, 'HABITADO'),
('D', 7, 'MARCOS', 'CALLE ROSILLO', NULL, 'HABITADO'),
('D', 4, 'DAVID', 'FERNADEZ', NULL, 'HABITADO'),
('D', 9, 'ERIKA', 'RIVAS AGUAYO', NULL, 'HABITADO'),
('E', 9, 'VANIA', 'CALDERON FLORES', NULL, 'HABITADO'),
('F', 1, 'MARCOS', 'CHAMBA MOROCHO', NULL, 'HABITADO'),
('F', 6, 'DANIELA', 'VASQUEZ RODRIGUEZ', NULL, 'HABITADO'),
('F', 7, 'SANDI', 'AGUILERA MOROCHO', NULL, 'HABITADO'),
('F', 10, 'GUIDO', 'HERRERA ROSILLO', NULL, 'HABITADO'),
('F', 12, 'IRMA', 'FLORES LALANGUI', NULL, 'HABITADO'),
('F', 13, 'MANUEL', 'MOROCHO CORTEZ', NULL, 'HABITADO'),
('F', 15, 'INDALIRA', 'MOROCHO CORTEZ', NULL, 'HABITADO'),
('F', 16, 'MARIA', 'CORTEZ DE MORORCHO', NULL, 'HABITADO'),
('F', 17, 'OLGA', 'MOROCHO CORTEZ', NULL, 'HABITADO'),
('F', 20, 'DAVID', 'MOROCHO CORTEZ', NULL, 'HABITADO'),
('G', 2, 'IRIS', 'CRIOLLO RODRIGUEZ', NULL, 'HABITADO'),
('G', 4, 'RICARDINA', 'ZARATE DIOSES', NULL, 'HABITADO'),
('G', 5, 'RAFAEL', 'CHERO', NULL, 'HABITADO'),
('G', 6, 'EDIN', 'VALVERDE', NULL, 'HABITADO'),
('G', 8, 'VILMA', 'AGUILAR CHAMBA', NULL, 'HABITADO'),
('G', 11, 'ISAAC', 'BENITES CHUNGA', NULL, 'HABITADO'),
('G', 14, 'DANFER', 'VIERA ROÑA', NULL, 'HABITADO'),
('G', 15, 'TERESA', 'DE MALDONADO', NULL, 'HABITADO'),
('G', 18, 'JOSE', 'PALACIOS ALZAMORA', NULL, 'HABITADO'),
('G', 20, 'CESAR', 'PIZARRO ROJAS', NULL, 'HABITADO'),
('H', 1, 'EDILBERTO', 'IZQUIERDO VAZQUES', NULL, 'HABITADO'),
('I', 1, 'MARCELO', 'GARCIA IDROGO', NULL, 'HABITADO'),
('I', 4, 'LEYDI', 'MOSTE JIMENEZ', NULL, 'HABITADO'),
('I', 18, 'MIRTHA', 'AREVALO CORDOVA', NULL, 'HABITADO'),
('I', 20, 'ETELVINA', 'VILLAVIVENCIO DE VELASQUEZ', NULL, 'HABITADO'),
('I', 24, 'GONZALO', 'BENITES CORDOVA', NULL, 'HABITADO'),
('I', 25, 'RICARDO', 'GARCIA HUAMAN', NULL, 'HABITADO'),
('I', 27, 'OMAR', 'JUAREZ ROSALES', NULL, 'HABITADO'),
('J', 1, 'EDIBERTO', 'OJEDA EX SOL DE PIURA', NULL, 'HABITADO'),
('K', 1, 'CARLOS', 'BENITES GUERRERO', NULL, 'HABITADO'),
-- Casos Especiales (Asignados a Manzana Z o Lotes > 1000)
('Z', 1, 'BITEL', 'VITTEL', NULL, 'HABITADO'),
('Z', 2, 'SANTOS', 'PADILLA', NULL, 'HABITADO'),
('I', 1001, 'DAVID', 'CRISANTO', NULL, 'HABITADO'),
('A', 39, 'SUSANA', 'FLORES BENITES', NULL, 'HABITADO'),
('I', 1002, 'ROSA', 'PAREATON', NULL, 'HABITADO'),
('A', 3, 'NIÑO', 'IRVIN', NULL, 'HABITADO'),
('A', 1001, 'GERSON', 'CALLE GARCIA', NULL, 'HABITADO'),
('A', 1002, 'ELMER', 'SALVADOR FLORES', NULL, 'HABITADO'),
('I', 9, 'RONALD', 'CALDERON FLORES', NULL, 'HABITADO'),
('I', 10, 'FRANFLIN', 'CALDERON FLORES', NULL, 'HABITADO') -- Franflin -> Franklin
ON CONFLICT (manzana, lote_numero) DO NOTHING;

-- 3. Insertar Recibos (Lecturas)
-- Usamos una función temporal o bloque DO para buscar el ID dinámicamente
DO $$
DECLARE
    tid BIGINT;
    lid BIGINT;
BEGIN
    SELECT id INTO tid FROM tarifas_mensuales WHERE periodo = '2025-01-01';

    -- Helper para insertar (mz, lt, consumo)
    -- Si no encuentra el lote, lo salta.
    
    -- 1. EMER DAVID
    SELECT id INTO lid FROM lotes WHERE manzana='A' AND lote_numero=1;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 105, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 2. CARLOS
    SELECT id INTO lid FROM lotes WHERE manzana='A' AND lote_numero=2;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 5, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 3. CARLOS 
    SELECT id INTO lid FROM lotes WHERE manzana='A' AND lote_numero=17;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 5, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 4. DAVID
    SELECT id INTO lid FROM lotes WHERE manzana='A' AND lote_numero=18;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 78.7, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 5. CARLOS
    SELECT id INTO lid FROM lotes WHERE manzana='A' AND lote_numero=26;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 135.89, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 6. KARINA
    SELECT id INTO lid FROM lotes WHERE manzana='A' AND lote_numero=29;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 5, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 7. AYDE
    SELECT id INTO lid FROM lotes WHERE manzana='A' AND lote_numero=30;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 5, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 8. GABRIELA
    SELECT id INTO lid FROM lotes WHERE manzana='A' AND lote_numero=34;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 8.4, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 9. LUIS
    SELECT id INTO lid FROM lotes WHERE manzana='A' AND lote_numero=35;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 84.1, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 10. FELIX
    SELECT id INTO lid FROM lotes WHERE manzana='A' AND lote_numero=38;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 41.58, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 11. JEAN PIERRE
    SELECT id INTO lid FROM lotes WHERE manzana='A' AND lote_numero=33;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 5, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 12. WILLY
    SELECT id INTO lid FROM lotes WHERE manzana='A' AND lote_numero=40;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 161.8, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 13. KAREN
    SELECT id INTO lid FROM lotes WHERE manzana='A' AND lote_numero=41;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 5, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 14. ALEXIS
    SELECT id INTO lid FROM lotes WHERE manzana='A' AND lote_numero=44;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 11.4, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 15. ROSA ELIDA
    SELECT id INTO lid FROM lotes WHERE manzana='B' AND lote_numero=2;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 135, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 16. ROBIN
    SELECT id INTO lid FROM lotes WHERE manzana='B' AND lote_numero=3;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 25.98, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 17. MARI
    SELECT id INTO lid FROM lotes WHERE manzana='B' AND lote_numero=6;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 32.9, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 18. MARIBEL VANIA
    SELECT id INTO lid FROM lotes WHERE manzana='A' AND lote_numero=31;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 5, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 19. RENZO
    SELECT id INTO lid FROM lotes WHERE manzana='B' AND lote_numero=12;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 91.44, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 20. DIANA
    SELECT id INTO lid FROM lotes WHERE manzana='B' AND lote_numero=13;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 93.17, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 21. ANAIS
    SELECT id INTO lid FROM lotes WHERE manzana='B' AND lote_numero=30;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 70.96, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 22. NANCY
    SELECT id INTO lid FROM lotes WHERE manzana='B' AND lote_numero=31;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 55.8, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 23. OMAR
    SELECT id INTO lid FROM lotes WHERE manzana='B' AND lote_numero=35;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 63.9, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 24. DENISSE
    SELECT id INTO lid FROM lotes WHERE manzana='B' AND lote_numero=37;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 129.5, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 25. FRANCISCO
    SELECT id INTO lid FROM lotes WHERE manzana='C' AND lote_numero=1;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 11.3, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 26. ELMER
    SELECT id INTO lid FROM lotes WHERE manzana='C' AND lote_numero=2;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 83.46, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 27. JORGE
    SELECT id INTO lid FROM lotes WHERE manzana='C' AND lote_numero=3;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 5, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 28. CARLOS
    SELECT id INTO lid FROM lotes WHERE manzana='C' AND lote_numero=11;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 5, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 29. ANNER
    SELECT id INTO lid FROM lotes WHERE manzana='D' AND lote_numero=1;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 15, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 30. KAREN
    SELECT id INTO lid FROM lotes WHERE manzana='D' AND lote_numero=2;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 49.6, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 31. JENIFER
    SELECT id INTO lid FROM lotes WHERE manzana='D' AND lote_numero=3;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 5, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 32. CARMEN
    SELECT id INTO lid FROM lotes WHERE manzana='D' AND lote_numero=5;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 40.15, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 33. MARCOS
    SELECT id INTO lid FROM lotes WHERE manzana='D' AND lote_numero=7;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 94, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 34. DAVID
    SELECT id INTO lid FROM lotes WHERE manzana='D' AND lote_numero=4;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 86.1, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 35. ERIKA
    SELECT id INTO lid FROM lotes WHERE manzana='D' AND lote_numero=9;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 55.1, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 36. VANIA
    SELECT id INTO lid FROM lotes WHERE manzana='E' AND lote_numero=9;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 101.25, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 37. MARCOS
    SELECT id INTO lid FROM lotes WHERE manzana='F' AND lote_numero=1;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 34.1, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 38. DANIELA
    SELECT id INTO lid FROM lotes WHERE manzana='F' AND lote_numero=6;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 50.5, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 39. SANDI
    SELECT id INTO lid FROM lotes WHERE manzana='F' AND lote_numero=7;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 31.12, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 40. GUIDO
    SELECT id INTO lid FROM lotes WHERE manzana='F' AND lote_numero=10;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 5, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 41. IRMA
    SELECT id INTO lid FROM lotes WHERE manzana='F' AND lote_numero=12;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 81, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 42. MANUEL
    SELECT id INTO lid FROM lotes WHERE manzana='F' AND lote_numero=13;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 5, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 43. INDALIRA
    SELECT id INTO lid FROM lotes WHERE manzana='F' AND lote_numero=15;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 20.6, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 44. MARIA
    SELECT id INTO lid FROM lotes WHERE manzana='F' AND lote_numero=16;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 10.2, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 45. OLGA
    SELECT id INTO lid FROM lotes WHERE manzana='F' AND lote_numero=17;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 97.2, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 46. DAVID
    SELECT id INTO lid FROM lotes WHERE manzana='F' AND lote_numero=20;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 354.8, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 47. IRIS
    SELECT id INTO lid FROM lotes WHERE manzana='G' AND lote_numero=2;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 9.68, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 48. RICARDINA
    SELECT id INTO lid FROM lotes WHERE manzana='G' AND lote_numero=4;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 59.39, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 49. RAFAEL
    SELECT id INTO lid FROM lotes WHERE manzana='G' AND lote_numero=5;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 94.4, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 50. EDIN
    SELECT id INTO lid FROM lotes WHERE manzana='G' AND lote_numero=6;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 5, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 51. VILMA
    SELECT id INTO lid FROM lotes WHERE manzana='G' AND lote_numero=8;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 79.41, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 52. ISAAC
    SELECT id INTO lid FROM lotes WHERE manzana='G' AND lote_numero=11;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 38.65, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 53. DANFER
    SELECT id INTO lid FROM lotes WHERE manzana='G' AND lote_numero=14;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 5, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 54. TERESA
    SELECT id INTO lid FROM lotes WHERE manzana='G' AND lote_numero=15;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 5, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 55. JOSE
    SELECT id INTO lid FROM lotes WHERE manzana='G' AND lote_numero=18;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 5, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 56. CESAR
    SELECT id INTO lid FROM lotes WHERE manzana='G' AND lote_numero=20;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 74.61, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 57. EDILBERTO
    SELECT id INTO lid FROM lotes WHERE manzana='H' AND lote_numero=1;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 223.91, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 58. MARCELO
    SELECT id INTO lid FROM lotes WHERE manzana='I' AND lote_numero=1;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 340.5, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 59. LEYDI
    SELECT id INTO lid FROM lotes WHERE manzana='I' AND lote_numero=4;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 32.3, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 60. MIRTHA
    SELECT id INTO lid FROM lotes WHERE manzana='I' AND lote_numero=18;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 8, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 61. ETELVINA
    SELECT id INTO lid FROM lotes WHERE manzana='I' AND lote_numero=20;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 5, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 62. GONZALO
    SELECT id INTO lid FROM lotes WHERE manzana='I' AND lote_numero=24;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 17.35, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 63. RICARDO
    SELECT id INTO lid FROM lotes WHERE manzana='I' AND lote_numero=25;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 119.1, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 64. OMAR
    SELECT id INTO lid FROM lotes WHERE manzana='I' AND lote_numero=27;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 6, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 65. EDIBERTO
    SELECT id INTO lid FROM lotes WHERE manzana='J' AND lote_numero=1;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 60, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 66. CARLOS
    SELECT id INTO lid FROM lotes WHERE manzana='K' AND lote_numero=1;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 257.8, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 67. BITEL
    SELECT id INTO lid FROM lotes WHERE manzana='Z' AND lote_numero=1;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 2178.1, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 68. SANTOS
    SELECT id INTO lid FROM lotes WHERE manzana='Z' AND lote_numero=2;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 227.9, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 69. DAVID CRISANTO
    SELECT id INTO lid FROM lotes WHERE manzana='I' AND lote_numero=1001;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 55.6, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 70. SUSANA
    SELECT id INTO lid FROM lotes WHERE manzana='A' AND lote_numero=39;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 7, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 71. MARCELO
    SELECT id INTO lid FROM lotes WHERE manzana='I' AND lote_numero=1; -- Repetido en lista (fila 71 vs 58). Se actualiza o inserta? La lista tiene consumo 990.3 aca vs 340.5 arriba.
    -- Ojo: Marcelo Garcia Idrogo I-1 aparece dos veces. Fila 58 (340.5 kwh) y Fila 71 (990.3 kwh).
    -- Asumiré que es UNA CORRECCION o un segundo medidor? El constraint uq_lote_tarifa impedirá duplicado. Tomare el ultimo valido o el primero.
    -- Ejecutare el update por si acaso
    IF lid IS NOT NULL THEN 
       UPDATE recibos SET consumo_kwh = 990.3 WHERE lote_id = lid AND tarifa_id = tid;
       -- Si no existia (que ya lo insertamos arriba), insertamos (pero ya insertamos).
    END IF;

    -- 72. ROSA
    SELECT id INTO lid FROM lotes WHERE manzana='I' AND lote_numero=1002;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 64.3, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 73. NIÑO
    SELECT id INTO lid FROM lotes WHERE manzana='A' AND lote_numero=3;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 5, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 74. GERSON
    SELECT id INTO lid FROM lotes WHERE manzana='A' AND lote_numero=1001;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 5, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 75. ELMER
    SELECT id INTO lid FROM lotes WHERE manzana='A' AND lote_numero=1002;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 5, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 76. RONALD
    SELECT id INTO lid FROM lotes WHERE manzana='I' AND lote_numero=9;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 5, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

    -- 77. FRANFLIN (FRANKLIN)
    SELECT id INTO lid FROM lotes WHERE manzana='I' AND lote_numero=10;
    IF lid IS NOT NULL THEN INSERT INTO recibos (lote_id, tarifa_id, consumo_kwh, precio_x_kwh, alumbrado_publico) VALUES (lid, tid, 5, 0.86, 10) ON CONFLICT DO NOTHING; END IF;

END $$;
