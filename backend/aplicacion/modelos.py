from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey, Boolean
from sqlalchemy.orm import declarative_base
from sqlalchemy.dialects.postgresql import JSONB

Base = declarative_base()

# Esquema SEGURIDAD
class Usuario(Base):
    __tablename__ = 'tbl_usuarios'
    __table_args__ = {'schema': 'seguridad'} # <--- ESTO ES VITAL
    
    usu_id = Column(Integer, primary_key=True)
    usu_nombre_completo = Column(String(200), nullable=False)
    usu_email = Column(String(150), unique=True, nullable=False)
    usu_password_hash = Column(String, nullable=False)
    usu_rol = Column(String(20), default='alumno')
    usu_puntos_totales = Column(Integer, default=0)
    usu_activo = Column(Boolean, default=True) # Soft Delete
    usu_fecha_registro = Column(TIMESTAMP)

# Esquema EVALUACIÓN
class Materia(Base):
    __tablename__ = 'tbl_materias'
    __table_args__ = {'schema': 'evaluacion'}
    
    mat_id = Column(Integer, primary_key=True)
    mat_nombre = Column(String(100), nullable=False)
    mat_fk_profesor = Column(Integer, ForeignKey('seguridad.tbl_usuarios.usu_id'))
    mat_activo = Column(Boolean, default=True)

class SesionQuiz(Base):
    __tablename__ = 'tbl_sesiones'
    __table_args__ = {'schema': 'evaluacion'}
    
    ses_id = Column(Integer, primary_key=True)
    ses_codigo_acceso = Column(String(10), unique=True, nullable=False)
    ses_id_quiz_mongo = Column(String(50), nullable=False)
    ses_fk_materia = Column(Integer, ForeignKey('evaluacion.tbl_materias.mat_id'))
    ses_tipo = Column(String(20))
    ses_fecha_limite = Column(TIMESTAMP, nullable=True)
    ses_activo = Column(Boolean, default=True)

class Resultado(Base):
    __tablename__ = 'tbl_resultados'
    __table_args__ = {'schema': 'evaluacion'}
    
    res_id = Column(Integer, primary_key=True)
    res_fk_usuario = Column(Integer, ForeignKey('seguridad.tbl_usuarios.usu_id'))
    res_fk_sesion = Column(Integer, ForeignKey('evaluacion.tbl_sesiones.ses_id'))
    res_puntos_obtenidos = Column(Integer, default=0)
    res_tiempo_total_ms = Column(Integer)
    res_detalle_errores = Column(JSONB) # <--- JSONB para analítica pro