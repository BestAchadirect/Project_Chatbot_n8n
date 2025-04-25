import sys
import os
from app.database import engine, Base


sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.__init__ import create_app

app = create_app()

# Create all tables
Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    app.run(debug=True)