from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum, Text
from sqlalchemy.sql import func
from aplicacion.conexion_bd import Base
import enum

class RolUsuario(str, enum.Enum):
    master = "master"
    profesor = "profesor"
    alumno = "alumno"
    
class Usuario(Base):
    __tablename__ = "tbl_usuarios"
    __table_args__ = {"schema": "seguridad"}
    
    usu_id = Column(Integer, primary_key=True, index=True)
    usu_nombre = Column(String(100), nullable=False)
    usu_apellido = Column(String(100), nullable=False)
    usu_email = Column(String(150), unique=True, nullable=False)
    usu_password_hash = Column(String, nullable=False)
    usu_rol = Column(Enum(RolUsuario), default=RolUsuario.alumno)
    usu_imagen = Column(Text, nullable=True)  # Base64 para manejar las imagenes de perfil de manera provisional ojo
    usu_activo = Column(Boolean, default=True)
    usu_fecha_registro = Column(DateTime(timezone=True), server_default=func.now())