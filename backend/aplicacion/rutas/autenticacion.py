from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from jose import jwt 
from datetime import datetime, timedelta
import os   

from aplicacion.conexion_bd import obtener_bd
from aplicacion.modelos import Usuario, RolUsuario
from aplicacion.esquemas import DatosLogin, DatosRegistro, RespuestaLogin, UsuarioRespuesta

router = APIRouter(prefix="/auth", tags=["Autenticación"])

CLAVE_SECRETA = os.getenv("CLAVE_SECRETA", "clave_cambiar")
ALGORITMO = "HS256"

def crear_token(datos: dict):
    expira = datetime.utcnow() + timedelta(days=1)
    datos.update({"exp": expira})
    return jwt.encode(datos, CLAVE_SECRETA, algorithm=ALGORITMO)
    
@router.post("/login", response_model=RespuestaLogin)
def login(datos: DatosLogin, bd: Session = Depends(obtener_bd)):
    resultado = bd.execute(
        select(Usuario).where(
            Usuario.usu_email == datos.email,
            Usuario.usu_activo == True
        )
    )
    usuario = resultado.scalar_one_or_none()
    
    if not usuario or datos.password != usuario.usu_password_hash:
        raise HTTPException(status_code=400, detail="Credenciales incorrectas")
    
    token = crear_token(datos={"sub": str(usuario.usu_id)})
    
    return RespuestaLogin(
        token_acceso=token,
        usuario=UsuarioRespuesta(
            id=usuario.usu_id,
            nombre=usuario.usu_nombre,
            apellido=usuario.usu_apellido,
            email=usuario.usu_email,
            rol=usuario.usu_rol.value,
            imagen=usuario.usu_imagen
        )
    )

@router.post("/registro", response_model=RespuestaLogin)
def registro(datos: DatosRegistro, bd: Session = Depends(obtener_bd)):
    # Verifica si email ya existe
    resultado = bd.execute(
        select(Usuario).where(Usuario.usu_email == datos.email)
    )
    if resultado.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    # Crea usuario siempre como alumno
    nuevo_usuario = Usuario(
        usu_nombre=datos.nombre,
        usu_apellido=datos.apellido,
        usu_email=datos.email,
        usu_password_hash=datos.password,  
        usu_rol=RolUsuario.alumno,
        usu_imagen=datos.imagen,  
        usu_activo=True
    )
    
    bd.add(nuevo_usuario)
    bd.commit()
    bd.refresh(nuevo_usuario)
    
    token = crear_token(datos={"sub": str(nuevo_usuario.usu_id)})
    
    return RespuestaLogin(
        token_acceso=token,
        usuario=UsuarioRespuesta(
            id=nuevo_usuario.usu_id,
            nombre=nuevo_usuario.usu_nombre,
            apellido=nuevo_usuario.usu_apellido,
            email=nuevo_usuario.usu_email,
            rol=nuevo_usuario.usu_rol.value,
            imagen=nuevo_usuario.usu_imagen
        )
    )