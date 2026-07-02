export async function fetchWithTimeout(resource: string | URL | Request, options: RequestInit = {}) {
  const { timeout = 60000, ...fetchOptions } = options as RequestInit & { timeout?: number };

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  // Set up Authorization header
  const headers = new Headers(fetchOptions.headers || {});
  
  // Only add if not explicitly omitted or already set
  if (!headers.has('Authorization')) {
    let token = localStorage.getItem('authToken');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  try {
    const response = await fetch(resource, {
      ...fetchOptions,
      headers,
      signal: controller.signal
    });
    return response;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error(`Network Request Timeout: The server did not respond within ${timeout / 1000} seconds.`);
    }
    throw error;
  } finally {
    clearTimeout(id);
  }
}
