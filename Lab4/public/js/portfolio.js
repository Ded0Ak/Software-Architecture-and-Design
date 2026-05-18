async function loadPortfolio() {
  try {
    const data = await apiGet("/portfolio");
    const tbody = document.getElementById("portfolioTable");
    tbody.innerHTML = data.map(p => `
      <tr>
        <td class="p-2">${p.id}</td>
        <td class="p-2">${p.title}</td>
        <td class="p-2">${p.description}</td>
        <td class="p-2">
          <button class="text-red-600 underline" onclick="deletePortfolio(${p.id})">Видалити</button>
        </td>
      </tr>
    `).join("");
  } catch (e) {
    showError(e.message);
  }
}

document.getElementById("addBtn").addEventListener("click", async () => {
  try {
    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("desc").value.trim();
    if (!title || !description) return showError("Заповніть поля");

    await apiPost("/portfolio", { title, description });
    showSuccess("Роботу додано");
    await loadPortfolio();
  } catch (e) {
    showError(e.message);
  }
});

document.getElementById("updateBtn").addEventListener("click", async () => {
  try {
    const id = Number(document.getElementById("portfolioId").value);
    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("desc").value.trim();
    if (!id || !title || !description) return showError("Некоректні дані");

    await apiPut(`/portfolio/${id}`, { title, description });
    showSuccess("Портфоліо оновлено");
    await loadPortfolio();
  } catch (e) {
    showError(e.message);
  }
});

async function deletePortfolio(id) {
  try {
    await apiDelete(`/portfolio/${id}`);
    showSuccess("Портфоліо видалено");
    await loadPortfolio();
  } catch (e) {
    showError(e.message);
  }
}

loadPortfolio();