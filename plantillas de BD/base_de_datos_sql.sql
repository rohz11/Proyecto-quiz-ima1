-- PROYECTO: SISTEMA DE GAMIFICACIÓN UNIVERSAL (TRAYECTO IV)
-- ARQUITECTURA: POSTGRESQL + MONGODB + SOFT DELETE

-- 1. ESQUEMAS
CREATE SCHEMA IF NOT EXISTS seguridad;
CREATE SCHEMA IF NOT EXISTS evaluacion;

-- 2. TIPOS DE DATOS PERSONALIZADOS
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'rol_usuario' AND typnamespace = 'seguridad'::regnamespace) THEN
        CREATE TYPE seguridad.rol_usuario AS ENUM ('master', 'profesor', 'alumno');
    END IF;
END $$;

-- 3. TABLA DE USUARIOS (Con Nombres y Apellidos separados)
CREATE TABLE seguridad.tbl_usuarios (
    usu_id SERIAL PRIMARY KEY,
    usu_nombre VARCHAR(100) NOT NULL, -- <--- CAMBIO
    usu_apellido VARCHAR(100) NOT NULL, -- <--- CAMBIO
    usu_email VARCHAR(150) UNIQUE NOT NULL,
    usu_password_hash TEXT NOT NULL,
    usu_rol seguridad.rol_usuario DEFAULT 'alumno',
    usu_puntos_totales INTEGER DEFAULT 0,
    usu_activo BOOLEAN DEFAULT TRUE, 
    usu_fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABLA DE MATERIAS (Organización de biblioteca)
CREATE TABLE evaluacion.tbl_materias (
    mat_id SERIAL PRIMARY KEY,
    mat_nombre VARCHAR(100) NOT NULL,
    mat_fk_profesor INTEGER NOT NULL,
    mat_activo BOOLEAN DEFAULT TRUE, -- SOFT DELETE
    CONSTRAINT fk_materia_autor FOREIGN KEY (mat_fk_profesor) REFERENCES seguridad.tbl_usuarios(usu_id)
);

-- 5. TABLA DE SESIONES (El puente dinámico)
CREATE TABLE evaluacion.tbl_sesiones (
    ses_id SERIAL PRIMARY KEY,
    ses_codigo_acceso VARCHAR(10) UNIQUE NOT NULL, -- El link/código
    ses_id_quiz_mongo VARCHAR(50) NOT NULL,        -- ID de MongoDB
    ses_fk_materia INTEGER NOT NULL,
    ses_tipo VARCHAR(20) CHECK (ses_tipo IN ('Sincrono', 'Asincrono')) DEFAULT 'Sincrono',
    ses_fecha_limite TIMESTAMP NULL,
    ses_activo BOOLEAN DEFAULT TRUE,               -- SOFT DELETE
    ses_fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sesion_materia FOREIGN KEY (ses_fk_materia) REFERENCES evaluacion.tbl_materias(mat_id)
);

-- 6. TABLA DE RESULTADOS (Analítica e Histórico)
CREATE TABLE evaluacion.tbl_resultados (
    res_id SERIAL PRIMARY KEY,
    res_fk_usuario INTEGER NOT NULL,
    res_fk_sesion INTEGER NOT NULL,
    res_puntos_obtenidos INTEGER DEFAULT 0,
    res_tiempo_total_ms INTEGER,
    res_detalle_errores JSONB,                    -- Estructura: [{"pregunta": 1, "opcion_usuario": 2, "es_correcta": false}]
    res_fecha_completado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_resultado_usuario FOREIGN KEY (res_fk_usuario) REFERENCES seguridad.tbl_usuarios(usu_id),
    CONSTRAINT fk_resultado_sesion FOREIGN KEY (res_fk_sesion) REFERENCES evaluacion.tbl_sesiones(ses_id)
);

-- 7. ÍNDICES DE VELOCIDAD (Alta Concurrencia)
CREATE INDEX idx_ses_codigo ON evaluacion.tbl_sesiones(ses_codigo_acceso);
CREATE INDEX idx_usu_activo ON seguridad.tbl_usuarios(usu_activo) WHERE usu_activo = TRUE;