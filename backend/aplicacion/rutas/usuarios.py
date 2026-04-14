from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from aplicacion.conexion_bd import get_db
from aplicacion.modelos import Usuario, Rol
from aplicacion.esquemas import UsuarioRespuesta

router = APIRouter(prefix="/usuarios", tags=["Gestión de Usuarios"])

@router.get("/", response_model=list[UsuarioRespuesta])
def listar_usuarios(bd: Session = Depends(get_db)):
    """Lista todos los usuarios con su información y rol"""
    resultado = bd.execute(select(Usuario))
    usuarios = resultado.scalars().all()
    
    usuarios_respuesta = []
    for usuario in usuarios:
        # Obtener nombre del rol
        resultado_rol = bd.execute(select(Rol).where(Rol.rol_id == usuario.usu_fk_rol))
        rol = resultado_rol.scalar_one_or_none()
        nombre_rol = rol.rol_nombre if rol else "desconocido"
        
        print(f"Usuario: {usuario.usu_email}, Rol ID: {usuario.usu_fk_rol}, Rol nombre: {nombre_rol}, Activo: {usuario.usu_activo}")
        
        usuarios_respuesta.append(UsuarioRespuesta(
            usu_id=usuario.usu_id,
            usu_nombre=usuario.usu_nombre,
            usu_apellido=usuario.usu_apellido,
            usu_email=usuario.usu_email,
            usu_puntos_app=usuario.usu_puntos_app,
            usu_fk_rol=usuario.usu_fk_rol,
            usu_activo=usuario.usu_activo,
            rol_nombre=nombre_rol,
            usu_imagen=usuario.usu_imagen
        ))
    
    return usuarios_respuesta

@router.get("/{usuario_id}", response_model=UsuarioRespuesta)
def obtener_usuario(usuario_id: int, bd: Session = Depends(get_db)):
    """Obtiene un usuario específico por ID"""
    resultado = bd.execute(select(Usuario).where(Usuario.usu_id == usuario_id))
    usuario = resultado.scalar_one_or_none()
    
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Obtener nombre del rol
    resultado_rol = bd.execute(select(Rol).where(Rol.rol_id == usuario.usu_fk_rol))
    rol = resultado_rol.scalar_one_or_none()
    nombre_rol = rol.rol_nombre if rol else "desconocido"
    
    return UsuarioRespuesta(
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

@router.put("/{usuario_id}", response_model=UsuarioRespuesta)
def actualizar_usuario(usuario_id: int, datos: dict, bd: Session = Depends(get_db)):
    """Actualiza datos de un usuario"""
    resultado = bd.execute(select(Usuario).where(Usuario.usu_id == usuario_id))
    usuario = resultado.scalar_one_or_none()
    
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Actualizar campos permitidos
    if 'usu_nombre' in datos:
        usuario.usu_nombre = datos['usu_nombre']
    if 'usu_apellido' in datos:
        usuario.usu_apellido = datos['usu_apellido']
    if 'usu_email' in datos:
        usuario.usu_email = datos['usu_email']
    if 'usu_fk_rol' in datos:
        usuario.usu_fk_rol = datos['usu_fk_rol']
    if 'usu_activo' in datos:
        usuario.usu_activo = datos['usu_activo']
    if 'usu_imagen' in datos:
        usuario.usu_imagen = datos['usu_imagen']
    
    bd.commit()
    bd.refresh(usuario)
    
    # Obtener nombre del rol
    resultado_rol = bd.execute(select(Rol).where(Rol.rol_id == usuario.usu_fk_rol))
    rol = resultado_rol.scalar_one_or_none()
    nombre_rol = rol.rol_nombre if rol else "desconocido"
    
    return UsuarioRespuesta(
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

@router.delete("/{usuario_id}")
def eliminar_usuario(usuario_id: int, bd: Session = Depends(get_db)):
    """Elimina un usuario"""
    resultado = bd.execute(select(Usuario).where(Usuario.usu_id == usuario_id))
    usuario = resultado.scalar_one_or_none()
    
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    bd.delete(usuario)
    bd.commit()
    
    return {"mensaje": "Usuario eliminado exitosamente"}
