from collections import defaultdict
from datetime import date, datetime
from calendar import monthrange

from fastapi import APIRouter, Depends

from ..db import transactions
from ..security import current_user_id, owner_key
from .transactions import decode

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

MONTHS_IT = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"]

def shift_month(year: int, month: int, delta: int):
    index = year * 12 + (month - 1) + delta
    return index // 12, index % 12 + 1

@router.get("")
def dashboard(user_id: str = Depends(current_user_id)):
    key = owner_key(user_id)
    docs = list(transactions.find({"owner_key": key}).sort("created_at", -1))
    items = [decode(doc) for doc in docs]

    today = date.today()
    current_month = today.month
    current_year = today.year

    month_items = [
        item for item in items
        if (d := date.fromisoformat(item["date"])).month == current_month
        and d.year == current_year
    ]

    income = sum(x["amount"] for x in month_items if x["type"] == "income")
    expenses = sum(x["amount"] for x in month_items if x["type"] == "expense")
    savings = income - expenses

    # Saldo complessivo: tutte le entrate meno tutte le uscite registrate.
    balance = sum(
        x["amount"] if x["type"] == "income" else -x["amount"]
        for x in items
    )

    categories = defaultdict(float)
    for item in month_items:
        if item["type"] == "expense":
            categories[item["category"]] += item["amount"]

    labels, monthly_income, monthly_expenses = [], [], []

    for delta in range(-5, 1):
        year, month = shift_month(current_year, current_month, delta)
        labels.append(MONTHS_IT[month - 1])

        selected = [
            item for item in items
            if (d := date.fromisoformat(item["date"])).year == year
            and d.month == month
        ]

        monthly_income.append(round(sum(x["amount"] for x in selected if x["type"] == "income"), 2))
        monthly_expenses.append(round(sum(x["amount"] for x in selected if x["type"] == "expense"), 2))

    return {
        "summary": {
            "balance": round(balance, 2),
            "income": round(income, 2),
            "expenses": round(expenses, 2),
            "savings": round(savings, 2),
            "savings_percentage": round((savings / income * 100) if income else 0, 1)
        },
        "categories": {k: round(v, 2) for k, v in categories.items()},
        "monthly": {
            "labels": labels,
            "income": monthly_income,
            "expenses": monthly_expenses
        },
        "transactions": items[:20]
    }
