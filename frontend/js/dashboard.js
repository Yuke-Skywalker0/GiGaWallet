const dashboardData = {
    overview: {
        labels: ["Mar", "Apr", "Mag", "Giu", "Lug", "Ago"],
        income: [1450, 1720, 1550, 1900, 1680, 1850],
        expenses: [980, 1120, 890, 1040, 950, 920]
    },
    categories: [
        { name: "Cibo", emoji: "🍔", amount: 280 },
        { name: "Auto", emoji: "🚗", amount: 210 },
        { name: "Gaming", emoji: "🎮", amount: 80 },
        { name: "Shopping", emoji: "🛍️", amount: 65 }
    ],
    transactions: [
        { name: "Supermercato", category: "Cibo", date: "Oggi", amount: -45.2, emoji: "🛒" },
        { name: "Stipendio", category: "Lavoro", date: "27 Agosto", amount: 1850, emoji: "💼" },
        { name: "Benzina", category: "Auto", date: "25 Agosto", amount: -60, emoji: "⛽" },
        { name: "Steam", category: "Gaming", date: "23 Agosto", amount: -29.99, emoji: "🎮" }
    ]
};

function formatCurrency(value) {
    return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(value)
}

function renderCategories() {
    const c = document.querySelector("#category-list");

    if (!c) return; c.innerHTML = "";

    dashboardData.categories.forEach(x => {
        const e = document.createElement("div");
        e.className = "category-item";
        e.innerHTML = `<div class="category-item__name"><span class="category-item__emoji">${x.emoji}</span><span>${x.name}</span></div><strong class="category-item__amount">${formatCurrency(x.amount)}</strong>`;
        c.appendChild(e)
    })
}

function renderTransactions() {
    const c = document.querySelector("#transactions-list");
    if (!c) return; c.innerHTML = "";

    dashboardData.transactions.forEach(x => {
        const e = document.createElement("div");
        e.className = "transaction"; const income = x.amount > 0;
        e.innerHTML = `<div class="transaction__icon">${x.emoji}</div><div class="transaction__info"><strong class="transaction__name">${x.name}</strong><span class="transaction__meta">${x.category} · ${x.date}</span></div><strong class="transaction__amount ${income ? "transaction__amount--income" : "transaction__amount--expense"}">${income ? "+" : ""}${formatCurrency(x.amount)}</strong>`; c.appendChild(e)
    })
}

function createOverviewChart() {
    const canvas = document.querySelector("#overview-chart");

    if (!canvas || typeof Chart === "undefined") return; new Chart(canvas.getContext("2d"),
        {
            type: "line", data: {
                labels: dashboardData.overview.labels, datasets: [{ label: "Entrate", data: dashboardData.overview.income, borderColor: "#43aeb0", backgroundColor: "rgba(67,174,176,.08)", borderWidth: 2.5, fill: true, tension: .4, pointRadius: 0 },
                { label: "Uscite", data: dashboardData.overview.expenses, borderColor: "#55afd0", backgroundColor: "rgba(85,175,208,.04)", borderWidth: 2.5, fill: true, tension: .4, pointRadius: 0 }]
            }, options: { responsive: true, maintainAspectRatio: false, interaction: { intersect: false, mode: "index" }, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: "#8b9ba3" } }, y: { grid: { color: "#eef3f4" }, ticks: { color: "#8b9ba3", callback: v => `€${v}` } } } }
        })
}

function createExpensesChart() {
    const canvas = document.querySelector("#expenses-chart");
    if (!canvas || typeof Chart === "undefined") return; new Chart(canvas.getContext("2d"),
        {
            type: "doughnut", data: {
                labels: dashboardData.categories.map(x => x.name),
                datasets: [{ data: dashboardData.categories.map(x => x.amount), backgroundColor: ["#43aeb0", "#55afd0", "#50b994", "#a6d9da"], borderWidth: 0 }]
            },

            options: { responsive: true, maintainAspectRatio: false, cutout: "76%", plugins: { legend: { display: false } } }
        })
}


function initializeDashboard() {
    renderCategories();
    renderTransactions();
    createOverviewChart();
    createExpensesChart();
    if (window.lucide) lucide.createIcons()
}

document.addEventListener("DOMContentLoaded", initializeDashboard);
