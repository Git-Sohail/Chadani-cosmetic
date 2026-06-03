/** True when the request never reached the server (backend down, wrong URL, offline). */
export function isNetworkError(error) {
  return (
    !error?.response &&
    (error?.code === 'ERR_NETWORK' ||
      error?.message === 'Network Error' ||
      error?.message?.includes('Network Error'))
  );
}

export function getApiErrorMessage(error, fallback = 'Something went wrong.') {
  if (isNetworkError(error)) {
    return 'Cannot reach the server. Start the backend: cd backend && npm run dev';
  }
  const data = error?.response?.data;
  if (typeof data === 'object' && data?.error) return data.error;
  if (typeof data === 'string') return data;
  return fallback;
}

/** Log API issues without triggering Next.js dev error overlay for expected network failures. */
export function logApiIssue(label, error) {
  if (isNetworkError(error)) {
    console.warn(`[${label}] Backend unreachable — is it running on port 5000?`);
    return;
  }
  console.warn(`[${label}]`, error?.response?.data || error?.message || error);
}
