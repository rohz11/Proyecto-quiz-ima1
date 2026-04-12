import os
import motor.motor_asyncio
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# --- CONFIGURACIÓN POSTGRESQL (SQLAlchemy) ---
DATABASE_URL = os.getenv("DATABASE_URL")

# Motor de conexión con pool_pre_ping para evitar desconexiones
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# Sesión local
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para modelos
Base = declarative_base()

# --- CONFIGURACIÓN MONGODB (Motor) ---
MONGO_URL = os.getenv("MONGO_URL")
mongo_client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)

# Sincronizado con tus nombres: base de datos y colección
db_mongo = mongo_client.quiz_base_mongo 
coleccion_quices = db_mongo.quices 

# Dependencia para obtener la DB en las rutas
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

print("✅ Conexiones a Postgres y MongoDB (quiz_base_mongo/quices) listas.")