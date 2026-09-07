from datetime import date
from typing import Literal
from pydantic import BaseModel, Field, field_validator

class GoogleLogin(BaseModel):
    credential: str = Field(min_length=20)

class TransactionCreate(BaseModel):
    type: Literal["income", "expense"]
    amount: float = Field(gt=0, le=100_000_000)
    category: str = Field(min_length=1, max_length=50)
    description: str = Field(min_length=1, max_length=120)
    date: date

    @field_validator("description", "category")
    @classmethod
    def clean_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Campo obbligatorio.")
        return value

class TransactionOut(BaseModel):
    id: str
    type: Literal["income", "expense"]
    amount: float
    category: str
    description: str
    date: str
