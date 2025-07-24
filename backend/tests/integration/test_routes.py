"""
Integration tests for API routes.
Tests the complete request/response cycle with mocked external services.
"""

import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from datetime import datetime, timezone

from .conftest import (
    TEST_SESSION_ID,
    TEST_USER_ID,
    TEST_MESSAGE,
    SAMPLE_CHAT_SESSION,
    SAMPLE_CHAT_MESSAGE,
    assert_json_response
)

class TestChatEndpoints:
    """Test suite for chat-related endpoints."""

    def test_chat_message_success(self, test_client, mock_db_service, mock_n8n_service):
        """Test successful message handling"""
        with patch('app.routes.db_service', mock_db_service), \
             patch('app.routes.n8n_service', mock_n8n_service):
            
            response = test_client.post(
                "/chat/message",
                json={
                    "sessionId": TEST_SESSION_ID,
                    "message": TEST_MESSAGE
                }
            )

            assert_json_response(response, 200)
            assert "response" in response.json()
            mock_db_service.get_or_create_session.assert_called_once_with(TEST_SESSION_ID)
            mock_db_service.save_message.assert_called()
            mock_n8n_service.send_message.assert_called_once()

    def test_chat_message_missing_data(self, test_client):
        """Test handling of missing message data"""
        response = test_client.post(
            "/chat/message",
            json={"sessionId": TEST_SESSION_ID}  # Missing message
        )
        assert_json_response(response, 400)

    def test_chat_message_n8n_error(self, test_client, mock_db_service, mock_n8n_service):
        """Test handling of n8n service error"""
        mock_n8n_service.send_message.side_effect = Exception("N8N Error")
        
        with patch('app.routes.db_service', mock_db_service), \
             patch('app.routes.n8n_service', mock_n8n_service):
            
            response = test_client.post(
                "/chat/message",
                json={
                    "sessionId": TEST_SESSION_ID,
                    "message": TEST_MESSAGE
                }
            )

            assert_json_response(response, 500)
            assert "something went wrong" in response.json()["detail"]

class TestSessionEndpoints:
    """Test suite for session-related endpoints."""

    def test_get_chat_sessions(self, test_client, mock_db_service):
        """Test retrieving chat sessions"""
        mock_db_service.client.table().select().eq().order().execute.return_value.data = [SAMPLE_CHAT_SESSION]
        
        with patch('app.routes.db_service', mock_db_service):
            response = test_client.get(f"/chat/sessions?user_id={TEST_USER_ID}")
            
            assert_json_response(response, 200)
            sessions = response.json()["sessions"]
            assert len(sessions) == 1
            assert sessions[0]["session_id"] == TEST_SESSION_ID

    def test_get_chat_sessions_missing_user(self, test_client):
        """Test sessions request without user_id"""
        response = test_client.get("/chat/sessions")
        assert_json_response(response, 400)

    def test_get_chat_messages(self, test_client, mock_db_service):
        """Test retrieving chat messages"""
        mock_db_service.get_session_messages.return_value = [SAMPLE_CHAT_MESSAGE]
        
        with patch('app.routes.db_service', mock_db_service):
            response = test_client.get(f"/chat/messages/{TEST_SESSION_ID}")
            
            assert_json_response(response, 200)
            messages = response.json()["messages"]
            assert len(messages) == 1
            assert messages[0]["message"] == TEST_MESSAGE

    def test_end_chat_session_success(self, test_client, mock_db_service):
        """Test successfully ending a chat session"""
        mock_db_service.end_session.return_value = True
        
        with patch('app.routes.db_service', mock_db_service):
            response = test_client.post(f"/chat/session/{TEST_SESSION_ID}/end")
            
            assert_json_response(response, 200)
            assert "Session ended successfully" in response.json()["message"]

    def test_end_chat_session_not_found(self, test_client, mock_db_service):
        """Test ending non-existent session"""
        mock_db_service.end_session.return_value = False
        
        with patch('app.routes.db_service', mock_db_service):
            response = test_client.post(f"/chat/session/{TEST_SESSION_ID}/end")
            
            assert_json_response(response, 404)
            assert "Session not found" in response.json()["detail"]

class TestHealthEndpoint:
    """Test suite for health check endpoint."""

    def test_health_check(self, test_client):
        """Test health check endpoint"""
        response = test_client.get("/health")
        
        assert_json_response(response, 200)
        assert response.json()["status"] == "healthy"
        assert "timestamp" in response.json()
