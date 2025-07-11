# AI Chatbot with n8n Integration

A real-time chat application with AI assistant capabilities, built with Flask, WebSocket, and n8n workflow automation.

## 🚀 Features

- **Real-time Chat**: WebSocket-based real-time messaging
- **AI Assistant**: OpenAI-powered chatbot with memory
- **Session Management**: Persistent chat sessions and history
- **User Registration**: User account creation and management
- **Vector Search**: Supabase vector store for knowledge base
- **n8n Integration**: Automated workflow processing
- **Responsive Design**: Mobile-friendly chat interface

## 📁 Project Structure

```
Project_Chatbot_n8n/
├── backend/
│   ├── app/
│   │   ├── __init__.py          # Flask app configuration
│   │   ├── database.py          # Database connection
│   │   ├── models.py            # SQLAlchemy models
│   │   ├── routes.py            # API endpoints
│   │   └── socket_events.py     # WebSocket event handlers
│   ├── main.py                  # Application entry point
│   └── requirements.txt         # Python dependencies
├── frontend/
│   └── public/
│       ├── index.html           # Main chat interface
│       ├── register.html        # User registration page
│       ├── script.js            # Frontend JavaScript
│       └── style.css            # Styling
├── workflows/
│   └── AI_agent_chat.json      # n8n workflow configuration
└── README.md                    # This file
```

## 🛠️ Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js (for n8n)
- PostgreSQL database
- OpenAI API key
- Supabase account

### 1. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your database and API credentials

# Run database migrations
python create_tables.py

# Start the Flask server
python main.py
```

The backend will run on `http://localhost:5001`

### 2. Frontend Setup

```bash
cd frontend/public

# Serve the frontend (you can use any static server)
python -m http.server 8000
# or
npx serve .
```

The frontend will be available at `http://localhost:8000`

### 3. n8n Setup

1. Install n8n globally:
```bash
npm install -g n8n
```

2. Start n8n:
```bash
n8n start
```

3. Import the workflow:
   - Open n8n at `http://localhost:5678`
   - Go to Workflows
   - Import the `workflows/AI_agent_chat.json` file

4. Configure credentials:
   - OpenAI API credentials
   - Supabase credentials
   - PostgreSQL credentials

### 4. Database Setup

Create a PostgreSQL database and update the connection string in `backend/app/database.py`:

```python
DATABASE_URL = "postgresql://username:password@localhost:5432/chatbot_db"
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/chatbot_db
OPENAI_API_KEY=your_openai_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

### n8n Webhook URL

Update the webhook URL in `backend/app/routes.py`:

```python
n8n_response = requests.post(
    "http://localhost:5678/webhook-test/returning-user",
    json=data,
    timeout=10
)
```

## 📡 API Endpoints

### Chat Endpoints

- `POST /chat/message` - Send a chat message
- `GET /chat/sessions` - Get user chat sessions
- `GET /chat/messages/<session_id>` - Get messages for a session
- `POST /chat/session/<session_id>/end` - End a chat session

### User Endpoints

- `POST /user/register` - Register a new user
- `GET /health` - Health check endpoint

## 🔌 WebSocket Events

### Client to Server
- `connect` - Connect to WebSocket
- `join_session` - Join a chat session
- `send_message` - Send a real-time message
- `typing` - Send typing indicator

### Server to Client
- `connected` - Connection confirmation
- `new_message` - New message received
- `user_typing` - User typing indicator
- `error` - Error message

## 🤖 AI Assistant Features

The AI assistant can:
- Answer questions about body jewelry products
- Provide pricing information
- Help with wholesale inquiries
- Search knowledge base using vector embeddings
- Maintain conversation context
- Handle multiple user sessions

## 🎨 Frontend Features

- Real-time chat interface
- Typing indicators
- Message history
- Connection status
- Responsive design
- User registration
- Session management

## 🔄 n8n Workflow

The n8n workflow includes:
- Webhook trigger for incoming messages
- OpenAI chat model integration
- PostgreSQL memory for conversation context
- Supabase vector store for knowledge search
- Conditional responses for common queries
- Error handling and fallbacks

## 🚀 Deployment

### Production Considerations

1. **Security**:
   - Use HTTPS in production
   - Implement proper authentication
   - Secure WebSocket connections
   - Validate all inputs

2. **Performance**:
   - Use a production WSGI server (Gunicorn)
   - Implement Redis for session storage
   - Add rate limiting
   - Optimize database queries

3. **Monitoring**:
   - Add logging
   - Monitor WebSocket connections
   - Track API usage
   - Set up error alerts

### Docker Deployment

Create a `docker-compose.yml`:

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5001:5001"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/chatbot
    depends_on:
      - db
  
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
  
  db:
    image: postgres:13
    environment:
      - POSTGRES_DB=chatbot
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## 🐛 Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Check if Flask-SocketIO is running
   - Verify CORS settings
   - Check firewall settings

2. **n8n Webhook Not Responding**
   - Verify n8n is running on port 5678
   - Check webhook URL in backend
   - Ensure workflow is active

3. **Database Connection Issues**
   - Verify PostgreSQL is running
   - Check connection string
   - Ensure database exists

4. **AI Responses Not Working**
   - Verify OpenAI API key
   - Check Supabase credentials
   - Ensure vector store is populated

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🤝 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the n8n documentation

---

**Happy Chatting! 🎉** 