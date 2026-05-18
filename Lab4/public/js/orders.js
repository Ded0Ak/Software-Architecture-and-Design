function toggleOrderInputs() {
  const orderType = document.getElementById("orderType").value;
  const serviceIds = document.getElementById("serviceIds");
  const totalPrice = document.getElementById("totalPrice");

  if (orderType === "Turnkey") {
    totalPrice.classList.remove("hidden");
    serviceIds.classList.add("hidden");
  } else {
    serviceIds.classList.remove("hidden");
    totalPrice.classList.add("hidden");
  }
}

async function loadOrders() {
  try {
    const data = await apiGet("/orders");
    const tbody = document.getElementById("ordersTable");
    tbody.innerHTML = data.map(o => `
      <tr>
        <td class="p-2">${o.id}</td>
        <td class="p-2">${o.clientName}</td>
        <td class="p-2">${o.orderType}</td>
        <td class="p-2">${o.totalPrice}</td>
        <td class="p-2">${o.completed}</td>
        <td class="p-2">
          <button class="text-red-600 underline" onclick="deleteOrder(${o.id})">Видалити</button>
        </td>
      </tr>
    `).join("");
  } catch (e) {
    showError(e.message);
  }
}

async function loadServicesTable() {
  try {
    const data = await apiGet("/services");
    const tbody = document.getElementById("servicesListTable");
    tbody.innerHTML = data.map(s => `
      <tr>
        <td class="p-2">${s.id}</td>
        <td class="p-2">${s.name}</td>
        <td class="p-2">${s.price}</td>
        <td class="p-2">${s.type}</td>
      </tr>
    `).join("");
  } catch (e) {
    showError(e.message);
  }
}

document.getElementById("orderType").addEventListener("change", toggleOrderInputs);

document.getElementById("addCatalogBtn").addEventListener("click", async () => {
  try {
    const clientName = document.getElementById("clientName").value.trim();
    const orderType = document.getElementById("orderType").value;

    if (orderType === "Turnkey") {
      const totalPrice = Number(document.getElementById("totalPrice").value);
      if (!clientName || totalPrice <= 0) return showError("Некоректні дані");
      await apiPost("/orders/turnkey", { clientName, totalPrice });
    } else {
      const idsRaw = document.getElementById("serviceIds").value.trim();
      const serviceIds = idsRaw.split(",").map(x => Number(x.trim())).filter(x => !isNaN(x));
      if (!clientName || serviceIds.length === 0) return showError("Некоректні дані");
      await apiPost("/orders/catalog", { clientName, serviceIds });
    }

    showSuccess("Замовлення створено");
    await loadOrders();
  } catch (e) {
    showError(e.message);
  }
});

document.getElementById("updateBtn").addEventListener("click", async () => {
  try {
    const id = Number(document.getElementById("orderId").value);
    const clientName = document.getElementById("clientName").value.trim();
    const orderType = document.getElementById("orderType").value;

    if (!id || !clientName) return showError("Некоректні дані");

    if (orderType === "Turnkey") {
      const totalPrice = Number(document.getElementById("totalPrice").value);
      if (totalPrice <= 0) return showError("Некоректна сума");
      await apiPut(`/orders/${id}`, { clientName, orderType, totalPrice });
    } else {
      const idsRaw = document.getElementById("serviceIds").value.trim();
      const serviceIds = idsRaw.split(",").map(x => Number(x.trim())).filter(x => !isNaN(x));
      if (serviceIds.length === 0) return showError("Некоректні послуги");
      await apiPut(`/orders/${id}`, { clientName, orderType, serviceIds });
    }

    showSuccess("Замовлення оновлено");
    await loadOrders();
  } catch (e) {
    showError(e.message);
  }
});

async function deleteOrder(id) {
  try {
    await apiDelete(`/orders/${id}`);
    showSuccess("Замовлення видалено");
    await loadOrders();
  } catch (e) {
    showError(e.message);
  }
}

toggleOrderInputs();
loadOrders();
loadServicesTable();