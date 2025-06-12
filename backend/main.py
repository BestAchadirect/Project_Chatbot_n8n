import sys
import os
from app.create_app import create_app
from flask_cors import CORS
from dotenv import load_dotenv

# Import your api_routes blueprint
from app.api_routes import api_routes

# Load environment variables from .env file
load_dotenv(os.path.join(os.path.dirname(__file__), '../workflows/.env'))
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    app = create_app()
    if app is None:
        raise RuntimeError("create_app returned None. Please check the implementation.")
    # Register blueprint after app is created
    app.register_blueprint(api_routes, url_prefix="/api")
    # Enable CORS for the Flask application with dynamic origins
    cors_origins = os.getenv("N8N_CORS_ALLOW_ORIGIN", "*").split(",")
    CORS(app, resources={r"/*": {"origins": cors_origins}})
except Exception as e:
    print(f"Failed to create application: {e}")
    sys.exit(1)

if __name__ == '__main__':
    try:
        app.run(debug=True, host='0.0.0.0', port=5001)
    except Exception as e:
        print(f"Application failed to start: {e}")