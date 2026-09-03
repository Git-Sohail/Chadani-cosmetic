/**
 * Validates and sanitizes customer redirect targets.
 * Prevents open-redirect vulnerabilities (e.g. //attacker.com, /\attacker.com)
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

  const trimmed = target.trim();

  // Must start with '/' and must NOT start with '//' (protocol-relative) or contain backslashes
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.includes('\\')) {
    return fallback;
  }

  // Prevent redirect loops into auth views
  if (
    trimmed.startsWith('/login') ||
    trimmed.startsWith('/register') ||
    trimmed.startsWith('/verify-otp') ||
    trimmed.startsWith('/forgot-password')
  ) {
    return fallback;
  }

  // Route legacy paths to unified destinations
  if (trimmed === '/profile') return '/account/settings';
  if (trimmed === '/orders') return '/account/orders';
  if (trimmed === '/wishlist') return '/account/wishlist';

  return trimmed;
}

