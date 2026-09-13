// Frontend JWT Auth Helper
export function getToken(): string | null {
  return localStorage.getItem("auth_token");
}

export function setToken(token: string): void {
  localStorage.setItem("auth_token", token);
}

export function removeToken(): void {
  localStorage.removeItem("auth_token");
}

export function getUserEmail(): string | null {
  return localStorage.getItem("auth_email");
}

export function setUserEmail(email: string): void {
  localStorage.setItem("auth_email", email);
}

export function removeUserEmail(): void {
  localStorage.removeItem("auth_email");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function getAuthHeaders(): HeadersInit {
  const token = getToken();
  if (token) {
    return {
      "Authorization": `Bearer ${token}`
    };
  }
  return {};
}

// Fetch helper that automatically includes auth headers
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});
  
  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Eger Content-Type belirtilmemisse ve body bir string ise (genelde JSON)
  if (!headers.has("Content-Type") && typeof options.body === "string") {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (response.status === 401) {
    // Token gecersiz olduysa veya yetkisiz erisimse sil ve yonlendir
    removeToken();
    removeUserEmail();
    window.location.href = "/login";
  }

  return response;
}
