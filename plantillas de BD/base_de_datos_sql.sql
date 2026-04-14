-- ======================================================
-- 1. ESQUEMAS DE ORGANIZACIÓN
-- ======================================================
CREATE SCHEMA IF NOT EXISTS seguridad;
CREATE SCHEMA IF NOT EXISTS evaluacion;

-- ======================================================
-- 2. NÚCLEO DE SEGURIDAD
-- ======================================================

-- Tabla de Roles: Define si es Profesor o Estudiante
CREATE TABLE seguridad.tbl_roles (
    rol_id SERIAL PRIMARY KEY,
    rol_nombre VARCHAR(50) UNIQUE NOT NULL
);

-- Inserts de los 3 roles principales (en orden de ID)
INSERT INTO seguridad.tbl_roles (rol_nombre) VALUES 
    ('alumno'),    -- ID 1
    ('profesor'),  -- ID 2
    ('master')     -- ID 3
ON CONFLICT (rol_nombre) DO NOTHING;

-- Tabla de Usuarios: Incluye la billetera de puntos (Gamificación)
CREATE TABLE seguridad.tbl_usuarios (
    usu_id SERIAL PRIMARY KEY,
    usu_nombre VARCHAR(100) NOT NULL,
    usu_apellido VARCHAR(100) NOT NULL,
    usu_email VARCHAR(150) UNIQUE NOT NULL,
    usu_password_hash TEXT NOT NULL,
    usu_fk_rol INTEGER NOT NULL,
    usu_puntos_app INTEGER DEFAULT 0, 
    usu_activo BOOLEAN DEFAULT TRUE,
    usu_fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usu_imagen TEXT,
    CONSTRAINT fk_usuario_rol FOREIGN KEY (usu_fk_rol) REFERENCES seguridad.tbl_roles(rol_id)
);

-- ======================================================
-- 3. NÚCLEO ACADÉMICO Y GESTIÓN
-- ======================================================

-- Tabla de Materias
CREATE TABLE evaluacion.tbl_materias (
    mat_id SERIAL PRIMARY KEY,
    mat_nombre VARCHAR(100) NOT NULL,
    mat_codigo VARCHAR(20) UNIQUE NOT NULL,
    mat_fk_profesor INTEGER NOT NULL,
    mat_activo BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_materia_profesor FOREIGN KEY (mat_fk_profesor) REFERENCES seguridad.tbl_usuarios(usu_id)
);

-- Tabla de Inscripciones: Relaciona alumnos con materias
CREATE TABLE evaluacion.tbl_inscripciones (
    ins_id SERIAL PRIMARY KEY,
    ins_fk_alumno INTEGER NOT NULL,
    ins_fk_materia INTEGER NOT NULL,
    ins_fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ins_alumno FOREIGN KEY (ins_fk_alumno) REFERENCES seguridad.tbl_usuarios(usu_id),
    CONSTRAINT fk_ins_materia FOREIGN KEY (ins_fk_materia) REFERENCES evaluacion.tbl_materias(mat_id),
    CONSTRAINT uq_alumno_materia UNIQUE (ins_fk_alumno, ins_fk_materia)
);

-- ======================================================
-- 4. NÚCLEO DE EVALUACIÓN Y CONTROL OFFLINE
-- ======================================================

-- Tabla de Sesiones: Control de acceso y tiempos globales
CREATE TABLE evaluacion.tbl_sesiones (
    ses_id SERIAL PRIMARY KEY,
    ses_codigo_acceso VARCHAR(10) UNIQUE NOT NULL,
    ses_id_mongo_quiz VARCHAR(50) NOT NULL,
    ses_fk_materia INTEGER NOT NULL,
    ses_nombre_grupo VARCHAR(100),
    ses_puntuacion_tipo VARCHAR(20) CHECK (ses_puntuacion_tipo IN ('Igual', 'Dificultad')),
    ses_manual_activado BOOLEAN DEFAULT TRUE,
    ses_estatus VARCHAR(20) DEFAULT 'Espera', -- 'Espera', 'En curso', 'Finalizada'
    ses_fecha_inicio TIMESTAMP NOT NULL,
    ses_fecha_fin TIMESTAMP NOT NULL,
    ses_activo BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_sesion_materia FOREIGN KEY (ses_fk_materia) REFERENCES evaluacion.tbl_materias(mat_id)
);

-- Tabla de Resultados: Analítica detallada y validación de integridad temporal
CREATE TABLE evaluacion.tbl_resultados (
    res_id SERIAL PRIMARY KEY,
    res_fk_usuario INTEGER NOT NULL,
    res_fk_sesion INTEGER NOT NULL,
    res_nota_final NUMERIC(5,2) NOT NULL,
    res_puntos_ganados_app INTEGER NOT NULL,
    res_tiempo_total_ms INTEGER,
    res_informe_fallas JSONB,
    
    -- NUEVOS CAMPOS PARA EL MANEJO DE LUZ/INTERNET:
    res_hora_inicio_real TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Cuándo el alumno dio "Comenzar"
    res_hora_final_real TIMESTAMP,                            -- Cuándo terminó en su dispositivo (Local)
    res_finalizado_offline BOOLEAN DEFAULT FALSE,             -- Bandera para saber si se sincronizó después
    res_fecha_sincronizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Cuándo llegó realmente al servidor
    
    CONSTRAINT fk_res_usuario FOREIGN KEY (res_fk_usuario) REFERENCES seguridad.tbl_usuarios(usu_id),
    CONSTRAINT fk_res_sesion FOREIGN KEY (res_fk_sesion) REFERENCES evaluacion.tbl_sesiones(ses_id)
);

-- ======================================================
-- 5. ACTUALIZACIONES PARA BASES DE DATOS EXISTENTES
-- ======================================================

-- Para bases de datos existentes, actualizar el tipo de columna usu_imagen a TEXT
-- Esto permite almacenar imágenes en base64 más grandes
ALTER TABLE seguridad.tbl_usuarios ALTER COLUMN usu_imagen TYPE TEXT;