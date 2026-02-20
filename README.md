# Portal de Luz - Sistema de Gestión de Consumo y Pagos (UPIS Las Palmeras del Sol)

## 📌 Descripción del Proyecto
Bienvenido a **Portal de Luz**, una aplicación web moderna diseñada para la gestión integral del consumo de energía eléctrica y agua, así como la administración de pagos para la comunidad "UPIS Las Palmeras del Sol".

Este sistema permite a los administradores:
- Gestionar el padrón de lotes y vecinos.
- Configurar tarifas mensuales (precio por kWh, alumbrado público).
- Registrar lecturas de consumo y generar recibos automáticamente.
- Controlar el estado de los pagos y la recaudación.
- **Generar reportes e importar masivamente lecturas desde Excel.**

Además, ofrece un **Portal de Vecinos** de acceso público donde los usuarios pueden consultar su deuda y el historial de sus recibos utilizando únicamente su DNI, garantizando transparencia y facilidad de acceso a la información.

## 🚀 Stack Tecnológico

El proyecto utiliza un stack moderno para máxima precisión y velocidad:

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router) - Con Turbopack para desarrollo ultra fluido.
- **Backend & Base de Datos**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, RLS).
- **Manejo de Datos**: [SheetJS (xlsx)](https://sheetjs.com/) - Estandarizado para reportes e importaciones masivas.
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/).
- **Iconos**: [Lucide React](https://lucide.dev/).

## ✨ Características Principales

### 1. Gestión de Lecturas y Precisión Financiera
- **Importación Masiva Excel**: Carga de lecturas directamente desde archivos `.xlsx` o `.xls`.
- **Cálculo Automatizado (SQL)**: Los totales de los recibos se calculan mediante un trigger en la base de datos (`tr_calcular_recibo_biu`), garantizando que los montos sean consistentes independientemente del canal de ingreso.
- **Redondeo Inteligente**: Los montos se redondean automáticamente para facilitar la cobranza presencial.

### 2. Diseño Defensivo y UX Premium
- **Selección de Período Obligatoria**: La interfaz bloquea el registro accidental si no hay un período definido.
- **Confirmación Crítica**: Todas las acciones sensibles (marcar como pagado, eliminar) requieren confirmación mediante `AlertDialog` asíncronos.
- **Notificaciones**: Feedback inmediato mediante `Sonner` toasts.

### 3. Seguridad Estricta
- **RLS (Row Level Security)**: Políticas implementadas para proteger la privacidad de los vecinos y restringir la administración solo a usuarios autenticados.

### 4. Reportes Avanzados
- Generación de reportes mensuales en Excel con un solo clic, permitiendo una auditoría fácil y rápida de la recaudación.

## 🛠️ Configuración Local

1.  **Clonar el repositorio**
    ```bash
    git clone <url-del-repositorio>
    cd portal-de-luz
    ```

2.  **Instalar dependencias**
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno**
    Crea un archivo `.env.local` en la raíz del proyecto:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
    NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
    ```

4.  **Base de Datos**
    Los esquemas actuales se encuentran en `supabase/schema.sql`. Asegúrate de ejecutarlos en tu instancia de Supabase.

5.  **Ejecutar el servidor de desarrollo**
    ```bash
    npm run dev
    ```

    Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📜 Documentación Adicional
Para más detalles sobre la arquitectura técnica y reglas de negocio, consulta:
- [Requerimientos Principales.md](file:///d:/GitHubProyects/PortalDeLuz/.gemini/Requerimientos%20Principales.md)

## 📜 Licencia
Este proyecto es propiedad de la comunidad UPIS Las Palmeras del Sol y está destinado para su uso interno.
