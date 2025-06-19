import sys
import os
from app.database import engine, Base
from app import create_app
from flask_cors import CORS


# sys.path modification removed; ensure your project uses a proper package structure for imports



app = create_app()
# CORS is configured within create_app; no need to set it here

# Database tables should be managed with migrations (e.g., Alembic) instead of create_all in production.
# Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)