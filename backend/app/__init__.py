from flask import Flask
from flask_cors import CORS
from .config import Config
from .database import db
from .routes import bp, api_routes


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    CORS(api_routes, origins=["http://localhost:3000"])
    CORS(bp, origins=["http://localhost:3000"])
    # Initialize database
    db.init_app(app) 
       
    # Register blueprints
    app.register_blueprint(api_routes)
    app.register_blueprint(bp)
    
    return app

