from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware



from aplicacion.rutas import autenticacion  

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(autenticacion.router)

@app.get("/")
async def raiz():
    return {"mensaje": "API funcionando"}