# Portal de Luz - Sistema de Gestión de Consumo y Pagos (UPIS Las Palmeras del Sol)

## 📌 Descripción del Proyecto
Bienvenido a **Portal de Luz**, una aplicación web moderna diseñada para la gestión integral del consumo de energía eléctrica y agua, así como la administración de pagos para la comunidad "UPIS Las Palmeras del Sol".

Este sistema permite a los administradores:
- Gestionar el padrón de lotes y vecinos.
- Configurar tarifas mensuales (precio por kWh, alumbrado público).
- Registrar lecturas de consumo y generar recibos automáticamente.
- Controlar el estado de los pagos y la recaudación.

Además, ofrece un **Portal de Vecinos** de acceso público donde los usuarios pueden consultar su deuda y el historial de sus recibos utilizando únicamente su DNI, garantizando transparencia y facilidad de acceso a la información.

## 🚀 Stack Tecnológico

El proyecto está construido sobre un stack robusto y escalable:

- **Frontend**: [Next.js 14+](https://nextjs.org/) (App Router) - El framework de React para producción.
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/) - Tipado estático para un código más seguro y mantenible.
- **Backend & Base de Datos**: [Supabase](https://supabase.com/) - Postgres, Autenticación y Realtime "out of the box".
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/) - Framework de utilidades para diseño rápido.
- **Componentes UI**: [shadcn/ui](https://ui.shadcn.com/) - Componentes accesibles y personalizables construidos con Radix UI.
- **Iconos**: [Lucide React](https://lucide.dev/) - Iconos hermosos y consistentes.

## ✨ Características Principales

### 1. Gestión de Lotes
- Directorio completo de vecinos con información de contacto.
- Clasificación de lotes por estado: `HABITADO`, `SOLO_MANTENIMIENTO`, `BALDIO`.
- Validación para evitar duplicidad de lotes en una misma manzana.

### 2. Tarifas Flexibles
- Configuración mensual de costos unitarios.
- Diferenciación de costos por consumo (kWh) y costos fijos (Alumbrado Público).
- Histórico de tarifas para mantener la integridad de recibos pasados.

### 3. Facturación Automatizada
- Cálculo automático del monto a pagar basado en lecturas.
- Fórmula transparente: `(Consumo * Precio Unitario) + Alumbrado`.
- Redondeo automático para facilitar el cobro en efectivo.

### 4. Control de Pagos
- Seguimiento del estado de cada recibo (`PENDIENTE`, `PAGADO`).
- Registro de fecha y hora de los pagos.
- Indicadores visuales de estado.

### 5. Acceso Público
- Consulta rápida de deuda por DNI.
- Sin necesidad de registro para los vecinos.
- Visualización clara del detalle de cada recibo.

## 🛠️ Configuración Local

1.  **Clonar el repositorio**
    ```bash
    git clone <url-del-repositorio>
    cd portal-de-luz
    ```

2.  **Instalar dependencias**
    ```bash
    npm install
    # o
    pnpm install
    # o
    yarn install
    ```

3.  **Configurar Variables de Entorno**
    Crea un archivo `.env.local` en la raíz del proyecto y agrega tus credenciales de Supabase:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
    NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
    ```

4.  **Base de Datos**
    Ejecuta el script SQL ubicado en `.gemini/BaseDeDatos.sql` en el editor SQL de tu proyecto en Supabase para crear las tablas y políticas de seguridad necesarias.

5.  **Ejecutar el servidor de desarrollo**
    ```bash
    npm run dev
    ```

    Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

## 📜 Licencia
Este proyecto es propiedad de la comunidad UPIS Las Palmeras del Sol y está destinado para su uso interno.
