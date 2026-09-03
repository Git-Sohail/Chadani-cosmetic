/**
 * Validates and sanitizes customer redirect targets.
 * Prevents open-redirect vulnerabilities (e.g. //attacker.com, /\attacker.com, %5C, encoded colons)
 * and maps legacy paths to the Phase 5 consolidated account structure.
 *
 * @param {string|null|undefined} target - The requested redirect URL path
 * @param {string} [fallback='/account'] - Safe fallback destination if invalid
 * @returns {string} Safe relative internal path
 */
export function getSafeRedirect(target, fallback = '/account') {
  if (!target || typeof target !== 'string') {
    return fallback;
  }

  let decoded = target.trim();
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    return fallback;
  }

  // Must start with '/' and must NOT start with '//' (protocol-relative) or contain backslashes or colons
  if (
    !decoded.startsWith('/') ||
    decoded.startsWith('//') ||
    decoded.includes('\\') ||
    decoded.includes(':')
  ) {
    return fallback;
  }

  // Prevent redirect loops into auth views
  if (
    decoded.startsWith('/login') ||
    decoded.startsWith('/register') ||
    decoded.startsWith('/verify-otp') ||
    decoded.startsWith('/forgot-password')
  ) {
    return fallback;
  }

  // Route legacy paths to unified destinations
  if (decoded === '/profile') return '/account/settings';
  if (decoded === '/orders') return '/account/orders';
  if (decoded === '/wishlist') return '/account/wishlist';

  return decoded;
}
