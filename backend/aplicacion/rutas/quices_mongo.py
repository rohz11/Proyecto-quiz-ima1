"""
Aquí están todos los endpoints para los quices en MongoDB
POST, GET, PUT, DELETE - todo el CRUD básico
"""
from fastapi import APIRouter, HTTPException, status
from bson import ObjectId
from datetime import datetime
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from aplicacion.conexion_bd import coleccion_quices
from aplicacion.esquemas_quiz import QuizCrear, QuizRespuesta

router = APIRouter(prefix="/quices", tags=["Quices MongoDB"])

# Verificar que la colección esté disponible
if coleccion_quices is None:
    logger.error("❌ ERROR: coleccion_quices es None - MongoDB no inicializado")
else:
    logger.info("✅ coleccion_quices inicializada correctamente")


def quiz_helper(quiz) -> dict:
    """Convierte un documento MongoDB a dict con ID string"""
    return {
        "_id": str(quiz["_id"]),
        "metadatos": quiz.get("metadatos", {}),
        "preguntas": quiz.get("preguntas", [])
    }


@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def crear_quiz(quiz: QuizCrear):
    """
    Guarda un quiz nuevo en MongoDB
    Le llega el título, tema, autor y las preguntas desde el frontend
    """
    logger.info(f"📝 POST /quices/ - Creando quiz: {quiz.metadatos.titulo}")
    logger.info(f"📝 Autor ID: {quiz.metadatos.autor_id}")
    logger.info(f"📝 Cantidad de preguntas: {len(quiz.preguntas)}")
    
    # Verificar que la colección esté disponible
    if coleccion_quices is None:
        logger.error("❌ coleccion_quices es None - No se puede guardar")
        raise HTTPException(status_code=500, detail="Error de conexión con MongoDB")
    
    try:
        quiz_dict = quiz.model_dump()
        quiz_dict["metadatos"]["fecha_creacion"] = datetime.utcnow()
        
        logger.info(f"📝 Insertando en MongoDB...")
        result = await coleccion_quices.insert_one(quiz_dict)
        
        logger.info(f"✅ Quiz creado con ID: {result.inserted_id}")
        return {
            "status": "success",
            "mensaje": "Quiz creado exitosamente",
            "quiz_id": str(result.inserted_id)
        }
    except Exception as e:
        logger.error(f"❌ ERROR al crear quiz: {str(e)}")
        logger.error(f"❌ Tipo de error: {type(e).__name__}")
        raise HTTPException(status_code=500, detail=f"Error al guardar quiz: {str(e)}")


@router.get("/")
async def listar_quices(autor_id: int = None):
    """
    Devuelve todos los quices de un autor
    Lo usa la biblioteca para mostrar los quices del profesor logueado
    """
    logger.info(f"📋 GET /quices/ - autor_id: {autor_id}")
    
    if coleccion_quices is None:
        logger.error("❌ coleccion_quices es None")
        raise HTTPException(status_code=500, detail="Error de conexión con MongoDB")
    
    try:
        query = {}
        if autor_id:
            query["metadatos.autor_id"] = autor_id
        
        quices = await coleccion_quices.find(query).to_list(length=100)
        logger.info(f"📋 Encontrados {len(quices)} quices")
        
        resultado = []
        for quiz in quices:
            metadatos = quiz.get("metadatos", {})
            resultado.append({
                "_id": str(quiz["_id"]),
                "titulo": metadatos.get("titulo", "Sin título"),
                "tema": metadatos.get("tema"),
                "imagen_portada": metadatos.get("imagen_portada"),
                "fecha_creacion": metadatos.get("fecha_creacion"),
                "cantidad_preguntas": len(quiz.get("preguntas", []))
            })
        
        return {"quices": resultado}
    except Exception as e:
        logger.error(f"❌ ERROR listando quices: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al listar quices: {str(e)}")


@router.get("/{quiz_id}")
async def obtener_quiz(quiz_id: str):
    """Obtener un quiz completo por su ID"""
    try:
        obj_id = ObjectId(quiz_id)
    except:
        raise HTTPException(status_code=400, detail="ID inválido")
    
    quiz = await coleccion_quices.find_one({"_id": obj_id})
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz no encontrado")
    
    return quiz_helper(quiz)


@router.put("/{quiz_id}")
async def actualizar_quiz(quiz_id: str, quiz: QuizCrear):
    """Actualizar un quiz existente"""
    try:
        obj_id = ObjectId(quiz_id)
    except:
        raise HTTPException(status_code=400, detail="ID inválido")
    
    quiz_dict = quiz.model_dump()
    quiz_dict["metadatos"]["fecha_actualizacion"] = datetime.utcnow()
    
    result = await coleccion_quices.update_one(
        {"_id": obj_id},
        {"$set": quiz_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Quiz no encontrado")
    
    return {"status": "success", "mensaje": "Quiz actualizado"}


@router.delete("/{quiz_id}")
async def eliminar_quiz(quiz_id: str):
    """Borra un quiz por ID - esto lo llamo desde el frontend cuando el profe confirma"""
    try:
        obj_id = ObjectId(quiz_id)
    except:
        raise HTTPException(status_code=400, detail="ID inválido")
    
    result = await coleccion_quices.delete_one({"_id": obj_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Quiz no encontrado")
    
    return {"status": "success", "mensaje": "Quiz eliminado"}
