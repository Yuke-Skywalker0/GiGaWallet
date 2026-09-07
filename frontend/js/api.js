const API = {
  base: window.FINORA_CONFIG.API_BASE_URL.replace(/\/$/, ""),

  async request(path, options = {}) {
    const response = await fetch(`${this.base}${path}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      ...options
    });

    if (response.status === 204) return null;

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.detail || "Errore di comunicazione con il server.");
    }

    return data;
  },

  me() {
    return this.request("/api/auth/me");
  },

  googleLogin(credential) {
    return this.request("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential })
    });
  },

  logout() {
    return this.request("/api/auth/logout", { method: "POST" });
  },

  dashboard() {
    return this.request("/api/dashboard");
  },

  transactions() {
    return this.request("/api/transactions");
  },

  createTransaction(transaction) {
    return this.request("/api/transactions", {
      method: "POST",
      body: JSON.stringify(transaction)
    });
  },

  deleteTransaction(id) {
    return this.request(`/api/transactions/${id}`, { method: "DELETE" });
  }
};
