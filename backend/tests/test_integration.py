import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, Mock
import os

# Do not create client here, we'll use the fixture from conftest.py

def test_backend_health(test_client):
    """Test if the backend health endpoint is accessible"""
    response = test_client.get("/health")
    assert response.status_code == 200
    assert "status" in response.json()
    assert response.json()["status"] == "healthy"

@pytest.mark.parametrize("webhook_mode,expected_url", [
    ("test", "http://n8n:5678/webhook-test/returning-user"),
    ("production", "http://n8n:5678/webhook/returning-user"),
    ("invalid", "http://n8n:5678/webhook/returning-user"),  # Should default to production
])
def test_webhook_mode_selection(webhook_mode, expected_url):
    """Test if the correct webhook URL is selected based on N8N_WEBHOOK_MODE"""
    with patch.dict(os.environ, {"N8N_WEBHOOK_MODE": webhook_mode}, clear=True):
        # Reset the module to force environment variable re-evaluation
        import importlib
        import app.routes
        importlib.reload(app.routes)
        from app.routes import N8N_WEBHOOK_URL
        assert N8N_WEBHOOK_URL == expected_url

@pytest.mark.asyncio
async def test_chat_message_flow(test_client, mock_db_service, mock_n8n_service):
    """Test the complete flow of sending a chat message"""
    test_data = {
        "sessionId": "test-session",
        "message": "Hello, bot!"
    }
    
    with patch("app.routes.db_service", mock_db_service), \
         patch("app.routes.n8n_service", mock_n8n_service):
        
        response = test_client.post("/chat/message", json=test_data)
        
        # Verify response
        assert response.status_code == 200
        assert "response" in response.json()
        assert response.json()["response"] == "Test response"
        
        # Verify db and n8n services were called
        mock_db_service.get_or_create_session.assert_called_once()
        mock_db_service.save_message.assert_called()
        mock_n8n_service.send_message.assert_called_once()

@pytest.mark.asyncio
async def test_n8n_unreachable(test_client, mock_db_service, mock_n8n_service):
    """Test behavior when n8n service is unreachable"""
    test_data = {
        "sessionId": "test-session",
        "message": "Hello, bot!"
    }
    
    mock_n8n_service.send_message.side_effect = Exception("Connection refused")
    
    with patch("app.routes.db_service", mock_db_service), \
         patch("app.routes.n8n_service", mock_n8n_service):
        
        response = test_client.post("/chat/message", json=test_data)
        assert response.status_code == 500
        assert "something went wrong" in response.json()["detail"]

@pytest.mark.asyncio
async def test_websocket_connection(test_client, mock_db_service, mock_n8n_service):
    """Test WebSocket connection functionality"""
    with patch("app.socket_events.db_service", mock_db_service), \
         patch("app.socket_events.n8n_service", mock_n8n_service):
        with test_client.websocket_connect("/ws/chat") as websocket:
            data = {"sessionId": "test-session", "message": "Hello, bot!"}
            websocket.send_json(data)
            response = websocket.receive_json()
            assert isinstance(response, dict)
            assert "response" in response
            assert response["response"] == "Test response"
