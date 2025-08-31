# E-commerce con PostgreSQL y React

Este es un proyecto de E-commerce full-stack construido con un backend en Node.js, Express, Sequelize y PostgreSQL, y un frontend desarrollado con React y Vite.

## Características

- **Catálogo de Productos:** Visualización de productos con detalles, imágenes y precios.
- **Carrito de Compras:** Funcionalidad para agregar, eliminar y modificar productos en el carrito.
- **Autenticación de Usuarios:** Registro e inicio de sesión de usuarios utilizando JWT (JSON Web Tokens).
- **Panel de Administración (Dashboard):**
  - Gestión de Productos (CRUD)
  - Gestión de Categorías
  - Gestión de Usuarios
- **Subida de Imágenes:** Carga de imágenes de productos al servidor.

## Tecnologías Utilizadas

### Backend
- **Node.js:** Entorno de ejecución para JavaScript.
- **Express:** Framework para construir la API REST.
- **Sequelize:** ORM para interactuar con la base de datos PostgreSQL.
- **PostgreSQL:** Sistema de gestión de bases de datos relacional.
- **JSON Web Token (JWT):** Para la autenticación y autorización de usuarios.
- **Bcrypt.js:** Para el hash de contraseñas.
- **Multer:** Middleware para la carga de archivos (imágenes de productos).
- **CORS:** Para habilitar solicitudes de recursos cruzados.
- **Dotenv:** Para la gestión de variables de entorno.

### Frontend
- **React:** Biblioteca para construir interfaces de usuario.
- **Vite:** Herramienta de compilación rápida para el desarrollo frontend.
- **React Router DOM:** Para la gestión de rutas en la aplicación.
- **Axios:** Cliente HTTP para realizar solicitudes a la API del backend.
- **React Toastify & SweetAlert2:** Para mostrar notificaciones y alertas atractivas.
- **ESLint:** Para el linting del código.

## Instalación y Configuración

Sigue estos pasos para configurar y ejecutar el proyecto en tu entorno local.

### Prerrequisitos
- Node.js (v18 o superior)
- npm (o un gestor de paquetes similar como Yarn)
- PostgreSQL

### 1. Clonar el Repositorio
```bash
git clone https://github.com/lozadandres/EcomercePGSQL.git
cd EcomercePGSQL
```

### 2. Configurar el Backend
```bash
cd backend
npm install
```
- Crea un archivo `.env` en el directorio `backend` y configura las variables de entorno, especialmente las credenciales de la base de datos PostgreSQL.
```env
DB_USER=tu_usuario_de_postgres
DB_PASSWORD=tu_contraseña_de_postgres
DB_HOST=localhost
DB_NAME=nombre_de_tu_bd
JWT_SECRET=tu_secreto_jwt
```

### 3. Configurar el Frontend
```bash
cd ../frontend
npm install
```

## Cómo Ejecutar el Proyecto

1.  **Iniciar el Servidor Backend:**
    Desde el directorio `backend`, ejecuta:
    ```bash
    npm start 
    # O si tienes nodemon instalado globalmente o como dependencia de desarrollo
    nodemon index.js
    ```
    El servidor se ejecutará en `http://localhost:5000` (o el puerto que hayas configurado).

2.  **Iniciar la Aplicación Frontend:**
    Desde el directorio `frontend`, ejecuta:
    ```bash
    npm run dev
    ```
    La aplicación se abrirá en `http://localhost:5173` (o el puerto que indique Vite).
