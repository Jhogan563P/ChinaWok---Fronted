# ChinaWok Frontend

Aplicación web moderna de e-commerce para delivery de comida, replicando la experiencia de China Wok Perú. Construida con **Vite + React + TypeScript** y preparada para integrarse con microservicios desplegados en **AWS Lambda + API Gateway**.

## ✨ Características Implementadas

### 🎨 Frontend
- **React 18** con TypeScript para desarrollo type-safe
- **React Router DOM v6** para navegación SPA
- **Tailwind CSS** con sistema de diseño personalizado
- **Context API** para gestión de estado (Carrito y Autenticación)
- **Axios** con múltiples clientes para microservicios independientes

### 🛒 Funcionalidades
- ✅ Carrito de compras funcional (agregar/eliminar/actualizar cantidades)
- ✅ Sistema de autenticación (Login/Registro)
- ✅ Búsqueda y filtrado de productos por categoría
- ✅ Localizador de tiendas con filtros por tipo de despacho
- ✅ Carrusel promocional
- ✅ Persistencia de carrito en localStorage
- ✅ Cálculo automático de subtotales y delivery
- ✅ Validación de formularios
24: 
25: ### 📦 Gestión de Pedidos Avanzada
26: - ✅ **Estados Granulares**: Visualización detallada (Cocinando, Empacando, En camino, etc.)
27: - ✅ **Actualización Manual**: Botón de refresco para estados sin depender de WebSockets
28: - ✅ **Confirmación Persistente**: Botón de "Confirmar Recepción" inteligente que persiste tras recargas
29: - ✅ **WebSockets**: Notificaciones en tiempo real para cambios de estado

### 🏗️ Arquitectura

```
src/
├── components/          # Componentes reutilizables
│   ├── common/         # LocationDropdown, NavActions, PromoCarousel
│   ├── layout/         # BaseLayout
│   ├── products/       # ProductCard, ProductFilters
│   └── shared/         # Header, Footer, SkeletonGrid
├── contexts/           # Contextos globales
│   ├── CartContext.tsx # Gestión del carrito
│   └── AuthContext.tsx # Gestión de autenticación
├── data/               # Mock data (temporal)
├── hooks/              # Custom hooks
├── pages/              # Páginas principales
│   ├── HomePage.tsx
│   ├── PromotionsPage.tsx
│   ├── StoresPage.tsx
│   ├── CartPage.tsx
│   ├── RegisterPage.tsx
│   └── LoginPage.tsx
├── router/             # Configuración de rutas
├── services/           # Capa de servicios para APIs
│   ├── apiClient.ts    # Múltiples clientes Axios
│   ├── productService.ts
│   ├── orderService.ts
│   ├── userService.ts
│   ├── storeService.ts
│   ├── offerService.ts
│   └── comboService.ts
└── types/              # Tipos TypeScript compartidos
```

## 🚀 Inicio Rápido

### Instalación

```bash
npm install
```

### Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Producción

```bash
npm run build      # Construir para producción
npm run preview    # Previsualizar build
```

## 🔧 Variables de Entorno

El proyecto utiliza **variables de entorno** para conectarse a los microservicios. Sigue estos pasos:

### 1. Configuración Inicial

Copia el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

### 2. Variables Disponibles

```env
# Microservicio de Usuarios (Login, Registro, CRUD Usuarios)
VITE_API_USERS_URL=https://tu-api-usuarios.execute-api.region.amazonaws.com/prod

# Microservicio de Locales (CRUD Locales, Tipos de despacho)
VITE_API_STORES_URL=https://tu-api-locales.execute-api.region.amazonaws.com/prod

# Microservicio de Pedidos (Productos, Pedidos, Ofertas, Combos)
VITE_API_ORDERS_URL=https://tu-api-pedidos.execute-api.region.amazonaws.com/prod

# Timeout para requests HTTP
VITE_API_TIMEOUT=10000
```

## 📡 Integración con APIs de AWS

### Arquitectura de Microservicios

El frontend se comunica con **3 microservicios independientes** desplegados en AWS Lambda + API Gateway:

1. **Microservicio de Usuarios**: Autenticación y gestión de usuarios
2. **Microservicio de Locales**: CRUD de tiendas y tipos de despacho
3. **Microservicio de Pedidos**: Productos, pedidos, ofertas y combos

### Cómo Conectar tus APIs

#### **Paso 1: Obtener las URLs de API Gateway**

En AWS Console:
1. Ve a **API Gateway**
2. Selecciona tu API
3. Ve a **Stages** → Selecciona tu stage (ej: `prod`)
4. Copia la **Invoke URL**

Ejemplo: `https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod`

#### **Paso 2: Actualizar `.env`**

Reemplaza las URLs en tu archivo `.env`:

```env
VITE_API_USERS_URL=https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod
VITE_API_STORES_URL=https://def456ghi.execute-api.us-east-1.amazonaws.com/prod
VITE_API_ORDERS_URL=https://jkl789mno.execute-api.us-east-1.amazonaws.com/prod
```

#### **Paso 3: Cambiar el flag USE_MOCK_DATA**

En cada archivo de servicio (`src/services/*.ts`), cambia el flag a `false`:

```typescript
// productService.ts
const USE_MOCK_DATA = false; // Cambiar de true a false

// userService.ts
const USE_MOCK_DATA = false; // Cambiar de true a false

// storeService.ts
const USE_MOCK_DATA = false; // Cambiar de true a false
```

#### **Paso 4: Reiniciar el servidor de desarrollo**

```bash
npm run dev
```

### Estructura de Respuestas Esperadas

Tus APIs Lambda deben devolver respuestas en este formato:

```typescript
// Respuesta exitosa
{
  "statusCode": 200,
  "headers": {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",  // IMPORTANTE para CORS
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
  },
  "body": JSON.stringify({
    "success": true,
    "data": [...] // tus datos
  })
}
```

### Endpoints Esperados

#### **API de Usuarios**
```
POST   /register        # Registro de usuario
POST   /login           # Login
GET    /users/:id       # Obtener perfil
PUT    /users/:id       # Actualizar perfil
```

#### **API de Locales**
```
GET    /stores          # Listar locales
GET    /stores/:id      # Obtener local específico
GET    /stores/search   # Buscar locales
```

#### **API de Pedidos**
```
GET    /products        # Listar productos
GET    /products/:id    # Obtener producto
POST   /orders          # Crear pedido
GET    /orders/:id      # Obtener pedido
GET    /offers          # Listar ofertas
GET    /combos          # Listar combos
```

## ⚠️ Configuración CORS

**MUY IMPORTANTE**: Tus Lambda Functions deben incluir headers CORS:

```python
# Ejemplo en Python
return {
    'statusCode': 200,
    'headers': {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    },
    'body': json.dumps(data)
}
```

También debes habilitar CORS en API Gateway:
1. Selecciona tu recurso
2. **Actions** → **Enable CORS**
3. Marca los métodos necesarios
4. **Deploy API**

## 🧪 Testing sin APIs

El proyecto incluye **mock data** que te permite probar toda la funcionalidad sin APIs:

- ✅ Agregar productos al carrito
- ✅ Registrarse e iniciar sesión (mock)
- ✅ Ver locales y filtrar por tipo de despacho
- ✅ Navegar por todas las páginas

Para usar mock data, simplemente deja `USE_MOCK_DATA = true` en los servicios.

## 📦 Tecnologías Utilizadas

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | 18.2.0 | Librería UI |
| TypeScript | 5.3.3 | Type safety |
| Vite | 5.0.12 | Build tool |
| React Router | 6.22.3 | Routing |
| Tailwind CSS | 3.4.1 | Estilos |
| Axios | 1.6.7 | HTTP client |

## 🎨 Paleta de Colores

```css
Primary: #D9252C (Rojo)
Secondary: #118C4F (Verde)
Accent: #FFC107 (Amarillo)
Dark Text: #1B1B1B
Light Gray: #F5F5F5
Font: Poppins
```

## 📄 Licencia

Este proyecto es para fines educativos (Cloud Computing - Ciclo 4).

## 👥 Equipo

Desarrollo Frontend - Proyecto P2
