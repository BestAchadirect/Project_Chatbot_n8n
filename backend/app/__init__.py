from flask import Flask
from flask_cors import CORS
from .config import Config
from .database import db, migrate
from .routes import bp, api_routes


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    CORS(app, origins=["http://localhost:3000"])

    # Initialize database
    db.init_app(app)
    migrate.init_app(app, db)

    # Create tables within app context
    with app.app_context():
        db.create_all()

    # Register blueprints
    app.register_blueprint(api_routes)
    app.register_blueprint(bp)
    
    return app

