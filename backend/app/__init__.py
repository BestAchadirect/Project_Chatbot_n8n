from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
from .routes import api_routes

# Initialize SocketIO
socketio = SocketIO(cors_allowed_origins="*")

def create_app():
    app = Flask(__name__)
    
    # Configure app
    app.config['SECRET_KEY'] = 'your-secret-key-here'  # Change this in production
    
    # Allow requests from both localhost and the specific IP
    # CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "http://192.168.101.171:3000"]}})

    CORS(app, resources={r"/*": {"origins": "*"}})  # Allow all origins for development

    # Register blueprints
    app.register_blueprint(api_routes)
    
    # Initialize SocketIO with the app
    socketio.init_app(app, cors_allowed_origins="*")
    
    # Import and register socket events
    from . import socket_events
    
    return app

