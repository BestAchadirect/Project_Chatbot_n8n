from flask import Flask
from flask_cors import CORS
from .routes import api_routes

def create_app():
    app = Flask(__name__)
    # Allow requests from http://localhost:3000
    CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

    app.register_blueprint(api_routes)
    
    return app
