"""
Unit tests for database service.
Tests database operations in isolation.
"""

import pytest
from unittest.mock import Mock, patch
from datetime import datetime, timezone

from app.services.database import DatabaseService
from ..conftest import (
    TEST_SESSION_ID,
    TEST_USER_ID,
    TEST_MESSAGE,
    SAMPLE_CHAT_SESSION,
    SAMPLE_CHAT_MESSAGE
)

class TestDatabaseService:
    """Test suite for DatabaseService."""

    @pytest.fixture
    def mock_supabase(self):
        """Create mock Supabase client"""
        return Mock()

    @pytest.fixture
    def db_service(self, mock_supabase):
        """Create DatabaseService with mock Supabase"""
        with patch('app.services.database.create_client', return_value=mock_supabase):
            return DatabaseService('test_url', 'test_key')

    def test_get_or_create_session_existing(self, db_service, mock_supabase):
        """Test retrieving existing session"""
        mock_supabase.table().select().eq().execute.return_value.data = [SAMPLE_CHAT_SESSION]
        
        db_service.get_or_create_session(TEST_SESSION_ID)
        
        mock_supabase.table.assert_called_with('chat_sessions')
        mock_supabase.table().insert.assert_not_called()

    def test_get_or_create_session_new(self, db_service, mock_supabase):
        """Test creating new session"""
        mock_supabase.table().select().eq().execute.return_value.data = []
        
        db_service.get_or_create_session(TEST_SESSION_ID)
        
        mock_supabase.table().insert.assert_called_once()
        insert_data = mock_supabase.table().insert.call_args[0][0]
        assert insert_data['session_id'] == TEST_SESSION_ID
        assert insert_data['user_id'].startswith('user_')

    def test_save_message(self, db_service, mock_supabase):
        """Test saving chat message"""
        db_service.save_message(TEST_SESSION_ID, 'user', TEST_MESSAGE)
        
        mock_supabase.table.assert_called_with('chat_messages')
        mock_supabase.table().insert.assert_called_once()
        insert_data = mock_supabase.table().insert.call_args[0][0]
        assert insert_data['session_id'] == TEST_SESSION_ID
        assert insert_data['sender'] == 'user'
        assert insert_data['message'] == TEST_MESSAGE

    def test_get_session_messages(self, db_service, mock_supabase):
        """Test retrieving session messages"""
        mock_supabase.table().select().eq().order().execute.return_value.data = [SAMPLE_CHAT_MESSAGE]
        
        messages = db_service.get_session_messages(TEST_SESSION_ID)
        
        assert len(messages) == 1
        assert messages[0].message == TEST_MESSAGE
        assert messages[0].sender == 'user'

    def test_end_session(self, db_service, mock_supabase):
        """Test ending chat session"""
        mock_supabase.table().update().eq().execute.return_value.data = [SAMPLE_CHAT_SESSION]
        
        result = db_service.end_session(TEST_SESSION_ID)
        
        assert result is True
        mock_supabase.table().update.assert_called_once()
