---
name: database-connection-testing
description: Guía paso a paso para configurar conexiones de base de datos con FastAPI, MongoDB y PostgreSQL, y probar funciones con React Native sin errores. Usa cuando: necesitas configurar conexiones DB y testing en stack FastAPI + MongoDB + PostgreSQL + React Native.
---

# Configuración de Conexiones de Base de Datos y Pruebas con FastAPI, MongoDB, PostgreSQL y React Native

Esta habilidad proporciona un checklist rápido con instrucciones claras para configurar conexiones de base de datos y probar funciones correctamente sin errores.

## Checklist de Pasos

### 1. Configurar Conexión a MongoDB en FastAPI
- Instalar dependencias: `motor` para MongoDB asíncrono.
- Crear archivo de configuración para la URI de MongoDB (usar variables de entorno).
- Implementar función de conexión en `conexion_bd.py`.
- Probar la conexión ejecutando un script simple.

Herramientas a usar:
- `install_python_packages` para instalar motor.
- `read_file` para revisar `conexion_bd.py`.
- `run_in_terminal` para probar conexión.

### 2. Configurar Conexión a PostgreSQL en FastAPI
- Instalar dependencias: `psycopg2` o `asyncpg` para PostgreSQL.
- Agregar configuración de PostgreSQL en el archivo de configuración.
- Implementar función de conexión en `conexion_bd.py`.
- Probar la conexión.

Herramientas a usar:
- `install_python_packages` para instalar asyncpg.
- `read_file` para revisar esquemas y modelos.
- `run_in_terminal` para probar.

### 3. Crear Endpoints de Prueba en FastAPI
- Definir rutas en `rutas_quices.py` para probar conexiones (e.g., GET /test-mongo, GET /test-postgres).
- Usar esquemas de Pydantic para respuestas.
- Asegurar manejo de errores.

Herramientas a usar:
- `read_file` para revisar rutas existentes.
- `replace_string_in_file` para agregar nuevos endpoints (después de explicar).

### 4. Configurar React Native para Llamadas a API
- Instalar dependencias: `axios` o `fetch` para HTTP requests.
- Crear servicio en `services/api.ts` para llamadas a FastAPI.
- Configurar URL base del backend.

Herramientas a usar:
- `read_file` para revisar `services/api.ts`.
- `run_in_terminal` para instalar dependencias en my-app.

### 5. Probar Conexiones y Funciones
- Ejecutar servidor FastAPI.
- Hacer llamadas desde React Native a los endpoints de prueba.
- Verificar logs y respuestas sin errores.

Herramientas a usar:
- `run_in_terminal` para iniciar servidor.
- `run_in_terminal` para probar con curl o desde app.

## Notas
- Siempre explicar cambios antes de aplicarlos.
- Usar variables de entorno para configuraciones sensibles.
- Verificar compatibilidad de versiones de dependencias.