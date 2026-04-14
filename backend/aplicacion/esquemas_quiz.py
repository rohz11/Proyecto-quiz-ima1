"""
Esquemas para validar los quices antes de guardarlos en MongoDB
Estos esquemas se utilizan para definir la estructura de los datos que se almacenan en la base de datos de MongoDB.
Los hice con Pydantic para que FastAPI valide automáticamente los datos antes de guardarlos.
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from bson import ObjectId


class Respuesta(BaseModel):
    texto: str
    es_correcta: bool = False


class Pregunta(BaseModel):
    nro_orden: int
    tipo: str
    categoria: Optional[str] = None
    enunciado: str
    multimedia: Optional[dict] = None
    puntos_si_es_dificultad: float = 10.0
    tiempo_limite_segundos: int = 20
    opciones: List[Respuesta]


class MetadatosQuiz(BaseModel):
    titulo: str
    tema: Optional[str] = None
    recompensa_puntos_app: int = 0
    imagen_portada: Optional[str] = None
    autor_id: int
    fecha_creacion: datetime = Field(default_factory=datetime.utcnow)


class QuizCrear(BaseModel):
    metadatos: MetadatosQuiz
    preguntas: List[Pregunta]


class QuizRespuesta(QuizCrear):
    id: str = Field(alias="_id")
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str, datetime: lambda v: v.isoformat()}
