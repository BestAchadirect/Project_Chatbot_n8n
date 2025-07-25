import sys
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import router as api_router
from app.socket_events import websocket_endpoint

app = FastAPI()

<<<<<<< HEAD
# Configure CORS - Allow all origins in development
origins = [
    "http://192.168.101.63:3000",
    "http://localhost:3000",
    "http://localhost:5001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
=======
# Allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
>>>>>>> c1f9070ccb7a29111fee9de0911e64545c5cae06
)

# Include API routes
app.include_router(api_router)

# Add websocket route
app.add_api_websocket_route("/ws/chat", websocket_endpoint)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001, reload=True)
