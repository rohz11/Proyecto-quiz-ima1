import os
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from jose import jwt
import bcrypt

from aplicacion.conexion_bd import get_db
from aplicacion.modelos import Usuario, Rol
from aplicacion.esquemas import DatosRegistro, RespuestaLogin, UsuarioRespuesta

router = APIRouter(prefix="/auth", tags=["Autenticación"])

# --- CONFIGURACIÓN DE SEGURIDAD ---
CLAVE_SECRETA = os.getenv("CLAVE_SECRETA", "clave_extremadamente_secreta_123")
ALGORITMO = "HS256"

# Helpers de seguridad con bcrypt directamente
def hashear_password(password):
    # bcrypt tiene un límite de 72 bytes, truncamos si es necesario
    password_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password_bytes, salt).decode('utf-8')

def crear_token(datos: dict):
    # Expira en 1 día
    expira = datetime.utcnow() + timedelta(days=1)
    to_encode = datos.copy()
    to_encode.update({"exp": expira})
    return jwt.encode(to_encode, CLAVE_SECRETA, algorithm=ALGORITMO)

@router.post("/registro", response_model=RespuestaLogin)
def registro(datos: DatosRegistro, bd: Session = Depends(get_db)):
    # Verifica si email ya existe
    resultado = bd.execute(
        select(Usuario).where(Usuario.usu_email == datos.email)
    )
    usuario_existente = resultado.scalar_one_or_none()
    if usuario_existente:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    # Buscar el rol de alumno
    resultado_rol = bd.execute(select(Rol).where(Rol.rol_nombre == "alumno"))
    rol_alumno = resultado_rol.scalar_one_or_none()
    
    if not rol_alumno:
        raise HTTPException(status_code=400, detail="El rol de alumno no existe")
    else:
        rol_id = rol_alumno.rol_id
    
    # Crea usuario con PASSWORD HASHEADA
    nuevo_usuario = Usuario(
        usu_nombre=datos.nombre,
        usu_apellido=datos.apellido,
        usu_email=datos.email,
        usu_password_hash=hashear_password(datos.password),
        usu_fk_rol=rol_id,
        usu_imagen=datos.imagen,
        usu_activo=True
    )
    
    bd.add(nuevo_usuario)
    bd.commit()
    bd.refresh(nuevo_usuario)
    
    token = crear_token(datos={"sub": str(nuevo_usuario.usu_id)})
    
    # Obtener el nombre del rol desde la base de datos
    resultado_rol = bd.execute(select(Rol).where(Rol.rol_id == nuevo_usuario.usu_fk_rol))
    rol = resultado_rol.scalar_one_or_none()
    nombre_rol = rol.rol_nombre if rol else "desconocido"
    
    return RespuestaLogin(
        token_acceso=token,
        usuario=UsuarioRespuesta(
            usu_id=nuevo_usuario.usu_id,
            usu_nombre=nuevo_usuario.usu_nombre,
            usu_apellido=nuevo_usuario.usu_apellido,
            usu_email=nuevo_usuario.usu_email,
            usu_puntos_app=nuevo_usuario.usu_puntos_app,
            usu_fk_rol=nuevo_usuario.usu_fk_rol,
            usu_activo=nuevo_usuario.usu_activo,
            rol_nombre=nombre_rol,
            usu_imagen=nuevo_usuario.usu_imagen
        )
    )
