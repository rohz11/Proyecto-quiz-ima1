from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey, Boolean, Numeric, func
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.dialects.postgresql import JSONB

Base = declarative_base()

# ======================================================
# Esquema SEGURIDAD
# ======================================================

class Rol(Base):
    __tablename__ = 'tbl_roles'
    __table_args__ = {'schema': 'seguridad'}
    
    rol_id = Column(Integer, primary_key=True)
    rol_nombre = Column(String(50), unique=True, nullable=False)
    
    # Relación inversa
    usuarios = relationship("Usuario", back_populates="rol")


class Usuario(Base):
    __tablename__ = 'tbl_usuarios'
    __table_args__ = {'schema': 'seguridad'}
    
    usu_id = Column(Integer, primary_key=True)
    usu_nombre = Column(String(100), nullable=False)
    usu_apellido = Column(String(100), nullable=False)
    usu_email = Column(String(150), unique=True, nullable=False)
    usu_password_hash = Column(String, nullable=False)
    usu_fk_rol = Column(Integer, ForeignKey('seguridad.tbl_roles.rol_id'), nullable=False)
    usu_puntos_app = Column(Integer, default=0)
    usu_activo = Column(Boolean, default=True)
    usu_fecha_registro = Column(TIMESTAMP, server_default=func.now())

    # RELACIONES
    rol = relationship("Rol", back_populates="usuarios")
    materias_dictadas = relationship("Materia", back_populates="profesor")
    inscripciones = relationship("Inscripcion", back_populates="alumno")
    resultados = relationship("Resultado", back_populates="usuario")


# ======================================================
# Esquema EVALUACIÓN
# ======================================================

class Materia(Base):
    __tablename__ = 'tbl_materias'
    __table_args__ = {'schema': 'evaluacion'}
    
    mat_id = Column(Integer, primary_key=True)
    mat_nombre = Column(String(100), nullable=False)
    mat_codigo = Column(String(20), unique=True, nullable=False)
    mat_fk_profesor = Column(Integer, ForeignKey('seguridad.tbl_usuarios.usu_id'), nullable=False)
    mat_activo = Column(Boolean, default=True)

    # RELACIONES
    profesor = relationship("Usuario", back_populates="materias_dictadas")
    sesiones = relationship("SesionQuiz", back_populates="materia")
    alumnos_inscritos = relationship("Inscripcion", back_populates="materia")


class Inscripcion(Base):
    __tablename__ = 'tbl_inscripciones'
    __table_args__ = {'schema': 'evaluacion'}
    
    ins_id = Column(Integer, primary_key=True)
    ins_fk_alumno = Column(Integer, ForeignKey('seguridad.tbl_usuarios.usu_id'), nullable=False)
    ins_fk_materia = Column(Integer, ForeignKey('evaluacion.tbl_materias.mat_id'), nullable=False)
    ins_fecha_inscripcion = Column(TIMESTAMP, server_default=func.now())

    # RELACIONES
    alumno = relationship("Usuario", back_populates="inscripciones")
    materia = relationship("Materia", back_populates="alumnos_inscritos")


class SesionQuiz(Base):
    __tablename__ = 'tbl_sesiones'
    __table_args__ = {'schema': 'evaluacion'}
    
    ses_id = Column(Integer, primary_key=True)
    ses_codigo_acceso = Column(String(10), unique=True, nullable=False)
    ses_id_mongo_quiz = Column(String(50), nullable=False)
    ses_fk_materia = Column(Integer, ForeignKey('evaluacion.tbl_materias.mat_id'), nullable=False)
    ses_nombre_grupo = Column(String(100))
    ses_puntuacion_tipo = Column(String(20)) 
    ses_manual_activado = Column(Boolean, default=True) 
    ses_estatus = Column(String(20), default='Espera')
    ses_fecha_inicio = Column(TIMESTAMP, nullable=False)
    ses_fecha_fin = Column(TIMESTAMP, nullable=False)
    ses_activo = Column(Boolean, default=True)

    # RELACIONES
    materia = relationship("Materia", back_populates="sesiones")
    resultados = relationship("Resultado", back_populates="sesion")


class Resultado(Base):
    __tablename__ = 'tbl_resultados'
    __table_args__ = {'schema': 'evaluacion'}
    
    res_id = Column(Integer, primary_key=True)
    res_fk_usuario = Column(Integer, ForeignKey('seguridad.tbl_usuarios.usu_id'), nullable=False)
    res_fk_sesion = Column(Integer, ForeignKey('evaluacion.tbl_sesiones.ses_id'), nullable=False)
    res_nota_final = Column(Numeric(5, 2), nullable=False)
    res_puntos_ganados_app = Column(Integer, nullable=False)
    res_tiempo_total_ms = Column(Integer)
    res_informe_fallas = Column(JSONB)
    
    # --- CAMPOS ACTUALIZADOS PARA CONTROL DE LUZ/OFFLINE ---
    res_hora_inicio_real = Column(TIMESTAMP, server_default=func.now())
    res_hora_final_real = Column(TIMESTAMP) # Hora de fin enviada por el dispositivo
    res_finalizado_offline = Column(Boolean, default=False)
    res_fecha_sincronizacion = Column(TIMESTAMP, server_default=func.now())

    # RELACIONES
    usuario = relationship("Usuario", back_populates="resultados")
    sesion = relationship("SesionQuiz", back_populates="resultados")