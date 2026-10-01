import os

from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.server_api import ServerApi


load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "dental_patient_management")

if not MONGODB_URI:
    raise RuntimeError("MONGODB_URI is not set in the .env file")


client = MongoClient(
    MONGODB_URI,
    server_api=ServerApi("1")
)

db = client[DATABASE_NAME]

patients_collection = db["patients"]
case_sheets_collection = db["case_sheets"]
counters_collection = db["counters"]

