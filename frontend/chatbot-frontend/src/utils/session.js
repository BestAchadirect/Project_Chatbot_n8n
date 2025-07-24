/**
 * @fileoverview Session management utilities for chat application
 * Handles session ID generation, validation, and storage in the browser's session storage
 */

/**
 * Generates a cryptographically secure random session ID
 * @private
 * @returns {string} A 20-character alphanumeric string
 */
function generateSessionId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from(
    { length: 20 }, 
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}

/**
 * Retrieves existing session ID from storage or creates a new one
 * @public
 * @returns {string} Valid session ID, either existing or newly generated
 * @description
 * - Checks sessionStorage for existing ID
 * - Validates ID format (20 alphanumeric characters)
 * - Creates new ID if none exists or invalid
 * - Persists ID to sessionStorage
 */
export function getOrCreateSessionId() {
  let id = sessionStorage.getItem('sessionId');
  if (!id || !/^[A-Za-z0-9]{20}$/.test(id)) {
    id = generateSessionId();
    sessionStorage.setItem('sessionId', id);
  }
  return id;
}
