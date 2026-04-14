# Exporto todos los routers para que servidor.py los pueda importar fácil
from . import login
from . import registro
from . import rutas_quices
from . import usuarios
from . import quices_mongo

__all__ = [
    'login',
    'registro', 
    'rutas_quices',
    'usuarios',
    'quices_mongo'
]
