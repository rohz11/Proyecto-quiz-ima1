from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from rutas import rutas_quices, quices_mongo

app = FastAPI()

# CORS para permitir llamadas desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"mensaje": "¡El backend está vivo!", "status": "ok"}

@app.get("/health")
async def health_check():
    """Verificar estado de las conexiones"""
    from conexion_bd import coleccion_quices, mongo_client
    
    mongo_status = "ok"
    mongo_error = None
    
    try:
        if mongo_client:
            await mongo_client.admin.command('ping')
        else:
            mongo_status = "error"
            mongo_error = "Cliente MongoDB no inicializado"
    except Exception as e:
        mongo_status = "error"
        mongo_error = str(e)
    
    return {
        "status": "ok" if mongo_status == "ok" else "error",
        "mongo": {
            "status": mongo_status,
            "error": mongo_error,
            "coleccion_quices": "ok" if coleccion_quices is not None else "error"
        }
    }

# Routers
app.include_router(rutas_quices.router)
app.include_router(quices_mongo.router)