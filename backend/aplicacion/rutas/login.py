import os
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from jose import jwt
import bcrypt

from aplicacion.conexion_bd import get_db
from aplicacion.modelos import Usuario, Rol
from aplicacion.esquemas import DatosLogin, RespuestaLogin, UsuarioRespuesta

router = APIRouter(prefix="/auth", tags=["Autenticación"])

# --- CONFIGURACIÓN DE SEGURIDAD ---
CLAVE_SECRETA = os.getenv("CLAVE_SECRETA", "clave_extremadamente_secreta_123")
ALGORITMO = "HS256"

# Helpers de seguridad con bcrypt directamente
def verificar_password(password_plana, password_hasheada):
    password_bytes = password_plana.encode('utf-8')[:72]
    hash_bytes = password_hasheada.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hash_bytes)

def crear_token(datos: dict):
    # Expira en 1 día
    expira = datetime.utcnow() + timedelta(days=1)
    to_encode = datos.copy()
    to_encode.update({"exp": expira})
    return jwt.encode(to_encode, CLAVE_SECRETA, algorithm=ALGORITMO)

@router.post("/login", response_model=RespuestaLogin)
def login(datos: DatosLogin, bd: Session = Depends(get_db)):
    print(f"Intento de login: email={datos.email}")
    
    resultado = bd.execute(
        select(Usuario).where(
            Usuario.usu_email == datos.email,
            Usuario.usu_activo == True
        )
    )
    usuario = resultado.scalar_one_or_none()
    
    print(f"Usuario encontrado: {usuario is not None}")
    
    if not usuario:
        print("Usuario no encontrado o inactivo")
        raise HTTPException(status_code=400, detail="Credenciales incorrectas")
    
    print(f"Usuario activo: {usuario.usu_activo}")
    
    # VALIDACIÓN SEGURA: Usamos verificar_password en lugar de !=
    if not verificar_password(datos.password, usuario.usu_password_hash):
        print("Contraseña incorrecta")
        raise HTTPException(status_code=400, detail="Credenciales incorrectas")
    
    print("Contraseña correcta")
    
    token = crear_token(datos={"sub": str(usuario.usu_id)})
    
    # Obtener el nombre del rol desde la base de datos
    resultado_rol = bd.execute(select(Rol).where(Rol.rol_id == usuario.usu_fk_rol))
    rol = resultado_rol.scalar_one_or_none()
    nombre_rol = rol.rol_nombre if rol else "desconocido"
    
    print(f"Rol del usuario: {nombre_rol}")
    
    return RespuestaLogin(
        token_acceso=token,
        usuario=UsuarioRespuesta(
            usu_id=usuario.usu_id,
            usu_nombre=usuario.usu_nombre,
            usu_apellido=usuario.usu_apellido,
            usu_email=usuario.usu_email,
            usu_puntos_app=usuario.usu_puntos_app,
            usu_fk_rol=usuario.usu_fk_rol,
            usu_activo=usuario.usu_activo,
            rol_nombre=nombre_rol,
            usu_imagen=usuario.usu_imagen
        )
    )
