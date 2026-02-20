# Portal de Luz - Requerimientos Principales y Documentación Técnica

Este documento detalla la arquitectura, reglas de negocio y estándares técnicos implementados en el sistema **Portal de Luz** para la comunidad "UPIS Las Palmeras del Sol".

---

## 🚀 Stack Tecnológico

El sistema está construido con tecnologías modernas para garantizar escalabilidad, precisión financiera y una experiencia de usuario premium:

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router) con TypeScript.
- **Backend / Base de Datos**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Realtime).
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/) para un diseño responsivo y moderno.
- **Componentes UI**: [Shadcn UI](https://ui.shadcn.com/) (basado en Radix UI).
- **Iconografía**: [Lucide React](https://lucide.dev/).
- **Reportes e Importaciones**: [SheetJS (xlsx)](https://sheetjs.com/) para generación y lectura nativa de archivos Excel.
- **Utilidades**: 
  - `Sonner` para notificaciones tipo Toast.

---

## 🗄️ Arquitectura de Base de Datos

### Esquema de Tablas
1. **`lotes`**: Directorio maestro de vecinos (Manzana, Lote, DNI, Propietario, Celular, Tipo de Servicio). Se incluye el campo `celular` para contacto directo.
2. **`tarifas_mensuales`**: Configuración de precios por período (kWh y Alumbrado Público).
3. **`recibos`**: Registro de consumo y deudas. Mantiene un snapshot inmutable del precio del período al momento de la creación.

### Precisión Financiera
- **Tipo de Dato**: Todos los montos monetarios y consumos utilizan `numeric` para garantizar precisión decimal sin errores de flotantes.
- **Snapshot Inmutable**: Cada recibo guarda su propia copia de `precio_x_kwh` y `alumbrado_publico` para que cambios futuros en las tarifas no alteren los recibos ya emitidos.

### Automatización SQL (Triggers y Vistas)
- **Trigger `tr_calcular_recibo_biu`**: Mediante una función PL/pgSQL (`fn_calcular_recibo`), el sistema calcula automáticamente el `total_consumo` y `total_recibo` aplicando un redondeo financiero de **2 decimales**. Esto centraliza la lógica de negocio en la base de datos.
- **Auto-RLS (Senior Logic)**: Implementación de un `EVENT TRIGGER` que garantiza que cualquier tabla nueva en el schema público tenga Row Level Security activado por defecto.
- **Vista `vista_deudas_por_periodo`**: Proporciona un resumen optimizado para el Dashboard.

---

## 🔐 Seguridad y Accesos

- **RLS (Row Level Security)**: Se ha implementado una política de seguridad estricta en Supabase:
  - **Acceso Público**: Los vecinos pueden realizar búsquedas (`SELECT`) filtrando por DNI para consultar sus deudas sin necesidad de login.
  - **Acceso Administrativo**: Solo usuarios autenticados tienen permisos de escritura (`INSERT`, `UPDATE`, `DELETE`) en todo el sistema.

---

## 🛠️ Flujos Core y Reglas de Negocio

### 1. Dashboard Administrativo
- Visualización de métricas clave (Lotes, Recibos, Pendientes, Deuda Total).
- **Filtro Interactivos**: Resumen de morosidad por período que permite alternar visualmente entre "Pagados" y "Pendientes" con indicadores de color.

### 2. Gestión de Lecturas (Diseño Defensivo)
- **Selección Obligatoria**: El sistema impide el registro accidental al obligar al administrador a seleccionar un período antes de desbloquear la interfaz de búsqueda o importación.
- **Importación Masiva**: Soporte para carga vía Excel (.xlsx) y autocompletado para lotes de "Solo Mantenimiento".

### 3. Gestión de Pagos (Confirmación Crítica)
- **Confirmación UI**: Antes de marcar un recibo como `PAGADO` o eliminar registros, el sistema despliega un `AlertDialog` de Shadcn UI que resume los datos del recibo para validación humana final.
- **Filtro por Mes**: Permite gestionar cobros específicos mes a mes para evitar confusión visual.

### 4. Reportes de Excel
- Generación de archivos `.xlsx` reales con formato por columnas (Manzana, Lote, Vecino, Consumo, Total).
- Los reportes se generan dinámicamente según el período seleccionado.

---

## 🎨 Estándares de UI/UX

- **Adiós a `window.confirm`**: Se ha erradicado el uso de diálogos nativos del navegador. Todas las validaciones y confirmaciones críticas usan modales asíncronos de Shadcn UI para una experiencia corporativa.
- **Feedback Visual**: 
  - Rojo Destructivo: Para eliminaciones.
  - Verde Éxito: Para registros de pagos y estados pagados.
  - Azul Información: Para previsualizaciones y estados activos.
- **Empty States**: Las vistas vacías incluyen instrucciones claras y llamadas a la acción (ej. "Selecciona un período para comenzar").
