from fastapi import FastAPI
from rutas import rutas_quices

app = FastAPI()

@app.get("/")
def read_root():
    return {"mensaje": "¡El backend está vivo, Rodmy!"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "q": q}



app.include_router(rutas_quices.router)