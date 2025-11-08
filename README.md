# ChinaWok Frontend

Interfaz creada con Vite + React + TypeScript para replicar la experiencia visual de China Wok Perú.

## Características

- React 18 con TypeScript y React Router DOM para el enrutamiento.
- Tailwind CSS configurado para el sistema de diseño.
- Arquitectura modular con carpetas para `components`, `hooks`, `pages`, `services`, `data` y `router`.
- Datos simulados para promociones, productos y locales mientras se integra el backend.
- Carrusel promocional, listado de productos, vista de locales, carrito y formulario de registro.

## Scripts

```bash
npm install    # Instalar dependencias
npm run dev    # Iniciar el entorno de desarrollo
npm run build  # Construir la aplicación para producción
npm run preview # Previsualizar la build
```

## Estructura

```
├── public
├── src
│   ├── assets
│   ├── components
│   ├── data
│   ├── hooks
│   ├── pages
│   ├── router
│   └── services
```

## Variables de entorno

- `VITE_API_URL`: URL base para el cliente de Axios (opcional, usa un valor ficticio por defecto).

## Próximos pasos

- Conectar los servicios al backend cuando esté disponible.
- Reemplazar los datos simulados por peticiones reales.
- Ajustar las páginas con el contenido definitivo del proyecto.
