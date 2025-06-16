import sys
import os
from app.database import engine, Base
from app.__init__ import create_app


sys.path.append(os.path.dirname(os.path.abspath(__file__)))



from flask_cors import CORS

app = create_app()
CORS(app, origins=["http://localhost:5000"])  # Adjust the origin as needed

# Create all tables
Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)