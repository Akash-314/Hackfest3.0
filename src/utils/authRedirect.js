/**
 * Utility functions for safe, reliable authentication redirects.
 * Enforces internal route paths only, preventing open redirect vulnerabilities.
 */

/**
 * Validates and extracts a safe internal redirect path.
 *
 * @param {string|object|null} from - The redirect destination (path string or React Router location object).
 * @param {URLSearchParams|null} searchParams - Optional URL search params to extract fallback redirect from.
 * @param {string} fallback - Default path to return if no valid redirect is specified (default: '/dashboard').
 * @returns {string} Safe relative internal path.
 */
export function getSafeRedirectPath(from, searchParams = null, fallback = '/dashboard') {
  let raw = from;

  // Check URL search parameters (?redirect=... or ?from=...) if state.from is not provided
  if (!raw && searchParams) {
    raw = searchParams.get('redirect') || searchParams.get('from');
  }

  if (!raw) return fallback;

  let path = '';
  if (typeof raw === 'string') {
    path = raw.trim();
  } else if (typeof raw === 'object' && raw !== null) {
    const pathname = raw.pathname || '';
    const search = raw.search || '';
    const hash = raw.hash || '';
    path = `${pathname}${search}${hash}`.trim();
  }

  if (!path) return fallback;

  // 1. Must start with exactly one '/'
  if (!path.startsWith('/')) {
    return fallback;
  }

  // 2. Reject protocol-relative URLs (e.g., '//evil.com')
  if (path.startsWith('//')) {
    return fallback;
  }

  // 3. Reject absolute URLs containing scheme (e.g., 'http://', 'https://', 'data:', 'javascript:')
  if (path.includes('://') || /^\/[/\\]*(javascript|data|vbscript):/i.test(path)) {
    return fallback;
  }

  // 4. Reject control characters that could cause HTTP header injection or open redirect tricks
  if (/[\r\n\t]/.test(path)) {
    return fallback;
  }

  return path;
}

/**
 * Extracts human-readable competition info if the redirect path targets event registration.
 * Used to display friendly contextual notices on login/signup forms.
 *
 * @param {string} path - The safe redirect path.
 * @returns {{ isRegistration: boolean, competitionId: string|null, competitionName: string|null }}
 */
export function getRegistrationIntent(path) {
  if (!path || !path.startsWith('/register')) {
    return { isRegistration: false, competitionId: null, competitionName: null };
  }

  try {
    const url = new URL(path, 'http://localhost');
    const comp = (url.searchParams.get('competition') || url.searchParams.get('arena') || url.searchParams.get('event') || '').toLowerCase();

    const names = {
      hackathon: 'Flagship Hackathon',
      codeathon: 'Codeathon',
      ideathon: 'Ideathon',
    };

    if (comp && names[comp]) {
      return {
        isRegistration: true,
        competitionId: comp,
        competitionName: names[comp],
      };
    }

    return {
      isRegistration: true,
      competitionId: null,
      competitionName: 'HackFest 3.0',
    };
  } catch {
    return {
      isRegistration: true,
      competitionId: null,
      competitionName: 'HackFest 3.0',
    };
  }
}
