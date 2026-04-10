from pydantic import BaseModel, ConfigDict

class DatosLogin(BaseModel):
    email: str
    password: str

class DatosRegistro(BaseModel):
    nombre: str
    apellido: str
    email: str
    password: str
    tipo: str  # "estudiante" o "profesor" (siempre se crea como alumno)
    imagen: str | None = None 

class UsuarioRespuesta(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    nombre: str
    apellido: str
    email: str
    rol: str
    imagen: str | None = None 

class RespuestaLogin(BaseModel):
    token_acceso: str
    tipo_token: str = "bearer"
    usuario: UsuarioRespuesta