import random
import string
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from bson import ObjectId  # Necesario para convertir el string a ID de Mongo

# Importamos desde el directorio raíz
from conexion_bd import get_db, coleccion_quices
import modelos 

router = APIRouter(
    prefix="/sesiones",
    tags=["Sesiones de Quiz"]
)

# Función para generar el código de acceso único
def generar_codigo_acceso(longitud=6):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=longitud))

@router.post("/crear")
async def crear_sesion(id_quiz_mongo: str, id_materia: int, db: Session = Depends(get_db)):
    # 1. Validar si el ID de Mongo tiene formato correcto
    try:
        obj_id = ObjectId(id_quiz_mongo)
    except Exception:
        raise HTTPException(status_code=400, detail="El ID de Mongo no es válido")

    # 2. Verificar existencia en MongoDB
    quiz_existente = await coleccion_quices.find_one({"_id": obj_id, "activo": True})
    if not quiz_existente:
        raise HTTPException(status_code=404, detail="El Quiz no existe en la biblioteca de Mongo")

    # 3. Generar código aleatorio único
    codigo = generar_codigo_acceso()

    # 4. Guardar en PostgreSQL (Esquema evaluacion)
    nueva_sesion = modelos.SesionQuiz(
        ses_codigo_acceso=codigo,
        ses_id_quiz_mongo=id_quiz_mongo, # Se guarda como string
        ses_fk_materia=id_materia,
        ses_tipo="Sincrono", # Por defecto
        ses_activo=True
    )

    try:
        db.add(nueva_sesion)
        db.commit()
        db.refresh(nueva_sesion)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al guardar en Postgres: {str(e)}")

    return {
        "status": "success",
        "mensaje": "Sesión de Quiz creada exitosamente",
        "codigo_para_estudiantes": codigo,
        "quiz_titulo": quiz_existente.get("configuracion", {}).get("nombre_quiz")
    }