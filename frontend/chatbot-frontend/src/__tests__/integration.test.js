import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';
import { WebSocket } from 'mock-socket';

// Mock WebSocket
global.WebSocket = WebSocket;

// Mock server for backend API
const server = setupServer(
  // Health check endpoint
  rest.get('http://localhost:5001/health', (req, res, ctx) => {
    return res(ctx.json({ status: 'healthy' }));
  }),

  // Chat message endpoint
  rest.post('http://localhost:5001/chat/message', (req, res, ctx) => {
    return res(ctx.json({ response: 'Hello from the bot!' }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Frontend Integration Tests', () => {
  test('Backend API Connectivity', async () => {
    render(<App />);
    
    // Wait for the health check to complete
    await waitFor(() => {
      expect(screen.queryByText('Connection Error')).toBeNull();
    });
  });

  test('Message Sending Flow', async () => {
    render(<App />);
    
    // Find and fill the message input
    const input = screen.getByPlaceholderText(/type a message/i);
    fireEvent.change(input, { target: { value: 'Hello, bot!' } });
    
    // Send the message
    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);
    
    // Wait for the response
    await waitFor(() => {
      expect(screen.getByText('Hello from the bot!')).toBeInTheDocument();
    });
  });

  test('WebSocket Connection', async () => {
    render(<App />);
    
    // Wait for WebSocket connection to establish
    await waitFor(() => {
      expect(screen.queryByText('WebSocket Error')).toBeNull();
    });
  });

  test('Error Handling - Backend Unavailable', async () => {
    // Simulate backend being down
    server.use(
      rest.post('http://localhost:5001/chat/message', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    render(<App />);
    
    // Try to send a message
    const input = screen.getByPlaceholderText(/type a message/i);
    fireEvent.change(input, { target: { value: 'Hello' } });
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });
});
