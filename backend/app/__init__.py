from flask import Flask
from flask_cors import CORS
from .routes import api_routes


def create_app():
    app = Flask(__name__)

    # Allow requests from both localhost and the specific IP
    # CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "http://192.168.101.171:3000"]}})

    CORS(app, resources={r"/*": {"origins": "*"}})  # Allow all origins for development

    app.register_blueprint(api_routes)

    return app

