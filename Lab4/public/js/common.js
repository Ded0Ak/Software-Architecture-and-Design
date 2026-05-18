const API = "/api";

function showError(message) {
  const box = document.getElementById("errorBox");
  if (!box) return alert(message);
  box.textContent = message;
  box.classList.remove("hidden");
}

function clearError() {
  const box = document.getElementById("errorBox");
  if (!box) return;
  box.textContent = "";
  box.classList.add("hidden");
}

function showSuccess(message) {
  const box = document.getElementById("successBox");
  if (!box) return;
  box.textContent = message;
  box.classList.remove("hidden");
  setTimeout(() => {
    box.classList.add("hidden");
    box.textContent = "";
  }, 2500);
}

async function apiGet(path) {
  clearError();
  const res = await fetch(`${API}${path}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Помилка запиту" }));
    throw new Error(err.message);
  }
  return res.json();
}

async function apiPost(path, data) {
  clearError();
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Помилка запиту" }));
    throw new Error(err.message);
  }
  return res.json();
}

async function apiPut(path, data) {
  clearError();
  const res = await fetch(`${API}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Помилка запиту" }));
    throw new Error(err.message);
  }
  return res.json();
}

async function apiDelete(path) {
  clearError();
  const res = await fetch(`${API}${path}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Помилка запиту" }));
    throw new Error(err.message);
  }
  return true;
}