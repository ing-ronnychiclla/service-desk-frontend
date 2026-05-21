# 🛠️ Service Desk - Sistema de Gestión de Incidencias (Frontend)

Este es el cliente web para la plataforma de **Service Desk Enterprise**, una aplicación moderna para la gestión, soporte y resolución de incidencias técnicas en organizaciones empresariales. Está construido utilizando **Angular 19** con una estética visual premium y altamente interactiva de tipo **Glassmorphic** (efectos de cristal, gradientes suaves y animaciones dinámicas).

---

## ✨ Características Principales

*   **🎨 Diseño Visual Premium (Glassmorphism)**: Interfaz de usuario elegante con esquemas de colores HSL refinados, sombras dinámicas y micro-animaciones en botones e inputs.
*   **👤 Panel por Roles**:
    *   **Empleado (`EMPLOYEE`)**: Puede crear y visualizar **únicamente** los tickets técnicos que él mismo ha reportado, garantizando la privacidad y seguridad de los datos.
    *   **Agente (`AGENT`) & Administrador (`ADMIN`)**: Acceso completo a la lista de tickets globales, pudiendo tomar tickets libres, cambiar sus estados o cerrarlos.
*   **🔒 Autenticación y Seguridad**:
    *   Integración con tokens JWT del servidor para sesiones persistentes y seguras.
    *   Manejo transparente de roles decodificados del token directamente en el cliente.
*   **⚡ Paginación y Filtrado Dinámico**: Navegación fluida por las solicitudes de soporte técnico.
*   **👋 Bienvenida Personalizada**: Panel de control con banner interactivo de bienvenida que muestra el correo y el rol de la sesión activa del usuario.

---

## 🚀 Arquitectura y Tecnologías

*   **Framework**: [Angular 19 (Standalone Components)](https://angular.dev/)
*   **Estilos (CSS)**: [Tailwind CSS v3](https://tailwindcss.com/)
*   **Fuentes**: Google Fonts (*Inter* para texto general y *Outfit* para títulos destacados)
*   **Consumo API**: HttpClient con interceptor JWT global (`authInterceptor`)
*   **Enrutado**: Angular Router con guardias de seguridad (`authGuard`)

---

## 🛠️ Instalación y Configuración Local

### Prerrequisitos
*   [Node.js](https://nodejs.org/) (versión 18 o superior recomendada)
*   [Angular CLI](https://github.com/angular/angular-cli) instalado globalmente (`npm install -g @angular/cli`)

### Pasos para iniciar

1.  **Instalar las dependencias**:
    ```bash
    npm install
    ```

2.  **Configurar variables de entorno**:
    Verifica la dirección del servidor back-end en `src/environments/environment.ts` o `src/environments/environment.development.ts`. Por defecto, está configurado para conectarse al servidor Spring Boot en:
    ```typescript
    apiUrl: 'http://localhost:8080/api/v1'
    ```

3.  **Iniciar el servidor de desarrollo**:
    ```bash
    ng serve
    ```
    *O de forma abreviada para abrirlo directamente en el navegador:*
    ```bash
    ng serve -o
    ```
    Navega a `http://localhost:4200/` en tu navegador. La aplicación se recargará automáticamente al realizar cambios en los archivos de origen.

---

## 📂 Estructura del Proyecto

```text
src/
├── app/
│   ├── core/               # Guardianes, interceptores y servicios transversales (Auth)
│   ├── features/           # Vistas y componentes del negocio
│   │   ├── auth/           # Formulario e inicio de sesión
│   │   └── dashboard/      # Panel principal, detalle del ticket y servicios
│   ├── app.component.ts    # Componente raíz
│   ├── app.config.ts       # Proveedores globales de Angular
│   └── app.routes.ts       # Configuración de las rutas del sitio
├── environments/           # Variables de configuración (Desarrollo/Producción)
├── models/                 # Interfaces TypeScript de tipos de datos (Ticket, User)
├── index.html              # HTML base
└── styles.css              # Estilos CSS globales y tokens de diseño
```

---

## 🎯 Scripts Disponibles

*   `npm run dev` / `ng serve`: Levanta el servidor local.
*   `npm run build` / `ng build`: Compila la aplicación en un paquete de producción en la carpeta `dist/`.
*   `npm run test` / `ng test`: Ejecuta las pruebas unitarias.
