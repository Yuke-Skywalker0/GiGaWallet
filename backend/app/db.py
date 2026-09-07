from pymongo import MongoClient, ASCENDING
from .config import settings

client = MongoClient(settings.mongodb_uri)
db = client[settings.mongodb_db]

users = db["users"]
transactions = db["transactions"]

def ensure_indexes():
    users.create_index([("google_sub", ASCENDING)], unique=True)
    transactions.create_index([("owner_key", ASCENDING)])
    transactions.create_index([("created_at", ASCENDING)])
