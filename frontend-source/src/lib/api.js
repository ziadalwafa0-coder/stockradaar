const API_URL = import.meta.env.VITE_API_URL || "/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    },
    ...options
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || "تعذر الاتصال بالخادم");
  }

  return response.json();
}

export const api = {
  stats: () => request("/dashboard/stats").then((res) => res.data),
  products: (params = {}) => request(`/products${toQuery(params)}`).then((res) => res.data),
  alerts: (sort = "recent") => request(`/alerts?sort=${sort}`).then((res) => res.data),
  markAlertRead: (id) => request(`/alerts/${id}/read`, { method: "PATCH" }).then((res) => res.data),
  platforms: () => request("/platforms").then((res) => res.data),
  addPlatform: (payload) =>
    request("/platforms", {
      method: "POST",
      body: JSON.stringify(payload)
    }).then((res) => res.data),
  updatePlatform: (id, payload) =>
    request(`/platforms/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    }).then((res) => res.data)
};

function toQuery(params) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== "")
  ).toString();

  return query ? `?${query}` : "";
}
