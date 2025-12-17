# Delicious Kitchen - Frontend

Una aplicación web completa para la gestión integral del restaurante "Delicious Kitchen" — frontend construido con React (Vite), TailwindCSS y Firebase Authentication. Este repositorio contiene el código cliente (JavaScript, CSS, HTML) y un Dockerfile para construir y ejecutar la aplicación en un contenedor.

<img width="1863" height="349" alt="image" src="https://github.com/user-attachments/assets/906fc516-7ab8-4c63-a8d3-c993e7a5ed0c" />


## Contenido
- Acerca de
- Funcionalidades
- Stack tecnológico
- Requisitos previos
- Desarrollo local
- Compilar para producción
- Ejecutar con Docker
- Variables de entorno
- Resolución de problemas

## Acerca de
El frontend es una SPA (aplicación de una sola página) desarrollada con React, creada y servida con Vite, y estilizada con TailwindCSS. Se conecta a una arquitectura de microservicios backend a través de un API Gateway y utiliza Firebase para autenticación y gestión de usuarios. Está preparada para desplegarse como archivos estáticos o dentro de un contenedor Docker.

## Funcionalidades

### Módulo de Órdenes
- Crear y gestionar órdenes de cliente
- Seguimiento en tiempo real del estado de las órdenes
- Notificaciones SSE (Server-Sent Events) para actualizaciones instantáneas
- Cancelación de órdenes con modales de confirmación
- Vista pública del estado de órdenes

### Módulo de Cocina
- Vista especializada para personal de cocina
- Gestión de estados de órdenes (PENDING → IN_PROGRESS → READY → DELIVERED)
- Filtros por estado, fecha y mesero
- Tarjetas visuales con información detallada de cada orden
- Actualización en tiempo real vía RabbitMQ

### Módulo de Reseñas y Encuestas
- Sistema público de reseñas con calificación por estrellas
- Encuestas de satisfacción (NPS - Net Promoter Score)
- Panel administrativo para gestión de reseñas
- Moderación y respuesta a comentarios de clientes
- Visualización de métricas de satisfacción

### Módulo de Administración
- **Panel de Analytics**: Dashboard completo con gráficos (Chart.js), tablas de datos y filtros avanzados
- **Gestión de Usuarios**: CRUD completo (crear, editar, visualizar, desactivar usuarios)
- **Control de Roles**: Admin, Kitchen, Waiter con permisos diferenciados
- **Rutas Protegidas**: Autenticación Firebase con validación de roles

### Autenticación y Seguridad
- Integración completa con Firebase Authentication
- Login con email/password
- Gestión de sesiones con contexto React
- Manejo de custom claims para roles
- Protección de rutas basada en roles
- Manejo robusto de errores de autenticación

### Internacionalización (i18n)
- Soporte multiidioma (español/inglés)
- Configuración con react-i18next
- Traducciones para toda la interfaz

### Testing
- Suite completa de pruebas unitarias (Jest + Testing Library)
- Pruebas de integración
- Mocks de servicios (MSW - Mock Service Worker)
- Cobertura de componentes críticos

## Stack tecnológico

### Core
- **React 18.3** - Biblioteca de UI con hooks modernos
- **Vite 7.2** - Build tool y dev server de alta velocidad
- **React Router DOM 7.9** - Navegación y enrutamiento SPA
- **TailwindCSS 3.4** - Framework CSS utility-first

### Autenticación y Backend
- **Firebase 12.6** - Authentication, Firestore y servicios cloud
- **API Gateway** - Punto de entrada unificado a microservicios
- **Server-Sent Events (SSE)** - Notificaciones en tiempo real

### Internacionalización
- **i18next 25.7** - Framework de traducción
- **react-i18next 16.3** - Integración React para i18n

### Testing
- **Jest 29.7** - Framework de testing
- **Testing Library** - Testing de componentes React
- **MSW 1.3** - Mock Service Worker para interceptar requests
- **jest-environment-jsdom** - Entorno DOM para pruebas

### Development
- **ESLint 9.39** - Linter para código JavaScript/React
- **Babel** - Transpilador para compatibilidad
- **PostCSS** - Procesador CSS
- **PropTypes** - Validación de props en componentes

## Requisitos previos
- **Node.js** (versión 18+ LTS recomendada) y npm o yarn — para desarrollo local y build
- **Docker o Podman** (opcional) — para construir y ejecutar la imagen
- **Git** — para clonar el repositorio
- **Cuenta Firebase** — para configurar autenticación (ver sección Variables de entorno)
- **Backend Services** — API Gateway y servicios de notificaciones corriendo (ver infrastructure-delicious-kitchen)

## Desarrollo local

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/J-Ciro/restaurant-frontend.git
   cd restaurant-frontend
   ```

2. **Configura las variables de entorno**
   ```bash
   # Copia el archivo de ejemplo
   cp .env.example .env
   
   # Edita el archivo .env con tus valores reales
   # Especialmente las credenciales de Firebase
   ```

3. **Instala dependencias**
   ```bash
   npm install
   # o
   yarn
   ```

4. **Inicia el servidor de desarrollo**
   ```bash
   npm run dev
   # o
   yarn dev
   ```

   Por defecto el servidor de desarrollo corre en el puerto **5173**.  
   Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

5. **Ejecuta las pruebas**
   ```bash
   # Ejecutar todas las pruebas
   npm test
   
   # Ejecutar en modo watch
   npm run test:watch
   ```

### Estructura de Rutas

| Ruta | Descripción | Acceso |
|------|-------------|--------|
| `/` | Página principal/home | Público |
| `/order` | Creación de órdenes | Público |
| `/orders/:orderId` | Estado de orden específica | Público |
| `/login` | Autenticación de usuarios | Público |
| `/kitchen` | Vista de cocina | ADMIN, KITCHEN |
| `/dashboard/analytics` | Dashboard de ventas | ADMIN |
| `/users` | Gestión de usuarios | ADMIN |
| `/users/new` | Crear nuevo usuario | ADMIN |
| `/users/:id` | Editar usuario | ADMIN |
| `/reviews` | Página pública de reseñas | Público |
| `/admin/reviews` | Gestión de reseñas | ADMIN |
| `/admin/surveys` | Gestión de encuestas | ADMIN |

## Compilar para producción

1. **Genera los archivos estáticos con Vite:**
   ```bash
   npm run build
   # o
   yarn build
   ```
   
   Los archivos optimizados se generan en la carpeta `dist/`.

2. **(Opcional) Previsualizar la build localmente:**
   ```bash
   npm run preview
   # o
   yarn preview
   ```

3. **Sirve los archivos generados:**
   ```bash
   # Usando npx serve
   npx serve dist
   
   # O configura tu servidor favorito (nginx, caddy, etc.)
   # para apuntar a la carpeta `dist`
   ```

### Optimizaciones de Producción
- Tree-shaking automático de código no usado
- Minificación de JavaScript y CSS
- Code-splitting por rutas
- Lazy loading de componentes
- Optimización de assets (imágenes, fuentes)


## Ejecutar con Docker o Podman
El proyecto incluye un Dockerfile para construir y servir la aplicación. Puedes usar **Docker** o **Podman** de forma intercambiable, sin modificar la configuración del repositorio.

### Comandos básicos (Docker o Podman)

1. Construir la imagen:
    - Docker:
       ```sh
       docker build -t restaurant-frontend .
       ```
    - Podman:
       ```sh
       podman build -t restaurant-frontend .
       ```

2. Ejecutar el contenedor y mapear el puerto 5173:
    - Docker:
       ```sh
       docker run --rm -p 5173:5173 restaurant-frontend
       ```
    - Podman:
       ```sh
       podman run --rm -p 5173:5173 restaurant-frontend
       ```

#### Notas:
- El comando anterior mapea el puerto 5173 del contenedor al puerto 5173 del host. Si se emplea otro puerto interno, ajusta el mapeo: `-p puertoHost:puertoContenedor`.
- Para ejecutar en segundo plano (detached):
   - Docker:
      ```sh
      docker run -d --name restaurant-frontend -p 5173:5173 restaurant-frontend
      ```
   - Podman:
      ```sh
      podman run -d --name restaurant-frontend -p 5173:5173 restaurant-frontend
      ```
- Para pasar variables de entorno al contenedor:
   - Docker:
      ```sh
      docker run --rm -p 5173:5173 -e API_URL="https://api.ejemplo.com" restaurant-frontend
      ```
   - Podman:
      ```sh
      podman run --rm -p 5173:5173 -e API_URL="https://api.ejemplo.com" restaurant-frontend
      ```

> **Compatibilidad:**
> - No es necesario modificar ningún archivo del proyecto para usar Podman.
> - No subas archivos de configuración específicos de Podman al repositorio.
> - Los comandos y archivos (`Dockerfile`, `docker-compose.yml`) funcionan igual para ambos motores.

Si tu aplicación usa variables de Vite en tiempo de build, recuerda que deben tener el prefijo VITE_ (por ejemplo VITE_API_URL) y suelen inyectarse en tiempo de construcción. Para configuración en tiempo de ejecución considera un pequeño script que reemplace variables en un archivo served-config o el uso de un servidor que inyecte esas variables.

## Variables de entorno

El proyecto utiliza variables de entorno con el prefijo `VITE_` para ser inyectadas en tiempo de build. Copia el archivo `.env.example` a `.env` y configura los siguientes valores:

### API Gateway y Servicios
```env
# URL del API Gateway (punto de entrada principal al backend)
VITE_API_URL=http://localhost:3000

# URL del servicio de notificaciones SSE
VITE_NOTIFICATION_URL=http://localhost:3003/notifications/stream
```

### Firebase Authentication
Obtén estos valores desde Firebase Console > Project Settings > General:

```env
VITE_FIREBASE_API_KEY=your-firebase-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id  # Opcional
```

### Configuración para Diferentes Ambientes

**Development (local):**
```env
VITE_API_URL=http://localhost:3000
VITE_NOTIFICATION_URL=http://localhost:3003/notifications/stream
```

**Production:**
```env
VITE_API_URL=https://api.delicious-kitchen.com
VITE_NOTIFICATION_URL=https://notifications.delicious-kitchen.com/stream
```

### Notas Importantes
- Las variables `VITE_*` se inyectan en **tiempo de build**, no en tiempo de ejecución
- Para cambiar valores en producción, necesitas **reconstruir** la aplicación
- **Nunca** incluyas el archivo `.env` en el control de versiones (está en `.gitignore`)
- Para configuración dinámica en runtime, considera usar un archivo de configuración servido por el backend

## Resolución de problemas

### Puerto en Uso
Si el puerto 5173 está ocupado, puedes:

**Opción 1:** Cambiar el puerto en desarrollo
```bash
# Editar vite.config.js
server: {
  port: 8080  // o cualquier otro puerto disponible
}
```

**Opción 2:** Mapear a otro puerto del host en Docker
```bash
docker run --rm -p 8080:5173 restaurant-frontend
# Luego abre http://localhost:8080
```

### Errores de Build
Si experimentas fallos en la compilación:

```bash
# Limpia cache y reinstala dependencias
rm -rf node_modules package-lock.json
npm install

# En Windows
rmdir /s /q node_modules
del package-lock.json
npm install
```

### Errores de Firebase Authentication
- Verifica que todas las variables `VITE_FIREBASE_*` estén correctamente configuradas
- Confirma que Firebase Authentication esté habilitado en la consola
- Asegúrate de haber agregado los dominios autorizados en Firebase Console
- Revisa que el método de autenticación Email/Password esté activado

### Problemas con Variables de Entorno
```bash
# Verifica que el archivo .env exista
ls -la .env  # Linux/Mac
dir .env     # Windows

# Reconstruye después de cambiar variables
npm run build
```

### Errores de CORS
Si experimentas errores CORS al conectar con el backend:
- Verifica que el API Gateway tenga configuradas las políticas CORS correctas
- Confirma que `VITE_API_URL` apunte a la URL correcta
- En desarrollo, asegúrate de que el backend esté ejecutándose

### Conexión con Microservicios
Para ejecutar la aplicación completa:

```bash
# Desde el directorio infrastructure-delicious-kitchen
cd ../infrastructure-delicious-kitchen
docker-compose up -d

# O usando el script de inicio
./scripts/start-all.ps1  # Windows PowerShell
./scripts/start-all.sh   # Linux/Mac
```

### Depuración de SSE (Notificaciones)
Si las notificaciones en tiempo real no funcionan:
- Verifica que `VITE_NOTIFICATION_URL` esté correctamente configurado
- Confirma que el servicio de notificaciones esté corriendo
- Revisa la consola del navegador para errores de conexión EventSource
- Asegúrate de estar autenticado (SSE requiere autenticación)

### Problemas con Pruebas
```bash
# Ejecutar pruebas con más información
npm test -- --verbose

# Limpiar cache de Jest
npm test -- --clearCache

# Ejecutar una prueba específica
npm test -- OrderStatus.test
```

