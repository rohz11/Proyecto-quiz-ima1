# Project Guidelines

## Code Style
Use Spanish for variable and function names (e.g., `usu_id`, `mat_nombre`), schemas, and UI text. Follow FastAPI/Pydantic conventions for backend models and schemas. For frontend, use TypeScript with Expo Router patterns.

Reference: [backend/aplicacion/modelos.py](backend/aplicacion/modelos.py) for SQLAlchemy models, [backend/aplicacion/esquemas.py](backend/aplicacion/esquemas.py) for Pydantic schemas, [my-app/types/quiz.ts](my-app/types/quiz.ts) for TypeScript types.

## Architecture
Quiz app with FastAPI backend (authentication, session management) and Expo/React Native frontend (mobile UI). Hybrid database: PostgreSQL for relational data (users, roles, evaluations), MongoDB for flexible quiz content. Backend handles data persistence; frontend manages UI and API calls.

Boundaries: Single FastAPI app with routers for auth and quizzes. No microservices.

## Build and Test
### Backend
- Activate venv: `backend\aplicacion\env\Scripts\activate` (Windows)
- Install: `pip install -r backend/aplicacion/requirements.txt`
- Run: `uvicorn backend.aplicacion.servidor:app --reload` (from project root)

### Frontend
- Install: `cd my-app && npm install`
- Run: `npm start` or `npx expo start`

No automated tests present.

## Conventions
- Database connections loaded from `.env` (DATABASE_URL for Postgres, MONGO_URL for Mongo). Create `.env` manually.
- API base URL hardcoded in frontend (`http://192.168.1.9:8000`); update for different environments.
- Use provided DB templates for setup: [plantillas de BD/base_de_datos_sql.sql](plantillas de BD/base_de_datos_sql.sql) for Postgres, [plantillas de BD/quiz_base_mongo.json](plantillas de BD/quiz_base_mongo.json) for Mongo.
- For DB connection testing, see [.github/skills/database-connection-testing/SKILL.md](.github/skills/database-connection-testing/SKILL.md)