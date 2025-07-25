"""
N8N service module for chat application.
Handles all interactions with the n8n workflow engine.
"""

import os
import requests
from typing import Optional, Dict, Any

class N8NService:
    """
    Service class for handling all n8n webhook interactions.
    Manages different webhook modes and response processing.
    """
    
    def __init__(self):
        """Initialize n8n service with environment-based configuration."""
        self.mode = os.getenv('N8N_WEBHOOK_MODE', 'production')
        self.webhook_url = self._get_webhook_url()

    def _get_webhook_url(self) -> str:
        """
        Get the appropriate webhook URL based on mode.
        
        Returns:
            str: The webhook URL to use
        """
        if self.mode == 'test':
            return os.getenv('N8N_WEBHOOK_URL_TEST', 'http://n8n:5678/webhook-test/returning-user')
        return os.getenv('N8N_WEBHOOK_URL_PRODUCTION', 'http://n8n:5678/webhook/returning-user')

<<<<<<< HEAD
    async def send_message(self, session_id: str, message: str) -> Dict[str, Any]:
=======
    def send_message(self, session_id: str, message: str) -> Dict[str, Any]:
>>>>>>> c1f9070ccb7a29111fee9de0911e64545c5cae06
        """
        Send message to n8n webhook.
        
        Args:
            session_id (str): Session identifier
            message (str): Message to send
            
        Returns:
            Dict[str, Any]: Processed response from n8n
            
        Raises:
<<<<<<< HEAD
            Exception: If the request fails
        """
        try:
            from httpx import AsyncClient
            async with AsyncClient() as client:
                response = await client.post(
                    self.webhook_url,
                    json={'sessionId': session_id, 'message': message},
                    timeout=30.0
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            print(f"Error sending message to n8n: {str(e)}")
            raise
=======
            requests.RequestException: If the request fails
        """
        response = requests.post(
            self.webhook_url,
            json={'sessionId': session_id, 'message': message},
            timeout=30
        )
        response.raise_for_status()
        return response.json()
>>>>>>> c1f9070ccb7a29111fee9de0911e64545c5cae06

    def extract_bot_message(self, response_json: dict) -> Optional[str]:
        """
        Extract bot message from n8n response.
        
        Args:
            response_json (dict): Raw response from n8n
            
        Returns:
            Optional[str]: Extracted message or None if not found
        """
        if isinstance(response_json, dict):
            bot_message = response_json.get("response") or response_json.get("markdown")
            if not bot_message and isinstance(response_json.get("data"), dict):
                bot_message = response_json["data"].get("response")
            return bot_message
        return None

# Initialize n8n service
n8n_service = N8NService()
