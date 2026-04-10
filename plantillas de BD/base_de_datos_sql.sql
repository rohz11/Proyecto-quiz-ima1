-- PROYECTO: INSTITUTO METROPOLITANO ADVENTISTA - TRAYECTO IV
-- ARQUITECTURA: EVALUACIÓN MULTIMODAL CON ACCESO DINÁMICO ALEATORIO

-- 1. Esquema para Gestión de Seguridad
CREATE SCHEMA IF NOT EXISTS seguridad;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'rol_usuario' AND typnamespace = 'seguridad'::regnamespace) THEN
        CREATE TYPE seguridad.rol_usuario AS ENUM ('master', 'profesor', 'alumno');
    END IF;
END $$;

CREATE TABLE seguridad.tbl_usuarios (
    usu_id SERIAL PRIMARY KEY,
    usu_nombre VARCHAR(100) NOT NULL,
    usu_apellido VARCHAR(100) NOT NULL,
    usu_email VARCHAR(150) UNIQUE NOT NULL,
    usu_password_hash TEXT NOT NULL,
    usu_rol seguridad.rol_usuario DEFAULT 'alumno',
    usu_imagen TEXT NULL, 
    usu_activo BOOLEAN DEFAULT TRUE,
    usu_fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE seguridad.tbl_usuarios IS 'almacena credenciales y perfiles de acceso del sistema.';

-- 2. Esquema para Lógica de Evaluación
CREATE SCHEMA IF NOT EXISTS evaluacion;

-- Tabla de Quices (Estructura base)
CREATE TABLE evaluacion.tbl_quices (
    qui_id SERIAL PRIMARY KEY,
    qui_titulo VARCHAR(200) NOT NULL,
    qui_descripcion TEXT,
    qui_fk_autor_id INTEGER NOT NULL,
    qui_mongo_doc_id VARCHAR(50) UNIQUE, 
    qui_img_url TEXT,
    qui_fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_usuario_autor FOREIGN KEY (qui_fk_autor_id) 
    REFERENCES seguridad.tbl_usuarios(usu_id) ON DELETE CASCADE
);

COMMENT ON TABLE evaluacion.tbl_quices IS 'datos de los cuestionarios vinculados a MongoDB';

-- Modo 1: Sesiones (En Vivo / Sincrónico)
CREATE TABLE evaluacion.tbl_sesiones (
    ses_id SERIAL PRIMARY KEY,
    ses_fk_quiz_id INTEGER NOT NULL,
    ses_codigo_acceso VARCHAR(15) UNIQUE NOT NULL, -- Código aleatorio generado al iniciar
    ses_estado VARCHAR(20) DEFAULT 'espera', 
    ses_fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_quiz_instancia FOREIGN KEY (ses_fk_quiz_id) 
    REFERENCES evaluacion.tbl_quices(qui_id) ON DELETE CASCADE
);

COMMENT ON TABLE evaluacion.tbl_sesiones IS 'salas de juego sincronizadas que usan un código aleatorio temporal.';

-- Modo 2: Asignaciones (Tareas / Asincrónico)
CREATE TABLE evaluacion.tbl_asignaciones (
    asig_id SERIAL PRIMARY KEY,
    asig_fk_quiz_id INTEGER NOT NULL,
    asig_codigo_acceso VARCHAR(15) UNIQUE NOT NULL, -- Código aleatorio generado para la tarea
    asig_fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    asig_fecha_limite TIMESTAMP NOT NULL,
    asig_estado_activo BOOLEAN DEFAULT TRUE,

    CONSTRAINT fk_quiz_asignado FOREIGN KEY (asig_fk_quiz_id) 
    REFERENCES evaluacion.tbl_quices(qui_id) ON DELETE CASCADE
);

COMMENT ON TABLE evaluacion.tbl_asignaciones IS 'cuestionarios asignados a estudiantes con fecha de entrega';

-- Tabla de Resultados y Ranking
CREATE TABLE evaluacion.tbl_resultados (
    res_id SERIAL PRIMARY KEY,
    res_fk_usuario_id INTEGER NOT NULL,
    res_fk_sesion_id INTEGER NULL, 
    res_fk_asig_id INTEGER NULL,   
    res_puntos INTEGER DEFAULT 0,
    res_aciertos INTEGER DEFAULT 0,
    res_tiempo_ms INTEGER, 
    res_fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_alumno_participante FOREIGN KEY (res_fk_usuario_id) REFERENCES seguridad.tbl_usuarios(usu_id),
    CONSTRAINT fk_sesion_activa FOREIGN KEY (res_fk_sesion_id) REFERENCES evaluacion.tbl_sesiones(ses_id),
    CONSTRAINT fk_asignacion_activa FOREIGN KEY (res_fk_asig_id) REFERENCES evaluacion.tbl_asignaciones(asig_id)
);

COMMENT ON TABLE evaluacion.tbl_resultados IS 'centraliza puntajes para generar rankings por sesión o asignaciones';

-- 3. Índices
CREATE INDEX idx_ses_acceso ON evaluacion.tbl_sesiones(ses_codigo_acceso);
CREATE INDEX idx_asig_acceso ON evaluacion.tbl_asignaciones(asig_codigo_acceso);

-- 4. Datos de Prueba iniciales
INSERT INTO seguridad.tbl_usuarios (usu_nombre, usu_apellido, usu_email, usu_password_hash, usu_rol)
VALUES ('Hender', 'Rojas', 'hender@gmail.com', '123', 'master'), 
    ('Rodmy', 'Chacon', 'rodmy@gmail.com', '123', 'profesor');

DO $$ BEGIN RAISE NOTICE 'Base de Datos configurada'; END $$;