"""
Unit tests for n8n service.
Tests n8n webhook integration in isolation.
"""

import pytest
from unittest.mock import Mock, patch
import requests

from app.services.n8n import N8NService
from ..conftest import TEST_SESSION_ID, TEST_MESSAGE

class TestN8NService:
    """Test suite for N8NService."""

    @pytest.fixture
    def n8n_service(self):
        """Create N8NService instance"""
        with patch.dict('os.environ', {
            'N8N_WEBHOOK_MODE': 'test',
            'N8N_WEBHOOK_URL_TEST': 'http://test-n8n:5678/webhook-test',
            'N8N_WEBHOOK_URL_PRODUCTION': 'http://prod-n8n:5678/webhook'
        }):
            return N8NService()

    def test_get_webhook_url_test_mode(self):
        """Test webhook URL selection in test mode"""
        with patch.dict('os.environ', {
            'N8N_WEBHOOK_MODE': 'test',
            'N8N_WEBHOOK_URL_TEST': 'http://test-url'
        }):
            service = N8NService()
            assert 'test-url' in service.webhook_url

    def test_get_webhook_url_production_mode(self):
        """Test webhook URL selection in production mode"""
        with patch.dict('os.environ', {
            'N8N_WEBHOOK_MODE': 'production',
            'N8N_WEBHOOK_URL_PRODUCTION': 'http://prod-url'
        }):
            service = N8NService()
            assert 'prod-url' in service.webhook_url

    def test_get_webhook_url_default_mode(self):
        """Test webhook URL selection with invalid mode"""
        with patch.dict('os.environ', {
            'N8N_WEBHOOK_MODE': 'invalid',
            'N8N_WEBHOOK_URL_PRODUCTION': 'http://prod-url'
        }):
            service = N8NService()
            assert 'prod-url' in service.webhook_url

    def test_send_message_success(self, n8n_service):
        """Test successful message sending"""
        mock_response = Mock()
        mock_response.json.return_value = {"response": "Test response"}
        
        with patch('requests.post', return_value=mock_response):
            response = n8n_service.send_message(TEST_SESSION_ID, TEST_MESSAGE)
            
            assert response == {"response": "Test response"}

    def test_send_message_network_error(self, n8n_service):
        """Test handling of network error"""
        with patch('requests.post', side_effect=requests.RequestException):
            with pytest.raises(requests.RequestException):
                n8n_service.send_message(TEST_SESSION_ID, TEST_MESSAGE)

    def test_send_message_timeout(self, n8n_service):
        """Test handling of timeout"""
        with patch('requests.post', side_effect=requests.Timeout):
            with pytest.raises(requests.Timeout):
                n8n_service.send_message(TEST_SESSION_ID, TEST_MESSAGE)

    def test_extract_bot_message_direct_response(self):
        """Test message extraction from direct response"""
        response = {"response": "Direct message"}
        message = N8NService().extract_bot_message(response)
        assert message == "Direct message"

    def test_extract_bot_message_markdown(self):
        """Test message extraction from markdown field"""
        response = {"markdown": "Markdown message"}
        message = N8NService().extract_bot_message(response)
        assert message == "Markdown message"

    def test_extract_bot_message_nested(self):
        """Test message extraction from nested data"""
        response = {"data": {"response": "Nested message"}}
        message = N8NService().extract_bot_message(response)
        assert message == "Nested message"

    def test_extract_bot_message_invalid(self):
        """Test message extraction from invalid response"""
        response = {"invalid": "format"}
        message = N8NService().extract_bot_message(response)
        assert message is None
