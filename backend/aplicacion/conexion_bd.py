from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

# Hardcodeado temporalmente - ignora el .env
URL_BASE_DATOS = "postgresql://postgres:123@localhost:5432/instituto_metropolitano"

motor = create_engine(URL_BASE_DATOS, echo=True)
SesionLocal = sessionmaker(autocommit=False, autoflush=False, bind=motor)
Base = declarative_base()

def obtener_bd():
    bd = SesionLocal()
    try:
        yield bd
    finally:
        bd.close()