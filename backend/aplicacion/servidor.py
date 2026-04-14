from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importo todas las rutas - login, registro y quices
from aplicacion.rutas import login, registro, usuarios, rutas_quices, quices_mongo

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(login.router)
app.include_router(registro.router)
app.include_router(usuarios.router)
app.include_router(rutas_quices.router)
app.include_router(quices_mongo.router)

@app.get("/")
async def raiz():
    return {"mensaje": "API funcionando"}

# Verificar que MongoDB está conectado (útil para debug)
@app.get("/health")
async def health_check():
    from aplicacion.conexion_bd import coleccion_quices, mongo_client
    
    try:
        if mongo_client:
            await mongo_client.admin.command('ping')
            return {"status": "ok", "mongo": "conectado"}
        else:
            return {"status": "error", "mongo": "no inicializado"}
    except Exception as e:
        return {"status": "error", "mongo": str(e)}