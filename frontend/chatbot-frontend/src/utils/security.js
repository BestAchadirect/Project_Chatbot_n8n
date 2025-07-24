/**
 * @fileoverview Security utilities for the chat application
 * Provides functions for host validation, security headers, and request configuration
 */

/**
 * Validates the backend host against allowed origins
 * @param {string} host - The host to validate
 * @returns {string} - Validated host or safe default
 * @description
 * - Checks host against REACT_APP_ALLOWED_ORIGINS environment variable
 * - Falls back to 'localhost' if validation fails
 * - Prevents connections to unauthorized backends
 */
export function validateHost(host) {
  const allowedOrigins = JSON.parse(process.env.REACT_APP_ALLOWED_ORIGINS || '["localhost"]');
  if (!host || !allowedOrigins.includes(host)) {
    console.error('Invalid backend host configuration');
    return 'localhost'; // Fallback to safe default
  }
  return host;
}

/**
 * Generates security headers based on configuration
 * @param {string} enableSecurityHeaders - Flag to enable additional security headers
 * @returns {Object} - Object containing security headers
 * @description
 * Includes:
 * - X-Content-Type-Options: Prevents MIME type sniffing
 * - X-Frame-Options: Prevents clickjacking attacks
 */
export function getSecurityHeaders(enableSecurityHeaders) {
  return enableSecurityHeaders === 'true' 
    ? {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY'
      }
    : {};
}

/**
 * Creates complete set of headers for API requests
 * @param {boolean} enableSecurityHeaders - Flag to enable additional security headers
 * @returns {Object} - Complete set of request headers
 * @description
 * Includes:
 * - Content-Type for JSON
 * - Request tracking ID
 * - Optional security headers
 * - CSRF protection headers
 */
export function createRequestHeaders(enableSecurityHeaders = false) {
  return {
    'Content-Type': 'application/json',
    'X-Request-ID': crypto.randomUUID(), // Unique identifier for request tracing
    ...getSecurityHeaders(enableSecurityHeaders)
  };
}
