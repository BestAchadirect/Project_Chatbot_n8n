import sys
import os
import logging
from app.database import engine, Base
from app.create_app import create_app
from flask import request

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    app = create_app()
    if app is None:
        raise RuntimeError("create_app returned None. Please check the implementation.")
    logging.info("Application created successfully.")
except Exception as e:
    logging.error(f"Failed to create application: {e}")
    sys.exit(1)

# Create all tables
try:
    Base.metadata.create_all(bind=engine)
    logging.info("Database tables created successfully.")
except Exception as e:
    logging.error(f"Failed to create database tables: {e}")
    sys.exit(1)

# Add logging to verify incoming data
@app.route('/verify-data', methods=['POST'])
def verify_data():
    try:
        data = request.get_json()
        logging.info(f"Received data: {data}")
        return {"status": "success", "data": data}, 200
    except Exception as e:
        logging.error(f"Error receiving data: {e}")
        return {"status": "error", "message": str(e)}, 500

if __name__ == '__main__':
    try:
        app.run(debug=True, host='0.0.0.0', port=5001)
    except Exception as e:
        logging.error(f"Application failed to start: {e}")
