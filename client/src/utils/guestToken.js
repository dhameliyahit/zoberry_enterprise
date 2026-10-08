/**
 * Guest Session Token Utility
 * Generates and persists a unique guest token in localStorage
 * so guest carts remain persistent across page reloads and can be merged on login.
 */

export const getGuestSessionToken = () => {
  if (typeof window === 'undefined') return null;
  
  let token = localStorage.getItem('zoberry_guest_token');
  if (!token) {
    // Generate simple UUID v4
    token = 'guest_' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    localStorage.setItem('zoberry_guest_token', token);
  }
  return token;
};

export const clearGuestSessionToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('zoberry_guest_token');
  }
};
