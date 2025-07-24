"""
WebSocket events module for chat application.
Handles real-time communication features like typing indicators and live updates.
"""

from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, Set
from datetime import datetime

class ConnectionManager:
    """
    Manages WebSocket connections and broadcasts.
    Handles connection lifecycle and message distribution.
    """
    
    def __init__(self):
        """Initialize connection manager with empty connection pools."""
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, session_id: str):
        """
        Accept a new WebSocket connection.
        
        Args:
            websocket (WebSocket): The WebSocket connection
            session_id (str): Chat session identifier
        """
        await websocket.accept()
        if session_id not in self.active_connections:
            self.active_connections[session_id] = set()
        self.active_connections[session_id].add(websocket)

    def disconnect(self, websocket: WebSocket, session_id: str):
        """
        Remove a WebSocket connection.
        
        Args:
            websocket (WebSocket): The WebSocket connection
            session_id (str): Chat session identifier
        """
        if session_id in self.active_connections:
            self.active_connections[session_id].remove(websocket)
            if not self.active_connections[session_id]:
                del self.active_connections[session_id]

    async def broadcast_to_session(self, message: dict, session_id: str):
        """
        Broadcast message to all connections in a session.
        
        Args:
            message (dict): Message to broadcast
            session_id (str): Target session identifier
        """
        if session_id in self.active_connections:
            for connection in self.active_connections[session_id]:
                await connection.send_json(message)

# Initialize connection manager
manager = ConnectionManager()

async def websocket_endpoint(websocket: WebSocket):
    """
    Handle WebSocket connections and messages.
    Currently used for typing indicators and connection status.
    
    Args:
        websocket (WebSocket): The WebSocket connection
    """
    session_id = None
    
    try:
        # Accept initial connection
        await websocket.accept()
        
        # Get session information
        data = await websocket.receive_json()
        session_id = data.get('sessionId')
        
        if not session_id:
            await websocket.close(code=1003)  # 1003 = Unsupported data
            return
            
        # Register connection
        await manager.connect(websocket, session_id)
        
        # Notify session of connection
        await manager.broadcast_to_session({
            'type': 'connection',
            'status': 'connected',
            'timestamp': datetime.now().isoformat()
        }, session_id)
        
        # Main message loop
        while True:
            data = await websocket.receive_json()
            if data.get('type') == 'typing':
                # Broadcast typing status
                await manager.broadcast_to_session({
                    'type': 'typing',
                    'sender': data.get('sender'),
                    'timestamp': datetime.now().isoformat()
                }, session_id)
                
    except WebSocketDisconnect:
        if session_id:
            manager.disconnect(websocket, session_id)
            await manager.broadcast_to_session({
                'type': 'connection',
                'status': 'disconnected',
                'timestamp': datetime.now().isoformat()
            }, session_id)
    except Exception as e:
        print(f"WebSocket error: {e}")
        if session_id:
            manager.disconnect(websocket, session_id)