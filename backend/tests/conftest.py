"""
Test utilities and fixtures for the chat application tests.
"""

import os
import pytest
from datetime import datetime, timezone
from typing import Generator
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch, AsyncMock
from dotenv import load_dotenv

# Load test environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '.env.test'))

from app.main import app
from app.services.database import DatabaseService
from app.services.n8n import N8NService

@pytest.fixture
def test_client() -> Generator:
    """
    Create a test client for the FastAPI application.
    
    Yields:
        TestClient: FastAPI test client
    """
    with TestClient(app) as client:
        yield client

@pytest.fixture
def mock_db_service():
    """
    Create a mock database service.
    
    Returns:
        Mock: Mocked database service
    """
    mock_db = Mock(spec=DatabaseService)
    mock_db.get_or_create_session = AsyncMock(return_value=None)
    mock_db.save_message = AsyncMock(return_value=None)
    return mock_db

@pytest.fixture
def mock_n8n_service():
    """
    Create a mock n8n service.
    
    Returns:
        Mock: Mocked n8n service
    """
    mock_n8n = Mock(spec=N8NService)
    mock_n8n.send_message = AsyncMock(return_value={"response": "Test response"})
    mock_n8n.extract_bot_message.return_value = "Test response"
    return mock_n8n

def get_test_timestamp() -> str:
    """
    Get a consistent timestamp for testing.
    
    Returns:
        str: ISO format timestamp
    """
    return datetime.now(timezone.utc).isoformat()

# Sample test data
TEST_SESSION_ID = "test_session_123"
TEST_USER_ID = "test_user_123"
TEST_MESSAGE = "Hello, bot!"

SAMPLE_CHAT_SESSION = {
    "session_id": TEST_SESSION_ID,
    "user_id": TEST_USER_ID,
    "started_at": get_test_timestamp(),
    "ended_at": None
}

SAMPLE_CHAT_MESSAGE = {
    "message_id": "msg_123",
    "session_id": TEST_SESSION_ID,
    "sender": "user",
    "message": TEST_MESSAGE,
    "timestamp": get_test_timestamp()
}

def assert_json_response(response, expected_status: int):
    """
    Assert that a response has the expected status code and is JSON.
    
    Args:
        response: FastAPI response
        expected_status (int): Expected HTTP status code
    """
    assert response.status_code == expected_status
    assert response.headers["content-type"] == "application/json"
