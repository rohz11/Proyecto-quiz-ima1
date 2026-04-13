from pydantic import BaseModel, ConfigDict, EmailStr
from datetime import datetime
from typing import Optional, Dict, List, Any

# ======================================================
# 1. ESQUEMAS DE SEGURIDAD (Login y Registro)
# ======================================================

class DatosLogin(BaseModel):
    email: EmailStr
    password: str

class DatosRegistro(BaseModel):
    nombre: str
    apellido: str
    email: EmailStr
    password: str
    tipo: str  # "estudiante" o "profesor"
    imagen: Optional[str] = None

class UsuarioRespuesta(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    usu_id: int
    usu_nombre: str
    usu_apellido: str
    usu_email: str
    usu_puntos_app: int
    usu_fk_rol: int
    usu_activo: bool

class RespuestaLogin(BaseModel):
    token_acceso: str
    tipo_token: str = "bearer"
    usuario: UsuarioRespuesta

# ======================================================
# 2. ESQUEMAS ACADÉMICOS (Materias e Inscripciones)
# ======================================================

class MateriaBase(BaseModel):
    mat_nombre: str
    mat_codigo: str

class MateriaCrear(MateriaBase):
    pass

class MateriaRespuesta(MateriaBase):
    model_config = ConfigDict(from_attributes=True)
    mat_id: int
    mat_fk_profesor: int
    mat_activo: bool

class InscripcionSolicitud(BaseModel):
    mat_codigo: str # Para que el alumno se una a una materia

# ======================================================
# 3. ESQUEMAS DE EVALUACIÓN (Sesiones de Quiz)
# ======================================================

class SesionBase(BaseModel):
    ses_nombre_grupo: str
    ses_id_mongo_quiz: str
    ses_puntuacion_tipo: str # "Igual" o "Dificultad"
    ses_fecha_inicio: datetime
    ses_fecha_fin: datetime

class SesionCrear(SesionBase):
    ses_fk_materia: int

class SesionRespuesta(SesionBase):
    model_config = ConfigDict(from_attributes=True)
    ses_id: int
    ses_codigo_acceso: str
    ses_manual_activado: bool
    ses_estatus: str
    ses_activo: bool

# ======================================================
# 4. ESQUEMAS DE RESULTADOS (Validación Offline e Integridad)
# ======================================================

class ResultadoEnvio(BaseModel):
    """Esquema para recibir la nota, incluso si hubo apagón"""
    ses_codigo_acceso: str
    nota_final: float
    puntos_ganados: int
    tiempo_total_ms: int
    informe_fallas: Dict[str, int]
    
    # Control de tiempo corrido e integridad (Crítico para Venezuela)
    hora_inicio_local: datetime   # Cuándo inició en su dispositivo
    finalizado_en_local: datetime # Cuándo marcó la última pregunta
    es_offline: bool = False      # Indica si el envío fue demorado por conexión

class ResultadoRespuesta(BaseModel):
    """Esquema para mostrar resultados en el historial"""
    model_config = ConfigDict(from_attributes=True)
    
    res_id: int
    res_fk_usuario: int
    res_fk_sesion: int
    res_nota_final: float
    res_puntos_ganados_app: int
    res_tiempo_total_ms: Optional[int]
    res_informe_fallas: Optional[Dict[str, Any]]
    
    # Datos de auditoría
    res_hora_inicio_real: datetime
    res_hora_final_real: Optional[datetime]
    res_fecha_sincronizacion: datetime
    res_finalizado_offline: bool