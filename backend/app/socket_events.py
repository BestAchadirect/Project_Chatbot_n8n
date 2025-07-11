from flask_socketio import emit, join_room, leave_room, disconnect
from flask import request
from . import socketio
from datetime import datetime
from dotenv import load_dotenv
from datetime import datetime, timezone
import os
from supabase import create_client, Client

load_dotenv()

# Initialize Supabase client
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@socketio.on('connect')
def handle_connect():
    print(f"Client connected: {request.sid}")
    emit('connected', {'data': 'Connected to chat server'})

@socketio.on('disconnect')
def handle_disconnect():
    print(f"Client disconnected: {request.sid}")

@socketio.on('join_room')
def handle_join_room(data):
    room = data.get('room')
    if room:
        join_room(room)
        emit('status', {'msg': f'Joined room: {room}'}, room=room)

@socketio.on('leave_room')
def handle_leave_room(data):
    room = data.get('room')
    if room:
        leave_room(room)
        emit('status', {'msg': f'Left room: {room}'}, room=room)

@socketio.on('send_message')
def handle_send_message(data):
    session_id = data.get('sessionId')
    message = data.get('message')
    sender = data.get('sender', 'user')
    
    if not session_id or not message:
        emit('error', {'error': 'Missing sessionId or message'})
        return
    
    try:
        # Create or get chat session
        session_resp = supabase.table('chat_sessions').select('*').eq('session_id', session_id).execute()
        if not session_resp.data:
            supabase.table('chat_sessions').insert({
                'session_id': session_id,
                'user_id': f"user_{session_id[:8]}",
                'started_at': datetime.now(timezone.utc).isoformat()
            }).execute()
        
        # Do NOT save the message here, just broadcast it
        emit('new_message', {
            'sessionId': session_id,
            'sender': sender,
            'message': message,
            'timestamp': datetime.now(timezone.utc).isoformat()
        }, room=session_id)
        
    except Exception as e:
        print(f"Error saving message: {e}")
        emit('error', {'error': 'Failed to save message'})

@socketio.on('typing')
def handle_typing(data):
    session_id = data.get('sessionId')
    is_typing = data.get('isTyping', False)
    
    if session_id:
        emit('user_typing', {
            'sessionId': session_id,
            'isTyping': is_typing
        }, room=session_id, include_self=False)

@socketio.on('join_session')
def handle_join_session(data):
    session_id = data.get('sessionId')
    if session_id:
        join_room(session_id)
        emit('status', {'msg': f'Joined session: {session_id}'}, room=session_id) 