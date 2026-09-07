const state = {
  user: null,
  transactions: [],
  overviewChart: null,
  categoryChart: null
};

const $ = selector => document.querySelector(selector);

function money(value) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR"
  }).format(value || 0);
}

function toast(message) {
  const el = $("#toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove("show"), 2600);
}

function showAuth() {
  $("#auth-view").classList.remove("hidden");
  $("#app-view").classList.add("hidden");
}

function showApp() {
  $("#auth-view").classList.add("hidden");
  $("#app-view").classList.remove("hidden");
  $("#welcome").textContent = `Ciao, ${state.user.name?.split(" ")[0] || "Luca"} 👋`;
}

function initGoogle() {
  const clientId = window.FINORA_CONFIG.GOOGLE_CLIENT_ID;

  if (!window.google || clientId.startsWith("INSERISCI_")) {
    $("#google-button").innerHTML =
      '<p class="micro">Configura GOOGLE_CLIENT_ID in js/config.js per abilitare il login.</p>';
    return;
  }

  google.accounts.id.initialize({
    client_id: clientId,
    callback: async response => {
      try {
        state.user = await API.googleLogin(response.credential);
        showApp();
        await loadDashboard();
      } catch (error) {
        toast(error.message);
      }
    }
  });

  google.accounts.id.renderButton($("#google-button"), {
    theme: "outline",
    size: "large",
    shape: "pill",
    width: 320,
    text: "continue_with"
  });
}

function renderTransactions() {
  const list = $("#transactions-list");

  if (!state.transactions.length) {
    list.innerHTML = '<div class="empty">Nessuna transazione. Aggiungi la prima operazione.</div>';
    return;
  }

  const icons = {
    Cibo: "🍔", Trasporti: "🚗", Casa: "🏠", Bollette: "🧾",
    Shopping: "🛍️", Gaming: "🎮", Lavoro: "💼", Altro: "💳"
  };

  list.innerHTML = state.transactions.slice(0, 8).map(t => `
    <div class="transaction">
      <div class="transaction-main">
        <span class="transaction-icon">${icons[t.category] || "💳"}</span>
        <div class="transaction-copy">
          <strong>${escapeHtml(t.description)}</strong>
          <small>${escapeHtml(t.category)} · ${new Date(t.date + "T00:00:00").toLocaleDateString("it-IT")}</small>
        </div>
      </div>
      <span class="amount ${t.type === "income" ? "income" : "expense"}">
        ${t.type === "income" ? "+" : "-"}${money(t.amount)}
      </span>
    </div>
  `).join("");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[c]);
}

function renderCharts(data) {
  if (state.overviewChart) state.overviewChart.destroy();
  if (state.categoryChart) state.categoryChart.destroy();

  state.overviewChart = new Chart($("#overview-chart"), {
    type: "line",
    data: {
      labels: data.monthly.labels,
      datasets: [
        { label: "Entrate", data: data.monthly.income, borderColor: "#43aeb0", backgroundColor: "rgba(67,174,176,.08)", fill: true, tension: .4, borderWidth: 3 },
        { label: "Uscite", data: data.monthly.expenses, borderColor: "#69b7d4", tension: .4, borderWidth: 3 }
      ]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "top" } } }
  });

  const categoryLabels = Object.keys(data.categories);
  const categoryValues = Object.values(data.categories);

  state.categoryChart = new Chart($("#category-chart"), {
    type: "doughnut",
    data: {
      labels: categoryLabels,
      datasets: [{ data: categoryValues, backgroundColor: ["#43aeb0","#69b7d4","#67c7a4","#f0b66f","#d98b91","#8f9ed8","#8bc7c9","#bcc7cb"], borderWidth: 0 }]
    },
    options: { responsive: true, maintainAspectRatio: false, cutout: "70%", plugins: { legend: { position: "bottom" } } }
  });
}

async function loadDashboard() {
  const data = await API.dashboard();
  state.transactions = data.transactions;

  $("#available-balance").textContent = money(data.summary.balance);
  $("#total-income").textContent = money(data.summary.income);
  $("#total-expenses").textContent = money(data.summary.expenses);
  $("#total-savings").textContent = money(data.summary.savings);
  $("#savings-percentage").textContent =
    `${data.summary.savings_percentage.toFixed(1).replace(".", ",")}% delle entrate`;

  renderTransactions();
  renderCharts(data);
}

function openModal() {
  $("#transaction-modal").classList.remove("hidden");
  $("#transaction-date").value = new Date().toISOString().slice(0, 10);
  setTimeout(() => $("#transaction-amount").focus(), 0);
}

function closeModal() {
  $("#transaction-modal").classList.add("hidden");
}

async function boot() {
  initGoogle();

  try {
    state.user = await API.me();
    showApp();
    await loadDashboard();
  } catch {
    showAuth();
  }

  $("#new-transaction-btn").addEventListener("click", openModal);
  $("#close-modal").addEventListener("click", closeModal);
  $("#cancel-modal").addEventListener("click", closeModal);

  $("#transaction-modal").addEventListener("click", e => {
    if (e.target.id === "transaction-modal") closeModal();
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeModal();
  });

  $("#logout-btn").addEventListener("click", async () => {
    try { await API.logout(); } finally {
      state.user = null;
      showAuth();
    }
  });

  $("#transaction-form").addEventListener("submit", async e => {
    e.preventDefault();

    const payload = {
      type: $("#transaction-type").value,
      amount: Number($("#transaction-amount").value),
      category: $("#transaction-category").value,
      description: $("#transaction-description").value.trim(),
      date: $("#transaction-date").value
    };

    if (!Number.isFinite(payload.amount) || payload.amount <= 0) {
      toast("Inserisci un importo valido.");
      return;
    }

    try {
      await API.createTransaction(payload);
      e.target.reset();
      closeModal();
      await loadDashboard();
      toast("Transazione aggiunta.");
    } catch (error) {
      toast(error.message);
    }
  });
}

window.addEventListener("load", boot);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js"));
}
