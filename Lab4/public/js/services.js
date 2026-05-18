async function loadServices() {
  try {
    const data = await apiGet("/services");
    const tbody = document.getElementById("servicesTable");
    tbody.innerHTML = data.map(s => `
      <tr>
        <td class="p-2">${s.id}</td>
        <td class="p-2">${s.name}</td>
        <td class="p-2">${s.price}</td>
        <td class="p-2">${s.type}</td>
        <td class="p-2">
          <button class="text-red-600 underline" onclick="deleteService(${s.id})">Видалити</button>
        </td>
      </tr>
    `).join("");
  } catch (e) {
    showError(e.message);
  }
}

document.getElementById("addBtn").addEventListener("click", async () => {
  try {
    const name = document.getElementById("name").value.trim();
    const price = Number(document.getElementById("price").value);
    const type = document.getElementById("type").value;
    if (!name || price <= 0) return showError("Некоректні дані");

    await apiPost("/services", { name, price, type });
    showSuccess("Послугу додано");
    await loadServices();
  } catch (e) {
    showError(e.message);
  }
});

document.getElementById("updateBtn").addEventListener("click", async () => {
  try {
    const id = Number(document.getElementById("serviceId").value);
    const name = document.getElementById("name").value.trim();
    const price = Number(document.getElementById("price").value);
    const type = document.getElementById("type").value;
    if (!id || !name || price <= 0) return showError("Некоректні дані");

    await apiPut(`/services/${id}`, { name, price, type });
    showSuccess("Послугу оновлено");
    await loadServices();
  } catch (e) {
    showError(e.message);
  }
});

async function deleteService(id) {
  try {
    await apiDelete(`/services/${id}`);
    showSuccess("Послугу видалено");
    await loadServices();
  } catch (e) {
    showError(e.message);
  }
}

loadServices();