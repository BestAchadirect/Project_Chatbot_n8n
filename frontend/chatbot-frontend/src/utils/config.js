/**
 * @fileoverview Application configuration management
 * Centralizes all configuration values and provides environment-aware defaults
 */

import { validateHost } from './security';

/**
 * Environment-based configuration values
 * @constant
 * @description
 * Reads from environment variables with fallbacks:
 * - API_PROTOCOL: 'http' in development, 'https' recommended in production
 * - WS_PROTOCOL: 'ws' in development, 'wss' recommended in production
 * - BACKEND_HOST: Validated host name
 * - BACKEND_PORT: Default 5001
 * - API_TIMEOUT: Default 30 seconds
 */
const API_PROTOCOL = process.env.REACT_APP_API_PROTOCOL || 'http';
const WS_PROTOCOL = process.env.REACT_APP_WS_PROTOCOL || 'ws';
const BACKEND_HOST = validateHost(process.env.REACT_APP_BACKEND_HOST);
const BACKEND_PORT = process.env.REACT_APP_BACKEND_PORT || 5001;
const API_TIMEOUT = parseInt(process.env.REACT_APP_API_TIMEOUT || '30000');

/**
 * Exported configuration object
 * @exports config
 * @type {Object}
 * @property {string} API_PROTOCOL - HTTP protocol for REST API
 * @property {string} WS_PROTOCOL - WebSocket protocol
 * @property {string} BACKEND_HOST - Validated backend hostname
 * @property {number} BACKEND_PORT - Backend server port
 * @property {number} API_TIMEOUT - API request timeout in milliseconds
 * @property {string} API_BASE - Constructed API base URL
 * @property {string} WS_URL - Constructed WebSocket URL
 */
export const config = {
  API_PROTOCOL,
  WS_PROTOCOL,
  BACKEND_HOST,
  BACKEND_PORT,
  API_TIMEOUT,
  API_BASE: `${API_PROTOCOL}://${BACKEND_HOST}:${BACKEND_PORT}`,
  WS_URL: `${WS_PROTOCOL}://${BACKEND_HOST}:${BACKEND_PORT}/ws/chat`
};
